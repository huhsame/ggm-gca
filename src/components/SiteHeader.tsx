import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/auth/actions";

// 판매글 페이지들에서 공용으로 쓰는 상단바
export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nickname =
    (user?.user_metadata?.nickname as string | undefined) ??
    user?.email?.split("@")[0];

  return (
    <header className="flex items-center justify-between border-b border-black/5 bg-white/70 px-6 py-4 backdrop-blur">
      <Link href="/products" className="text-xl font-extrabold text-sweet-dark">
        🍠 고구마마켓
      </Link>

      <nav className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-foreground/70">
              <b className="text-grape">{nickname}</b>님
            </span>
            <form action={signout}>
              <button
                type="submit"
                className="rounded-lg border border-black/10 px-3 py-1.5 font-medium transition hover:bg-black/5"
              >
                로그아웃
              </button>
            </form>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="rounded-lg px-3 py-1.5 font-medium hover:bg-black/5"
            >
              로그인
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-sweet px-3 py-1.5 font-semibold text-white transition hover:bg-sweet-dark"
            >
              회원가입
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
