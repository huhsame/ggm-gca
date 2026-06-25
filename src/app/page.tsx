import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signout } from "@/app/auth/actions";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const { welcome } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nickname =
    (user?.user_metadata?.nickname as string | undefined) ??
    user?.email?.split("@")[0];

  return (
    <div className="flex flex-1 flex-col">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-black/5 bg-white/70 px-6 py-4 backdrop-blur">
        <Link href="/" className="text-xl font-extrabold text-sweet-dark">
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

      {/* 본문 */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        {welcome && (
          <p className="mb-6 rounded-full bg-grape/10 px-4 py-1.5 text-sm font-medium text-grape">
            🎉 가입을 환영해요!
          </p>
        )}

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          우리 동네 중고거래
          <br />
          <span className="text-sweet-dark">고구마마켓</span>
        </h1>
        <p className="mt-4 max-w-md text-foreground/60">
          가까운 이웃과 따끈한 물건을 사고 팔아요. 군고구마처럼 정겨운 거래.
        </p>

        <div className="mt-8">
          {user ? (
            <Link
              href="/products"
              className="inline-block rounded-xl bg-sweet px-6 py-3 font-semibold text-white transition hover:bg-sweet-dark"
            >
              판매글 보러가기 🛒
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-block rounded-xl bg-sweet px-6 py-3 font-semibold text-white transition hover:bg-sweet-dark"
            >
              지금 시작하기
            </Link>
          )}
        </div>
      </main>

      <footer className="border-t border-black/5 py-6 text-center text-xs text-foreground/40">
        고구마마켓 · 개발 공부용 프로젝트 🍠
      </footer>
    </div>
  );
}
