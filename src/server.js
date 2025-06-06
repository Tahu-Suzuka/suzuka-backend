import express, { json } from "express";
import { config } from "dotenv";
import database from './configs/database.js';
import { swaggerUi, specs } from './configs/swagger.js';
import routerApi from './routes/index.js'; // Import routerApi
import authRoute from "./routes/authRoute.js";
import passport from 'passport'; // ini dari package, bukan dari ./configs
import './configs/passport.js'; // jalankan konfigurasi strategi Google

config();
const app = express();
const port = process.env.PORT;

// Inisialisasi Passport
app.use(passport.initialize());

// Middleware untuk parsing JSON
app.use(json());

// Endpoint Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use("/auth", authRoute);
app.get("/", (req, res) => {
  res.send("Tahu Suzuka Punya Bapak Ade");
});
routerApi(app);

// Jalankan server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});
