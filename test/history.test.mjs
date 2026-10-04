import { test } from "node:test";
import assert from "node:assert/strict";
import { updateHistory } from "../lib/history.mjs";

const results = [{ name: "A", ok: true, detail: "비밀일 수 있는 문구" }, { name: "B", ok: false, detail: "HTTP 500" }];

test("오늘 결과를 맨 앞에 붙이고, 공개 페이지용으로 정상·고장만 남긴다", () => {
  const h = updateHistory([], results, "2026-10-04");
  assert.deepEqual(h, [{ date: "2026-10-04", checks: [{ name: "A", ok: true }, { name: "B", ok: false }] }]);
});

test("같은 날 다시 돌리면 그날 기록을 바꾼다", () => {
  const before = [{ date: "2026-10-04", checks: [{ name: "A", ok: false }] }];
  const h = updateHistory(before, results, "2026-10-04");
  assert.equal(h.length, 1);
  assert.equal(h[0].checks[0].ok, true);
});

test("최근 30일만 남긴다", () => {
  const before = Array.from({ length: 30 }, (_, i) => ({ date: `2026-09-${String(30 - i).padStart(2, "0")}`, checks: [] }));
  const h = updateHistory(before, results, "2026-10-01");
  assert.equal(h.length, 30);
  assert.equal(h[0].date, "2026-10-01");
  assert.equal(h.at(-1).date, "2026-09-02");
});
