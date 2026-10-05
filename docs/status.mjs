// 상태 페이지가 쓰는 규칙. 브라우저와 테스트(test/status.test.mjs)가 같이 쓴다.

/** 감지부터 복구 확인까지 걸린 시간. "49분", "2시간 5분" */
export function durationText(start, end) {
  const min = Math.round((new Date(end) - new Date(start)) / 60_000);
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? (m ? `${h}시간 ${m}분` : `${h}시간`) : `${m}분`;
}

/**
 * 막대 하나의 상태. 기록은 하루 한 줄이라 같은 날 다시 점검해 통과하면 고장 흔적이 사라진다.
 * 그날 장애 기록(incidents.json)에 이 항목이 있으면 "고장 후 복구"로 남긴다.
 */
export function barState(day, name, incidents) {
  const c = day?.checks.find((x) => x.name === name);
  if (!c) return "none";
  if (!c.ok) return "bad";
  return incidents.some((i) => i.date === day.date && i.checks.includes(name)) ? "recovered" : "ok";
}
