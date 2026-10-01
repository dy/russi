import { PATRONYMICS } from "./patronymics-data.js";

const CYRILLIC_NAME = /^[А-ЯЁа-яё -]+$/u;

function titleCase(value) {
  return value.toLocaleLowerCase("ru-RU").replace(/(^|[ -])([а-яё])/gu, (_, prefix, letter) => prefix + letter.toLocaleUpperCase("ru-RU"));
}

function suggest(name) {
  const lower = name.toLocaleLowerCase("ru-RU");
  if (lower.endsWith("ий")) {
    const stem = name.slice(0, -2);
    return [[`${stem}иевич`], [`${stem}иевна`]];
  }
  if (lower.endsWith("ей") || lower.endsWith("ай")) {
    const stem = name.slice(0, -1);
    return [[`${stem}евич`], [`${stem}евна`]];
  }
  if (lower.endsWith("ь")) {
    const stem = name.slice(0, -1);
    return [[`${stem}евич`], [`${stem}евна`]];
  }
  if (/[ая]$/u.test(lower)) {
    const stem = name.slice(0, -1);
    return [[`${stem}ич`], [`${stem}ична`]];
  }
  return [[`${name}ович`], [`${name}овна`]];
}

export function buildPatronymics(value) {
  const input = String(value ?? "").trim().replace(/\s+/g, " ");
  if (!input) throw new TypeError("Введите имя отца.");
  if (!CYRILLIC_NAME.test(input)) throw new TypeError("Используйте только русские буквы, пробел или дефис.");

  const name = titleCase(input);
  const record = PATRONYMICS[name.toLocaleLowerCase("ru-RU")];
  const [masculine, feminine] = record ?? suggest(name);
  return { name, masculine, feminine, exact: Boolean(record) };
}
