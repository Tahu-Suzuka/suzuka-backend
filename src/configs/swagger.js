import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Konfigurasi Swagger
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tahu Suzuka API Documentation',
      version: '1.0.0',
      description: 'API documentation for Tahu Suzuka project',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT}`, // Gunakan PORT dari .env
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Path ke file route
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
