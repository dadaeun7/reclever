import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("reclever_access_token")?.value;
  const { pathname } = request.nextUrl;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_KEY);
      const { payload } = await jwtVerify(token, secret);

      if (payload.sub) {
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-email", payload.sub as string);

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }
    } catch (error) {
      console.log("JWT Verity error:", error);
    }
  }

  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (token) {
    try {
      const secret = process.env.JWT_KEY;
      // 환경변수가 없는 경우 예외 처리
      if (!secret) {
        throw new Error("서버 환경변수 JWT_KEY가 설정되지 않았습니다.");
      }
      // 요청 시점에 Key 인코딩 수행
      const jwtKey = new TextEncoder().encode(secret);
      await jwtVerify(token, jwtKey);

      return NextResponse.next();
    } catch (error: any) {
      console.error("토큰 만료: " + error);
      const loginResponse = NextResponse.redirect(
        new URL("/login", request.url),
      );
      loginResponse.cookies.set("reclever_access_token", "", {
        path: "/",
        maxAge: 0,
      });
      return loginResponse;
    }
  }

  if (
    !token &&
    (pathname === "/settings" ||
      pathname === "/calendar" ||
      pathname === "/days")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
