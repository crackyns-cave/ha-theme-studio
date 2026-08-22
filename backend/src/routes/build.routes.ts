import { Router, Request, Response } from 'express';
import { BuildService } from '../services/build.service';

const router = Router();
const buildService = new BuildService();

// Build current theme
router.post('/current', async (req: Request, res: Response) => {
  try {
    const { visual, palette } = req.body;
    console.log(`[BUILD] Building theme: ${visual}-${palette}`);
    const result = await buildService.buildTheme(visual, palette);
    console.log(`[BUILD] Result:`, result);
    res.json(result);
  } catch (error) {
    console.error('[BUILD ERROR]', error);
    res.status(500).json({ error: 'Failed to build theme', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Build theme family (all visuals with one palette)
router.post('/family', async (req: Request, res: Response) => {
  try {
    const { palette } = req.body;
    const result = await buildService.buildFamily(palette);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to build theme family' });
  }
});

// Build all themes
router.post('/all', async (req: Request, res: Response) => {
  try {
    console.log('[BUILD ALL] Starting to build all themes...');
    const result = await buildService.buildAll();
    console.log(`[BUILD ALL] Completed. Built ${result.length} themes`);
    res.json(result);
  } catch (error) {
    console.error('[BUILD ALL ERROR]', error);
    res.status(500).json({ error: 'Failed to build all themes', details: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// Export theme as zip
router.post('/export', async (req: Request, res: Response) => {
  try {
    const { themes } = req.body;
    const zipPath = await buildService.exportZip(themes);
    res.download(zipPath);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export themes' });
  }
});

export default router;
