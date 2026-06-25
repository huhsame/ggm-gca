import Link from "next/link";
import { login } from "@/app/auth/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; info?: string }>;
}) {
  const { error, info } = await searchParams;

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="text-3xl font-extrabold text-sweet-dark">
            🍠 고구마마켓
          </Link>
          <p className="mt-2 text-sm text-foreground/60">
            로그인하고 우리 동네 거래를 시작해요
          </p>
        </div>

        <form
          action={login}
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
        >
          {info && (
            <p className="mb-4 rounded-lg bg-grape/10 px-3 py-2 text-sm text-grape">
              {info}
            </p>
          )}
          {error && (
            <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <label className="mb-1 block text-sm font-medium" htmlFor="email">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="goguma@example.com"
            className="mb-4 w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
          />

          <label className="mb-1 block text-sm font-medium" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="mb-6 w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-sweet py-2.5 font-semibold text-white transition hover:bg-sweet-dark"
          >
            로그인
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-foreground/60">
          아직 회원이 아니신가요?{" "}
          <Link href="/signup" className="font-semibold text-grape hover:underline">
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
