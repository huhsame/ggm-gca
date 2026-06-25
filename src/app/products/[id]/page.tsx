import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import { deleteProduct } from "@/app/products/actions";
import { formatPrice, statusBadgeClass } from "@/lib/format";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase
    .from("products")
    .select("id, seller_id, title, price, description, status, created_at")
    .eq("id", id)
    .maybeSingle();

  // 없는 글이면 404
  if (!product) {
    notFound();
  }

  // 판매자 닉네임 (profiles 에서 따로 조회)
  const { data: seller } = await supabase
    .from("profiles")
    .select("nickname")
    .eq("id", product.seller_id)
    .maybeSingle();

  const isOwner = user?.id === product.seller_id;
  const createdAt = new Date(product.created_at).toLocaleDateString("ko-KR");

  // 삭제 액션에 이 글의 id 를 미리 묶어둔다
  const deleteThis = deleteProduct.bind(null, product.id);

  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Link
          href="/products"
          className="mb-4 inline-block text-sm text-foreground/50 hover:text-foreground"
        >
          ← 목록으로
        </Link>

        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(product.status)}`}
            >
              {product.status}
            </span>
            <span className="text-xs text-foreground/40">
              {seller?.nickname ?? "알 수 없음"} · {createdAt}
            </span>
          </div>

          <h1 className="text-2xl font-extrabold">{product.title}</h1>
          <p className="mt-2 text-xl font-bold text-sweet-dark">
            {formatPrice(product.price)}
          </p>

          <hr className="my-5 border-black/5" />

          <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">
            {product.description || "설명이 없어요."}
          </p>

          {isOwner && (
            <div className="mt-8 flex gap-3 border-t border-black/5 pt-5">
              <Link
                href={`/products/${product.id}/edit`}
                className="flex-1 rounded-lg border border-black/10 py-2.5 text-center font-medium transition hover:bg-black/5"
              >
                수정
              </Link>
              <form action={deleteThis} className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-lg border border-red-200 py-2.5 font-medium text-red-600 transition hover:bg-red-50"
                >
                  삭제
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
