import express from 'express';
import 'dotenv/config'
import bodyParser from 'body-parser';
import cors from 'cors';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import emailRoutes from './routes/emailRoutes';
import courseRoutes from './routes/courseRoutes';
import languageRoutes from './routes/languageRoutes';
import categoryRoutes from './routes/categoryRoutes';
import './db'
import { PORT } from './utils/env';
// Import other route handlers as needed

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(morgan('dev'));

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/language', languageRoutes);
app.use('/api/category', categoryRoutes);
// Mount other routes similarly

// Start server
const port = PORT || 8081 || 8082 || 8083;
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
