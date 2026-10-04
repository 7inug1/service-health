# service-health

Digestube·VIZUDEN·포트폴리오 사이트를 매일 09:00(KST)에 점검하는 비공개 저장소.
하나라도 실패하면 GitHub Actions 실패 메일이 온다. 결과 표는 실행 기록의 Summary 에 남는다.

## 점검 기준

1. 심사자가 누르는 경로가 열리는가
2. 조용히 멈추는 외부 서비스(크레딧·지출 한도·API 종료)가 살아 있는가

## 항목

| 서비스 | 항목 | 함께 확인되는 것 |
|---|---|---|
| 포트폴리오 | 첫 화면 | Vercel |
| Digestube | 첫 화면, 맛보기 영상 | Vercel |
| Digestube | 검색 | Supabase DB, Hugging Face 임베딩·리랭커 |
| Digestube | 질문 답변 | Gemini (받아쓰기와 같은 키) |
| Digestube | Claude 키 | 목차 생성용 키의 잔액·지출 한도 |
| VIZUDEN | 첫 화면, 유형 진단, 샘플 번역서 | Vercel |
| VIZUDEN | Claude 키, Tavily 키 | 보고서 생성용 키 |

- 하지 않는 것: 새 영상 등록, 보고서 생성처럼 한 번에 돈이 드는 동작
- 드는 비용: 하루 질문 답변 1번(Gemini), Claude 출력 1토큰 2번, Tavily 검색 1번
- VIZUDEN DB 는 vizuden 저장소의 `keepalive` 가 6시간마다 직접 조회한다(실패 시 그쪽에서 메일)

## 실행

```bash
npm test          # 판정 규칙 테스트
npm run check     # 실제 점검 (키는 환경변수로)
```
