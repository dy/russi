import { readFile, writeFile } from "node:fs/promises";

const source = await readFile(new URL("../dicts/patronimics.txt", import.meta.url), "utf8");
const entries = source.trim().split(/\r?\n/u).slice(1).map((line) => {
  const [name, masculine, feminine] = line.split("\t");
  return [name.toLocaleLowerCase("ru-RU"), [masculine.split("|"), feminine.split("|")]];
});

const records = Object.fromEntries(entries);
const banner = "// Generated from dicts/patronimics.txt by npm run build. Do not edit manually.\n";
await writeFile(new URL("../src/patronymics-data.js", import.meta.url), `${banner}export const PATRONYMICS = ${JSON.stringify(records, null, 2)};\n`);
console.log(`Generated ${Object.keys(records).length} patronymic records.`);
