# 🍠 고구마마켓

우리 동네 중고거래 마켓 (당근마켓 스타일) — **개발 공부용 프로젝트**.
Next.js 16 (App Router) + Supabase 로 단계적으로 만들어갑니다.

## 현재 단계: 회원가입 / 로그인 / 로그아웃 ✅

- 이메일 + 비밀번호 인증 (Supabase Auth)
- 회원가입 시 닉네임 저장
- 로그인 상태에 따라 홈 화면 분기

## 기술 스택

- **Next.js 16** (App Router, Server Actions, `src/` 구조)
- **Supabase** (`@supabase/ssr` — 서버/브라우저/proxy 세션 처리)
- **Tailwind CSS v4**
- **TypeScript**

## 폴더 구조

```
src/
├── app/
│   ├── auth/actions.ts     # 회원가입·로그인·로그아웃 서버 액션
│   ├── login/page.tsx      # 로그인 화면
│   ├── signup/page.tsx     # 회원가입 화면
│   ├── page.tsx            # 홈 (로그인 상태 분기)
│   └── layout.tsx
├── lib/supabase/
│   ├── client.ts           # 브라우저용 클라이언트
│   ├── server.ts           # 서버용 클라이언트
│   └── middleware.ts       # 세션 갱신 헬퍼
└── proxy.ts                # 매 요청 세션 갱신 (구 middleware)
supabase/schema.sql         # DB 스키마 (profiles 테이블 + 트리거)
```

## 시작하기

### 1. 환경변수 설정

`.env.local.example` 을 복사해 `.env.local` 을 만들고 값을 채웁니다.
Supabase 대시보드 > **Project Settings > Data API** 에서 복사:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxx
```

### 2. DB 스키마 실행

Supabase 대시보드 > **SQL Editor** 에서 `supabase/schema.sql` 내용을 붙여넣고 Run.

### 3. 이메일 확인 설정 (공부용 권장)

대시보드 > **Authentication > Sign In / Providers > Email** 에서
**"Confirm email"** 을 끄면 가입 즉시 로그인됩니다 (개발 편의).

### 4. 실행

```bash
npm install
npm run dev
```

http://localhost:3000 접속.

## 배포

GitHub 저장소를 Vercel 에 연결하고, Vercel 프로젝트의 **Environment Variables** 에
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 두 개를 추가하면 됩니다.
(`.env.local` 은 git 에 올라가지 않습니다.)

## 다음 단계 (예정)

- [ ] 프로필 페이지
- [ ] 상품 등록 / 목록 / 상세
- [ ] 이미지 업로드 (Supabase Storage)
- [ ] 채팅 / 찜하기
