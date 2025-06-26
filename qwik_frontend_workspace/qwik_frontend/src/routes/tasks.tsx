import {
  component$,
  useStore,
  useSignal,
  useVisibleTask$,
  $,
  useComputed$,
} from "@builder.io/qwik";
import NavBar from "../components/NavBar";

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const API_URL = "/api/tasks";

// PUBLIC_INTERFACE
/**
 * Mobile-focused Task Manager page using Tailwind CSS and Qwik best practices.
 * Features:
 * - View all tasks, add, mark complete/incomplete, delete.
 * - Real-time sync with Express API.
 * - Modern, touch-friendly UI.
 */
export default component$(() => {
  const state = useStore<{
    tasks: Task[];
    loading: boolean;
    error: string | null;
    submitting: boolean;
    addError: string | null;
  }>({
    tasks: [],
    loading: true,
    error: null,
    submitting: false,
    addError: null,
  });

  const inputTitle = useSignal("");

  // Fetch tasks from API
  const fetchTasks$ = $(async () => {
    state.loading = true;
    state.error = null;
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      state.tasks = data as Task[];
    } catch (err: any) {
      state.error = err.message || "Unable to load tasks.";
    } finally {
      state.loading = false;
    }
  });

  useVisibleTask$(fetchTasks$);

  // Add new task
  const addTask$ = $(async () => {
    state.addError = null;
    const title = inputTitle.value.trim();
    if (!title) {
      state.addError = "Task title cannot be empty.";
      return;
    }
    state.submitting = true;
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to add task");
      inputTitle.value = "";
      await fetchTasks$();
    } catch (err: any) {
      state.addError = err.message || "Unable to add task.";
    } finally {
      state.submitting = false;
    }
  });

  // Complete/incomplete toggle
  const toggleTask$ = $(
    async (taskId: string, completed: boolean) => {
      try {
        await fetch(`${API_URL}/${taskId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !completed }),
        });
        // Optimistically update UI
        state.tasks = state.tasks.map((t) =>
          t.id === taskId ? { ...t, completed: !completed } : t
        );
      } catch {
        await fetchTasks$();
      }
    }
  );

  // Delete a task
  const deleteTask$ = $(async (taskId: string) => {
    try {
      await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
    } catch {
      await fetchTasks$();
    }
  });

  const incompleteCount = useComputed$(
    () => state.tasks.filter((t) => !t.completed).length
  );

  return (
    <>
      <NavBar />
      <main class="min-h-screen bg-[#f8fafc] py-3 px-1">
        <div class="task-manager w-full shadow-lg rounded-2xl mx-auto mt-2">

          {/* Header */}
          <header class="task-header mb-2">
            <h1 class="text-2xl font-bold tracking-tight text-[#1976d2]">
              TaskFlow <span class="brand-accent">Tasks</span>
            </h1>
            <p class="mt-1 text-[#424242] text-sm">
              Stay on top of your goals!{" "}
              <span class="text-[#ffca28]">
                {incompleteCount.value} active
              </span>
            </p>
          </header>

          {/* Add Task Form */}
          <section class="task-form-section w-full">
            <form
              class="task-form flex gap-2"
              preventdefault:submit
              onSubmit$={addTask$}
            >
              <input
                type="text"
                value={inputTitle.value}
                placeholder="Add a new task..."
                class="task-input flex-1 text-base"
                onInput$={(e: Event, el) => (inputTitle.value = el.value)}
                disabled={state.submitting}
                aria-label="Task title"
                autoFocus
                maxLength={80}
              />
              <button
                type="submit"
                class="button-accent px-6 py-2"
                disabled={state.submitting || !inputTitle.value.trim()}
                aria-label="Add Task"
              >
                Add
              </button>
            </form>
            {state.addError && (
              <div class="task-error mt-2 text-[#b71c1c]">{state.addError}</div>
            )}
          </section>

          {/* Task List */}
          <section class="task-list-section">
            {state.loading ? (
              <div class="task-loading text-[#aaa]">Loading tasks...</div>
            ) : state.error ? (
              <div class="task-error">{state.error}</div>
            ) : state.tasks.length === 0 ? (
              <div class="task-empty">No tasks found. Start by adding one!</div>
            ) : (
              <ul class="task-list">
                {state.tasks.map((task) => (
                  <li
                    key={task.id}
                    class={
                      "task-item flex items-center " +
                      (task.completed ? "completed" : "")
                    }
                  >
                    <label class="task-checkbox-label cursor-pointer flex items-center group">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange$={() =>
                          toggleTask$(task.id, task.completed)
                        }
                        aria-label={
                          task.completed
                            ? "Mark task incomplete"
                            : "Mark task complete"
                        }
                      />
                      <span class="custom-checkbox" />
                    </label>
                    <span
                      class={
                        "task-title flex-1 min-w-0 " +
                        (task.completed ? "opacity-60 line-through" : "")
                      }
                    >
                      {task.title}
                    </span>
                    <button
                      class="button-delete ml-1 p-1"
                      title="Delete Task"
                      aria-label="Delete Task"
                      onClick$={() => deleteTask$(task.id)}
                    >
                      {/* Trash SVG for modern style */}
                      <svg
                        viewBox="0 0 24 24"
                        width="22"
                        height="22"
                        fill="none"
                        stroke="#1976d2"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="inline-block align-middle"
                        aria-hidden="true"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </>
  );
});
