-- 고구마마켓 DB 스키마
-- 새 Supabase 프로젝트의 SQL Editor 에 붙여넣고 실행하세요.
-- (대시보드 > 좌측 SQL Editor > New query > 붙여넣기 > Run)
--
-- 회원가입/로그인/로그아웃 자체는 Supabase Auth 만으로 동작하지만,
-- 닉네임·프로필을 다루기 위해 auth.users 와 1:1로 연결되는 profiles 테이블을 만든다.

-- 1) 프로필 테이블
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text,
  created_at timestamptz not null default now()
);

-- 2) RLS(행 수준 보안) 켜기
alter table public.profiles enable row level security;

-- 3) 정책
--   - 누구나 프로필을 볼 수 있다(거래 상대 닉네임 표시용)
drop policy if exists "프로필은 누구나 조회" on public.profiles;
create policy "프로필은 누구나 조회"
  on public.profiles for select
  using (true);

--   - 본인 프로필만 수정 가능
drop policy if exists "본인 프로필만 수정" on public.profiles;
create policy "본인 프로필만 수정"
  on public.profiles for update
  using (auth.uid() = id);

-- 4) 회원가입 시 profiles 행 자동 생성 트리거
--    signUp 의 options.data.nickname 값이 raw_user_meta_data 로 들어온다.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nickname', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 판매글(products) — 중고거래 글. (사진은 아직 없음)
-- ============================================================

-- 5) 판매글 테이블
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  price integer not null default 0,           -- 원 단위. 0 = 무료나눔
  description text not null default '',
  status text not null default '판매중',       -- 판매중 / 예약중 / 거래완료
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 최신글이 먼저 나오도록 정렬용 인덱스
create index if not exists products_created_at_idx
  on public.products (created_at desc);

-- 6) RLS(행 수준 보안) 켜기
alter table public.products enable row level security;

-- 7) 정책
--   - 판매글은 누구나 볼 수 있다(로그인 안 해도 구경 가능)
drop policy if exists "판매글은 누구나 조회" on public.products;
create policy "판매글은 누구나 조회"
  on public.products for select
  using (true);

--   - 로그인한 사람만 글을 쓸 수 있고, 작성자는 본인이어야 한다
drop policy if exists "본인 글만 작성" on public.products;
create policy "본인 글만 작성"
  on public.products for insert
  with check (auth.uid() = seller_id);

--   - 본인 글만 수정 가능
drop policy if exists "본인 글만 수정" on public.products;
create policy "본인 글만 수정"
  on public.products for update
  using (auth.uid() = seller_id);

--   - 본인 글만 삭제 가능
drop policy if exists "본인 글만 삭제" on public.products;
create policy "본인 글만 삭제"
  on public.products for delete
  using (auth.uid() = seller_id);
