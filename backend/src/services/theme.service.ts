import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export interface ThemeConfig {
  visual: string;
  palette: string;
  mode: 'light' | 'dark';
  shape: {
    radius: number;
  };
  elevation: 'minimal' | 'medium' | 'high';
}

export class ThemeService {
  // Detect environment: Docker vs local development
  private isDocker = require('fs').existsSync('/framework');
  private configPath = this.isDocker 
    ? '/framework/current-config.json' 
    : path.join(__dirname, '../../../framework/current-config.json');

  async getCurrentConfig(): Promise<ThemeConfig> {
    try {
      const data = await fs.readFile(this.configPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      // Return default configuration
      return {
        visual: 'material3',
        palette: 'material-purple',
        mode: 'light',
        shape: { radius: 12 },
        elevation: 'medium'
      };
    }
  }

  async saveCurrentConfig(config: ThemeConfig): Promise<void> {
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2));
  }

  async generatePreview(visual: string, palette: string, mode: string): Promise<Record<string, any>> {
    // This will combine the visual and palette to generate CSS variables
    // For preview purposes only (not a complete theme file)
    
    const paletteData = await this.loadPaletteData(palette);
    const visualData = await this.loadVisualData(visual);
    
    return {
      ...paletteData,
      ...visualData,
      mode
    };
  }

  private async loadPaletteData(palette: string): Promise<Record<string, any>> {
    try {
      const palettePath = path.join('/framework/color-palettes', palette);
      const lightPath = path.join(palettePath, '11-light-mode.yaml');
      
      const content = await fs.readFile(lightPath, 'utf-8');
      const parsed: any = yaml.load(content);
      
      return parsed?.light || {};
    } catch (error) {
      return {};
    }
  }

  private async loadVisualData(visual: string): Promise<Record<string, any>> {
    try {
      const visualPath = path.join('/framework/visual-languages', visual);
      const systemPath = path.join(visualPath, '02-visual-system.yaml');
      
      const content = await fs.readFile(systemPath, 'utf-8');
      const parsed: any = yaml.load(content);
      
      return parsed || {};
    } catch (error) {
      return {};
    }
  }
}
