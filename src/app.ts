import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import taskRoutes from './routes/task.routes';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
// We will create these route files next, for now we import them even if they don't exist yet to show intent
// Note: This might cause compile error if files are missing, but we will create them in this flow.
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Task Management API is running');
});

// Error Handler
app.use(errorHandler);

export default app;
