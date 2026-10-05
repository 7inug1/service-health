# service-health

Digestube·VIZUDEN·포트폴리오 사이트를 매일 09:00(KST)에 점검하는 비공개 저장소.
하나라도 실패하면 GitHub Actions 실패 메일이 온다.

- 상태 페이지: https://7inug1.github.io/service-health/ (항목별 정상·고장, 최근 30일)
- 자세한 오류 문구: 실행 기록의 Summary

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

## 장애 기록

기록은 하루 한 줄이라, 같은 날 고치고 다시 점검하면 그날 고장 흔적이 사라진다.
그래서 장애는 `docs/incidents.json` 에 따로 남긴다(최신이 위). 상태 페이지는 이 기록이 있는 날의 막대를 주황(고장 후 복구)으로 그리고, 아래에 장애 기록을 보여 준다.

| 칸 | 내용 |
|---|---|
| `date` · `title` | 날짜(KST)와 한 줄 제목 |
| `checks` | 영향받은 점검 항목 이름 (점검 이름과 똑같이) |
| `lastOk` · `detected` · `resolved` | 마지막 정상 점검, 실패 감지, 재점검 통과 시각 |
| `impact` · `cause` · `fix` · `prevention` | 영향, 원인, 조치, 재발 방지 |

키·오류 원문 같은 내부 정보는 적지 않는다.

## 실행

```bash
npm test          # 판정 규칙 테스트
npm run check     # 실제 점검 (키는 환경변수로), results.json 생성
node record.mjs   # results.json 을 docs/history.json 에 합침
```
