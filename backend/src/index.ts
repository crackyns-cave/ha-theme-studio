import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import themeRoutes from './routes/theme.routes';
import paletteRoutes from './routes/palette.routes';
import visualRoutes from './routes/visual.routes';
import buildRoutes from './routes/build.routes';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/themes', themeRoutes);
app.use('/api/palettes', paletteRoutes);
app.use('/api/visuals', visualRoutes);
app.use('/api/build', buildRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 HA Theme Studio API running on port ${PORT}`);
  console.log(`📁 Framework: /framework`);
  console.log(`📦 Output: /output`);
});

export default app;
