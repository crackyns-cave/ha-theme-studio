import fs from 'fs/promises';
import path from 'path';

export interface ColorPalette {
  name: string;
  slug: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary?: string;
    success: string;
    warning: string;
    error: string;
  };
}

export class PaletteService {
  // Detect environment: Docker vs local development
  private isDocker = require('fs').existsSync('/framework');
  private palettesPath = this.isDocker 
    ? '/framework/color-palettes' 
    : path.join(__dirname, '../../../framework/color-palettes');

  async getAllPalettes(): Promise<ColorPalette[]> {
    try {
      const entries = await fs.readdir(this.palettesPath, { withFileTypes: true });
      const palettes: ColorPalette[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          palettes.push({
            name: this.formatName(entry.name),
            slug: entry.name,
            colors: await this.extractColors(entry.name)
          });
        }
      }

      return palettes;
    } catch (error) {
      return [];
    }
  }

  async getPalette(name: string): Promise<ColorPalette | null> {
    const palettes = await this.getAllPalettes();
    return palettes.find(p => p.slug === name) || null;
  }

  async savePalette(palette: ColorPalette): Promise<void> {
    // Implementation for creating new palette YAML files
    // This would generate the complete palette structure
    const palettePath = path.join(this.palettesPath, palette.slug);
    await fs.mkdir(palettePath, { recursive: true });
    
    // Generate light and dark mode YAML files from palette.colors
    // This is a placeholder - full implementation would generate complete YAML
  }

  private formatName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private async extractColors(slug: string): Promise<ColorPalette['colors']> {
    // Extract primary colors from the palette YAML files
    // This is simplified - in reality would parse YAML
    return {
      primary: '#6750A4',
      secondary: '#625B71',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#B3261E'
    };
  }
}
