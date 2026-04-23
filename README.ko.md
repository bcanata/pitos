<p align="center">
  <img src="public/logo.png" alt="PitOS" width="260">
</p>

# PitOS

FRC(FIRST Robotics Competition) 팀을 위한 AI 기반 워크스페이스. Slack 스타일의 채널, 작업 추적, 의사결정 로그, 심사 인터뷰 준비까지 — 모두 단순히 대화만 하는 게 아니라 실제로 일을 해내는 Claude 에이전트와 연결되어 있습니다.

[Built with Claude Opus 4.7 Hackathon](https://cerebralvalley.ai/e/built-with-4-7-hackathon)을 위해 제작되었습니다.

> **Read in:** [English](README.md) · [Türkçe](README.tr.md) · [Other language? →](https://github.com/bcanata/pitos/issues/new?labels=translation-request&template=translation-request.md)

---

## 빠른 시작

```bash
npx pitos-app
```

이게 전부입니다. 위저드가 프로젝트를 스캐폴딩하고, 의존성을 설치하며, 데이터베이스를 프로비저닝하고, 선택적으로 Cloudflare에 커스텀 도메인을 설정한 뒤 Vercel에 배포합니다. 마지막에는 작동하는 로그인 링크를 받게 됩니다 — 처음부터 끝까지 약 2분 정도 걸립니다.

**요구 사항:**
- Node.js 20+
- [Claude API 키](https://console.anthropic.com) (`sk-ant-...`)
- *(선택)* 프로덕션 배포를 위한 [Vercel 계정](https://vercel.com)
- *(선택)* 무료 트랜잭션 이메일(월 3,000건)을 위한 [Resend 계정](https://resend.com)
- *(선택)* 커스텀 도메인을 위한 [Cloudflare 계정](https://dash.cloudflare.com)

---

## 설정 위저드가 하는 일

빈 디렉터리에서 `npx pitos-app`을 실행하면 대화형 위저드가 시작됩니다. **필수**로 표시된 단계를 제외하고는 모두 선택 사항입니다.

### 1. 프로젝트 스캐폴딩
아직 PitOS 체크아웃 안에 있지 않다면, 위저드가 패키지를 새 디렉터리로 복사하고 `npm install`을 실행합니다. 프롬프트가 뜨면 디렉터리 이름을 선택하세요.

### 2. Claude API 키 *(필수)*
`sk-ant-...` 키를 붙여넣으세요. 위저드가 Anthropic API에 대해 검증하므로 오타는 통과하지 못합니다.

### 3. 언어
10개의 내장 언어(English, Türkçe, Español, Français, Deutsch, Português, 中文, 日本語, עברית, 또는 기타) 중에서 선택하세요. "Other"를 선택하면 전체 설정 번들이 해당 언어로 Claude를 통해 즉석 번역됩니다.

### 4. 팀 정보 *(필수)*
- **팀 번호** — 예: `8092` (데모 / 시즌 종료 시에는 비워두세요)
- **팀 이름** — 예: *Nordic Storm*
- **이름** 및 **이메일** — 워크스페이스 관리자가 됩니다

### 5. 이메일 제공자 *(선택)*
개발 중에는 건너뛰세요 — 매직 링크 로그인 URL이 콘솔에 출력됩니다.

세 가지 옵션 중 하나를 선택하세요:

**Resend (추천 — 월 3,000건 무료)**
- [resend.com](https://resend.com)에서 무료 계정을 만들고 도메인을 추가하세요
- `re_*` API 키와 검증된 발신자 주소를 붙여넣으세요
- 무료 티어로 어떤 FRC 팀이든 무기한 사용 가능합니다

**Cloudflare Email Sending (선택 — Workers Paid 월 $5 필요)**
- **Cloudflare Account ID** — Cloudflare 대시보드 사이드바에서 확인
- **Cloudflare Email API 토큰** — `Email Sending` 권한이 부여된 `cfut_*` 범위 사용자 토큰
- **발신 이메일 주소** — 예: `noreply@yourteam.com`
- 참고: Workers Paid 플랜(월 $5)이 필요하며 무료 티어에서는 사용할 수 없습니다

**건너뛰기** — 매직 링크 URL이 서버 콘솔에 출력됩니다 (개발 전용, 복사해 붙여서 로그인)

### 6. 커스텀 도메인 *(선택)*
`pitos.yourteam.com` 같은 도메인을 Vercel 배포에 연결합니다.

**Cloudflare API 토큰**을 입력하라는 요청을 받게 됩니다. [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens)에서 다음 범위로 토큰을 생성하세요:

| 권한 | 이유 |
|---|---|
| `Zone:Zone:Read` | 도메인의 zone ID 조회 |
| `Zone:DNS:Edit` | CNAME + SPF TXT 레코드 생성 |
| `Zone:Email Routing Rules:Read` | *(선택)* 이메일 전달률을 위해 Cloudflare의 DKIM 키 가져오기 |

이 토큰은 **설정 중에만** 사용되며 — `.env.local`에 저장되거나 Vercel로 푸시되지 않습니다. 범위 지정 토큰을 사용하고 싶지 않다면 DNS를 수동으로 구성하고 이 단계를 건너뛰세요.

위저드는:
1. `/user/tokens/verify`에 대해 토큰을 검증합니다
2. 도메인에 `CNAME → cname.vercel-dns.com`을 생성합니다
3. SPF TXT 레코드를 추가합니다
4. DKIM TXT 레코드를 게시합니다 (Email Routing이 제공하는 경우)
5. Vercel 프로젝트에 도메인을 추가하고 `APP_URL`을 업데이트합니다

토큰이 거부되면 도메인 설정은 건너뛰지만 나머지 배포는 계속됩니다.

### 6. 영구 데이터베이스 *(선택, 프로덕션에는 추천)*
Vercel 배포가 성공한 후, 위저드는 영구 SQLite를 위해 [Turso](https://turso.tech)를 설정할지 묻습니다. 설정하지 않으면 데이터는 `/tmp/pitos.db`에 저장되며 콜드 스타트마다 삭제됩니다.

Turso 무료 티어: 9 GB 저장 공간, 월 5억 행 읽기 — 어떤 FRC 팀에게도 충분합니다.

1. [turso.tech/app/databases/new](https://turso.tech/app/databases/new)에서 무료 데이터베이스를 생성하세요
2. `libsql://your-db.turso.io` URL과 인증 토큰을 위저드에 복사하세요

위저드가 두 값을 모두 Vercel로 푸시하고 재배포를 트리거해 새 DB에 마이그레이션이 적용되도록 합니다.

### 7. Vercel에 배포 *(선택)*
마지막 단계에서 프로덕션 배포를 제안합니다. 수락하면 위저드가:
- `vercel link`를 실행합니다 (대화형 — 팀과 프로젝트 이름 선택)
- `ANTHROPIC_API_KEY`, `AUTH_SECRET`, 이메일 제공자 변수를 환경 변수로 푸시합니다
- `vercel --prod --yes`를 실행합니다
- `APP_URL`을 배포된 URL(또는 설정한 경우 커스텀 도메인)로 업데이트합니다
- `APP_URL`이 적용되도록 재배포합니다

배포된 URL의 `/onboarding`에서 팀 설정을 마무리합니다.

---

## 기능

**Channels** — Slack 스타일의 스레드 기반 메시징. 모든 메시지는 질문에 답하거나, 작업을 생성하거나, 학생의 논리적 추론을 키우기 위한 "심사 리플렉스" 질문(증거 요구, 왜 질문, 티치 모드 전환)을 던지는 Claude 에이전트를 트리거할 수 있습니다.

**Tasks** — 채널 논의에서 도출된 실행 항목. 티치 모드 작업은 학생이 완료 표시 전에 자신의 접근 방식을 설명하도록 유도합니다.

**Decisions** — 설계 및 전략 결정을 근거, 고려된 대안, 참여자와 함께 기록하는 로그. 시즌 종료 회고를 위해 검색 가능합니다.

**Ask** — 팀이 지금까지 말하거나 결정한 모든 것에 대한 의미 기반 검색. *"작년에 swerve drift 이슈를 어떻게 해결했지?"*라고 물어보면 원본 메시지로 연결되는 링크와 함께 출처가 있는 답변을 얻을 수 있습니다.

**Judge simulator** — 사실적인 모의 심사 인터뷰. Claude가 심사위원 역할을 맡아 답변에 따라 난이도를 조정하고, 좋은 답변과 개선할 부분을 담은 디브리프를 생성합니다.

**Exit interview** — Claude와 함께하는 시즌 종료 1:1. 학생이 배운 것, 좌절한 것, 내년에 원하는 것을 포착합니다 — 시즌 회고를 위한 원천 입력값입니다.

**Season recap** — 채널 기록, 의사결정, 종료 인터뷰로부터 완전한 회고 문서를 생성합니다. 어워드 제출 및 스폰서 리포트에 바로 활용 가능합니다.

**Settings** — 팀 구성, 멤버 관리, 언어 전환, API 키 순환.

---

## 운영 비용

FRC 팀은 빠듯한 예산으로 운영됩니다. PitOS는 학생 용돈으로도 감당할 수 있도록 설계되었습니다 — **영구 데이터와 실제 이메일이 가능한 진짜 프로덕션 인스턴스를 월 $0에** 운영할 수 있습니다 (Claude API 토큰 비용 별도).

### 서비스별 분석 (2026년 4월)

| 서비스 | 무료 티어 | 유료부터 | 비고 |
|---|---|---|---|
| **Anthropic Claude API** | 가입 시 $5 체험 크레딧 | 사용량 기반 | 주요 가변 비용 — 아래 참조 |
| **Vercel (Hobby)** | 100만 함수 호출, 4 CPU-시간 Active CPU, 100 GB 데이터 전송, 100만 엣지 요청, **최대 함수 실행 60초** | 사용자당 월 $20(Pro) + $20 사용 크레딧 | Hobby 티어는 "개인, 비상업적 용도" |
| **Netlify (Free)** | 100 GB 대역폭, 300 빌드 분, 12.5만 함수 호출 | 사용자당 월 $19 (Pro) | 하드 캡 — 사이트가 중단되며 예상치 못한 청구 없음 |
| **Resend** | **월 3,000 이메일**, 커스텀 도메인 1개, 일일 100건 | 월 $20 (Pro, 5만 이메일) | 기본 이메일 제공자 — 매직 링크 로그인에 이상적 |
| **Cloudflare DNS + Email Routing** | 무제한 zone, 무제한 DNS 레코드, 수신 이메일 라우팅 | 무료 | CLI가 수행하는 도메인 + DNS 자동화를 커버 |
| **Cloudflare Workers Paid** (Email Sending에 선택) | — | **월 $5** 최소 | 대체 이메일 제공자; 외부 메일 발송에는 Workers Paid 필요 |
| **Turso (LibSQL)** | **9 GB 저장 공간, 5억 행 읽기, 500 DB** | 월 $4.99 (Developer) | 프로덕션의 영구 SQLite — CLI 설정에 통합됨 |
| **커스텀 도메인** | — | 연 ~$10–15 | 선택 사항 — `*.vercel.app` 또는 `*.netlify.app` URL도 충분함 |

### Claude API 가격 (백만 토큰당)

| 모델 | 입력 | 출력 | 캐시 읽기 (10%) | 배치 (50% 할인) |
|---|---|---|---|---|
| **Haiku 4.5** | $1 | $5 | $0.10 | $0.50 / $2.50 |
| **Sonnet 4.6** | $3 | $15 | $0.30 | $1.50 / $7.50 |
| **Opus 4.7** | $5 | $25 | $0.50 | $2.50 / $12.50 |

PitOS는 품질을 위해 `lib/agents/*.ts`에서 기본적으로 **Opus 4.7**을 사용합니다. 비용을 5배 줄이려면, 고빈도/저위험 에이전트(채널 답변, 작업 추출)의 모델 ID를 `claude-haiku-4-5`로 바꾸고, 추론 품질이 가장 중요한 judge-sim과 season-recap에는 Opus를 유지하세요. 프롬프트 캐싱은 이미 SDK에서 지원됩니다 — 캐시 읽기는 입력 가격의 10%입니다.

**대략적인 월간 추정** (활발히 대화하는 20명 규모 팀 기준):
- 전부 Opus 4.7: **월 $15–40**
- 혼합 (채널은 Haiku, 무거운 에이전트는 Opus): **월 $3–8**
- 전부 Haiku 4.5: **월 $1–3**

### 비용 레시피

**완전 무료 프로덕션 (추천 출발점):**
- Vercel Hobby 또는 Netlify Free
- 실제 매직 링크 이메일을 위한 **Resend 무료 티어** (월 3,000건)
- 영구 SQLite를 위한 **Turso 무료 티어** (9 GB) — 콜드 스타트에도 데이터 유지
- 모든 에이전트에 Claude Haiku 4.5
- **비용: 월 $0** + Anthropic 사용량 (20명 팀 기준 월 ~$1–3)

**완전 무료 (개발 / 해커톤):**
- 이메일 건너뛰기 — 매직 링크 URL이 서버 로그에 출력됨 (복사해 붙여 로그인)
- 휘발성 `/tmp/pitos.db` SQLite (콜드 스타트 시 데이터 초기화)
- **비용: 월 $0** + Anthropic 사용량

**스폰서가 있는 실제 팀 (월 ~$25 + API):**
- Vercel Pro (월 $20) — 스폰서 로고가 있는 상업적 용도에 대한 법적 명확성
- Resend 무료 티어 (또는 선호 시 Cloudflare Workers Paid 월 $5)
- Turso 무료 또는 Developer (DB가 더 필요하면 월 $5)
- 커스텀 도메인 (월 $1 분할 상각)
- **비용: 월 $20–25 + Claude 사용량 월 ~$10–40**

### 주의할 점

- **Vercel Hobby는 "비상업적"입니다** — FRC 팀은 비영리/교육 목적이지만, 명시된 스폰서가 있거나 사이트에서 상품을 판매한다면 멘토와 상의하거나 Netlify Free(해당 조항 없음)로 전환하거나 Pro로 업그레이드하세요.
- **Vercel Hobby 함수 실행 시간은 60초로 제한됩니다** (기본 10초, 최대 60초까지 설정 가능). 긴 Opus 4.7 에이전트 실행 — judge-sim 모의 인터뷰, season-recap 생성 — 은 이 시간을 초과할 수 있습니다. 증상은 복잡한 에이전트 요청에서의 504 타임아웃입니다. Pro는 300초까지 허용합니다. 해결 방법: 더 빠른 응답을 위해 Haiku 4.5 사용, SSE 스트리밍(이미 지원됨), 또는 긴 에이전트 작업을 백그라운드 잡으로 분리.
- **Cloudflare Email Sending은 무료가 아닙니다.** *어떤* 외부 이메일이라도 발송하려면 Workers Paid 플랜(월 $5)이 필요합니다. 설정 위저드는 Resend(월 3,000건 무료)를 기본값으로 사용합니다. 이미 Workers Paid를 사용 중인 팀을 위해 Cloudflare Email도 여전히 옵션으로 지원됩니다.
- **Cloudflare Workers Free는 Email Sending에 충분하지 않습니다.** 무료 티어는 일일 10만 요청과 호출당 10ms CPU를 제공하지만, Email Sending은 특히 Workers Paid가 필요합니다. 나머지(DNS, 캐싱, SSL)에는 무료 티어로 충분합니다.
- **휘발성 SQLite는 콜드 스타트 시 초기화됩니다.** Turso가 없으면 DB는 `/tmp/pitos.db`에 저장되는데 Vercel/Netlify는 호출 사이에 이를 지웁니다. 설정 위저드가 배포 직후 Turso(9 GB 무료) 구성을 제안합니다.
- **Claude API 체험 크레딧은 만료됩니다.** Anthropic은 가입 시 $5 무료 크레딧을 제공합니다. 그 후에는 결제 수단이 필요합니다. 라이브 전환 전 한 달 테스트용으로 ~$5–10 예산을 잡으세요.

---

## 아키텍처

- **프레임워크** — Turbopack(기본 번들러)을 사용한 Next.js 16 App Router
- **UI** — React 19, Tailwind v4, [shadcn/ui](https://ui.shadcn.com)
- **데이터베이스** — `@libsql/client` + [Drizzle ORM](https://orm.drizzle.team)을 통한 LibSQL; 개발에서는 로컬 `file:./pitos.db`, 프로덕션에서는 Turso (`TURSO_DATABASE_URL`)
- **인증** — 매직 링크 토큰을 사용하는 [Lucia v3](https://lucia-auth.com) (비밀번호 없음)
- **이메일** — 제공자 체인: [Resend](https://resend.com) (`RESEND_API_KEY`) → [Cloudflare Email Sending](https://blog.cloudflare.com/email-for-agents/) (`CLOUDFLARE_EMAIL_API_TOKEN`) → 콘솔 로그
- **실시간** — `lib/sse.ts`의 경량 구독자 레지스트리를 사용한 SSE
- **AI** — 모든 에이전트에 `claude-opus-4-7`을 사용하는 `@anthropic-ai/sdk`

인증과 라우트 보호는 루트의 `proxy.ts`에 있습니다 (Next.js 16에서 `middleware.ts`에서 이름이 변경됨). 에이전트는 `lib/agents/` 아래에 에이전트당 파일 하나로 구성되어 있습니다.

---

## 수동 개발 설정

위저드를 건너뛰고 싶은 포크 및 기여자를 위해:

```bash
git clone https://github.com/bcanata/pitos.git
cd pitos
npm install
cp .env.example .env.local  # fill in ANTHROPIC_API_KEY + AUTH_SECRET
npm run db:push             # creates pitos.db
npx tsx scripts/seed-demo.ts # optional: seed Team 8092 demo data
npm run dev
```

[http://localhost:3000](http://localhost:3000)에 방문하세요.

---

## 환경 변수

| 변수 | 필수 | 용도 |
|---|---|---|
| `ANTHROPIC_API_KEY` | 예 | Claude API 키 |
| `AUTH_SECRET` | 예 | 64자 16진수 문자열 — 세션 쿠키 서명 |
| `APP_URL` | 예 | 배포 기본 URL (개발에서는 `http://localhost:3000`) |
| `DATABASE_URL` | 아니오 | 로컬 SQLite 경로 (기본값 `./pitos.db`; `TURSO_DATABASE_URL`이 설정되면 무시) |
| `RESEND_API_KEY` | 아니오 | Resend API 키 — 매직 링크 이메일 활성화 (월 3천 건 무료) |
| `RESEND_FROM_EMAIL` | 아니오 | Resend 발신자 주소 (예: `noreply@yourteam.com`) |
| `CLOUDFLARE_ACCOUNT_ID` | 아니오 | 대체 이메일 제공자 (Workers Paid 월 $5 필요) |
| `CLOUDFLARE_EMAIL_API_TOKEN` | 아니오 | Email Sending 권한이 있는 범위 지정 `cfut_*` 토큰 |
| `FROM_EMAIL` | 아니오 | Cloudflare Email 발신자 주소 |
| `TURSO_DATABASE_URL` | 아니오 | `libsql://your-db.turso.io` — 영구 SQLite 활성화 |
| `TURSO_AUTH_TOKEN` | 아니오 | Turso 인증 토큰 |

이메일 우선순위: `RESEND_API_KEY` → `CLOUDFLARE_EMAIL_API_TOKEN` → 콘솔 로그 (개발 폴백).

---

## 명령어

```bash
npm run dev         # dev server (Turbopack, localhost:3000)
npm run build       # production build
npm run lint        # ESLint
npm run db:push     # apply schema to SQLite
npm run db:studio   # Drizzle Studio GUI
npm run setup       # re-run the CLI wizard (same as npx pitos-app)
npm run mcp         # start the MCP server (for Claude Desktop / Code)
```

### 설정 재실행

```bash
npx pitos-app --force
```

`.env.local`을 덮어쓰고 모든 항목을 다시 묻습니다. 키를 잘못 입력했거나 도메인을 재구성하고 싶을 때 사용하세요.

---

## 배포 아키텍처

PitOS는
