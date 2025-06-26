//
// Task service layer – manages all task data in-memory and exposes helpful operations.
//

// In-memory task list and id auto-increment
let TASKS = [];
let nextId = 1;

// For SSE clients
const sseClients = new Set();

/**
 * Represents a Task.
 * @typedef {object} Task
 * @property {number} id - Unique task ID.
 * @property {string} title - Task description.
 * @property {boolean} completed - Task completion flag.
 * @property {string} createdAt - Task creation time (ISO string).
 * @property {string|null} updatedAt - Task last update time (ISO string or null).
 */

// PUBLIC_INTERFACE
function getAllTasks() {
  /** Returns a copy of all tasks. */
  return TASKS.slice();
}

// PUBLIC_INTERFACE
function addTask(title) {
  /** Adds a new task with the provided title. */
  const now = new Date().toISOString();
  const task = {
    id: nextId++,
    title: String(title),
    completed: false,
    createdAt: now,
    updatedAt: null,
  };
  TASKS.push(task);
  notifyClients();
  return task;
}

// PUBLIC_INTERFACE
function updateTask(id, updates) {
  /** Updates an entire task by id. Only fields in updates are replaced. */
  const idx = TASKS.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const allowedFields = ['title', 'completed'];
  allowedFields.forEach(f => {
    if (updates[f] !== undefined) {
      TASKS[idx][f] = updates[f];
    }
  });
  TASKS[idx].updatedAt = new Date().toISOString();
  notifyClients();
  return TASKS[idx];
}

// PUBLIC_INTERFACE
function patchTask(id, partialUpdates) {
  /** Partially updates a task. */
  return updateTask(id, partialUpdates);
}

// PUBLIC_INTERFACE
function deleteTask(id) {
  /** Removes the task with the given id. */
  const idx = TASKS.findIndex(t => t.id === id);
  if (idx === -1) return false;
  TASKS.splice(idx, 1);
  notifyClients();
  return true;
}

// PUBLIC_INTERFACE
function getTaskById(id) {
  /** Finds a task by id. */
  return TASKS.find(t => t.id === id) || null;
}

// SSE (real-time)
function registerSseClient(res) {
  sseClients.add(res);
}

// For cleaning SSE client connections
function unregisterSseClient(res) {
  sseClients.delete(res);
}

// Notify all SSE clients of latest task state
function notifyClients() {
  const data = JSON.stringify(TASKS);
  for (const client of sseClients) {
    try {
      client.write(`data: ${data}\n\n`);
    } catch {
      // Clean up broken connection
      sseClients.delete(client);
    }
  }
}

module.exports = {
  getAllTasks,
  addTask,
  updateTask,
  patchTask,
  deleteTask,
  getTaskById,
  registerSseClient,
  unregisterSseClient,
  notifyClients,
};
