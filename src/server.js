import express, { json } from "express";
import { config } from "dotenv";
import path from 'path'; 
import { fileURLToPath } from 'url'; 
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



// Routes
app.use("/auth", authRoute);
app.get("/", (req, res) => {
  res.send("Tahu Suzuka Punya Bapak Ade");
});
routerApi(app);

// Jalankan server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});