import { NextResponse, type NextRequest } from "next/server";
import { LAB_COOKIE, labPassword, labToken } from "@/lib/lab-gate";

/** 密码门的提交口。对了就种 cookie 回到原页，错了带 ?wrong=1 回门口。 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const pw = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/en/lab");
  // 只允许回站内路径，别成了开放跳转
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/en/lab";
  const url = req.nextUrl.clone();
  url.search = "";
  if (pw === labPassword()) {
    url.pathname = safeNext;
    const res = NextResponse.redirect(url, 303);
    res.cookies.set(LAB_COOKIE, await labToken(pw), { path: "/", maxAge: 60 * 60 * 24 * 90, httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    return res;
  }
  url.pathname = safeNext;
  url.searchParams.set("wrong", "1");
  return NextResponse.redirect(url, 303);
}
