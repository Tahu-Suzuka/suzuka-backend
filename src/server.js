import express, { json } from "express";
import { config } from "dotenv";
import path from 'path'; // TAMBAHKAN
import { fileURLToPath } from 'url'; // TAMBAHKAN
import database from './configs/database.js';
import { swaggerUi, specs } from './configs/swagger.js';
import routerApi from './routes/index.js';
import authRoute from "./routes/authRoute.js";
import passport from 'passport';
import './configs/passport.js';

config();
const app = express();
const port = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(passport.initialize());

app.use(json());

app.use(express.static(path.join(__dirname, 'public')));
// --------------------------------------------------

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