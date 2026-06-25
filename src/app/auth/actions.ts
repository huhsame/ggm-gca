"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// 회원가입
export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));
  const nickname = String(formData.get("nickname"));

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname }, // user_metadata 에 닉네임 저장
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");

  // "Confirm email" 설정이 켜져 있으면 session 이 없다 → 메일 확인 안내
  if (!data.session) {
    redirect(
      `/login?info=${encodeURIComponent("가입 메일을 보냈어요. 메일의 확인 링크를 누른 뒤 로그인해 주세요.")}`,
    );
  }

  // 이메일 확인이 꺼져 있으면 바로 로그인됨 → 홈으로
  redirect("/?welcome=1");
}

// 로그인
export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/");
}

// 로그아웃
export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
