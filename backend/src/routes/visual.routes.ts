import { Router, Request, Response } from 'express';
import { VisualService } from '../services/visual.service';

const router = Router();
const visualService = new VisualService();

// Get all available visual languages
router.get('/', async (req: Request, res: Response) => {
  try {
    const visuals = await visualService.getAllVisuals();
    res.json(visuals);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get visual languages' });
  }
});

// Get specific visual language
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const visual = await visualService.getVisual(req.params.name);
    if (!visual) {
      res.status(404).json({ error: 'Visual language not found' });
      return;
    }
    res.json(visual);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get visual language' });
  }
});

export default router;
