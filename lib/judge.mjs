// 응답을 받아 통과/실패를 정한다. 네트워크는 부르지 않는다(테스트하기 쉽게).

const pass = detail => ({ ok: true, detail });
const fail = detail => ({ ok: false, detail });

/** 페이지가 열리고, 꼭 있어야 할 글자가 보이는가. */
export function judgePage(status, body, mustContain) {
  if (status !== 200) return fail(`HTTP ${status}`);
  if (!body.includes(mustContain)) return fail(`"${mustContain}" 글자 없음`);
  return pass("열림");
}

/** Digestube 검색: 결과가 나오고(임베딩·DB), 리랭커가 오류 없이 응답했는가(Hugging Face). */
export function judgeSearch(status, json) {
  if (status !== 200) return fail(`HTTP ${status}${json?.error ? ` ${json.error}` : ""}`);
  const hits = json?.hits ?? [];
  if (!hits.length) return fail("검색 결과 0개");
  const reason = json?.rerank?.reason;
  if (reason === "error") return fail("리랭커 오류");
  return pass(`결과 ${hits.length}개, 리랭커 ${json?.rerank?.reranked ? "응답" : `건너뜀(${reason})`}`);
}

/** Digestube 질문: 흘려보낸 줄 중 마지막에 글이 있는 done 이 오는가(Gemini). */
export function judgeAsk(status, body) {
  if (status !== 200) {
    let msg = "";
    try { msg = JSON.parse(body).error ?? ""; } catch { /* 본문이 JSON 이 아니면 상태만 */ }
    return fail(`HTTP ${status}${msg ? ` ${msg}` : ""}`);
  }
  const lines = body.split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } });
  const error = lines.find(l => l?.t === "error");
  if (error) return fail(error.error ?? "오류");
  const done = lines.find(l => l?.t === "done");
  if (!done?.text) return fail("답이 끝까지 오지 않음");
  return pass(`답 ${done.text.length}자`);
}

/** 외부 API 키: 아주 작은 요청이 통과하는가. 실패하면 서비스가 보낸 문구를 그대로 보여 준다. */
export function judgeKey(status, json) {
  if (status === 200) return pass("응답");
  const msg = json?.error?.message ?? json?.error ?? json?.detail ?? "";
  return fail(`HTTP ${status}${msg ? ` ${typeof msg === "string" ? msg : JSON.stringify(msg)}` : ""}`);
}
