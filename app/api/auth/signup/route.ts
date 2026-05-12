import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码长度至少6位" }, { status: 400 });
    }

    const db = getDb();
    const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);

    if (existing) {
      return NextResponse.json({ error: "该邮箱已注册" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)").run(email, passwordHash);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "注册失败，请稍后重试" }, { status: 500 });
  }
}
