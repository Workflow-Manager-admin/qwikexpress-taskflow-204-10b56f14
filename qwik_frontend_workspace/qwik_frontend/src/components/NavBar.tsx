import { component$ } from "@builder.io/qwik";

// PUBLIC_INTERFACE
/**
 * Professional top navigation bar for the TaskFlow homepage.
 */
export default component$(() => (
  <nav class="nav-main">
    <div class="nav-container">
      <a href="/" class="nav-logo">
        {/* Replace below with logo SVG/image if available */}
        <span class="nav-logo-accent">TaskFlow</span>
      </a>
      <ul class="nav-list">
        <li>
          <a href="/" class="nav-link active">Home</a>
        </li>
        <li>
          <a href="/tasks" class="nav-link">Tasks</a>
        </li>
      </ul>
    </div>
  </nav>
));
