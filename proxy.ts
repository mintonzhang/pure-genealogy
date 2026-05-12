import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "pure-genealogy-default-secret-change-in-production"
);

const COOKIE_NAME = "auth-token";

const PUBLIC_PATHS = ["/auth", "/login", "/api/auth", "/noauth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 首页重定向到族谱关系图
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/family-tree/graph";
    return NextResponse.redirect(url);
  }

  // 静态资源和图片放行
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname === "/favicon.ico" ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // 公开路由直接放行
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 检查 JWT cookie
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
