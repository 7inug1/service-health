// 공개 상태 페이지에 쓸 기록. 오류 문구는 남기지 않고 정상·고장만 남긴다.
const DAYS = 30;

export function updateHistory(history, results, date) {
  const today = { date, checks: results.map(({ name, ok }) => ({ name, ok })) };
  return [today, ...history.filter(d => d.date !== date)].slice(0, DAYS);
}
