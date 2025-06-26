import {
  component$,
  useStore,
  useSignal,
  useVisibleTask$,
  $,
  useComputed$,
  PropFunction,
} from "@builder.io/qwik";
import NavBar from "../components/NavBar";

// --- Task Interfaces ---
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const API_URL = "/api/tasks";

// PUBLIC_INTERFACE
/** TaskManager: Handles logic and layout for the task manager page. */
export default component$(() => {
  // Centralized state/store
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

  // CRUD Operations
  /** Fetch tasks from API and update state. */
  const fetchTasks$ = $(async () => {
    state.loading = true;
    state.error = null;
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      state.tasks = Array.isArray(data) ? data : [];
    } catch (err: any) {
      state.error = err.message || "Unable to load tasks.";
    } finally {
      state.loading = false;
    }
  });
  useVisibleTask$(fetchTasks$);

  /** Add a new task via API. */
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
      if (!res.ok) {
        const msg = (await res.text()) || "Failed to add task";
        state.addError = msg;
        throw new Error(msg);
      }
      inputTitle.value = "";
      await fetchTasks$();
    } catch (err: any) {
      state.addError = err.message || "Unable to add task.";
    } finally {
      state.submitting = false;
    }
  });

  /** Toggle task completion. */
  const toggleTask$ = $(async (taskId: string, completed: boolean) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      // Optimistically update UI
      state.tasks = state.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !completed } : t
      );
    } catch {
      await fetchTasks$();
    }
  });

  /** Delete a task by ID. */
  const deleteTask$ = $(async (taskId: string) => {
    try {
      const res = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
    } catch {
      await fetchTasks$();
    }
  });

  /** Count of incomplete tasks. */
  const incompleteCount = useComputed$(
    () => state.tasks.filter((t) => !t.completed).length
  );

  // HANDOFF: Components
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
          {/* Task Add Form */}
          <TaskAddForm
            inputTitle={inputTitle.value}
            onInput$={(e: Event, el: HTMLInputElement) =>
              (inputTitle.value = el.value)
            }
            onAdd$={addTask$}
            disabled={state.submitting}
            hasError={!!state.addError}
            errorMsg={state.addError || ""}
          />
          {/* Task List */}
          <TaskList
            state={state}
            onToggle$={toggleTask$}
            onDelete$={deleteTask$}
          />
        </div>
      </main>
    </>
  );
});

// PUBLIC_INTERFACE
/** TaskAddForm: Form for adding a new task. */
export const TaskAddForm = component$(
  (props: {
    inputTitle: string;
    onInput$: PropFunction<(e: Event, el: HTMLInputElement) => void>;
    onAdd$: PropFunction<() => Promise<void>>;
    disabled: boolean;
    hasError: boolean | null;
    errorMsg: string;
  }) => (
    <section class="task-form-section w-full">
      <form
        class="task-form flex gap-2"
        preventdefault:submit
        onSubmit$={props.onAdd$}
      >
        <input
          type="text"
          value={props.inputTitle}
          placeholder="Add a new task..."
          class="task-input flex-1 text-base"
          onInput$={props.onInput$}
          disabled={props.disabled}
          aria-label="Task title"
          autoFocus
          maxLength={80}
        />
        <button
          type="submit"
          class="button-accent px-6 py-2"
          disabled={props.disabled || !props.inputTitle.trim()}
          aria-label="Add Task"
        >
          Add
        </button>
      </form>
      {props.hasError && (
        <div class="task-error mt-2 text-[#b71c1c]">{props.errorMsg}</div>
      )}
    </section>
  )
);

// PUBLIC_INTERFACE
/** TaskList: Shows all tasks, handles loading and error states, renders TaskItem. */
export const TaskList = component$(
  (props: {
    state: {
      tasks: Task[];
      loading: boolean;
      error: string | null;
      submitting: boolean;
      addError: string | null;
    };
    onToggle$: PropFunction<(taskId: string, completed: boolean) => Promise<void>>;
    onDelete$: PropFunction<(taskId: string) => Promise<void>>;
  }) => (
    <section class="task-list-section">
      {props.state.loading ? (
        <div class="task-loading text-[#aaa]">Loading tasks...</div>
      ) : props.state.error ? (
        <div class="task-error">{props.state.error}</div>
      ) : props.state.tasks.length === 0 ? (
        <div class="task-empty">No tasks found. Start by adding one!</div>
      ) : (
        <ul class="task-list">
          {props.state.tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle$={props.onToggle$}
              onDelete$={props.onDelete$}
            />
          ))}
        </ul>
      )}
    </section>
  )
);

// PUBLIC_INTERFACE
/** TaskItem: Renders a single task row, checkbox, title, and delete. */
export const TaskItem = component$(
  (props: {
    task: Task;
    onToggle$: PropFunction<(taskId: string, completed: boolean) => Promise<void>>;
    onDelete$: PropFunction<(taskId: string) => Promise<void>>;
  }) => (
    <li
      class={
        "task-item flex items-center " +
        (props.task.completed ? "completed" : "")
      }
    >
      <label class="task-checkbox-label cursor-pointer flex items-center group">
        <input
          type="checkbox"
          checked={props.task.completed}
          onChange$={() => props.onToggle$(props.task.id, props.task.completed)}
          aria-label={
            props.task.completed ? "Mark task incomplete" : "Mark task complete"
          }
        />
        <span class="custom-checkbox" />
      </label>
      <span
        class={
          "task-title flex-1 min-w-0 " +
          (props.task.completed ? "opacity-60 line-through" : "")
        }
      >
        {props.task.title}
      </span>
      <button
        class="button-delete ml-1 p-1"
        title="Delete Task"
        aria-label="Delete Task"
        onClick$={() => props.onDelete$(props.task.id)}
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
  )
);
