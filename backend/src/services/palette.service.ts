import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

export interface ColorPalette {
  name: string;
  slug: string;
  colors: PaletteColors;
  modes: {
    light: PaletteColors;
    dark: PaletteColors;
  };
}

interface PaletteColors {
  primary: string;
  secondary: string;
  tertiary?: string;
  success: string;
  warning: string;
  error: string;
  background: string;
  surface: string;
  text: string;
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
          const modes = await this.extractColors(entry.name);
          palettes.push({
            name: this.formatName(entry.name),
            slug: entry.name,
            colors: modes.light,
            modes
          });
          console.log(`[PaletteService] Loaded palette: ${entry.name} (${modes.light.primary})`);
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

  private async extractColors(slug: string): Promise<ColorPalette['modes']> {
    const light = await this.extractModeColors(slug, '11-light-mode.yaml', 'light');
    const dark = await this.extractModeColors(slug, '12-dark-mode.yaml', 'dark');
    return { light, dark };
  }

  private async extractModeColors(slug: string, fileName: string, mode: 'light' | 'dark'): Promise<PaletteColors> {
    const fallback = mode === 'light'
      ? { background: '#FEF7FF', surface: '#F3EDF7', text: '#1C1B1F' }
      : { background: '#1C1B1F', surface: '#2B2930', text: '#E6E1E5' };

    try {
      const yamlContent = await fs.readFile(path.join(this.palettesPath, slug, fileName), 'utf-8');
      const parsed = yaml.load(yamlContent) as any;
      const modeColors = parsed?.modes?.[mode] || parsed?.[mode] || {};

      return {
        primary: modeColors['primary-color'] || '#6750A4',
        secondary: modeColors['md-sys-color-secondary'] || modeColors['secondary-color'] || '#625B71',
        tertiary: modeColors['md-sys-color-tertiary'] || modeColors['tertiary-color'],
        success: modeColors['success-color'] || '#10b981',
        warning: modeColors['warning-color'] || '#f59e0b',
        error: modeColors['error-color'] || '#B3261E',
        background: modeColors['primary-background-color'] || fallback.background,
        surface: modeColors['card-background-color'] || fallback.surface,
        text: modeColors['primary-text-color'] || fallback.text
      };
    } catch (error) {
      return {
        primary: '#6750A4',
        secondary: '#625B71',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#B3261E',
        ...fallback
      };
    }
  }
}
