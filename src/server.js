import express, { json } from "express";
import { config } from "dotenv";
import database from './configs/database.js';
import { swaggerUi, specs } from './configs/swagger.js';
import routerApi from './routes/index.js'; // Import routerApi

config();
const app = express();
const port = process.env.PORT;

// Middleware untuk parsing JSON
app.use(json());

// Endpoint Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Endpoint utama
app.get("/", (req, res) => {
  res.send("Tahu Suzuka Punya Bapak Ade");
});

// Daftarkan semua routes
routerApi(app);

// Jalankan server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
