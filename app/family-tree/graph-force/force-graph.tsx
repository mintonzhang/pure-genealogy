"use client";

import { useCallback, useMemo, useState, useRef, useEffect, memo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Panel,
  type Node,
  type Edge,
  BackgroundVariant,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Search, X, Maximize, Minimize } from "lucide-react";
import { FamilyMemberNodeType, type FamilyNodeData } from "../graph/family-node";
import type { FamilyMemberNode } from "../graph/actions";
import { MemberDetailDialog } from "../member-detail-dialog";
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from "d3-force";

const nodeTypes: NodeTypes = {
  familyMember: FamilyMemberNodeType,
};

const NODE_WIDTH = 160;
const NODE_HEIGHT = 120;

interface ForceNode extends SimulationNodeDatum {
  id: string;
  member: FamilyMemberNode;
}

interface ForceLink extends SimulationLinkDatum<ForceNode> {
  source: string;
  target: string;
}

interface ForceGraphInnerProps {
  initialData: FamilyMemberNode[];
  onMemberClick?: (member: FamilyMemberNode) => void;
}

function buildForceGraph(members: FamilyMemberNode[]) {
  const memberMap = new Map(members.map((m) => [m.id, m]));
  const forceNodes: ForceNode[] = [];
  const forceLinks: ForceLink[] = [];

  // 找到族谱起点
  let rootMember = members.find((m) => m.is_root);
  if (!rootMember) {
    rootMember = members.find((m) => !m.father_id || !memberMap.has(m.father_id));
  }

  // 收集主树成员（从根节点 BFS）
  const mainTreeIds = new Set<number>();
  if (rootMember) {
    const queue = [rootMember];
    const visited = new Set<number>();
    while (queue.length > 0) {
      const m = queue.shift()!;
      if (visited.has(m.id)) continue;
      visited.add(m.id);
      mainTreeIds.add(m.id);
      const children = members.filter((c) => c.father_id === m.id);
      children.forEach((c) => queue.push(c));
    }
  }

  // 添加所有成员（非主树成员标记为灰色）
  members.forEach((m) => {
    if (mainTreeIds.has(m.id) || !rootMember) {
      forceNodes.push({ id: String(m.id), member: m });
    }
  });

  // 添加主树连线
  forceNodes.forEach((fn) => {
    const m = fn.member;
    if (m.father_id && mainTreeIds.has(m.father_id) && mainTreeIds.has(m.id)) {
      forceLinks.push({
        source: String(m.father_id),
        target: String(m.id),
      });
    }
  });

  // 添加非主树成员（灰色节点，无连线）
  members.forEach((m) => {
    if (!mainTreeIds.has(m.id) && rootMember) {
      forceNodes.push({ id: String(m.id), member: m });
    }
  });

  return { forceNodes, forceLinks, rootMemberId: rootMember?.id };
}

const ForceGraphInner = memo(function ForceGraphInner({
  initialData,
  onMemberClick,
}: ForceGraphInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [centerNodeId, setCenterNodeId] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<FamilyMemberNode | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const { forceNodes, forceLinks, rootMemberId } = useMemo(
    () => buildForceGraph(initialData),
    [initialData]
  );

  // 计算主树 ID 集合
  const mainTreeIds = useMemo(() => {
    const ids = new Set<number>();
    if (!rootMemberId) return ids;
    const memberMap = new Map(initialData.map((m) => [m.id, m]));
    const queue = [rootMemberId];
    const visited = new Set<number>();
    while (queue.length > 0) {
      const mid = queue.shift()!;
      if (visited.has(mid)) continue;
      visited.add(mid);
      ids.add(mid);
      const children = initialData.filter((c) => c.father_id === mid);
      children.forEach((c) => queue.push(c.id));
    }
    return ids;
  }, [initialData, rootMemberId]);

  // 初始随机位置
  const initialNodes: Node[] = useMemo(() => {
    // 计算哪些节点有子女
    const parentIds = new Set(initialData.filter((m) => m.father_id).map((m) => m.father_id!));

    return forceNodes.map((fn) => ({
      id: fn.id,
      type: "familyMember",
      position: {
        x: Math.random() * 400 + 200,
        y: Math.random() * 400 + 100,
      },
      data: {
        ...fn.member,
        is_alive: !!fn.member.is_alive,
        isHighlighted: false,
        isDimmed: rootMemberId ? !mainTreeIds.has(fn.member.id) : false,
        hasChildren: parentIds.has(fn.member.id),
      } as FamilyNodeData,
    }));
  }, [forceNodes, initialData, rootMemberId, mainTreeIds]);

  const initialEdges: Edge[] = useMemo(
    () =>
      forceLinks.map((link, i) => {
        const childMember = initialData.find((m) => m.id === Number(link.target));
        const fatherMember = initialData.find((m) => m.id === Number(link.source));
        const relationLabel = childMember?.gender === "女" ? "女" : "子";

        return {
          id: `e${link.source}-${link.target}-${i}`,
          source: String(link.source),
          target: String(link.target),
          label: relationLabel,
          labelStyle: { fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 },
          labelBgStyle: { fill: "hsl(var(--background))", fillOpacity: 0.85 },
          labelBgPadding: [4, 2] as [number, number],
          labelBgBorderRadius: 3,
          markerEnd: {
            type: "arrowclosed" as const,
            color: "hsl(var(--primary))",
            width: 16,
            height: 16,
          },
          style: {
            stroke: "hsl(var(--primary))",
            strokeWidth: 2,
            opacity: 0.7,
          },
        };
      }),
    [forceLinks, initialData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const simRef = useRef<any>(null);

  // 运行力导向模拟
  useEffect(() => {
    const simNodes: ForceNode[] = forceNodes.map((fn) => ({
      ...fn,
      x: undefined,
      y: undefined,
    }));

    const sim = forceSimulation<ForceNode>(simNodes)
      .force(
        "link",
        forceLink<ForceNode, ForceLink>(forceLinks)
          .id((d) => d.id)
          .distance(200)
      )
      .force("charge", forceManyBody().strength(-800))
      .force("center", forceCenter(0, 0))
      .force("collision", forceCollide(NODE_WIDTH))
      .alphaDecay(0.02)
      .on("tick", () => {
        setNodes((nds) =>
          nds.map((n) => {
            const sn = simNodes.find((s) => s.id === n.id);
            if (sn && sn.x != null && sn.y != null) {
              return { ...n, position: { x: sn.x, y: sn.y } };
            }
            return n;
          })
        );
      })
      .on("end", () => {
        // 模拟结束后适配视图
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
      });

    simRef.current = sim;

    return () => {
      sim.stop();
    };
  }, []); // 只在挂载时运行一次

  // 搜索定位
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return initialData.filter((m) => m.name.toLowerCase().includes(q));
  }, [searchQuery, initialData]);

  const handleSearchSelect = useCallback(
    (member: FamilyMemberNode) => {
      setHighlightedId(member.id);
      setSearchQuery(member.name);
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isHighlighted: n.id === String(member.id) },
        }))
      );
      // 飞到该节点
      const targetNode = nodes.find((n) => n.id === String(member.id));
      if (targetNode) {
        fitView({ nodes: [targetNode], duration: 800, padding: 0.5 });
      }
    },
    [nodes, setNodes, fitView]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setHighlightedId(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: false },
      }))
    );
  }, [setNodes]);

  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const member = initialData.find((m) => m.id === Number(node.id));
      if (member) {
        setSelectedMember(member);
        setDetailOpen(true);
        onMemberClick?.(member);
      }

      // 点击节点后以该节点为中心重新布局
      setCenterNodeId(node.id);
      setHighlightedId(Number(node.id));
      setNodes((nds) =>
        nds.map((n) => ({
          ...n,
          data: { ...n.data, isHighlighted: n.id === node.id },
        }))
      );

      // 固定选中节点到中心，重新跑力导向模拟
      const sim = simRef.current;
      if (sim) {
        sim.nodes().forEach((n: ForceNode) => {
          n.fx = null;
          n.fy = null;
        });
        const target = (sim.nodes() as ForceNode[]).find((n) => n.id === node.id);
        if (target) {
          target.fx = 0;
          target.fy = 0;
        }
        sim.alpha(0.8).restart();
      }

      setTimeout(() => fitView({ nodes: [node], duration: 800, padding: 0.5 }), 200);
    },
    [initialData, onMemberClick, setNodes, fitView]
  );

  const handleReset = useCallback(() => {
    setCenterNodeId(null);
    setHighlightedId(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: false },
      }))
    );
    if (simRef.current) {
      simRef.current.nodes().forEach((n: ForceNode) => {
        n.fx = null;
        n.fy = null;
      });
      simRef.current.alpha(0.5).restart();
    }
    setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
  }, [setNodes, fitView]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  const clearCenterNode = useCallback(() => {
    setCenterNodeId(null);
    setHighlightedId(null);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: { ...n.data, isHighlighted: false },
      }))
    );
    if (simRef.current) {
      simRef.current.nodes().forEach((n: ForceNode) => {
        n.fx = null;
        n.fy = null;
      });
      simRef.current.alpha(0.3).restart();
    }
  }, [setNodes]);

  return (
    <div
      ref={containerRef}
      className={
        isFullscreen
          ? "fixed inset-0 z-50 bg-background"
          : "w-full h-[calc(100vh-8rem)] min-h-[500px]"
      }
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={3}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        <Controls showInteractive={false} />

        {/* 顶部工具栏 */}
        <Panel position="top-left" className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索成员..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-48 md:w-64"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button variant="outline" size="icon" onClick={handleReset} title="重新布局">
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} title="全屏">
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
          {centerNodeId && (
            <Button variant="secondary" size="sm" onClick={clearCenterNode} className="gap-1.5">
              <X className="h-3.5 w-3.5" />
              <span className="max-w-24 truncate">
                {initialData.find((m) => m.id === Number(centerNodeId))?.name ?? "取消聚焦"}
              </span>
            </Button>
          )}
        </Panel>

        {/* 搜索结果下拉 */}
        {searchQuery.trim() && filteredMembers.length > 0 && (
          <Panel position="top-left" className="mt-12">
            <div className="bg-background border rounded-md shadow-md max-h-48 overflow-y-auto w-48 md:w-64">
              {filteredMembers.slice(0, 20).map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => handleSearchSelect(m)}
                >
                  {m.name}
                  {m.generation && (
                    <span className="text-muted-foreground ml-2">第{m.generation}世</span>
                  )}
                </button>
              ))}
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* 详情弹窗 */}
      <MemberDetailDialog
        member={selectedMember}
        isOpen={detailOpen}
        onOpenChange={setDetailOpen}
        fatherName={selectedMember?.father_id ? initialData.find((m) => m.id === selectedMember.father_id)?.name || null : null}
        motherName={
          selectedMember?.mother_name ||
          (selectedMember?.mother_id ? initialData.find((m) => m.id === selectedMember.mother_id)?.name || null : null)
        }
      />
    </div>
  );
});

interface ForceGraphProps {
  initialData: FamilyMemberNode[];
}

export function ForceGraph({ initialData }: ForceGraphProps) {
  return (
    <ReactFlowProvider>
      <ForceGraphInner initialData={initialData} />
    </ReactFlowProvider>
  );
}
