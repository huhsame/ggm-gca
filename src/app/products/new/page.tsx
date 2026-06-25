import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import { createProduct } from "@/app/products/actions";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 안 했으면 글쓰기 못 함
  if (!user) {
    redirect("/login?info=" + encodeURIComponent("글을 쓰려면 로그인이 필요해요."));
  }

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold">판매글 작성</h1>

        <form
          action={createProduct}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="image">
              대표 사진
            </label>
            <input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              className="block w-full text-sm text-foreground/70 file:mr-3 file:rounded-lg file:border-0 file:bg-sweet/15 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-sweet-dark hover:file:bg-sweet/25"
            />
            <p className="mt-1 text-xs text-foreground/50">
              사진은 한 장만 올릴 수 있어요. (선택사항)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">
              제목
            </label>
            <input
              id="title"
              name="title"
              required
              placeholder="팔 물건 이름을 적어주세요"
              className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="price">
              가격 (원)
            </label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              defaultValue={0}
              placeholder="0 = 무료나눔"
              className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
            />
            <p className="mt-1 text-xs text-foreground/50">
              0원으로 두면 무료나눔으로 올라가요.
            </p>
          </div>

          <div>
            <label
              className="mb-1 block text-sm font-medium"
              htmlFor="description"
            >
              자세한 설명
            </label>
            <textarea
              id="description"
              name="description"
              rows={6}
              placeholder="물건 상태, 거래 방법 등을 적어주세요"
              className="w-full resize-none rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="status">
              판매 상태
            </label>
            <select
              id="status"
              name="status"
              defaultValue="판매중"
              className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
            >
              <option value="판매중">판매중</option>
              <option value="예약중">예약중</option>
              <option value="거래완료">거래완료</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/products"
              className="flex-1 rounded-lg border border-black/10 py-2.5 text-center font-medium transition hover:bg-black/5"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-sweet py-2.5 font-semibold text-white transition hover:bg-sweet-dark"
            >
              올리기
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
