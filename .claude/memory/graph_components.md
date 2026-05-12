---
name: 图谱组件开发注意事项
description: 2D/3D图谱组件开发中遇到的问题和解决方案
type: project
originSessionId: 406ff4f5-e08d-4325-911f-579212ce9bd3
---
## 图谱类型
- 2D 图谱：`app/family-tree/graph/family-tree-graph.tsx`，dagre 自动布局
- 力导向图：`app/family-tree/graph-force/force-graph.tsx`，d3-force
- 3D 图：`app/family-tree/graph-3d/force-graph.tsx`，react-force-graph-3d

## 根节点检测模式
三个图谱均使用相同模式：优先找 is_root 成员，回退到第一个无父亲的成员。

## 非主树成员处理
通过 BFS 从根节点收集主树 ID，非主树成员灰显置底（isDimmed: true）。

## 已知问题
- graph-3d/force-graph.tsx 中 lucide-react 的 `Map` 图标与 JS `Map` 构造函数冲突，需使用 `MapIcon` 别名
- 3D 图谱的 SpriteText 来自 `three-spritetext` 包
