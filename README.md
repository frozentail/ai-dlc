# AIDLC Workshop

AIDLC (AI-Driven Development Life Cycle) 워크샵을 위한 사전 구성 프로젝트입니다.

## 개요

이 프로젝트는 AIDLC 워크샵 참가자들이 별도의 설정 없이 바로 실습을 시작할 수 있도록 필요한 파일과 구조를 미리 세팅해둔 템플릿입니다.

## 배포 후 초기 설정

### 1. DB 마이그레이션

```bash
docker compose exec backend alembic upgrade head
```

### 2. 관리자 계정 생성

```bash
docker compose exec backend python -c "
import urllib.request, json
data = json.dumps({
    'store_identifier': 'my-store',
    'store_name': '내 매장 이름',
    'username': 'admin',
    'password': 'your-password'
}).encode()
req = urllib.request.Request(
    'http://localhost:8000/auth/admin/setup',
    data=data,
    headers={'Content-Type': 'application/json'}
)
print(urllib.request.urlopen(req).read().decode())
"
```

- `store_identifier`: 영문 소문자로 된 매장 식별자 (예: `my-restaurant`)
- `store_name`: 매장 이름
- `username`: 관리자 로그인 ID
- `password`: 관리자 비밀번호 (영문/숫자, 72자 이내)

### 3. 관리자 페이지 접속

`/admin` 경로로 접속 후 위에서 설정한 계정으로 로그인합니다.

### 4. 테이블 생성

관리자 페이지 > 테이블 관리에서 테이블 번호와 비밀번호를 설정합니다.

### 5. 고객 페이지 초기 설정

기본 도메인 접속 시 setup 페이지에서 매장 식별자, 테이블 번호, 비밀번호를 입력합니다.

## 시작하기

1. 이 프로젝트를 클론하거나 다운로드합니다
2. 프로젝트 디렉토리에서 Kiro IDE 또는 Kiro CLI를 실행합니다
3. 추가 설정 없이 AIDLC 워크플로우를 바로 시작할 수 있습니다

### 환경별 Agent 설정

이 프로젝트는 실행 환경에 따라 다른 Agent 설정을 사용합니다:

- **Kiro IDE**: `AGENTS.md`를 이용하여 기본 Agent에 가이드 설정
  - `.kiro/steering/` 디렉토리의 워크플로우 규칙 적용
  - 한국어 응답 (기술 용어 제외)
  - 구조화된 워크플로우 가이드
  - 모든 단계에서 사용자 승인 필수

- **Kiro CLI**: `.kiro/agents/aidlc-worker.json`의 agent 설정을 통해 Custom Agent 생성
  - 한국어 응답 (기술 용어 제외)
  - 구조화된 워크플로우 가이드
  - 모든 단계에서 사용자 승인 필수

## 프로젝트 구조

```
aidlc-workshop/
├── .kiro/                          # Kiro 설정
│   ├── agents/                     # Custom Agent 설정 (CLI용)
│   │   └── aidlc-worker.json
│   ├── steering/                   # AIDLC 워크플로우 규칙
│   │   └── aws-aidlc-rules/
│   └── aws-aidlc-rule-details/     # 상세 규칙 문서
├── AGENTS.md                       # Agent 가이드 (IDE용)
└── README.md                       # 프로젝트 설명
```

## 사전 구성 내용

- **AIDLC 워크플로우 규칙**: Inception, Construction, Operations 단계별 가이드
- **Agent 설정**: aidlc-worker agent
- **한국어 지원**: 기술 용어를 제외한 모든 응답이 한국어로 제공됩니다

## 워크플로우

AIDLC는 다음 단계로 구성됩니다:

1. **Inception Phase**: 요구사항 분석, 설계, 계획 수립
2. **Construction Phase**: 상세 설계, 코드 생성, 빌드 및 테스트
3. **Operations Phase**: 배포 및 운영 (향후 확장 예정)

## 요구사항

- Kiro IDE 또는 Kiro CLI 설치

## 라이선스

워크샵 교육용 프로젝트입니다.