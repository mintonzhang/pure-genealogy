import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "用户名和密码不能为空" }, { status: 400 });
    }

    if (username.length < 2) {
      return NextResponse.json({ error: "用户名至少2个字符" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少6位" }, { status: 400 });
    }

    const db = await getDb();
    const existing = db.prepare("SELECT id FROM users WHERE username = ?").get(username);

    if (existing) {
      return NextResponse.json({ error: "该用户名已注册" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    db.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)").run(username, passwordHash);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
