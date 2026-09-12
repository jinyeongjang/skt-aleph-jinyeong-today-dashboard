# 📊 오늘의 진짜 정보판 — 데이터가 안 올 때 (Real Information Board)

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

## 📌 1. 과제 4 공식 제출 정보

- **배포 주소 (무로그인 공개 웹)**: [https://skt-aleph-jinyeong-today-dashboard.vercel.app](https://skt-aleph-jinyeong-today-dashboard.vercel.app)
- **소스코드 저장소**: [https://github.com/jinyeongjang/skt-aleph-jinyeong-today-dashboard](https://github.com/jinyeongjang/skt-aleph-jinyeong-today-dashboard)

### 📋 짧은 확인 방법 4줄 (T04-C27)

```text
① 어디로 가나요: 브라우저에서 무로그인 오늘의 진짜 정보판 메인 대시보드로 접속합니다.
② 3단계 이내 행동: [실제 동적 조회] 클릭 후 [합성 5종 실패 및 회복 시뮬레이터]에서 [TIMEOUT -> RECOVER-D2] 순차 실행 버튼을 클릭합니다.
③ 무엇이 보이면 통과인가요: 메인 화면에 값·단위·출처·출처 시각·조회 시각·기준 시간대(Asia/Seoul)가 명확히 보이며, 실패 시 마지막 정상값이 보존(stale)되고 복구 시 fresh/none 및 다음 날짜 행이 정확히 1건 추가됩니다.
④ 안 될 때 무엇이 보이나요: 네트워크 장애, 외부 401/403 거절, 호출 제한(429), 오프라인 등 장애 발생 시 마지막 정상값이 지워지지 않고 주황색 '오래된 값(Stale)' 배지와 유형별 조치 안내가 즉각 표시됩니다.
```

### 🧠 AI와 나의 판단 3줄 (T04-C28)

```text
① AI에게 맡긴 일: 공개 fixture 9종 결정론적 전이 스키마(adapter-reset.example.js) 정밀 TypeScript 포팅, Asia/Seoul 시간대 날짜 산출 및 단위 불일치 방어 수학적 비교 로직 구성.
② 학생이 직접 판단한 일: 외부 API 호출 시 비밀키 노출 0건을 위해 완전 무키 공공 오픈 API(Open-Meteo 서울 실시간 기온)를 채택하고, 같은 날짜 다중 조회의 원자적 갱신(Update)과 다음 날짜 신규 행(Create) 분기 규칙을 localStorage 키(signal_id + record_date)로 엄격히 확정함.
③ AI 제안을 따르지 않은 일: AI가 과거 날짜 기록 조작을 위한 모의 시계 임의 패치를 제안했으나, 실제 서로 다른 2일의 KST 날짜 기록 보존 요건(T04-C22~C24)의 진정성을 지키기 위해 실제 원천 관측 시각과 봉인 영수증 대조 검증 파이프라인을 그대로 보존함.
```

---

## 🎯 2. 완주 체크리스트 (5대 항목 100% 달성)

| 항목  | 점검 기준 및 과제 요건                                    | 구현 및 실측 검증 결과                                                                                                      |  상태   |
| :---: | :-------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :-----: |
| **1** | 실제 공개 원천의 값과 맥락이 보입니다.                    | Open-Meteo 서울 실시간 기온의 값·단위(°C)·출처 URL·출처 시각·조회 시각·Asia/Seoul 시간대 표시 (T04-C03~C10)                 | ✅ 완료 |
| **2** | 외부 실패 다섯 종류를 합성 재생합니다.                    | Timeout, Auth(401), Rate Limit(429), Offline, Schema Error 5종 실패 및 Recover-D2 회복 전수 검증 (T04-C12~C19, C26)         | ✅ 완료 |
| **3** | 마지막 정상값과 일별 기록을 보존합니다.                   | 어떤 실패에도 직전 정상값 100% 보존, Stale 배지 표시, 같은 날 중복 갱신(1행) 및 익일 새 행 생성 (T04-C17~C21)               | ✅ 완료 |
| **4** | 서로 다른 KST 날짜의 실제 기록 2건과 변화값을 대조합니다. | 서로 다른 2일의 실제 공개 원천 기록 보존 및 원천·저장·화면 일치, 어제 대비 변화값(Delta) 재계산 일치 (T04-C22~C24)          | ✅ 완료 |
| **5** | 개인정보·비밀값 없이 확인법을 제출합니다.                 | 브라우저/번들/Git 비밀키 원문 0건, 개인정보(PII) 0건 실시간 감사 통과 및 4줄 확인법/3줄 판단문 완비 (T04-C11, C25, C27~C35) | ✅ 완료 |

---

## 🏛️ 3. 시스템 아키텍처 및 디렉토리 구조

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
│   │   ├── DailyHistoryTable.tsx      # 일별 저장 기록 테이블 & 같은 날 중복 방지/익일 신규 행 검증기
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
├── condition/                         # 6대 평가 기준 이미지 원본 (condi 4-1 ~ 4-6)
├── CRITERIA.md                        # 과제 35개 세부 평가 기준 공식 명세서
├── GEMINI.md                          # 프로젝트 정의 및 AI Agent 가이드라인
└── package.json                       # 프로젝트 의존성 및 검증 스크립트
```

---

## 🛠️ 4. 기술 스택 및 개발 환경

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

## 💻 5. 로컬 설치 및 자동화 품질 검증

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

## 👤 6. 제작자 정보

- **작성자**: SKT ALEPH 장진영
- **프로젝트**: 과제 4 — 오늘의 진짜 정보판 (데이터가 안 올 때)
- **라이선스**: MIT License
