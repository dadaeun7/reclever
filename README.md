# Reclever (재활용 서비스 리뉴얼)

> **Python + Spring Boot + Next.js** 기반의 AI 분리배출 추천 및 환경 서비스 리뉴얼 프로젝트

[![Live Demo](https://img.shields.io/badge/Live_Demo-reclever.daeun--tech.site-4F46E5?style=for-the-badge&logo=googlechrome&logoColor=white)](https://reclever.daeun-tech.site)
![AWS Lightsail](https://img.shields.io/badge/AWS_Lightsail-FF9900?style=for-the-badge&logo=amazonwebservices&logoColor=white)
![Gabia](https://img.shields.io/badge/Gabia_Domain-0052CC?style=for-the-badge&logo=internetcomputer&logoColor=white)

---

<p align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-FF6B6B?style=for-the-badge&logo=git&logoColor=white" alt="Status" />
  <img src="https://img.shields.io/badge/Version-v2.0.0_beta-4F46E5?style=for-the-badge" alt="Version" />
</p>

<p align="center">
  <b>데이터 수집 기반 AI 분리배출 추천 서비스</b><br />
  현재 알고리즘 고도화 및 매칭 정확도 향상을 위해 <u>지속적으로 개발 중인 프로젝트</u>입니다. <br/> 위 LIVE DEMO를 클릭해 서비스에 방문해보세요!
</p>

<br />

## Tech Stack

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Backend & Infrastructure

![Java](https://img.shields.io/badge/Java-007396?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

---

## 📍 v2.0 주요 업데이트 내용

### 1️⃣ Main Page Spline 3D 디자인 적용

- 메인 페이지에 Spline 3D 인터랙티브 그래픽 요소 도입.

### 2️⃣ Microservice 통신 gRPC 전환 (`Java Client` ↔ `Python Server`)

- 기존 FastAPI(HTTP REST) 구조에서 **gRPC 프로토콜**로 전환.
- Java(Spring Boot)는 gRPC Client, Python은 gRPC Server로 작동하여 내부 통신 오버헤드 최소화.
- 단건 응답 및 상위 3건 재추천 응답 구조를 스키마로 통합 정의.

### 3️⃣ AI 상위 3건 재추천 파이프라인

- 단건 자동 등록 방식에서 벗어나 검색 결과 후보 **Top-3**를 도출하여 사용자가 적합한 분리배출 가이드를 직접 확인 및 선택할 수 있는 UX 반영.

### 4️⃣ Hybrid Search 매칭 알고리즘 (BM25 + Dense Retrieval + RRF)

- **전처리 (`tokenize_korean`)**: Kiwi 형태소 분석기 + 정규식을 통한 용량/수량 노이즈 제거.
- **다중 검색**: `BM25Okapi`(키워드 일치) + `ChromaDB & BAAI/bge-m3`(임베딩 시맨틱 유사도).
- **RRF (Reciprocal Rank Fusion)**: 두 검색 모델의 순위를 결합하고 Vector 점수 가중치를 적용해 정확한 최적 매칭 항목 추출.

### 5️⃣ 인증 및 상태 관리 구조 개선 (JWT & Middleware)

- **Next.js Middleware 단 JWT 파싱 적용**: 요청 수신 시 Middleware에서 JWT 토큰의 Payload(`sub`)를 검증 및 디코딩하여 사용자 이메일을 안전하게 추출하도록 개선
- **SSR-Client 간 상태 초기화 파이프라인 구축**:
  - `RootLayout`(Server Component)에서 Custom Header를 조회
  - 클라이언트 사이드 Initializer 컴포넌트를 통해 브라우저 전역 상태 관리 도구인 **Zustand Store**로 이메일 데이터 동기화
- 클라이언트 단의 불필요한 추가 API 요청 없이, 페이지 로드 시점에 유저 세션 정보(Email)를 안전하고 즉각적으로 상태에 세팅

---

#### 📃 과거 버전

<details>
<summary><b>v1.0 알고리즘 및 아키텍처 한계 기록 (Click to expand)</b></summary>

## 1. 과거 비즈니스 로직 및 아키텍처 한계

### ▪️기존 파이프라인

1. **Gmail & OCR**: Gmail OAuth2 및 Google Cloud OCR을 통한 상품명 추출
2. **Spring 내장 캐시**: `itemKeywordCacheService`를 통해 핵심 키워드(~400개)를 JVM 메모리에 저장 후 `String.contains()` 검증
3. **Vertex AI 호출**: 캐시 미스 발생 시 Vertex AI SDK를 통해 실시간 AI 추천 수집
4. **분리배출 정보 도출**

### ▪️비즈니스 / 기술적 한계

- **JVM 과한 점유 및 단순 연산 한계**: 단순 포함 연산의 가중성 및 JVM 메모리 부담 발생
- **50% 이상의 높은 미스매칭**: 신규 수식어, 변형 단어 인입 시 전혀 다른 결과 도출
- **높은 레이턴시 & Cost**: 캐시 미스율이 높아 실시간 LLM API 통신 대기 시간이 가중되고 비용 증가

---

## 2. 새로운 데이터 수집/분류 방식 및 자카드(Jaccard)의 한계

### ▪️개선된 수집 & 분류 파이프라인

1. **국가데이터처 통계청 API**: 온라인 상품명 데이터 수집
2. **Ollama (한국어 LLM)**: 단계적 프롬프트 설계를 통해 상품명 기반 배출 방법 추론
3. **Python 자동화**: 추론 로직 자동 호출 및 수집 스크립트 작성
4. **Jaccard 기반 로컬 매칭**:
   - 어절 분해 및 불필요한 부사어 제거 (토큰화)
   - 23개 카테고리 사전 데이터와 병렬 연산 및 수량/고유이름 결합 검색 세트 구축
   - 다중 점수 매칭 중 최댓값 반환

### ▪️자카드 프로세스의 한계

1. **분모 비대화 현상**: 키워드가 일치하더라도 전체 합집합($|A \cup B|$)의 크기가 크면 스코어가 0.0으로 수렴
2. **데이터 노이즈 영향**: AI 호출 과정에서 들어간 불필요한 토큰이 분모를 키워 스코어 하락
3. **적은 토큰 데이터**: 통계청 데이터의 적은 볼륨으로 인한 토큰 부족 문제 발생

---

## 3. 데이터 수집 시도 및 매칭 로직 최종 개선

### ▪️데이터 수집을 위한 다양한 시도

- ❌ **Gmail / NVIDIA Open AI**: API 호출 수 제한 및 시간 대비 적은 수집량
- ❌ **온라인 쇼핑몰 크롤링**: 헤더 세팅 등 봇 차단 우회 시도했으나 접속 제한으로 실패
- ⭕ **AI HUB 라벨링 데이터**: `.tar` 상품명 데이터에서 Python으로 5초 만에 **9,819개 고유 상품명 추출 성공**

### ▪️매칭 로직 및 공식 전환 (Containment)

1. **토큰화 & 정규식 필터링**: 단어 단위 분해, 대소문자/영문/숫자 필터링 및 수량/용량 단위 정규식 제거
2. **Containment 공식 전환**: 자카드 대신 입력 단어 대비 매칭 비율 측정 공식 도입
   $$\text{Score} = \frac{\text{매칭 토큰}}{\text{토큰화된 상품명}}$$
3. **보정 및 임베딩 점수 도출**:
   - 명사 매칭을 주력으로 하되, **용량 일치 시 보너스 점수 가산**
   - 매칭 실패 시 임베딩 기반 시맨틱 매칭 레이어 구성

---

## 4. 현재 성과 및 향후 보완점

### ▪️측정 성과

- **매칭 스코어 정상화**: 기존 분모 비대화로 인해 0.00x (0에 수렴)하던 임계값이 **0.25 ~ 0.3 수준으로 정상 최적화**됨.

### ▪️향후 보완 과제

1. **데이터 볼륨 확장**: 키워드 포함 상품은 빠르고 정확하나, 데이터 볼륨 확장을 통해 전체 정확도 향상 필요
2. **공백 없는 상품명 토큰화**: 어절 분리가 안 된 붙어있는 문자열 인입 시 매칭률 저하 $\rightarrow$ 전처리 토큰화 방식 수립 필요
3. **임베딩 모델 재검증**: 키워드 Miss 시 임베딩 시맨틱 매칭 10개 중 8개가 오탐 발생 및 네트워크 비용 가중 $\rightarrow$ 타겟 임베딩 모델 비교 및 교체 검토

</details>
