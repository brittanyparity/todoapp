const STORAGE_KEY = "todoapp.tasks.v1";

/** @typedef {{ id: string; text: string; done: boolean }} Task */

const composer = document.getElementById("composer");
const taskInput = document.getElementById("task-input");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const toolbar = document.getElementById("toolbar");
const countLabel = document.getElementById("count-label");
const clearDoneBtn = document.getElementById("clear-done");

/** @type {Task[]} */
let tasks = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (t) =>
          t &&
          typeof t.id === "string" &&
          typeof t.text === "string" &&
          typeof t.done === "boolean"
      )
      .map((t) => ({ id: t.id, text: t.text, done: t.done }));
  } catch {
    return [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function updateEmptyState() {
  const hasTasks = tasks.length > 0;
  emptyEl.hidden = hasTasks;
  toolbar.hidden = !hasTasks;
}

function updateCount() {
  const open = tasks.filter((t) => !t.done).length;
  const total = tasks.length;
  if (total === 0) {
    countLabel.textContent = "";
    return;
  }
  countLabel.textContent =
    open === 0 ? "All done" : `${open} open · ${total} total`;
}

function render() {
  listEl.replaceChildren();
  for (const task of tasks) {
    const li = document.createElement("li");
    li.className = `item${task.done ? " done" : ""}`;
    li.dataset.id = task.id;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "toggle";
    toggle.checked = task.done;
    toggle.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");

    const label = document.createElement("label");
    label.className = "item-label";
    label.htmlFor = `task-${task.id}`;
    label.textContent = task.text;

    toggle.id = `task-${task.id}`;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Remove";
    del.setAttribute("aria-label", `Remove: ${task.text}`);

    toggle.addEventListener("change", () => {
      task.done = toggle.checked;
      save();
      li.classList.toggle("done", task.done);
      toggle.setAttribute(
        "aria-label",
        task.done ? "Mark as not done" : "Mark as done"
      );
      updateCount();
    });

    del.addEventListener("click", () => {
      tasks = tasks.filter((t) => t.id !== task.id);
      save();
      li.remove();
      updateEmptyState();
      updateCount();
    });

    li.append(toggle, label, del);
    listEl.append(li);
  }
  updateEmptyState();
  updateCount();
}

composer.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;
  tasks.unshift({ id: uid(), text, done: false });
  save();
  taskInput.value = "";
  render();
  taskInput.focus();
});

clearDoneBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  save();
  render();
});

render();
taskInput.focus();
