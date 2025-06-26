const taskService = require('../services/task');

// Helper: parse integer id param, returns null on error
function parseIdParam(param) {
  const id = Number(param);
  return Number.isFinite(id) ? id : null;
}

class TaskController {
  // PUBLIC_INTERFACE
  /**
   * Returns list of all tasks.
   */
  getAll(req, res) {
    const data = taskService.getAllTasks();
    return res.json(data);
  }

  // PUBLIC_INTERFACE
  /**
   * Adds a new task.
   */
  add(req, res) {
    const { title } = req.body;
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'title is required' });
    }
    const task = taskService.addTask(title.trim());
    return res.status(201).json(task);
  }

  // PUBLIC_INTERFACE
  /**
   * Updates entire task by ID.
   */
  update(req, res) {
    const id = parseIdParam(req.params.id);
    if (id == null) return res.status(400).json({ message: 'Invalid id param' });
    const { title, completed } = req.body;
    if (title === undefined && completed === undefined) {
      return res.status(400).json({ message: 'At least one of title or completed required.' });
    }
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ message: 'title must be a non-empty string' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be boolean' });
    }
    const updated = taskService.updateTask(id, { title: title?.trim(), completed });
    if (!updated) return res.status(404).json({ message: 'Task not found' });
    return res.json(updated);
  }

  // PUBLIC_INTERFACE
  /**
   * Partially updates a task by ID (PATCH).
   */
  patch(req, res) {
    const id = parseIdParam(req.params.id);
    if (id == null) return res.status(400).json({ message: 'Invalid id param' });
    const { title, completed } = req.body;
    if (title === undefined && completed === undefined) {
      return res.status(400).json({ message: 'At least title or completed must be included.' });
    }
    if (title !== undefined && (typeof title !== 'string' || !title.trim())) {
      return res.status(400).json({ message: 'title must be a non-empty string' });
    }
    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'completed must be boolean' });
    }
    const updated = taskService.patchTask(id, { title: title?.trim(), completed });
    if (!updated) return res.status(404).json({ message: 'Task not found' });
    return res.json(updated);
  }

  // PUBLIC_INTERFACE
  /**
   * Removes a task by ID.
   */
  delete(req, res) {
    const id = parseIdParam(req.params.id);
    if (id == null) return res.status(400).json({ message: 'Invalid id param' });
    const ok = taskService.deleteTask(id);
    if (!ok) return res.status(404).json({ message: 'Task not found' });
    return res.status(204).send();
  }

  // PUBLIC_INTERFACE
  /**
   * Server-Sent Events endpoint for real-time task updates.
   */
  sse(req, res) {
    // Set headers for SSE
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.get('Origin') || '*',
    });
    res.flushHeaders();

    // Initial send
    res.write(`data: ${JSON.stringify(taskService.getAllTasks())}\n\n`);
    taskService.registerSseClient(res);

    // Remove client when connection closes
    req.on('close', () => {
      taskService.unregisterSseClient(res);
      res.end();
    });
  }
}

module.exports = new TaskController();
