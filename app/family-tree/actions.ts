"use server";

import { getDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

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

export interface FamilyMember {
  id: number;
  name: string;
  generation: number | null;
  sibling_order: number | null;
  father_id: number | null;
  father_name: string | null;
  mother_id: number | null;
  mother_name: string | null;
  gender: "男" | "女" | null;
  official_position: string | null;
  is_alive: boolean;
  is_root: boolean;
  spouse: string | null;
  spouses: SpouseRecord[];
  remarks: string | null;
  birthday: string | null;
  death_date: string | null;
  residence_place: string | null;
  updated_at: string;
}

export interface FetchMembersResult {
  data: FamilyMember[];
  count: number;
  error: string | null;
}

export async function fetchFamilyMembers(
  page: number = 1,
  pageSize: number = 50,
  searchQuery: string = ""
): Promise<FetchMembersResult> {
  const db = await getDb();

  try {
    let countQuery: string;
    let dataQuery: string;
    const params: unknown[] = [];

    if (searchQuery.trim()) {
      const like = `%${searchQuery.trim()}%`;
      countQuery = "SELECT COUNT(*) as count FROM family_members WHERE name LIKE ?";
      dataQuery =
        "SELECT * FROM family_members WHERE name LIKE ? ORDER BY generation ASC, sibling_order ASC LIMIT ? OFFSET ?";
      params.push(like, pageSize, (page - 1) * pageSize);
    } else {
      countQuery = "SELECT COUNT(*) as count FROM family_members";
      dataQuery =
        "SELECT * FROM family_members ORDER BY generation ASC, sibling_order ASC LIMIT ? OFFSET ?";
      params.push(pageSize, (page - 1) * pageSize);
    }

    const { count } = db.prepare(countQuery).get(...(searchQuery.trim() ? [params[0]] : [])) as { count: number };
    const data = db.prepare(dataQuery).all(...params) as FamilyMember[];

    // 批量查询父亲姓名
    const fatherIds = data.map((item) => item.father_id).filter((id): id is number => id !== null);
    let fatherMap: Record<number, string> = {};

    if (fatherIds.length > 0) {
      const placeholders = fatherIds.map(() => "?").join(",");
      const fathers = db
        .prepare(`SELECT id, name FROM family_members WHERE id IN (${placeholders})`)
        .all(...fatherIds) as { id: number; name: string }[];
      fatherMap = Object.fromEntries(fathers.map((f) => [f.id, f.name]));
    }

    // 批量查询母亲姓名和配偶
    const memberIds = data.map((item) => item.id);
    let motherMap: Record<number, string> = {};
    let spousesMap: Record<number, SpouseRecord[]> = {};

    if (memberIds.length > 0) {
      // 查询母亲
      const motherIds = data.map((item) => item.mother_id).filter((id): id is number => id !== null);
      if (motherIds.length > 0) {
        const mPlaceholders = motherIds.map(() => "?").join(",");
        const mothers = db
          .prepare(`SELECT id, name FROM family_members WHERE id IN (${mPlaceholders})`)
          .all(...motherIds) as { id: number; name: string }[];
        motherMap = Object.fromEntries(mothers.map((m) => [m.id, m.name]));
      }

      // 查询配偶
      const mPlaceholders = memberIds.map(() => "?").join(",");
      const allSpouses = db
        .prepare(`SELECT * FROM spouses WHERE member_id IN (${mPlaceholders}) ORDER BY sort_order ASC`)
        .all(...memberIds) as SpouseRecord[];
      for (const s of allSpouses) {
        if (!spousesMap[s.member_id!]) spousesMap[s.member_id!] = [];
        spousesMap[s.member_id!].push(s);
      }
    }

    const transformedData: FamilyMember[] = data.map((item) => ({
      ...item,
      is_alive: !!item.is_alive,
      is_root: !!item.is_root,
      father_name: item.father_id ? fatherMap[item.father_id] || null : null,
      mother_name: item.mother_name || (item.mother_id ? motherMap[item.mother_id] || null : null),
      spouses: spousesMap[item.id] || [],
    }));

    return { data: transformedData, count, error: null };
  } catch (err) {
    return { data: [], count: 0, error: err instanceof Error ? err.message : "查询失败" };
  }
}

export interface CreateMemberInput {
  name: string;
  generation?: number | null;
  sibling_order?: number | null;
  father_id?: number | null;
  mother_id?: number | null;
  mother_name?: string | null;
  gender?: "男" | "女" | null;
  official_position?: string | null;
  is_alive?: boolean;
  is_root?: boolean;
  spouse?: string | null;
  spouses?: SpouseRecord[];
  remarks?: string | null;
  birthday?: string | null;
  death_date?: string | null;
  residence_place?: string | null;
}

export async function createFamilyMember(
  input: CreateMemberInput
): Promise<{ success: boolean; error: string | null }> {
  const db = await getDb();
  try {
    // 如果设为起点，先清除其他成员的起点标记
    if (input.is_root) {
      db.prepare("UPDATE family_members SET is_root = 0").run();
    }

    const result = db.prepare(
      `INSERT INTO family_members (name, generation, sibling_order, father_id, mother_id, mother_name, gender, official_position, is_alive, is_root, spouse, remarks, birthday, death_date, residence_place)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      input.name,
      input.generation ?? null,
      input.sibling_order ?? null,
      input.father_id ?? null,
      input.mother_id ?? null,
      input.mother_name ?? null,
      input.gender ?? null,
      input.official_position ?? null,
      input.is_alive ?? true ? 1 : 0,
      input.is_root ? 1 : 0,
      input.spouse ?? null,
      input.remarks ?? null,
      input.birthday ?? null,
      input.death_date ?? null,
      input.residence_place ?? null
    );

    // 插入配偶记录
    if (input.spouses && input.spouses.length > 0) {
      const insertSpouse = db.prepare(
        `INSERT INTO spouses (member_id, spouse_member_id, name, start_date, end_date, end_reason, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      const memberId = result.lastInsertRowid as number;
      for (const s of input.spouses) {
        insertSpouse.run(
          memberId,
          s.spouse_member_id ?? null,
          s.name,
          s.start_date ?? null,
          s.end_date ?? null,
          s.end_reason ?? null,
          s.sort_order ?? 0
        );
      }
    }

    revalidatePath("/family-tree", "layout");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "创建失败" };
  }
}

export async function deleteFamilyMembers(
  ids: number[]
): Promise<{ success: boolean; error: string | null }> {
  if (ids.length === 0) {
    return { success: false, error: "没有选择要删除的成员" };
  }

  const db = await getDb();
  try {
    const placeholders = ids.map(() => "?").join(",");
    db.prepare(`DELETE FROM family_members WHERE id IN (${placeholders})`).run(...ids);
    revalidatePath("/family-tree", "layout");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "删除失败" };
  }
}

// 获取所有成员用于父亲选择下拉框
export async function fetchAllMembersForSelect(): Promise<
  { id: number; name: string; generation: number | null; gender: string | null }[]
> {
  const db = await getDb();
  const data = db
    .prepare("SELECT id, name, generation, gender FROM family_members ORDER BY generation ASC, name ASC")
    .all() as { id: number; name: string; generation: number | null; gender: string | null }[];
  return data;
}

export interface UpdateMemberInput extends CreateMemberInput {
  id: number;
}

// 根据 ID 获取单个成员
export async function fetchMemberById(id: number): Promise<FamilyMember | null> {
  const db = await getDb();
  const data = db.prepare("SELECT * FROM family_members WHERE id = ?").get(id) as FamilyMember | undefined;

  if (!data) return null;

  let father_name: string | null = null;
  if (data.father_id) {
    const father = db.prepare("SELECT name FROM family_members WHERE id = ?").get(data.father_id) as
      | { name: string }
      | undefined;
    father_name = father?.name || null;
  }

  let mother_name: string | null = data.mother_name || null;
  if (data.mother_id && !mother_name) {
    const mother = db.prepare("SELECT name FROM family_members WHERE id = ?").get(data.mother_id) as
      | { name: string }
      | undefined;
    mother_name = mother?.name || null;
  }

  const spouses = db
    .prepare("SELECT * FROM spouses WHERE member_id = ? ORDER BY sort_order ASC")
    .all(id) as SpouseRecord[];

  return {
    ...data,
    is_alive: !!data.is_alive,
    is_root: !!data.is_root,
    father_name,
    mother_name,
    spouses,
  };
}

export async function updateFamilyMember(
  input: UpdateMemberInput
): Promise<{ success: boolean; error: string | null }> {
  const db = await getDb();
  try {
    // 如果设为起点，先清除其他成员的起点标记
    if (input.is_root) {
      db.prepare("UPDATE family_members SET is_root = 0").run();
    }

    db.prepare(
      `UPDATE family_members SET name=?, generation=?, sibling_order=?, father_id=?, mother_id=?, mother_name=?, gender=?, official_position=?, is_alive=?, is_root=?, spouse=?, remarks=?, birthday=?, death_date=?, residence_place=?, updated_at=datetime('now')
       WHERE id=?`
    ).run(
      input.name,
      input.generation ?? null,
      input.sibling_order ?? null,
      input.father_id ?? null,
      input.mother_id ?? null,
      input.mother_name ?? null,
      input.gender ?? null,
      input.official_position ?? null,
      input.is_alive ?? true ? 1 : 0,
      input.is_root ? 1 : 0,
      input.spouse ?? null,
      input.remarks ?? null,
      input.birthday ?? null,
      input.death_date ?? null,
      input.residence_place ?? null,
      input.id
    );

    // 同步配偶记录：先删后插
    db.prepare("DELETE FROM spouses WHERE member_id = ?").run(input.id);
    if (input.spouses && input.spouses.length > 0) {
      const insertSpouse = db.prepare(
        `INSERT INTO spouses (member_id, spouse_member_id, name, start_date, end_date, end_reason, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (const s of input.spouses) {
        insertSpouse.run(
          input.id,
          s.spouse_member_id ?? null,
          s.name,
          s.start_date ?? null,
          s.end_date ?? null,
          s.end_reason ?? null,
          s.sort_order ?? 0
        );
      }
    }

    revalidatePath("/family-tree", "layout");
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "更新失败" };
  }
}

export interface ImportMemberInput {
  name: string;
  generation?: number | null;
  sibling_order?: number | null;
  father_name?: string | null;
  mother_name?: string | null;
  is_root?: boolean;
  gender?: "男" | "女" | null;
  official_position?: string | null;
  is_alive?: boolean;
  spouse?: string | null;
  remarks?: string | null;
  birthday?: string | null;
  residence_place?: string | null;
}

export async function batchCreateFamilyMembers(
  members: ImportMemberInput[]
): Promise<{ success: boolean; count: number; error: string | null }> {
  const db = await getDb();

  try {
    // 1. 提取所有不为空的父亲姓名
    const fatherNames = Array.from(
      new Set(
        members.map((m) => m.father_name?.trim()).filter((n): n is string => !!n)
      )
    );

    // 2. 批量查找父亲 ID
    const fatherMap: Record<string, number> = {};
    if (fatherNames.length > 0) {
      const placeholders = fatherNames.map(() => "?").join(",");
      const foundFathers = db
        .prepare(`SELECT id, name FROM family_members WHERE name IN (${placeholders})`)
        .all(...fatherNames) as { id: number; name: string }[];
      foundFathers.forEach((f) => {
        fatherMap[f.name] = f.id;
      });
    }

    const insert = db.prepare(
      `INSERT INTO family_members (name, generation, sibling_order, father_id, mother_name, is_root, gender, official_position, is_alive, spouse, remarks, birthday, residence_place)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    const insertSpouse = db.prepare(
      "INSERT INTO spouses (member_id, name, sort_order) VALUES (?, ?, 0)"
    );

    const insertMany = db.transaction((items: ImportMemberInput[]) => {
      for (const m of items) {
        let father_id: number | null = null;
        if (m.father_name && fatherMap[m.father_name.trim()]) {
          father_id = fatherMap[m.father_name.trim()];
        }
        const result = insert.run(
          m.name,
          m.generation ?? null,
          m.sibling_order ?? null,
          father_id,
          m.mother_name ?? null,
          m.is_root ? 1 : 0,
          m.gender ?? null,
          m.official_position ?? null,
          m.is_alive ?? true ? 1 : 0,
          m.spouse ?? null,
          m.remarks ?? null,
          m.birthday ?? null,
          m.residence_place ?? null
        );
        // 如果导入了配偶姓名，同步写入 spouses 表
        if (m.spouse) {
          insertSpouse.run(result.lastInsertRowid as number, m.spouse);
        }
      }
    });

    insertMany(members);

    revalidatePath("/family-tree", "layout");
    return { success: true, count: members.length, error: null };
  } catch (err) {
    return { success: false, count: 0, error: err instanceof Error ? err.message : "批量导入失败" };
  }
}

export async function fetchMembersForTimeline(): Promise<
  { id: number; name: string; birthday: string | null; death_date: string | null; generation: number | null }[]
> {
  const db = await getDb();
  const data = db
    .prepare("SELECT id, name, birthday, death_date, generation FROM family_members ORDER BY birthday ASC")
    .all() as { id: number; name: string; birthday: string | null; death_date: string | null; generation: number | null }[];
  return data;
}
