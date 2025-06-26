import { component$, useSignal, useTask$, useVisibleTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";

const API_URL = "http://localhost:3001"; // Update as necessary if backend URL changes

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export default component$(() => {
  // PUBLIC_INTERFACE
  /** Signal for the list of tasks to display */
  const tasks = useSignal<Task[]>([]);
  // PUBLIC_INTERFACE
  /** Signal for loading state */
  const loading = useSignal<boolean>(false);
  // PUBLIC_INTERFACE
  /** Signal for new task input */
  const newTask = useSignal<string>("");
  // PUBLIC_INTERFACE
  /** Signal for error messages */
  const error = useSignal<string | null>(null);

  // Fetch task list from backend
  useTask$(async () => {
    loading.value = true;
    try {
      const response = await fetch(`${API_URL}/tasks`);
      if (!response.ok) throw new Error("Failed to fetch tasks");
      tasks.value = await response.json();
      error.value = null;
    } catch (e: any) {
      error.value = e.message ?? "Could not retrieve tasks!";
    } finally {
      loading.value = false;
    }
  });

  // Implement "real-time" updates by polling every N seconds
  useVisibleTask$(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/tasks`);
        if (response.ok) {
          tasks.value = await response.json();
        }
      } catch (err) {
        // ignore polling errors to avoid empty block lint error
        void err;
      }
    }, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  });

  // PUBLIC_INTERFACE
  /** Add a new task to the list and backend */
  const addTask = $(
    async (e: Event) => {
      e.preventDefault();
      if (!newTask.value.trim()) return;
      try {
        loading.value = true;
        const response = await fetch(`${API_URL}/tasks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ title: newTask.value.trim() }),
        });
        if (!response.ok) {
          throw new Error("Failed to add task");
        }
        const created = await response.json();
        tasks.value = [...tasks.value, created];
        newTask.value = "";
        error.value = null;
      } catch (e: any) {
        error.value = e.message ?? "Failed to add task";
      } finally {
        loading.value = false;
      }
    }
  );

  // PUBLIC_INTERFACE
  /** Delete a task from the list and backend */
  const deleteTask = $(
    async (id: string) => {
      if (!window.confirm("Delete this task?")) return;
      try {
        await fetch(`${API_URL}/tasks/${id}`, { method: "DELETE" });
        tasks.value = tasks.value.filter((task) => task.id !== id);
      } catch (err) {
        // ignore errors as UI is optimistic
        void err;
      }
    }
  );

  // PUBLIC_INTERFACE
  /** Toggle completion state for a task */
  const toggleTask = $(
    async (id: string, completed: boolean) => {
      try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !completed }),
        });
        if (!response.ok) throw new Error("Failed to update task");
        // Update in local state for instant feedback
        tasks.value = tasks.value.map((task) =>
          task.id === id ? { ...task, completed: !completed } : task
        );
      } catch (err) {
        // ignore errors as UI is optimistic
        void err;
      }
    }
  );

  return (
    <div class="container task-manager">
      <header class="task-header">
        <h1>
          <span class="brand-accent">Task</span> Manager
        </h1>
      </header>
      <section class="task-form-section">
        <form class="task-form" preventdefault:submit onSubmit$={addTask}>
          <input
            type="text"
            class="task-input"
            placeholder="Add a new task..."
            value={newTask.value}
            onInput$={(e) => (newTask.value = (e.target as HTMLInputElement).value)}
            disabled={loading.value}
            maxLength={80}
          />
          <button type="submit" class="button-accent" disabled={loading.value || !newTask.value.trim()}>
            Add
          </button>
        </form>
        {error.value && <div class="task-error">{error.value}</div>}
      </section>
      <section class="task-list-section">
        {loading.value ? (
          <div class="task-loading">Loading...</div>
        ) : tasks.value.length === 0 ? (
          <div class="task-empty">No tasks yet. Enjoy your day!</div>
        ) : (
          <ul class="task-list">
            {tasks.value.map((task) => (
              <li key={task.id} class={{ "task-item": true, completed: task.completed }}>
                <label class="task-checkbox-label">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange$={async () => await toggleTask(task.id, task.completed)}
                  />
                  <span class="custom-checkbox" />
                </label>
                <span class="task-title">{task.title}</span>
                <button
                  class="button-delete"
                  title="Delete"
                  onClick$={async () => await deleteTask(task.id)}
                >
                  🗑
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Task Manager - Qwik + Express",
  meta: [
    {
      name: "description",
      content: "Modern minimal Qwik task manager app with Express backend.",
    },
  ],
};
