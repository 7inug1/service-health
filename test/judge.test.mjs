import { test } from "node:test";
import assert from "node:assert/strict";
import { judgePage, judgeSearch, judgeAsk, judgeKey } from "../lib/judge.mjs";

test("페이지: 200이고 글자가 있으면 통과", () => {
  assert.equal(judgePage(200, "<title>Digestube</title>", "Digestube").ok, true);
});

test("페이지: 200이어도 글자가 없으면 실패", () => {
  assert.equal(judgePage(200, "<html></html>", "Digestube").ok, false);
});

test("페이지: 404면 실패", () => {
  assert.equal(judgePage(404, "NOT_FOUND", "Digestube").ok, false);
});

test("검색: 결과가 있고 리랭커가 응답하면 통과", () => {
  const r = judgeSearch(200, { hits: [{ seq: 1 }], rerank: { reranked: true, reason: null } });
  assert.equal(r.ok, true);
});

test("검색: 결과가 0개면 실패", () => {
  assert.equal(judgeSearch(200, { hits: [], rerank: { reranked: false, reason: null } }).ok, false);
});

test("검색: 리랭커가 오류면 실패", () => {
  const r = judgeSearch(200, { hits: [{ seq: 1 }], rerank: { reranked: false, reason: "error" } });
  assert.equal(r.ok, false);
});

test("검색: 500이면 실패", () => {
  assert.equal(judgeSearch(500, { error: "x" }).ok, false);
});

test("답변: done 줄에 글이 있으면 통과", () => {
  const body = '{"t":"delta","text":"안"}\n{"t":"done","text":"안녕","cites":[1],"declined":false}\n';
  assert.equal(judgeAsk(200, body).ok, true);
});

test("답변: error 줄이 오면 실패", () => {
  const body = '{"t":"error","error":"잠시 후 다시 시도해 주세요."}\n';
  const r = judgeAsk(200, body);
  assert.equal(r.ok, false);
  assert.match(r.detail, /잠시 후/);
});

test("답변: done 없이 끝나면 실패", () => {
  assert.equal(judgeAsk(200, '{"t":"delta","text":"안"}\n').ok, false);
});

test("답변: 429면 실패", () => {
  assert.equal(judgeAsk(429, '{"error":"오늘 물어보기 50번을 다 썼어요."}').ok, false);
});

test("API 키: 200이면 통과", () => {
  assert.equal(judgeKey(200, {}).ok, true);
});

test("API 키: 실패하면 서비스가 보낸 오류 문구를 보여 준다", () => {
  const r = judgeKey(400, { error: { message: "Your credit balance is too low" } });
  assert.equal(r.ok, false);
  assert.match(r.detail, /credit balance/);
});
