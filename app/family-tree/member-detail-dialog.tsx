"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen, X } from "lucide-react";
import type { FamilyMemberNode } from "./graph/actions";
import { RichTextViewer } from "@/components/rich-text/viewer";
import { cn } from "@/lib/utils";

interface MemberDetailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: FamilyMemberNode | null;
  fatherName?: string | null;
  motherName?: string | null;
}

export function MemberDetailDialog({
  isOpen,
  onOpenChange,
  member,
  fatherName,
  motherName,
}: MemberDetailDialogProps) {
  if (!member) return null;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    const [y, m, d] = dateStr.split("-");
    return `${y}年${m}月${d}日`;
  };

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none w-auto p-0 overflow-visible bg-transparent border-none shadow-none flex items-center justify-center pointer-events-none"
        aria-describedby={undefined}
        showCloseButton={false}
      >
        <DialogTitle className="sr-only">{member.name} 详情</DialogTitle>

        <div className="relative w-[92vw] h-[70vh] sm:w-auto sm:h-[85vh] sm:aspect-[3/4] pointer-events-auto">

          {/* Close Button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute -top-12 right-0 sm:-top-12 sm:-right-8 p-2 text-white/80 hover:text-white transition-colors z-50 focus:outline-none bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-sm"
            aria-label="关闭"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="w-full h-full bg-[#fdfbf7] dark:bg-stone-900 rounded-lg shadow-2xl overflow-hidden border-2 sm:border-4 border-double border-stone-200 dark:border-stone-700 flex flex-col relative">

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-bl from-amber-100/50 dark:from-amber-900/20 to-transparent pointer-events-none" />

            {/* Header Section */}
            <div className="bg-stone-100/50 dark:bg-stone-800/50 p-4 sm:p-6 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-stone-200 dark:bg-stone-700 rounded-full">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-stone-600 dark:text-stone-300" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">{member.name}</h2>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-serif mt-1">
                    {member.generation ? `第 ${member.generation} 世` : "世代未知"}
                    {member.sibling_order ? ` • 行 ${member.sibling_order}` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                 {member.gender && (
                  <Badge variant="outline" className={cn(
                    "font-serif text-[10px] sm:text-xs px-1.5 sm:px-2.5",
                    member.gender === "男"
                      ? "border-blue-200 text-blue-700 bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:bg-blue-900/30"
                      : "border-pink-200 text-pink-700 bg-pink-50 dark:border-pink-800 dark:text-pink-300 dark:bg-pink-900/30"
                  )}>
                    {member.gender}
                  </Badge>
                )}
                {member.is_alive ? (
                  <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50 dark:border-green-800 dark:text-green-300 dark:bg-green-900/30 font-serif text-[10px] sm:text-xs px-1.5 sm:px-2.5">在世</Badge>
                ) : (
                  <Badge variant="outline" className="border-stone-300 text-stone-500 bg-stone-100 dark:border-stone-600 dark:text-stone-400 dark:bg-stone-800 font-serif text-[10px] sm:text-xs px-1.5 sm:px-2.5">已故</Badge>
                )}
              </div>
            </div>

            {/* Content Body - Native Scroll */}
            <div className="flex-1 w-full overflow-y-auto font-serif scrollbar-thin scrollbar-thumb-stone-200 dark:scrollbar-thumb-stone-700 p-5 sm:p-8">
              <div className="space-y-5 sm:space-y-6">

                {/* Key Relations */}
                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">父亲</span>
                    <div className="p-2 sm:p-3 bg-stone-50 dark:bg-stone-800/50 rounded border border-stone-100 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm sm:text-base">
                      {fatherName || "未记录"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">母亲</span>
                    <div className="p-2 sm:p-3 bg-stone-50 dark:bg-stone-800/50 rounded border border-stone-100 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm sm:text-base">
                      {motherName || member.mother_name || "未记录"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">配偶</span>
                    <div className="p-2 sm:p-3 bg-stone-50 dark:bg-stone-800/50 rounded border border-stone-100 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-medium text-sm sm:text-base">
                      {member.spouse || "未记录"}
                    </div>
                  </div>
                </div>

                <div className="w-full h-px bg-stone-200 dark:bg-stone-700 my-2 sm:my-4" />

                {/* Timeline Data */}
                <div className="grid grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">生辰</span>
                    <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300">{formatDate(member.birthday)}</p>
                  </div>
                  {!member.is_alive && (
                    <div className="space-y-1">
                      <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">卒年</span>
                      <p className="text-base sm:text-lg text-stone-700 dark:text-stone-300">{formatDate(member.death_date)}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">居住地</span>
                  <p className="text-stone-700 dark:text-stone-300 flex items-center gap-2 text-sm sm:text-base">
                    {member.residence_place || "未记录"}
                  </p>
                </div>

                <div className="w-full h-px bg-stone-200 dark:bg-stone-700 my-2 sm:my-4" />

                {/* 官职 */}
                {member.official_position && (
                  <div className="space-y-2">
                    <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">官职 / 头衔</span>
                    <p className="text-base sm:text-lg font-medium text-stone-800 dark:text-stone-200 bg-stone-100/50 dark:bg-stone-800/50 p-2 sm:p-3 rounded border border-stone-100 dark:border-stone-700 inline-block">
                      {member.official_position}
                    </p>
                  </div>
                )}

                {/* 生平事迹 */}
                <div className="space-y-2">
                  <span className="text-[10px] sm:text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">生平事迹</span>
                  <div className="rounded-md border border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 p-3 sm:p-4 min-h-[80px]">
                    {member.remarks ? (
                      <div className="prose prose-stone dark:prose-invert prose-sm max-w-none">
                        <RichTextViewer value={member.remarks} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-stone-400 dark:text-stone-600 italic py-4">
                        <BookOpen className="w-6 h-6 mb-1 opacity-20" />
                        <p className="text-sm">暂无生平记载</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
