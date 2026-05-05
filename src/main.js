import { supabase } from "./lib/supabase.js";
import * as tasksApi from "./tasks.js";

/** @typedef {{ id: string; title: string; completed: boolean }} Task */

const authPanel = document.getElementById("auth-panel");
const todoPanel = document.getElementById("todo-panel");
const authForm = document.getElementById("auth-form");
const authEmail = document.getElementById("auth-email");
const authPassword = document.getElementById("auth-password");
const authSignIn = document.getElementById("auth-sign-in");
const authSignUp = document.getElementById("auth-sign-up");
const authError = document.getElementById("auth-error");
const sessionEmail = document.getElementById("session-email");
const signOutBtn = document.getElementById("sign-out");
const composer = document.getElementById("composer");
const taskInput = document.getElementById("task-input");
const addBtn = document.getElementById("add-btn");
const listEl = document.getElementById("list");
const emptyEl = document.getElementById("empty");
const toolbar = document.getElementById("toolbar");
const countLabel = document.getElementById("count-label");
const clearDoneBtn = document.getElementById("clear-done");
const tasksLoading = document.getElementById("tasks-loading");
const taskError = document.getElementById("task-error");

/** @type {Task[]} */
let tasks = [];

function setAuthError(message) {
  authError.classList.remove("feedback-info");
  authError.classList.add("feedback-error");
  if (!message) {
    authError.hidden = true;
    authError.textContent = "";
    return;
  }
  authError.textContent = message;
  authError.hidden = false;
}

function setAuthInfo(message) {
  authError.classList.remove("feedback-error");
  authError.classList.add("feedback-info");
  authError.textContent = message;
  authError.hidden = false;
}

function setTaskError(message) {
  if (!message) {
    taskError.hidden = true;
    taskError.textContent = "";
    return;
  }
  taskError.textContent = message;
  taskError.hidden = false;
}

function showAuth() {
  authPanel.hidden = false;
  todoPanel.hidden = true;
}

function showTodo(email) {
  authPanel.hidden = true;
  todoPanel.hidden = false;
  sessionEmail.textContent = email ?? "";
}

function updateEmptyState() {
  const hasTasks = tasks.length > 0;
  emptyEl.hidden = hasTasks;
  toolbar.hidden = !hasTasks;
}

function updateCount() {
  const open = tasks.filter((t) => !t.completed).length;
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
    li.className = `item${task.completed ? " done" : ""}`;
    li.dataset.id = task.id;

    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.className = "toggle";
    toggle.checked = task.completed;
    toggle.setAttribute(
      "aria-label",
      task.completed ? "Mark as not done" : "Mark as done"
    );

    const label = document.createElement("label");
    label.className = "item-label";
    label.htmlFor = `task-${task.id}`;
    label.textContent = task.title;

    toggle.id = `task-${task.id}`;

    const del = document.createElement("button");
    del.type = "button";
    del.className = "delete";
    del.textContent = "Remove";
    del.setAttribute("aria-label", `Remove: ${task.title}`);

    toggle.addEventListener("change", async () => {
      const next = toggle.checked;
      toggle.disabled = true;
      setTaskError("");
      try {
        await tasksApi.updateTask(task.id, { completed: next });
        task.completed = next;
        li.classList.toggle("done", next);
        toggle.setAttribute(
          "aria-label",
          next ? "Mark as not done" : "Mark as done"
        );
        updateCount();
      } catch (err) {
        toggle.checked = !next;
        setTaskError(err instanceof Error ? err.message : "Could not update task.");
      } finally {
        toggle.disabled = false;
      }
    });

    del.addEventListener("click", async () => {
      del.disabled = true;
      setTaskError("");
      try {
        await tasksApi.deleteTask(task.id);
        tasks = tasks.filter((t) => t.id !== task.id);
        li.remove();
        updateEmptyState();
        updateCount();
      } catch (err) {
        setTaskError(err instanceof Error ? err.message : "Could not remove task.");
      } finally {
        del.disabled = false;
      }
    });

    li.append(toggle, label, del);
    listEl.append(li);
  }
  updateEmptyState();
  updateCount();
}

async function refreshTasks() {
  tasksLoading.hidden = false;
  setTaskError("");
  try {
    const rows = await tasksApi.listTasks();
    tasks = rows.map((r) => ({
      id: r.id,
      title: r.title,
      completed: r.completed,
    }));
    render();
  } catch (err) {
    setTaskError(err instanceof Error ? err.message : "Could not load tasks.");
    tasks = [];
    render();
  } finally {
    tasksLoading.hidden = true;
  }
}

async function applySession(session) {
  if (!session?.user) {
    tasks = [];
    render();
    showAuth();
    authEmail.focus();
    return;
  }
  showTodo(session.user.email ?? "");
  await refreshTasks();
  taskInput.focus();
}

async function initSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  await applySession(session);
}

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "INITIAL_SESSION") {
    return;
  }
  if (event === "SIGNED_OUT") {
    await applySession(null);
    return;
  }
  if (event === "SIGNED_IN" && session?.user) {
    await applySession(session);
    return;
  }
  if (event === "USER_UPDATED" && session?.user) {
    sessionEmail.textContent = session.user.email ?? "";
  }
});

authForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  setAuthError("");
  authSignIn.disabled = true;
  authSignUp.disabled = true;
  const email = authEmail.value.trim();
  const password = authPassword.value;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (err) {
    setAuthError(err instanceof Error ? err.message : "Sign in failed.");
  } finally {
    authSignIn.disabled = false;
    authSignUp.disabled = false;
  }
});

authSignUp.addEventListener("click", async () => {
  setAuthError("");
  authSignIn.disabled = true;
  authSignUp.disabled = true;
  const email = authEmail.value.trim();
  const password = authPassword.value;
  try {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    setAuthInfo(
      "Check your email to confirm your account if required by your project settings."
    );
  } catch (err) {
    setAuthError(err instanceof Error ? err.message : "Sign up failed.");
  } finally {
    authSignIn.disabled = false;
    authSignUp.disabled = false;
  }
});

signOutBtn.addEventListener("click", async () => {
  setTaskError("");
  await supabase.auth.signOut();
});

composer.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;
  addBtn.disabled = true;
  taskInput.disabled = true;
  setTaskError("");
  try {
    const row = await tasksApi.createTask(title);
    tasks.unshift({
      id: row.id,
      title: row.title,
      completed: row.completed,
    });
    taskInput.value = "";
    render();
    taskInput.focus();
  } catch (err) {
    setTaskError(err instanceof Error ? err.message : "Could not add task.");
  } finally {
    addBtn.disabled = false;
    taskInput.disabled = false;
  }
});

clearDoneBtn.addEventListener("click", async () => {
  clearDoneBtn.disabled = true;
  setTaskError("");
  try {
    await tasksApi.deleteCompletedTasks();
    tasks = tasks.filter((t) => !t.completed);
    render();
  } catch (err) {
    setTaskError(
      err instanceof Error ? err.message : "Could not clear completed tasks."
    );
  } finally {
    clearDoneBtn.disabled = false;
  }
});

initSession().catch((err) => {
  setAuthError(err instanceof Error ? err.message : "Could not start app.");
  showAuth();
});
