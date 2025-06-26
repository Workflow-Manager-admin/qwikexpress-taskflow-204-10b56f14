import {
  component$,
  useStore,
  useSignal,
  useVisibleTask$,
  $,
  useComputed$,
} from "@builder.io/qwik";
import type { PropFunction, Signal } from "@builder.io/qwik";
import NavBar from "../components/NavBar";

/**
 * --- Types & Utils ---
 */
interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const API_URL = "/api/tasks";

// PUBLIC_INTERFACE
/** 
 * TaskManager: Handles main logic, layout, and state for the tasks page.
 * - Loads task data from the backend API.
 * - Handles add, complete/incomplete, and delete actions.
 * - Renders a modular, mobile-friendly interface.
 */
export default component$(() => {
  // Centralized reactive state for the task manager page
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
  const inputRef = useSignal<HTMLInputElement>();

  // Load tasks on mount
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

  // Add a new task via API with UI feedback/focus
  const addTask$ = $(async () => {
    state.addError = null;
    const title = inputTitle.value.trim();
    if (!title) {
      state.addError = "Task title cannot be empty.";
      inputRef.value?.focus();
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
      inputRef.value?.focus();
      await fetchTasks$();
    } catch (err: any) {
      state.addError = err.message || "Unable to add task.";
    } finally {
      state.submitting = false;
    }
  });

  // Toggle complete/incomplete (optimistic UI, then sync)
  const toggleTask$ = $(async (taskId: string, completed: boolean) => {
    try {
      // Show instant toggle, then sync to server
      state.tasks = state.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: !completed } : t
      );
      const res = await fetch(`${API_URL}/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      if (!res.ok) throw new Error("Failed to update task");
    } catch {
      await fetchTasks$();
    }
  });

  // Delete a task (optimistic UI)
  const deleteTask$ = $(async (taskId: string) => {
    try {
      state.tasks = state.tasks.filter((t) => t.id !== taskId);
      const res = await fetch(`${API_URL}/${taskId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete task");
    } catch {
      await fetchTasks$();
    }
  });

  // Number of incomplete tasks for active counter
  const incompleteCount = useComputed$(
    () => state.tasks.filter((t) => !t.completed).length
  );

  // --- Render ---
  return (
    <>
      <NavBar />
      <main class="min-h-screen bg-[#f8fafc] flex flex-col py-3 px-1">
        <section class="task-manager w-full max-w-[500px] shadow-lg rounded-2xl mx-auto mt-6 sm:mt-10 flex flex-col gap-6 transition-all duration-150">
          {/* Header */}
          <TaskHeader incompleteCount={incompleteCount.value} />

          {/* Add Form */}
          <TaskAddForm
            inputTitle={inputTitle.value}
            inputRef={inputRef}
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
        </section>
      </main>
    </>
  );
});

// PUBLIC_INTERFACE
/**
 * TaskHeader: Shows app branding and active tasks count.
 */
export const TaskHeader = component$(
  (props: { incompleteCount: number }) => (
    <header class="task-header mb-1 w-full text-center">
      <h1 class="text-2xl sm:text-[2.1rem] font-bold tracking-tight text-[#1976d2] mb-0 leading-tight">
        TaskFlow <span class="brand-accent">Tasks</span>
      </h1>
      <p class="mt-1 text-[#424242] text-sm sm:text-base">
        Stay on top of your goals!{" "}
        <span class="text-[#ffca28] font-bold">
          {props.incompleteCount} active
        </span>
      </p>
    </header>
  )
);

// PUBLIC_INTERFACE
/**
 * TaskAddForm: Form for adding a new task. Handles input, submit, disable logic.
 */
export const TaskAddForm = component$(
  (props: {
    inputTitle: string;
    inputRef?: Signal<HTMLInputElement | undefined>;
    onInput$: PropFunction<(e: Event, el: HTMLInputElement) => void>;
    onAdd$: PropFunction<() => Promise<void>>;
    disabled: boolean;
    hasError: boolean | null;
    errorMsg: string;
  }) => (
    <section class="task-form-section w-full">
      <form
        class="task-form flex gap-2 w-full"
        preventdefault:submit
        onSubmit$={props.onAdd$}
        autocomplete="off"
      >
        <input
          ref={props.inputRef}
          type="text"
          value={props.inputTitle}
          placeholder="Add a new task..."
          class="task-input flex-1 text-base py-2 px-3 border border-gray-200 rounded-lg focus:border-[#1976d2] focus:outline-none transition"
          onInput$={props.onInput$}
          disabled={props.disabled}
          aria-label="Task title"
          maxLength={80}
          enterKeyHint="done"
        />
        <button
          type="submit"
          class={[
            "button-accent px-4 py-2 transition-colors duration-100",
            props.disabled || !props.inputTitle.trim()
              ? "opacity-80 cursor-not-allowed"
              : "hover:bg-yellow-400",
          ]}
          disabled={props.disabled || !props.inputTitle.trim()}
          aria-label="Add Task"
        >
          <span class="hidden sm:inline">Add</span>
          <span class="inline sm:hidden">+</span>
        </button>
      </form>
      {props.hasError && (
        <div class="task-error mt-2 text-[#b71c1c]">{props.errorMsg}</div>
      )}
    </section>
  )
);

// PUBLIC_INTERFACE
/**
 * TaskList: Shows all tasks, loading and error states, renders TaskItem.
 */
export const TaskList = component$(
  (props: {
    state: {
      tasks: Task[];
      loading: boolean;
      error: string | null;
      submitting: boolean;
      addError: string | null;
    };
    onToggle$: PropFunction<
      (taskId: string, completed: boolean) => Promise<void>
    >;
    onDelete$: PropFunction<(taskId: string) => Promise<void>>;
  }) => (
    <section class="task-list-section mt-3 w-full">
      {props.state.loading ? (
        <div class="task-loading text-[#aaa]">Loading tasks...</div>
      ) : props.state.error ? (
        <div class="task-error">{props.state.error}</div>
      ) : props.state.tasks.length === 0 ? (
        <div class="task-empty opacity-70 text-base">
          No tasks found. Start by adding one!
        </div>
      ) : (
        <ul class="task-list w-full flex flex-col gap-2">
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
/**
 * TaskItem: Renders a single task. Checkbox, title, and delete. Fully touch-friendly.
 */
export const TaskItem = component$(
  (props: {
    task: Task;
    onToggle$: PropFunction<
      (taskId: string, completed: boolean) => Promise<void>
    >;
    onDelete$: PropFunction<(taskId: string) => Promise<void>>;
  }) => (
    <li
      class={[
        "task-item relative flex items-center min-h-[44px] px-2 py-2 rounded-lg bg-[#f5f8fa] border border-[#f0f0f0] transition-all",
        props.task.completed ? "completed line-through text-slate-400 bg-[#f7fcf0]" : "",
        "hover:shadow-sm group"
      ]}
    >
      <label class="task-checkbox-label cursor-pointer flex items-center mr-2 group">
        <input
          type="checkbox"
          checked={props.task.completed}
          onChange$={() => props.onToggle$(props.task.id, props.task.completed)}
          aria-label={props.task.completed ? "Mark task incomplete" : "Mark task complete"}
          tabIndex={0}
        />
        <span
          class={[
            "custom-checkbox transition-colors w-5 h-5 rounded-md border-2 border-[#1976d2] mr-2 flex-shrink-0 box-content relative group-hover:border-[#ffca28]",
            props.task.completed ? "bg-[#1976d2] border-[#ffca28]" : "bg-white"
          ]}
        />
      </label>
      <span
        class={[
          "task-title flex-1 min-w-0 break-words text-base sm:text-[1rem] py-0",
          props.task.completed ? "opacity-60 line-through" : "font-medium text-[#1d2033]"
        ]}
        tabIndex={0}
      >
        {props.task.title}
      </span>
      <button
        type="button"
        class="button-delete ml-1 p-1 rounded group-hover:bg-[#ffe69e] hover:text-[#b71c1c] transition-colors"
        title="Delete Task"
        aria-label="Delete Task"
        tabIndex={0}
        onClick$={() => props.onDelete$(props.task.id)}
      >
        {/* Trash SVG icon */}
        <svg
          viewBox="0 0 24 24"
          width="21"
          height="21"
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
