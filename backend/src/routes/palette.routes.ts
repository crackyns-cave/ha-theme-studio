import { Router, Request, Response } from 'express';
import { PaletteService } from '../services/palette.service';

const router = Router();
const paletteService = new PaletteService();

// Get all available palettes
router.get('/', async (req: Request, res: Response) => {
  try {
    const palettes = await paletteService.getAllPalettes();
    res.json(palettes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get palettes' });
  }
});

// Get specific palette
router.get('/:name', async (req: Request, res: Response) => {
  try {
    const palette = await paletteService.getPalette(req.params.name);
    if (!palette) {
      res.status(404).json({ error: 'Palette not found' });
      return;
    }
    res.json(palette);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get palette' });
  }
});

// Create new palette
router.post('/', async (req: Request, res: Response) => {
  try {
    const palette = req.body;
    await paletteService.savePalette(palette);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save palette' });
  }
});

export default router;
