import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";
import {
  deleteProduct,
  toggleLike,
  addComment,
  deleteComment,
} from "@/app/products/actions";
import { formatPrice, statusBadgeClass } from "@/lib/format";

type Comment = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

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
    .select("id, seller_id, title, price, description, status, image_url, created_at")
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

  // 좋아요 개수 세기 (head: true → 실제 행은 안 가져오고 개수만)
  const { count: likeCount } = await supabase
    .from("product_likes")
    .select("*", { count: "exact", head: true })
    .eq("product_id", id);

  // 내가 이 글에 좋아요를 눌렀는지
  let likedByMe = false;
  if (user) {
    const { data: myLike } = await supabase
      .from("product_likes")
      .select("product_id")
      .eq("product_id", id)
      .eq("user_id", user.id)
      .maybeSingle();
    likedByMe = !!myLike;
  }

  // 댓글 목록 (오래된 순)
  const { data: commentsData } = await supabase
    .from("product_comments")
    .select("id, user_id, content, created_at")
    .eq("product_id", id)
    .order("created_at", { ascending: true });
  const comments = (commentsData ?? []) as Comment[];

  // 댓글 작성자들의 닉네임을 한 번에 가져와 매핑
  const nickById = new Map<string, string>();
  const userIds = [...new Set(comments.map((c) => c.user_id))];
  if (userIds.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, nickname")
      .in("id", userIds);
    (profs ?? []).forEach((p) =>
      nickById.set(p.id, (p.nickname as string) ?? "알 수 없음"),
    );
  }

  // 각 액션에 이 글의 id 를 미리 묶어둔다
  const deleteThis = deleteProduct.bind(null, product.id);
  const toggleLikeThis = toggleLike.bind(null, product.id);
  const addCommentThis = addComment.bind(null, product.id);

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

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {product.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              className="max-h-96 w-full object-cover"
            />
          )}
          <div className="p-6">
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

          {/* 좋아요 버튼 (로그인 안 했으면 눌렀을 때 로그인으로 안내) */}
          <form action={toggleLikeThis} className="mt-6">
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                likedByMe
                  ? "border-red-200 bg-red-50 text-red-600"
                  : "border-black/10 text-foreground/70 hover:bg-black/5"
              }`}
            >
              <span>{likedByMe ? "❤️" : "🤍"}</span>
              <span>좋아요 {likeCount ?? 0}</span>
            </button>
          </form>

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
        </div>

        {/* 댓글 섹션 */}
        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
          <h2 className="mb-4 font-bold">댓글 {comments.length}</h2>

          {user ? (
            <form action={addCommentThis} className="mb-6 flex gap-2">
              <input
                name="content"
                required
                placeholder="댓글을 남겨보세요"
                className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm outline-none focus:border-sweet focus:ring-2 focus:ring-sweet/30"
              />
              <button
                type="submit"
                className="rounded-lg bg-sweet px-4 py-2 text-sm font-semibold text-white transition hover:bg-sweet-dark"
              >
                등록
              </button>
            </form>
          ) : (
            <p className="mb-6 text-sm text-foreground/50">
              <Link href="/login" className="font-semibold text-grape hover:underline">
                로그인
              </Link>{" "}
              후 댓글을 쓸 수 있어요.
            </p>
          )}

          {comments.length === 0 ? (
            <p className="text-sm text-foreground/40">
              아직 댓글이 없어요. 첫 댓글을 남겨보세요!
            </p>
          ) : (
            <ul className="space-y-4">
              {comments.map((c) => (
                <li key={c.id} className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <b className="text-sm text-grape">
                        {nickById.get(c.user_id) ?? "알 수 없음"}
                      </b>
                      <span className="text-xs text-foreground/40">
                        {new Date(c.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/80">
                      {c.content}
                    </p>
                  </div>
                  {user?.id === c.user_id && (
                    <form action={deleteComment.bind(null, c.id, product.id)}>
                      <button
                        type="submit"
                        className="shrink-0 text-xs text-foreground/40 hover:text-red-500"
                      >
                        삭제
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
