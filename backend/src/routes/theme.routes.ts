import { Router, Request, Response } from 'express';
import { ThemeService } from '../services/theme.service';

const router = Router();
const themeService = new ThemeService();

// Get current theme configuration
router.get('/current', async (req: Request, res: Response) => {
  try {
    const config = await themeService.getCurrentConfig();
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get current configuration' });
  }
});

// Update theme configuration
router.post('/current', async (req: Request, res: Response) => {
  try {
    const config = req.body;
    await themeService.saveCurrentConfig(config);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

// Get theme preview variables
router.post('/preview', async (req: Request, res: Response) => {
  try {
    const { visual, palette, mode } = req.body;
    const variables = await themeService.generatePreview(visual, palette, mode);
    res.json(variables);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

export default router;
