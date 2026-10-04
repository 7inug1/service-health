// 매일 도는 점검. 하나라도 실패하면 종료 코드 1 → GitHub 가 실패 메일을 보낸다.
// 돈이 드는 동작(새 영상 등록, 보고서 생성)은 부르지 않는다. API 키는 출력하지 않는다.
import { appendFileSync, writeFileSync } from "node:fs";
import { judgePage, judgeSearch, judgeAsk, judgeKey } from "./lib/judge.mjs";

const DIGESTUBE = "https://digestube.vercel.app";
const VIZUDEN = "https://vizuden.com";
const PORTFOLIO = "https://jinwookshin.vercel.app/ko";
const SAMPLE_VIDEO = "byVgbqzYJrs"; // 로그인 없이 보이는 맛보기 영상
const QUESTION = "기대를 내려놓으라고 하는 이유가 뭐야?";
const TIMEOUT = 60_000;

const get = (url, init = {}) => fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT) });
const text = async url => { const r = await get(url); return [r.status, await r.text()]; };
const json = async (url, init) => { const r = await get(url, init); return [r.status, await r.json().catch(() => null)]; };

let hits = []; // 검색 결과를 질문 점검이 이어 쓴다

const page = (url, mustContain) => async () => judgePage(...await text(url), mustContain);

const checks = [
  ["포트폴리오 · 첫 화면", page(PORTFOLIO, "Jinwook Shin")],
  ["Digestube · 첫 화면", page(DIGESTUBE, "Digestube")],
  ["Digestube · 맛보기 영상", page(`${DIGESTUBE}/videos/${SAMPLE_VIDEO}`, "Digestube")],
  ["Digestube · 검색 (DB·Hugging Face)", async () => {
    const q = encodeURIComponent(QUESTION);
    const [status, body] = await json(`${DIGESTUBE}/api/search?q=${q}&k=3&ids=${SAMPLE_VIDEO}&rerank=1`);
    hits = (body?.hits ?? []).map(h => ({ video_id: h.video_id, seq: h.seq }));
    return judgeSearch(status, body);
  }],
  ["Digestube · 질문 답변 (Gemini)", async () => {
    if (!hits.length) return { ok: false, detail: "검색 결과가 없어 건너뜀" };
    const r = await get(`${DIGESTUBE}/api/ask`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ q: QUESTION, hits }),
    });
    return judgeAsk(r.status, await r.text());
  }],
  ["Digestube · Claude 키 (목차)", claude("ANTHROPIC_API_KEY_DIGESTUBE")],
  ["VIZUDEN · 첫 화면", page(VIZUDEN, "VIZUDEN")],
  ["VIZUDEN · 유형 진단", page(`${VIZUDEN}/type/questions`, "VIZUDEN")],
  ["VIZUDEN · 샘플 번역서", page(`${VIZUDEN}/translator/samples`, "VIZUDEN")],
  ["VIZUDEN · Claude 키 (보고서)", claude("ANTHROPIC_API_KEY_VIZUDEN")],
  ["VIZUDEN · Tavily 키 (보고서 검색)", async () => {
    const key = process.env.TAVILY_API_KEY;
    if (!key) return { ok: false, detail: "키 없음" };
    return judgeKey(...await json("https://api.tavily.com/search", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
      body: JSON.stringify({ query: "health check", max_results: 1 }),
    }));
  }],
];

/** 출력 1토큰짜리 요청 — 잔액·지출 한도에 막혔는지까지 드러난다. */
function claude(envName) {
  return async () => {
    const key = process.env[envName];
    if (!key) return { ok: false, detail: "키 없음" };
    return judgeKey(...await json("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1, messages: [{ role: "user", content: "hi" }] }),
    }));
  };
}

const rows = [];
for (const [name, run] of checks) {
  let r;
  try { r = await run(); } catch (e) { r = { ok: false, detail: e?.name === "TimeoutError" ? "시간 초과" : String(e?.message ?? e) }; }
  rows.push({ name, ...r });
  console.log(`${r.ok ? "통과" : "실패"}  ${name}  ${r.detail}`);
}

writeFileSync("results.json", JSON.stringify(rows));
const failed = rows.filter(r => !r.ok);
if (process.env.GITHUB_STEP_SUMMARY) {
  const table = ["| 결과 | 항목 | 내용 |", "|---|---|---|",
    ...rows.map(r => `| ${r.ok ? "✅" : "❌"} | ${r.name} | ${r.detail} |`)].join("\n");
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `## 점검 결과: 실패 ${failed.length}개\n\n${table}\n`);
}
process.exit(failed.length ? 1 : 0);
