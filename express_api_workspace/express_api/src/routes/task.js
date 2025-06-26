/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: CRUD operations for tasks and real-time updates
 */

const express = require('express');
const taskController = require('../controllers/task');

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks
 *     description: Returns all tasks.
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
router.get('/', taskController.getAll.bind(taskController));

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Add a new task
 *     description: Creates a new task (defaults to incomplete).
 *     tags: [Tasks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task description.
 *                 example: Buy milk
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input
 */
router.post('/', taskController.add.bind(taskController));

/**
 * @swagger
 * /tasks/{id}:
 *   put:
 *     summary: Update a task
 *     description: Replace a task's title or completion status.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Walk the dog
 *               completed:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Updated task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.put('/:id', taskController.update.bind(taskController));

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Patch a task
 *     description: Partially update a task (title or completed).
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The task id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Buy eggs
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Patched task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found
 */
router.patch('/:id', taskController.patch.bind(taskController));

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: Deletes a task by ID.
 *     tags: [Tasks]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The task id
 *     responses:
 *       204:
 *         description: Deleted
 *       404:
 *         description: Task not found
 */
router.delete('/:id', taskController.delete.bind(taskController));

/**
 * @swagger
 * /tasks/events:
 *   get:
 *     summary: Real-time task updates (SSE)
 *     description: |
 *       Server-Sent Events stream. Clients can listen to /tasks/events
 *       to receive live notifications whenever the task list changes.
 *     tags: [Tasks]
 *     responses:
 *       200:
 *         description: SSE stream of tasks
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       500:
 *         description: Internal error
 */
router.get('/events', taskController.sse.bind(taskController));

module.exports = router;
