"use server";

import { getDb } from "@/lib/db";

export interface BiographyMember {
  id: number;
  name: string;
  generation: number | null;
  sibling_order: number | null;
  father_id: number | null;
  mother_id: number | null;
  mother_name: string | null;
  gender: "男" | "女" | null;
  birthday: string | null;
  death_date: string | null;
  is_alive: boolean;
  spouse: string | null;
  official_position: string | null;
  residence_place: string | null;
  remarks: string;
  father_name: string | null;
  mother_display_name: string | null;
}

/**
 * 获取所有有生平事迹的成员，用于生平册展示
 */
export async function fetchMembersWithBiography(): Promise<{
  data: BiographyMember[];
  error: string | null;
}> {
  const db = getDb();

  try {
    const data = db
      .prepare(
        "SELECT * FROM family_members WHERE remarks IS NOT NULL AND remarks != '' ORDER BY generation ASC, sibling_order ASC"
      )
      .all() as BiographyMember[];

    // 过滤掉 remarks 只是空的 JSON 结构的情况
    const validData = data.filter((item) => {
      if (!item.remarks) return false;
      try {
        const parsed = JSON.parse(item.remarks);
        if (Array.isArray(parsed)) {
          return parsed.some((node: any) => {
            if (node.children && Array.isArray(node.children)) {
              return node.children.some((child: any) => child.text && child.text.trim());
            }
            return false;
          });
        }
        return false;
      } catch {
        return item.remarks.trim().length > 0;
      }
    });

    // 获取父/母亲 ID
    const fatherIds = validData
      .map((item) => item.father_id)
      .filter((id): id is number => id !== null);
    const motherIds = validData
      .map((item) => item.mother_id)
      .filter((id): id is number => id !== null);

    let fatherMap: Record<number, string> = {};
    let motherMap: Record<number, string> = {};

    const allParentIds = [...new Set([...fatherIds, ...motherIds])];
    if (allParentIds.length > 0) {
      const placeholders = allParentIds.map(() => "?").join(",");
      const parents = db
        .prepare(`SELECT id, name FROM family_members WHERE id IN (${placeholders})`)
        .all(...allParentIds) as { id: number; name: string }[];
      const parentMap = Object.fromEntries(parents.map((p) => [p.id, p.name]));
      fatherMap = Object.fromEntries(fatherIds.filter((id) => parentMap[id]).map((id) => [id, parentMap[id]]));
      motherMap = Object.fromEntries(motherIds.filter((id) => parentMap[id]).map((id) => [id, parentMap[id]]));
    }

    // 批量查询配偶
    const memberIds = validData.map((item) => item.id);
    let spousesMap: Record<number, string> = {};
    if (memberIds.length > 0) {
      const placeholders = memberIds.map(() => "?").join(",");
      const allSpouses = db
        .prepare(`SELECT member_id, name FROM spouses WHERE member_id IN (${placeholders}) ORDER BY sort_order ASC`)
        .all(...memberIds) as { member_id: number; name: string }[];
      for (const s of allSpouses) {
        spousesMap[s.member_id] = spousesMap[s.member_id]
          ? `${spousesMap[s.member_id]}、${s.name}`
          : s.name;
      }
    }

    const transformedData: BiographyMember[] = validData.map((item) => ({
      ...item,
      is_alive: !!item.is_alive,
      father_name: item.father_id ? fatherMap[item.father_id] || null : null,
      mother_display_name: item.mother_name || (item.mother_id ? motherMap[item.mother_id] || null : null),
      spouse: spousesMap[item.id] || item.spouse || null,
    }));

    return { data: transformedData, error: null };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "查询失败" };
  }
}
