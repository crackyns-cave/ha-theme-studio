import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

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
      console.log(`[PaletteService] Reading palettes from: ${this.palettesPath}`);
      const entries = await fs.readdir(this.palettesPath, { withFileTypes: true });
      const palettes: ColorPalette[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          const colors = await this.extractColors(entry.name);
          palettes.push({
            name: this.formatName(entry.name),
            slug: entry.name,
            colors
          });
          console.log(`[PaletteService] Loaded palette: ${entry.name} (${colors.primary})`);
        }
      }

      console.log(`[PaletteService] Loaded ${palettes.length} palettes`);
      return palettes;
    } catch (error) {
      console.error('[PaletteService] Error loading palettes:', error);
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
    try {
      // Read light mode YAML to extract colors
      const lightModePath = path.join(this.palettesPath, slug, '11-light-mode.yaml');
      const yamlContent = await fs.readFile(lightModePath, 'utf-8');
      const parsed = yaml.load(yamlContent) as any;
      
      const lightColors = parsed?.light || {};
      
      return {
        primary: lightColors['primary-color'] || '#6750A4',
        secondary: lightColors['secondary-color'] || '#625B71',
        tertiary: lightColors['tertiary-color'],
        success: lightColors['success-color'] || '#10b981',
        warning: lightColors['warning-color'] || '#f59e0b',
        error: lightColors['error-color'] || '#B3261E'
      };
    } catch (error) {
      // Fallback colors if parsing fails
      return {
        primary: '#6750A4',
        secondary: '#625B71',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#B3261E'
      };
    }
  }
}
