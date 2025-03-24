import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import courseRoutes from './routes/courseRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import helmet from 'helmet';

config();
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());
app.enable('trust proxy');

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173'];

console.log('Allowed Origins:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cors: {
      origins: allowedOrigins
    }
  });
});

// API Routes
app.use('/api/users', userRoutes);     // User management routes
app.use('/api/courses', courseRoutes);  // Course management routes
app.use('/api/admin', adminRoutes);     // Admin only routes

// Error handling
app.use(errorHandler);

// Start server
const port = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server is running on port ${port}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('CORS Configuration:', {
    origins: allowedOrigins,
  });
});

export default app;
