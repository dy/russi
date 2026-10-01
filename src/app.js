import { buildPatronymics } from "./patronymics.js";

const form = document.querySelector("#builder");
const input = document.querySelector("#name");
const results = document.querySelector("#results");
const error = document.querySelector("#error");

function show(value) {
  try {
    const patronymics = buildPatronymics(value);
    error.textContent = "";
    document.querySelector("#source-name").textContent = patronymics.name;
    document.querySelector("#masculine").textContent = patronymics.masculine.join(" · ");
    document.querySelector("#feminine").textContent = patronymics.feminine.join(" · ");
    document.querySelector("#confidence").textContent = patronymics.exact ? "Проверено по словарю" : "Предложено по правилу";
    document.querySelector("#note").textContent = patronymics.exact
      ? "Формы сверены со словарём. Точкой разделены равноправные варианты."
      : "Имени нет в словаре. Проверьте предложенные формы перед использованием в документах.";
    results.hidden = false;
    history.replaceState(null, "", `#${encodeURIComponent(patronymics.name)}`);
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (exception) {
    results.hidden = true;
    error.textContent = exception.message;
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  show(input.value);
});

document.querySelector("#hint").addEventListener("click", (event) => {
  if (!event.target.dataset.example) return;
  input.value = event.target.dataset.example;
  show(input.value);
});

document.querySelector(".cards").addEventListener("click", async (event) => {
  const id = event.target.dataset.copy;
  if (!id) return;
  await navigator.clipboard.writeText(document.querySelector(`#${id}`).textContent.replaceAll(" · ", ", "));
  const oldLabel = event.target.textContent;
  event.target.textContent = "Скопировано";
  setTimeout(() => { event.target.textContent = oldLabel; }, 1400);
});

if (location.hash.length > 1) {
  input.value = decodeURIComponent(location.hash.slice(1));
  show(input.value);
}
