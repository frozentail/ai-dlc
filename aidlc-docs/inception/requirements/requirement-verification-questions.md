# 요구사항 명확화 질문

테이블 오더 애플리케이션 개발을 위해 아래 질문들에 답변해 주세요.
각 질문의 `[Answer]:` 태그 뒤에 선택한 알파벳을 입력해 주세요.

---

## Question 1
기술 스택 선호도가 있으신가요? (Frontend)

A) React (TypeScript)
B) Vue.js (TypeScript)
C) React (JavaScript)
D) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: C

---

## Question 2
기술 스택 선호도가 있으신가요? (Backend)

A) Node.js + Express (TypeScript)
B) Node.js + Fastify (TypeScript)
C) Python + FastAPI
D) Java + Spring Boot
E) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: C

---

## Question 3
데이터베이스 선호도가 있으신가요?

A) PostgreSQL
B) MySQL
C) SQLite (개발/데모용 간단 구성)
D) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: A

---

## Question 4
배포 환경은 어떻게 되나요?

A) 로컬 개발 환경만 (Docker Compose)
B) AWS (ECS, RDS 등)
C) 단순 서버 배포 (PM2, Nginx)
D) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: A

---

## Question 5
메뉴 이미지 처리 방식은 어떻게 할까요? (constraints.md에서 이미지 리사이징/최적화는 제외)

A) 이미지 URL만 저장 (외부 URL 입력)
B) 파일 업로드 지원 (서버에 저장, 리사이징 없음)
C) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: B

---

## Question 6
관리자 계정은 어떻게 초기 생성하나요?

A) 서버 시작 시 seed 데이터로 기본 관리자 계정 생성
B) 별도 초기 설정 API 제공
C) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: B

---

## Question 7
실시간 주문 모니터링의 SSE(Server-Sent Events) 연결이 끊겼을 때 재연결 전략은?

A) 자동 재연결 (브라우저 기본 SSE 재연결 사용)
B) 자동 재연결 + 폴링 fallback
C) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: A

---

## Question 8
테이블 수는 대략 어느 정도를 가정하고 개발할까요?

A) 소규모 (1~10개 테이블)
B) 중규모 (10~30개 테이블)
C) 대규모 (30개 이상)
D) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: A

---

## Question 9
메뉴 관리에서 메뉴 노출 순서 조정 방식은?

A) 드래그 앤 드롭 (UI에서 직접 순서 변경)
B) 순서 번호 직접 입력
C) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: A

---

## Question 10
주문 상태 실시간 업데이트 (고객 화면에서 주문 상태 변경 반영)를 구현할까요?
요구사항에 "선택사항"으로 표기되어 있습니다.

A) 구현 (SSE 또는 폴링으로 고객 화면에서도 실시간 상태 반영)
B) 미구현 (고객은 주문 내역 조회 시 수동 새로고침)
C) 기타 (Other - [Answer]: 태그 뒤에 설명해 주세요)

[Answer]: A
