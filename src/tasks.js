import { supabase } from "./lib/supabase.js";

/**
 * @typedef {{ id: string; title: string; completed: boolean; created_at: string }} TaskRow
 */

/** @returns {Promise<TaskRow[]>} */
export async function listTasks() {
  const { data, error } = await supabase
    .from("tasks")
    .select("id, title, completed, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** @param {string} title @returns {Promise<TaskRow>} */
export async function createTask(title) {
  const trimmed = title.trim();
  const { data, error } = await supabase
    .from("tasks")
    .insert({ title: trimmed, completed: false })
    .select("id, title, completed, created_at")
    .single();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id
 * @param {{ title?: string; completed?: boolean }} patch
 */
export async function updateTask(id, patch) {
  const { data, error } = await supabase
    .from("tasks")
    .update(patch)
    .eq("id", id)
    .select("id, title, completed, created_at")
    .single();

  if (error) throw error;
  return data;
}

/** @param {string} id */
export async function deleteTask(id) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

/** Deletes all completed tasks for the signed-in user (RLS). */
export async function deleteCompletedTasks() {
  const { error } = await supabase.from("tasks").delete().eq("completed", true);
  if (error) throw error;
}
