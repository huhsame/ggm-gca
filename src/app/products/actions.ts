"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "product-images";

// 사진 파일을 Storage 에 올리고 공개 주소를 돌려준다. (사진이 없으면 null)
async function uploadImage(
  supabase: SupabaseClient,
  userId: string,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  // 본인 폴더(userId) 안에 시간 기반 이름으로 저장 → 파일명 충돌/한글 깨짐 방지
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "image/jpeg" });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// 폼에서 넘어온 값으로 판매글 데이터를 만든다(생성/수정 공용)
function readForm(formData: FormData) {
  const title = String(formData.get("title") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").replace(/,/g, "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const status = String(formData.get("status") ?? "판매중");

  // 가격은 숫자만. 비었거나 이상하면 0(무료나눔) 처리
  const price = Number.parseInt(priceRaw, 10);

  return {
    title,
    price: Number.isFinite(price) && price > 0 ? price : 0,
    description,
    status,
  };
}

// 판매글 작성
export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 로그인 안 했으면 로그인 페이지로
  if (!user) {
    redirect("/login?info=" + encodeURIComponent("글을 쓰려면 로그인이 필요해요."));
  }

  const fields = readForm(formData);

  if (!fields.title) {
    redirect("/products/new?error=" + encodeURIComponent("제목을 입력해 주세요."));
  }

  // 사진이 있으면 먼저 Storage 에 올리고 주소를 받는다
  const image = formData.get("image") as File | null;
  let imageUrl: string | null = null;
  try {
    imageUrl = await uploadImage(supabase, user.id, image);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "사진 업로드에 실패했어요.";
    redirect("/products/new?error=" + encodeURIComponent(msg));
  }

  const { error } = await supabase.from("products").insert({
    seller_id: user.id,
    ...fields,
    image_url: imageUrl,
  });

  if (error) {
    redirect("/products/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/products");
  redirect("/products");
}

// 판매글 수정
export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?info=" + encodeURIComponent("로그인이 필요해요."));
  }

  const fields = readForm(formData);

  if (!fields.title) {
    redirect(`/products/${id}/edit?error=` + encodeURIComponent("제목을 입력해 주세요."));
  }

  // 새 사진을 골랐을 때만 업로드해서 주소를 갈아끼운다(안 고르면 기존 사진 유지)
  const image = formData.get("image") as File | null;
  const updateData: Record<string, unknown> = {
    ...fields,
    updated_at: new Date().toISOString(),
  };
  try {
    const newUrl = await uploadImage(supabase, user.id, image);
    if (newUrl) updateData.image_url = newUrl;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "사진 업로드에 실패했어요.";
    redirect(`/products/${id}/edit?error=` + encodeURIComponent(msg));
  }

  // 본인 글만 수정되도록 seller_id 조건을 한 번 더 건다(보안정책 + 코드 이중 안전)
  const { error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .eq("seller_id", user.id);

  if (error) {
    redirect(`/products/${id}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/products");
  revalidatePath(`/products/${id}`);
  redirect(`/products/${id}`);
}

// 판매글 삭제
export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?info=" + encodeURIComponent("로그인이 필요해요."));
  }

  await supabase.from("products").delete().eq("id", id).eq("seller_id", user.id);

  revalidatePath("/products");
  redirect("/products");
}

// 좋아요 토글 — 안 눌렀으면 추가, 이미 눌렀으면 취소
export async function toggleLike(productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?info=" + encodeURIComponent("좋아요는 로그인 후 누를 수 있어요."));
  }

  // 이미 눌렀는지 확인
  const { data: existing } = await supabase
    .from("product_likes")
    .select("product_id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    // 이미 눌렀음 → 취소
    await supabase
      .from("product_likes")
      .delete()
      .eq("product_id", productId)
      .eq("user_id", user.id);
  } else {
    // 안 눌렀음 → 추가
    await supabase
      .from("product_likes")
      .insert({ product_id: productId, user_id: user.id });
  }

  revalidatePath(`/products/${productId}`);
}

// 댓글 작성
export async function addComment(productId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?info=" + encodeURIComponent("댓글은 로그인 후 쓸 수 있어요."));
  }

  const content = String(formData.get("content") ?? "").trim();

  // 빈 댓글이면 아무것도 안 하고 돌아감
  if (!content) {
    redirect(`/products/${productId}`);
  }

  await supabase
    .from("product_comments")
    .insert({ product_id: productId, user_id: user.id, content });

  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}

// 댓글 삭제 (본인 댓글만)
export async function deleteComment(commentId: string, productId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?info=" + encodeURIComponent("로그인이 필요해요."));
  }

  await supabase
    .from("product_comments")
    .delete()
    .eq("id", commentId)
    .eq("user_id", user.id);

  revalidatePath(`/products/${productId}`);
  redirect(`/products/${productId}`);
}
