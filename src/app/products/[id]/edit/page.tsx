import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import { updateProduct } from "@/app/products/actions";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?info=" + encodeURIComponent("로그인이 필요해요."));
  }

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, title, price, description, status")
    .eq("id", id)
    .maybeSingle();

  if (!product) {
    notFound();
  }

  // 본인 글이 아니면 상세로 돌려보냄
  if (product.seller_id !== user.id) {
    redirect(`/products/${id}`);
  }

  // 수정 액션에 이 글의 id 를 미리 묶어둔다
  const updateThis = updateProduct.bind(null, product.id);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-8">
        <h1 className="mb-6 text-2xl font-extrabold">판매글 수정</h1>

        <form
          action={updateThis}
          className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5"
        >
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="title">
              제목
            </label>
            <input
              id="title"
              name="title"
              required
              defaultValue={product.title}
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
              defaultValue={product.price}
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
              defaultValue={product.description}
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
              defaultValue={product.status}
              className="w-full rounded-lg border border-black/10 px-3 py-2 outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
            >
              <option value="판매중">판매중</option>
              <option value="예약중">예약중</option>
              <option value="거래완료">거래완료</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href={`/products/${product.id}`}
              className="flex-1 rounded-lg border border-black/10 py-2.5 text-center font-medium transition hover:bg-black/5"
            >
              취소
            </Link>
            <button
              type="submit"
              className="flex-1 rounded-lg bg-sweet py-2.5 font-semibold text-white transition hover:bg-sweet-dark"
            >
              저장
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
