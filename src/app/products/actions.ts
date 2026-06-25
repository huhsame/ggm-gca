"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

  const { error } = await supabase.from("products").insert({
    seller_id: user.id,
    ...fields,
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

  // 본인 글만 수정되도록 seller_id 조건을 한 번 더 건다(보안정책 + 코드 이중 안전)
  const { error } = await supabase
    .from("products")
    .update({ ...fields, updated_at: new Date().toISOString() })
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
