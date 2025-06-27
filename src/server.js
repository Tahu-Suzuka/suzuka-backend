import express, { json } from 'express';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import routerApi from './routes/index.js';
import authRoute from './routes/authRoute.js';
import passport from 'passport';
import './configs/passport.js';
import { errorHandler } from './middleware/errorHandler.js';

config();
const app = express();
const port = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS Configuration for React Frontend
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'http://localhost:5173', // Vite default port
      'http://localhost:5174',
      // Tambahkan external IP Compute Engine nanti
      `http://${process.env.EXTERNAL_IP}:3000`,
      `http://${process.env.EXTERNAL_IP}:5173`,
      // Domain production frontend
      'https://front-end-url.com',
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ],
  optionsSuccessStatus: 200 // Support legacy browsers
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Trust proxy (untuk reverse proxy seperti Nginx)
app.set('trust proxy', true);

// Middleware untuk parsing JSON dan URL encoded data
app.use(json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Passport middleware
app.use(passport.initialize());

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/auth', authRoute);

// Basic endpoint untuk test koneksi
app.get('/', (req, res) => {
  res.json({
    message: 'Tahu Suzuka Punya Bapak Ade - Backend API Ready',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS working properly',
    origin: req.get('origin'),
    timestamp: new Date().toISOString()
  });
});

routerApi(app);

app.use(errorHandler);

// Jalankan server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
