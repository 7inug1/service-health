import { test } from "node:test";
import assert from "node:assert/strict";
import { durationText, barState } from "../docs/status.mjs";

test("durationText: 감지부터 복구까지 걸린 시간을 사람 말로", () => {
  assert.equal(durationText("2026-10-05T13:42:00+09:00", "2026-10-05T14:31:00+09:00"), "49분");
  assert.equal(durationText("2026-10-05T09:00:00+09:00", "2026-10-05T11:05:00+09:00"), "2시간 5분");
  assert.equal(durationText("2026-10-05T09:00:00+09:00", "2026-10-05T11:00:00+09:00"), "2시간");
});

const incidents = [{ date: "2026-10-05", checks: ["Digestube · 검색 (DB·Hugging Face)"] }];

test("barState: 같은 날 다시 점검해 통과했어도 장애 기록이 있으면 '고장 후 복구'", () => {
  const day = { date: "2026-10-05", checks: [{ name: "Digestube · 검색 (DB·Hugging Face)", ok: true }] };
  assert.equal(barState(day, "Digestube · 검색 (DB·Hugging Face)", incidents), "recovered");
});

test("barState: 그날 기록 그대로 정상·고장, 기록이 없으면 none", () => {
  const day = { date: "2026-10-04", checks: [{ name: "A", ok: true }, { name: "B", ok: false }] };
  assert.equal(barState(day, "A", incidents), "ok");
  assert.equal(barState(day, "B", incidents), "bad");
  assert.equal(barState(day, "C", incidents), "none");
  assert.equal(barState(undefined, "A", incidents), "none");
});

test("barState: 그날 아직 고장이면 장애 기록이 있어도 bad", () => {
  const day = { date: "2026-10-05", checks: [{ name: "Digestube · 검색 (DB·Hugging Face)", ok: false }] };
  assert.equal(barState(day, "Digestube · 검색 (DB·Hugging Face)", incidents), "bad");
});
