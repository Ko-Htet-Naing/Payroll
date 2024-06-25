const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { version } = require("../package.json");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Employee Management Express API with Swagger",
      version,
      description:
        "This is a simple CRUD API application made with Express and documented with Swagger",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
    servers: [
      {
        url: "http://localhost:8000",
      },
    ],
  },
  apis: ["./routes/api/*.js", "./models/*.js"],
};
const specs = swaggerJsdoc(options);
const swaggerDocs = (app, port) => {
  // Swagger page
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs, {
      explorer: true,
      swaggerOptions: {
        defaultModelsExpandDepth: -1, // Controls the default expansion depth for models on Swagger UI
        docExpansion: "list", // Controls how the API listing is displayed
      },
    })
  );

  // Docs in JSON format
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(specs);
  });
};

module.exports = swaggerDocs;
