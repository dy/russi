import test from "node:test";
import assert from "node:assert/strict";
import { buildPatronymics } from "../src/patronymics.js";

test("returns irregular dictionary forms", () => {
  assert.deepEqual(buildPatronymics("  илья  "), {
    name: "Илья", masculine: ["Ильич"], feminine: ["Ильинична"], exact: true
  });
});

test("keeps accepted alternatives", () => {
  const result = buildPatronymics("Ярослав");
  assert.deepEqual(result.masculine, ["Ярославович", "Ярославич"]);
  assert.deepEqual(result.feminine, ["Ярославовна", "Ярославна"]);
});

test("suggests forms for unknown Cyrillic names", () => {
  assert.deepEqual(buildPatronymics("Аурон"), {
    name: "Аурон", masculine: ["Ауронович"], feminine: ["Ауроновна"], exact: false
  });
});

test("rejects empty and non-Cyrillic input", () => {
  assert.throws(() => buildPatronymics(""), /Введите имя/u);
  assert.throws(() => buildPatronymics("Alex"), /русские буквы/u);
});
