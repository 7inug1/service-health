// 점검 결과(results.json)를 공개 기록(docs/history.json)에 합친다.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { updateHistory } from "./lib/history.mjs";

const HISTORY = "docs/history.json";
const results = JSON.parse(readFileSync("results.json", "utf8"));
const history = existsSync(HISTORY) ? JSON.parse(readFileSync(HISTORY, "utf8")) : [];
const date = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10); // KST 날짜
writeFileSync(HISTORY, JSON.stringify(updateHistory(history, results, date), null, 1) + "\n");
console.log(`${date} 기록 저장`);
