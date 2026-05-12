import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const db = getDb();
    const user = db.prepare("SELECT id, email, password_hash FROM users WHERE email = ?").get(email) as
      | { id: number; email: string; password_hash: string }
      | undefined;

    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = await signToken({ id: user.id, email: user.email });
    await setSessionCookie(token);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "登录失败，请稍后重试" }, { status: 500 });
  }
}
