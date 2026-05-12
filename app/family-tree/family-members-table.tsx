"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Search, ChevronLeft, ChevronRight, Loader2, X, Calendar } from "lucide-react";
import type { FamilyMember, SpouseRecord } from "./actions";
import {
  createFamilyMember,
  updateFamilyMember,
  deleteFamilyMembers,
  fetchAllMembersForSelect,
  fetchMemberById,
} from "./actions";
import { ImportMembersDialog } from "./import-members-dialog";
import { FatherCombobox } from "./father-combobox";
import { RichTextEditor } from "@/components/rich-text/editor";
import { RichTextViewer } from "@/components/rich-text/viewer";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FamilyMembersTableProps {
  initialData: FamilyMember[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  searchQuery: string;
}

export function FamilyMembersTable({
  initialData,
  totalCount,
  currentPage,
  pageSize,
  searchQuery,
}: FamilyMembersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = React.useTransition();

  const [selectedIds, setSelectedIds] = React.useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(searchQuery);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoadingParents, setIsLoadingParents] = React.useState(false);
  const [loadingFatherId, setLoadingFatherId] = React.useState<number | null>(null);

  const [editingMember, setEditingMember] = React.useState<FamilyMember | null>(null);
  const [biographyMember, setBiographyMember] = React.useState<FamilyMember | null>(null);
  const [parentOptions, setParentOptions] = React.useState<
    { id: number; name: string; generation: number | null; gender: string | null }[]
  >([]);

  // 新增表单状态
  const [formData, setFormData] = React.useState({
    name: "",
    generation: "",
    sibling_order: "",
    father_id: "",
    mother_id: "",
    mother_name: "",
    gender: "",
    official_position: "",
    is_alive: true,
    is_root: false,
    spouse: "",
    remarks: "",
    birthday: "",
    death_date: "",
    residence_place: "",
  });
  const [spousesList, setSpousesList] = React.useState<SpouseRecord[]>([]);
  const [editingSpouse, setEditingSpouse] = React.useState<SpouseRecord | null>(null);
  const [isEditingSpouse, setIsEditingSpouse] = React.useState(false);

  const totalPages = Math.ceil(totalCount / pageSize);

  // 判断是否为编辑模式
  const isEditMode = editingMember !== null;

  // 女性成员选项（用于母亲选择）
  const motherOptions = React.useMemo(
    () => parentOptions.filter((p) => p.gender === "女"),
    [parentOptions]
  );

  // 加载父亲选择列表
  React.useEffect(() => {
    if (isDialogOpen) {
      setIsLoadingParents(true);
      fetchAllMembersForSelect()
        .then(setParentOptions)
        .finally(() => setIsLoadingParents(false));
    }
  }, [isDialogOpen]);

  const updateUrlParams = (params: Record<string, string>) => {
    startTransition(() => {
      const newParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
      });
      router.push(`/family-tree?${newParams.toString()}`);
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput, page: "1" });
  };

  const handlePageChange = (newPage: number) => {
    updateUrlParams({ page: newPage.toString() });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(initialData.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    const newSet = new Set(selectedIds);
    if (checked) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedIds(newSet);
  };

  const handleDelete = async () => {
    if (selectedIds.size === 0) return;

    const confirmed = window.confirm(
      `确定要删除选中的 ${selectedIds.size} 条记录吗？`
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const result = await deleteFamilyMembers(Array.from(selectedIds));
    setIsDeleting(false);

    if (result.success) {
      setSelectedIds(new Set());
      router.refresh();
    } else {
      alert(`删除失败: ${result.error}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      generation: "",
      sibling_order: "",
      father_id: "",
      mother_id: "",
      mother_name: "",
      gender: "",
      official_position: "",
      is_alive: true,
      is_root: false,
      spouse: "",
      remarks: "",
      birthday: "",
      death_date: "",
      residence_place: "",
    });
    setSpousesList([]);
    setEditingSpouse(null);
    setIsEditingSpouse(false);
    setEditingMember(null);
  };

  // 打开新增弹窗
  const handleOpenAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // 打开编辑弹窗
  const handleOpenEditDialog = (member: FamilyMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      generation: member.generation?.toString() ?? "",
      sibling_order: member.sibling_order?.toString() ?? "",
      father_id: member.father_id?.toString() ?? "null",
      mother_id: member.mother_id?.toString() ?? "",
      mother_name: member.mother_name ?? "",
      gender: member.gender ?? "",
      official_position: member.official_position ?? "",
      is_alive: member.is_alive,
      is_root: member.is_root,
      spouse: member.spouse ?? "",
      remarks: member.remarks ?? "",
      birthday: member.birthday ?? "",
      death_date: member.death_date ?? "",
      residence_place: member.residence_place ?? "",
    });
    setSpousesList(member.spouses || []);
    setIsDialogOpen(true);
  };

  // 关闭弹窗
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setIsEditingSpouse(false);
    setEditingSpouse(null);
    resetForm();
  };

  const handleSubmitMember = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("请输入姓名");
      return;
    }

    setIsSubmitting(true);

    const memberData = {
      name: formData.name.trim(),
      generation: formData.generation ? parseInt(formData.generation) : null,
      sibling_order: formData.sibling_order
        ? parseInt(formData.sibling_order)
        : null,
      father_id: (formData.father_id && formData.father_id !== "null")
        ? parseInt(formData.father_id)
        : null,
      mother_id: formData.mother_id ? parseInt(formData.mother_id) : null,
      mother_name: formData.mother_name || null,
      gender: (formData.gender as "男" | "女") || null,
      official_position: formData.official_position || null,
      is_alive: formData.is_alive,
      is_root: formData.is_root,
      spouse: formData.spouse || null,
      spouses: spousesList.filter(s => s.name.trim()),
      remarks: formData.remarks || null,
      birthday: formData.birthday || null,
      death_date: (!formData.is_alive && formData.death_date) ? formData.death_date : null,
      residence_place: formData.residence_place || null,
    };

    const result = isEditMode && editingMember
      ? await updateFamilyMember({ ...memberData, id: editingMember.id })
      : await createFamilyMember(memberData);

    setIsSubmitting(false);

    if (result.success) {
      handleCloseDialog();
      router.refresh();
    } else {
      alert(`${isEditMode ? "更新" : "添加"}失败: ${result.error}`);
    }
  };

  const allSelected =
    initialData.length > 0 && selectedIds.size === initialData.length;

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        {/* 搜索 */}
        <form onSubmit={handleSearch} className="flex gap-2 w-full lg:w-auto">
          <Input
            placeholder="搜索姓名..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button type="submit" variant="outline" size="icon" disabled={isPending}>
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          </Button>
        </form>

        {/* 操作按钮 */}
        <div className="flex gap-2 flex-wrap w-full lg:w-auto">
          <ImportMembersDialog onSuccess={() => router.refresh()} />
          
          <Button onClick={handleOpenAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            新增
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={selectedIds.size === 0 || isDeleting}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
            删除 {selectedIds.size > 0 && `(${selectedIds.size})`}
          </Button>
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent 
          className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 gap-0"
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>{isEditMode ? "编辑成员" : "新增成员"}</DialogTitle>
            <DialogDescription>
              填写成员信息后点击保存
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitMember} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="grid gap-4">
                {/* 姓名 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    姓名 *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="col-span-3"
                    required
                  />
                </div>

                {/* 父亲 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="father_id" className="text-right">
                    父亲
                  </Label>
                  <div className="col-span-3">
                    <FatherCombobox
                      value={formData.father_id}
                      options={parentOptions}
                      isLoading={isLoadingParents}
                      onChange={(value) => {
                        const father = parentOptions.find(p => p.id.toString() === value);
                        const newGeneration = father && father.generation !== null
                          ? (father.generation + 1).toString()
                          : (value === "null" ? "" : formData.generation);
                        setFormData({
                          ...formData,
                          father_id: value,
                          generation: newGeneration
                        });
                      }}
                    />
                  </div>
                </div>

                {/* 母亲 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="mother" className="text-right">
                    母亲
                  </Label>
                  <div className="col-span-3 flex gap-2">
                    <div className="flex-1">
                      <FatherCombobox
                        value={formData.mother_id}
                        options={motherOptions}
                        isLoading={isLoadingParents}
                        onChange={(value) => {
                          if (value && value !== "null") {
                            const mother = motherOptions.find(p => p.id.toString() === value);
                            setFormData({
                              ...formData,
                              mother_id: value,
                              mother_name: mother?.name ?? "",
                            });
                          } else {
                            setFormData({ ...formData, mother_id: "", mother_name: "" });
                          }
                        }}
                      />
                    </div>
                    <Input
                      placeholder="或输入姓名"
                      value={formData.mother_name}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          mother_name: e.target.value,
                          mother_id: e.target.value ? "" : formData.mother_id,
                        });
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* 世代 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="generation" className="text-right">
                    世代
                  </Label>
                  <Input
                    id="generation"
                    type="number"
                    value={formData.generation}
                    onChange={(e) =>
                      setFormData({ ...formData, generation: e.target.value })
                    }
                    className="col-span-3"
                    disabled={!!formData.father_id && formData.father_id !== "null"}
                  />
                </div>

                {/* 排行 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sibling_order" className="text-right">
                    排行
                  </Label>
                  <Input
                    id="sibling_order"
                    type="number"
                    value={formData.sibling_order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sibling_order: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>

                {/* 性别 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">
                    性别
                  </Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="选择性别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 生日 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="birthday" className="text-right">
                    生日
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) =>
                      setFormData({ ...formData, birthday: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>

                {/* 居住地 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="residence_place" className="text-right">
                    居住地
                  </Label>
                  <Input
                    id="residence_place"
                    value={formData.residence_place}
                    onChange={(e) =>
                      setFormData({ ...formData, residence_place: e.target.value })
                    }
                    className="col-span-3"
                  />
                </div>

                {/* 官职 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="official_position" className="text-right">
                    官职
                  </Label>
                  <Input
                    id="official_position"
                    value={formData.official_position}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        official_position: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>

                {/* 是否在世 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_alive" className="text-right">
                    是否在世
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="is_alive"
                      checked={formData.is_alive}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_alive: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="is_alive" className="font-normal">
                      在世
                    </Label>
                  </div>
                </div>

                {/* 族谱起点 */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_root" className="text-right">
                    族谱起点
                  </Label>
                  <div className="col-span-3 flex items-center space-x-2">
                    <Checkbox
                      id="is_root"
                      checked={formData.is_root}
                      onCheckedChange={(checked) =>
                        setFormData({
                          ...formData,
                          is_root: checked as boolean,
                        })
                      }
                    />
                    <Label htmlFor="is_root" className="font-normal text-muted-foreground">
                      设为族谱第一代起点（仅一个）
                    </Label>
                  </div>
                </div>

                {/* 卒年 (仅去世可选) */}
                {!formData.is_alive && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="death_date" className="text-right">
                      卒年
                    </Label>
                    <Input
                      id="death_date"
                      type="date"
                      value={formData.death_date}
                      onChange={(e) =>
                        setFormData({ ...formData, death_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                )}

                {/* 配偶 */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label className="text-right pt-2">
                    配偶
                  </Label>
                  <div className="col-span-3 space-y-2">
                    {spousesList.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">{s.name}</span>
                            {s.start_date && (
                              <span className="text-xs text-muted-foreground">
                                {s.start_date}{s.end_date ? ` ~ ${s.end_date}` : ""}
                              </span>
                            )}
                          </div>
                          {s.end_reason && (
                            <span className="text-xs text-muted-foreground">({s.end_reason})</span>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0"
                          onClick={() => {
                            setEditingSpouse({ ...s, sort_order: i });
                            setIsEditingSpouse(true);
                          }}
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-destructive"
                          onClick={() => setSpousesList(spousesList.filter((_, j) => j !== i))}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setEditingSpouse({ spouse_member_id: null, name: "", start_date: null, end_date: null, end_reason: null, sort_order: spousesList.length });
                        setIsEditingSpouse(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> 添加配偶
                    </Button>
                  </div>
                </div>

                {/* 配偶编辑弹窗 */}
                {isEditingSpouse && editingSpouse && (
                  <div className="grid grid-cols-4 items-start gap-4 p-3 border rounded-md bg-muted/20">
                    <Label className="text-right pt-2">
                      {editingSpouse.name ? "编辑配偶" : "添加配偶"}
                    </Label>
                    <div className="col-span-3 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          placeholder="配偶姓名 *"
                          value={editingSpouse.name}
                          onChange={(e) => setEditingSpouse({ ...editingSpouse, name: e.target.value })}
                          className="flex-1"
                          autoFocus
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">开始日期</Label>
                          <Input
                            type="date"
                            value={editingSpouse.start_date ?? ""}
                            onChange={(e) => setEditingSpouse({ ...editingSpouse, start_date: e.target.value || null })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">结束日期</Label>
                          <Input
                            type="date"
                            value={editingSpouse.end_date ?? ""}
                            onChange={(e) => setEditingSpouse({ ...editingSpouse, end_date: e.target.value || null })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">结束原因（如去世、离异等）</Label>
                        <Input
                          placeholder="选填"
                          value={editingSpouse.end_reason ?? ""}
                          onChange={(e) => setEditingSpouse({ ...editingSpouse, end_reason: e.target.value || null })}
                        />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => { setIsEditingSpouse(false); setEditingSpouse(null); }}
                        >
                          取消
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!editingSpouse.name.trim()}
                          onClick={() => {
                            if (!editingSpouse.name.trim()) return;
                            const idx = editingSpouse.sort_order;
                            if (idx < spousesList.length) {
                              // 编辑已有
                              const updated = [...spousesList];
                              updated[idx] = editingSpouse;
                              setSpousesList(updated);
                            } else {
                              // 新增
                              setSpousesList([...spousesList, editingSpouse]);
                            }
                            setIsEditingSpouse(false);
                            setEditingSpouse(null);
                          }}
                        >
                          确定
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 备注 / 生平事迹 */}
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="remarks" className="text-right pt-2">
                    生平事迹
                  </Label>
                  <div className="col-span-3">
                    <RichTextEditor
                      value={formData.remarks}
                      onChange={(value) =>
                        setFormData({ ...formData, remarks: value })
                      }
                      maxLength={500}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="px-6 py-4 border-t mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "保存中..." : "保存"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 表格 */}
      <div className={cn("border rounded-lg transition-opacity duration-200", isPending && "opacity-60 pointer-events-none")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="全选"
                />
              </TableHead>
              <TableHead className="w-16">ID</TableHead>
              <TableHead>姓名</TableHead>
              <TableHead className="w-20">世代</TableHead>
              <TableHead className="w-20">排行</TableHead>
              <TableHead className="w-24">父亲</TableHead>
              <TableHead className="w-24">母亲</TableHead>
              <TableHead className="w-16">性别</TableHead>
              <TableHead>生日</TableHead>
              <TableHead>卒年</TableHead>
              <TableHead>居住地</TableHead>
              <TableHead>官职</TableHead>
              <TableHead className="w-20">在世</TableHead>
              <TableHead className="w-16">起点</TableHead>
              <TableHead>配偶</TableHead>
              <TableHead>生平事迹</TableHead>
              <TableHead className="w-44">更新时间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={16} className="h-24 text-center">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              initialData.map((member) => (
                <TableRow
                  key={member.id}
                  data-state={selectedIds.has(member.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.has(member.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(member.id, checked as boolean)
                      }
                      aria-label={`选择 ${member.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono">{member.id}</TableCell>
                  <TableCell className="font-medium">
                    <button
                      type="button"
                      onClick={() => handleOpenEditDialog(member)}
                      className="text-primary hover:underline cursor-pointer text-left"
                    >
                      {member.name}
                    </button>
                  </TableCell>
                  <TableCell>{member.generation ?? "-"}</TableCell>
                  <TableCell>{member.sibling_order ?? "-"}</TableCell>
                  <TableCell>
                    {member.father_id && member.father_name ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={loadingFatherId === member.father_id}
                          onClick={async () => {
                            if (!member.father_id) return;
                            setLoadingFatherId(member.father_id);
                            try {
                              const fatherData = await fetchMemberById(member.father_id);
                              if (fatherData) {
                                handleOpenEditDialog(fatherData);
                              }
                            } finally {
                              setLoadingFatherId(null);
                            }
                          }}
                          className={cn(
                            "text-primary hover:underline cursor-pointer text-left",
                            loadingFatherId === member.father_id && "opacity-70 cursor-wait"
                          )}
                        >
                          {member.father_name}
                        </button>
                        {loadingFatherId === member.father_id && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {member.mother_name ? (
                      member.mother_id ? (
                        <button
                          type="button"
                          className="text-primary hover:underline cursor-pointer text-left"
                          onClick={async () => {
                            if (!member.mother_id) return;
                            setLoadingFatherId(member.mother_id);
                            try {
                              const motherData = await fetchMemberById(member.mother_id);
                              if (motherData) {
                                handleOpenEditDialog(motherData);
                              }
                            } finally {
                              setLoadingFatherId(null);
                            }
                          }}
                        >
                          {member.mother_name}
                        </button>
                      ) : (
                        member.mother_name
                      )
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{member.gender ?? "-"}</TableCell>
                  <TableCell>
                    {member.birthday
                      ? (() => {
                          const [y, m, d] = member.birthday.split("-");
                          return `${y}年${m}月${d}日`;
                        })()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {member.death_date
                      ? (() => {
                          const [y, m, d] = member.death_date.split("-");
                          return `${y}年${m}月${d}日`;
                        })()
                      : "-"}
                  </TableCell>
                  <TableCell>{member.residence_place ?? "-"}</TableCell>
                  <TableCell>{member.official_position ?? "-"}</TableCell>
                  <TableCell>{member.is_alive ? "是" : "否"}</TableCell>
                  <TableCell>
                    {member.is_root ? (
                      <Badge variant="outline" className="border-amber-200 text-amber-700 bg-amber-50 dark:border-amber-800 dark:text-amber-300 dark:bg-amber-900/30 text-xs">起点</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {member.spouses && member.spouses.length > 0
                      ? member.spouses.length <= 2
                        ? member.spouses.map((s) => s.name).join("、")
                        : `${member.spouses.slice(0, 2).map((s) => s.name).join("、")} 等${member.spouses.length}位`
                      : member.spouse || "-"}
                  </TableCell>
                  <TableCell>
                    {member.remarks ? (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0" 
                        onClick={() => setBiographyMember(member)}
                      >
                        查看
                      </Button>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.updated_at).toLocaleString("zh-CN")}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 分页 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
        <p className="text-sm text-muted-foreground">
          共 {totalCount} 条记录，第 {currentPage} / {totalPages || 1} 页
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || isPending}
          >
            <ChevronLeft className="h-4 w-4" />
            上一页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || isPending}
          >
            下一页
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 生平事迹查看弹窗 */}
      <Dialog open={!!biographyMember} onOpenChange={(open) => !open && setBiographyMember(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{biographyMember?.name} 的生平事迹</DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <RichTextViewer value={biographyMember?.remarks ?? null} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}