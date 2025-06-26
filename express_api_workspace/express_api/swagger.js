const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Task Manager API',
      version: '1.0.0',
      description: 'A beginner-friendly Task Manager API (CRUD, real-time updates) with Express + Swagger.',
    },
    components: {
      schemas: {
        Task: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Unique task id', example: 1 },
            title: { type: 'string', description: 'Task title', example: 'Buy milk' },
            completed: { type: 'boolean', description: 'Task completion flag', example: false },
            createdAt: { type: 'string', format: 'date-time', description: 'Created ISO timestamp' },
            updatedAt: { type: 'string', format: 'date-time', nullable: true, description: 'Last updated ISO timestamp (null if never updated)' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
