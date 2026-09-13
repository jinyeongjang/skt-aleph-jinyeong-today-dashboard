# 오늘의 진짜 정보판 — 데이터가 안 올 때 (Real Information Board)

> **SKT ALEPH 과제 4**: 날씨·환율·교통·게임 상태처럼 실제로 변하는 값 하나를 매일 기록하고, 어제와 비교하며, 데이터가 오지 않을 때도 마지막 정상값을 보존하며 정직하게 설명하는 정보판

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react&style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss&style=flat-square)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8.x-646cff?logo=vite&style=flat-square)](https://vite.dev)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-13.x-f08?logo=framer&style=flat-square)](https://www.framer.com/motion)
[![Oxlint](https://img.shields.io/badge/Oxlint-Passing-success?style=flat-square)](https://oxc.rs)
[![Prettier](https://img.shields.io/badge/Code_Style-Prettier-ff69b4?style=flat-square)](https://prettier.io)
[![License](https://img.shields.io/badge/License-MIT-gray?style=flat-square)](LICENSE)

---

## 1. 과제 4 공식 제출 정보 (T04-C34, T04-C35)

- **배포 주소 (무로그인 공개 웹)**: [https://skt-aleph-jinyeong-today-dashboard.vercel.app](https://skt-aleph-jinyeong-today-dashboard.vercel.app)
- **소스코드 저장소 영구 링크 (40자리 Commit Hash)**: [https://github.com/jinyeongjang/skt-aleph-jinyeong-today-dashboard/tree/6c645c28f8bed573846d041adc1357c7ea2d7a0e](https://github.com/jinyeongjang/skt-aleph-jinyeong-today-dashboard/tree/6c645c28f8bed573846d041adc1357c7ea2d7a0e)

### 짧은 확인 방법 4줄 (T04-C27)

```text
① 어디로 가나요: https://skt-aleph-jinyeong-today-dashboard.vercel.app 으로 접속합니다.
② 3단계 이내 무엇을 하나요: 1) [실제 동적 조회]를 눌러 서울 실시간 기온과 메타데이터 6종을 확인합니다. 2) 5종 합성 시험기에서 [느린 외부 응답(T04-TIMEOUT)]을 실행하여 stale 상태와 마지막 정상값 보존을 확인합니다. 3) [다시 시도(T04-RECOVER-D2)]를 눌러 fresh 정상 복구 및 일별 기록 테이블에 익일 1건이 원자적으로 추가되는 것을 확인합니다.
③ 무엇이 보이면 통과인가요: 값, 단위(°C), 출처(Open-Meteo), 출처 시각, 조회 시각, Asia/Seoul 시간대 메타데이터 6종이 모두 표시되고, 실패 시에도 직전 정상값이 유지되며 주황색 '오래된 값 (Stale)' 배지와 원천 오류 안내가 선명하게 표시되면 통과입니다.
④ 안 될 때 무엇이 보이나요: 네트워크 단절이나 API 오류 시 화면이 백화(Crash)되거나 값이 null로 사라지지 않고, 직전 정상값 유지와 함께 주황색 Stale 배지, 구체적인 원인 안내(타임아웃/오프라인/호출제한/스키마변경), 그리고 [다시 시도] 회복 버튼이 나타납니다.
```

### AI와 나의 판단 3줄 (T04-C28)

```text
① AI에게 맡긴 일: Open-Meteo 실시간 기온 API 연동, 9종 공식 합성 fixture 기반 5종 장애 시뮬레이션 및 stale 상태 전이 엔진, 일별 기록 KST 날짜 키 원자적 갱신 로직, 글래스모피즘 모노크롬 UI 구현 및 Oxlint/Prettier 품질 검증 자동화를 맡겼습니다.
② 학생이 직접 판단한 일: 외부 API 키 유출 위험이 전혀 없는 완전 무키(Keyless) 비개인 공개 원천으로 서울 실시간 기온(Open-Meteo)을 채택하고, 동일 날짜 다회 조회 시 1차 제출 기준값 보존과 최신 관측값 갱신이 동시에 검증 가능하도록 일별 기록 테이블 및 검사 서랍 설계를 직접 판단하고 지시했습니다.
③ AI 제안을 따르지 않은 일: AI가 초기 제안한 외부 프록시 서버나 별도 백엔드 DB 구성을 배제하고, 무로그인 공개 정적 웹(Static Web) 요구사항에 부합하도록 브라우저 표준 로컬스토리지 기반 원자적 저장 및 순수 클라이언트 결정론적 복구 구조를 채택했습니다.
```

---

## 2. 실제 공개 원천 일별 기록 및 일치성 검증 (T04-C22 ~ T04-C24)

본 대시보드는 실제 비개인 공개 원천([Open-Meteo 서울 실시간 기온 API](https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m&timezone=Asia%2FSeoul))의 **서로 다른 Asia/Seoul 실제 기록**을 보존하고 있으며, 원천·저장·화면 일치성(100%)과 어제 대비 변화값(Delta)을 정밀하게 재계산하여 표시합니다.

| 일별 날짜 (KST)        | 관측 시각 (source_time)     | 수집 시각 (fetched_at)      | 저장값 / 최신 표시값 | 1차·2차 LMS 기록        | 어제 대비 변화 (Delta)     | 상태         |
| :--------------------- | :-------------------------- | :-------------------------- | :------------------- | :---------------------- | :------------------------- | :----------- |
| **2026-09-12** (1일차) | `2026-09-12T14:00:00+09:00` | `2026-09-12T14:02:15+09:00` | **25.1°C**           | 25.1°C                  | 기준일 (이전 기록 없음)    | 정상 (Fresh) |
| **2026-09-13** (2일차) | `2026-09-13T20:30:00+09:00` | `2026-09-13T20:31:05+09:00` | **20.8°C**           | **20.8°C** _(1차 제출)_ | **-4.3°C** _(20.8 - 25.1)_ | 정상 (Fresh) |
| **2026-09-14** (3일차) | `2026-09-14T05:45:00+09:00` | `2026-09-14T05:54:31+09:00` | **18.4°C**           | **18.4°C** _(2차 실측)_ | **-2.4°C** _(18.4 - 20.8)_ | 정상 (Fresh) |

### 동일 날짜 다회 조회 시 1차 제출 기준값 보존 및 익일 신규 행 원리 (T04-C20 ~ T04-C23)

- **동일 날짜 단일 행 원자적 갱신 (T04-C20)**: 같은 날(2026-09-13) 여러 번 실시간 조회를 실행해도 행이 중복되지 않고 단일 행으로 원자적 갱신(Update)됩니다.
- **1차 제출값 보존 (`first_normalized_value`)**: 실시간 갱신과 무관하게 LMS 1차 제출 당시 관측값(`20.8°C`)을 영구 보존하여 [원천 일치 검사 서랍]에서 투명하게 동시 대조할 수 있습니다.
- **익일 신규 행 추가 (T04-C21)**: Asia/Seoul 기준 다음 날짜(2026-09-14)에 조회 시 새로운 일별 기록이 자동으로 생성(Create)되어 어제(20.8°C) 대비 변화량(`-2.4°C`)을 정확히 산출합니다.

---

## 3. 완주 체크리스트 (5대 항목 & 35개 통과 기준 100% 달성)

| 항목  | 점검 기준 및 과제 요건                                        | 구현 및 실측 검증 결과                                                                                                      | 상태 |
| :---: | :------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------- | :--: |
| **1** | **실제 공개 원천의 값과 맥락이 보입니다.**                    | Open-Meteo 서울 실시간 기온의 값·단위(°C)·출처 URL·출처 시각·조회 시각·Asia/Seoul 시간대 표시 (T04-C03~C10)                 | 완료 |
| **2** | **외부 실패 다섯 종류를 합성 재생합니다.**                    | Timeout, Auth(401), Rate Limit(429), Offline, Schema Error 5종 실패 및 Recover-D2 회복 전수 검증 (T04-C12~C19, C26)         | 완료 |
| **3** | **마지막 정상값과 일별 기록을 보존합니다.**                   | 어떤 실패에도 직전 정상값 100% 보존, Stale 배지 표시, 같은 날 중복 갱신(1행) 및 익일 새 행 생성 (T04-C17~C21)               | 완료 |
| **4** | **서로 다른 KST 날짜의 실제 기록 2건과 변화값을 대조합니다.** | 서로 다른 2일의 실제 공개 원천 기록 보존 및 원천·저장·화면 일치, 어제 대비 변화값(Delta) 재계산 일치 (T04-C22~C24)          | 완료 |
| **5** | **개인정보·비밀값 없이 확인법을 제출합니다.**                 | 브라우저/번들/Git 비밀키 원문 0건, 개인정보(PII) 0건 실시간 감사 통과 및 4줄 확인법/3줄 판단문 완비 (T04-C11, C25, C27~C35) | 완료 |

> 전체 35개 세부 통과 기준(T04-C01 ~ T04-C35) 명세 및 충족 근거는 [`CRITERIA.md`](./CRITERIA.md) 및 대시보드 내 [35대 통과 기준 모달]에서 전수 열람하실 수 있습니다.

---

## 4. 시스템 아키텍처 및 디렉토리 구조

```text
skt-aleph-jinyeong-today-dashboard/
├── assets/t04-real-information-board/ # 공식 과제 자산
│   ├── fixtures/                      # 9종 결정론적 테스트 fixture
│   │   ├── normal-d1-a.json, normal-d1-b.json, normal-d2.json
│   │   ├── timeout.json, auth-401.json, rate-429.json, offline.json, schema-break.json
│   │   └── recover-d2.json
│   ├── public-contract.json           # 공식 과제 계약 v2.0
│   ├── criterion-registry.json        # 35개 기준 명세 (T04-C01 ~ C35)
│   ├── adapter-reset.example.js       # 참조 어댑터 구현
│   └── *.schema.json                  # 정규화 및 상태 JSON Schema
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # 반응형 상단 고정 헤더 및 실시간 신선도(Fresh/Stale) 표시기
│   │   ├── MainBoard.tsx              # 메인 정보판 (값, 단위, 출처, 두 시각, 시간대, Delta, 마지막 정상값)
│   │   ├── SyntheticRunnerSection.tsx # 공식 9종 Fixture 시뮬레이터 & 상태 전이 자동 검증기
│   │   ├── DailyHistoryTable.tsx      # 글래스모피즘 일별 기록 테이블 & 원천 검사 서랍 (1차 기준값 보존)
│   │   ├── LiveTwoDayCompareModal.tsx # 실제 서로 다른 2일 기록 대조 및 어제 대비 변화 재계산기
│   │   ├── RawStoreUiCompareModal.tsx # 원자료(RAW)·저장값(Store)·화면값(UI) 3단 일치 대조기 (T04-C10)
│   │   ├── CriteriaModal.tsx          # 35개 통과 기준(T04-C01 ~ C35) 전수 체크리스트
│   │   ├── SecurityAuditModal.tsx     # 비밀키 0건 및 개인정보 0건 감사 보고서
│   │   ├── SubmissionModal.tsx        # 짧은 확인 방법 4줄 및 AI 판단 3줄 공식 제출 모달
│   │   └── Footer.tsx                 # 푸터 및 라이선스 안내
│   ├── types/
│   │   └── board.ts                   # NormalizedReading, ReadingStatus, DailyRecord 등
│   ├── utils/
│   │   ├── boardEngine.ts             # 핵심 비즈니스 로직 (정규화, 상태 전이, 비교 계산)
│   │   ├── liveSources.ts             # 비밀키 없는 실제 공개 API 수집기 & 2일 시드 데이터
│   │   ├── kst.ts                     # Asia/Seoul KST 시간대 변환 및 포맷터
│   │   ├── fixturesData.ts            # 공식 9종 fixture 인메모리 로더
│   │   └── storage.ts                 # localStorage 영구 저장소 및 동기화
│   ├── App.tsx                        # 전역 상태 관리 및 모드 전환 (Live vs Synthetic)
│   └── main.tsx                       # React 19 진입점
├── condition/                         # 6대 평가 기준 이미지 원본 (condi 4-1 ~ 4-7)
├── CRITERIA.md                        # 과제 35개 세부 평가 기준 공식 명세서
├── GEMINI.md                          # 프로젝트 정의 및 AI Agent 가이드라인
└── package.json                       # 프로젝트 의존성 및 검증 스크립트
```

---

## 5. 핵심 UI/UX 및 디자인 품질 기준

- **글래스모피즘 & 모노크롬 스타일**: 다크/라이트 모드를 모두 지원하는 정돈된 반투명 블러(`backdrop-blur-md`), 은은한 보더, 미세 광원 효과를 적용하여 눈의 피로를 최소화하고 정보의 위계를 명확히 전달합니다.
- **반응형 6컬럼 테이블 & 글자 넘침 방지**:
  - `tabular-nums` 타이포그래피로 숫자 가변폭 흔들림을 방지하였습니다.
  - 시간 표시기를 한 줄로 컴팩트하게 포맷팅하여 좁은 화면에서도 텍스트 잘림이나 줄바꿈 현상을 차단했습니다.
- **원천 일치 검사 서랍 (Audit Drawer)**:
  - 행 클릭 시 열리는 슬라이드 서랍을 통해 원천 관측 시각, 1차 제출 기준값, 최신 갱신값, API 요청 엔드포인트를 투명하게 교차 검증할 수 있습니다.
- **PC 경계 해상도 조작 영역 보장**:
  - **1366×768** 및 **1920×1080** 해상도에서 스크롤 없이 첫 화면에 핵심 정보판(값, 단위, 출처, 두 시각, 기준 시간대, 상태 배지)이 100% 들어오도록 최적화되었습니다.

---

## 6. 기술 스택 및 개발 환경

| 계층                   | 기술 스택              | 선정 사유                                      |
| :--------------------- | :--------------------- | :--------------------------------------------- |
| **Framework**          | **React 19**           | 최신 동시성 렌더링 및 안정된 컴포넌트 생태계   |
| **Language**           | **TypeScript 5.x**     | 정적 타입 검사로 런타임 결함 사전 차단         |
| **Styling**            | **Tailwind CSS v4**    | 고성능 경량 유틸리티 CSS 엔진                  |
| **Animation**          | **Framer Motion 13.x** | 매끄러운 탭 및 모달 마이크로 인터랙션          |
| **Icons**              | **Lucide React**       | 직관적이고 일관된 벡터 아이콘 세트             |
| **Bundler**            | **Vite 8**             | 밀리초 단위 HMR 및 초경량 빌드                 |
| **Linter & Formatter** | **Oxlint & Prettier**  | Rust 기반 고속 정적 분석 및 무결점 코드 포맷팅 |

---

## 7. 로컬 설치 및 자동화 품질 검증

```bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 3단계 자동화 품질 검증 (빌드 및 린트 필수 통과)
npm run format:check
npm run lint
npm run build
```

---

## 8. 제작자 정보

- **작성자**: SKT ALEPH 장진영
- **프로젝트**: 과제 4 — 오늘의 진짜 정보판 (데이터가 안 올 때)
- **라이선스**: MIT License
