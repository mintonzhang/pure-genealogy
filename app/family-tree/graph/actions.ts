"use server";

import { getDb } from "@/lib/db";

export interface FamilyMemberNode {
  id: number;
  name: string;
  generation: number | null;
  sibling_order: number | null;
  father_id: number | null;
  mother_id: number | null;
  mother_name: string | null;
  is_root: boolean;
  gender: "男" | "女" | null;
  official_position: string | null;
  is_alive: boolean;
  spouse: string | null;
  remarks: string | null;
  birthday: string | null;
  death_date: string | null;
  residence_place: string | null;
}

export interface SpouseRecord {
  id?: number;
  member_id?: number;
  spouse_member_id: number | null;
  name: string;
  start_date: string | null;
  end_date: string | null;
  end_reason: string | null;
  sort_order: number;
}

export interface FetchGraphResult {
  data: FamilyMemberNode[];
  error: string | null;
}

export async function fetchAllFamilyMembers(): Promise<FetchGraphResult> {
  const db = await getDb();
  try {
    const data = db
      .prepare(
        "SELECT id, name, generation, sibling_order, father_id, mother_id, mother_name, is_root, gender, official_position, is_alive, spouse, remarks, birthday, death_date, residence_place FROM family_members ORDER BY generation ASC, sibling_order ASC"
      )
      .all() as FamilyMemberNode[];

    // 批量查询配偶
    const memberIds = data.map((d) => d.id);
    let spousesMap: Record<number, SpouseRecord[]> = {};
    if (memberIds.length > 0) {
      const placeholders = memberIds.map(() => "?").join(",");
      const allSpouses = db
        .prepare(`SELECT * FROM spouses WHERE member_id IN (${placeholders}) ORDER BY sort_order ASC`)
        .all(...memberIds) as SpouseRecord[];
      for (const s of allSpouses) {
        if (!spousesMap[s.member_id!]) spousesMap[s.member_id!] = [];
        spousesMap[s.member_id!].push(s);
      }
    }

    return {
      data: data.map((d) => ({
        ...d,
        is_alive: !!d.is_alive,
        is_root: !!d.is_root,
        spouse: spousesMap[d.id]?.map((s) => s.name).join(",") || d.spouse || null,
      })),
      error: null,
    };
  } catch (err) {
    return { data: [], error: err instanceof Error ? err.message : "查询失败" };
  }
}
