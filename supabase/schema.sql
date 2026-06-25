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
