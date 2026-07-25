import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

function safeEqual(actual: string, expected: string) {
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export function proxy(request: NextRequest) {
  const expectedUsername = process.env.DEPLOY_USERNAME;
  const expectedPassword = process.env.DEPLOY_PASSWORD;

  if (!expectedUsername || !expectedPassword) {
    return NextResponse.next();
  }

  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Basic ")) {
    try {
      const [username = "", password = ""] = Buffer.from(
        authorization.slice(6),
        "base64",
      )
        .toString("utf8")
        .split(":", 2);

      if (
        safeEqual(username, expectedUsername) &&
        safeEqual(password, expectedPassword)
      ) {
        return NextResponse.next();
      }
    } catch {
      // Invalid credentials fall through to the challenge response.
    }
  }

  return new NextResponse("需要登录后访问", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="带货剪手", charset="UTF-8"',
      "Cache-Control": "no-store",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
