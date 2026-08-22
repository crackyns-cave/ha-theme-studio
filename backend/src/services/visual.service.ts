import fs from 'fs/promises';
import path from 'path';

export interface VisualLanguage {
  name: string;
  slug: string;
  description: string;
  features: string[];
}

export class VisualService {
  // Detect environment: Docker vs local development
  private isDocker = require('fs').existsSync('/framework');
  private visualsPath = this.isDocker 
    ? '/framework/visual-languages' 
    : path.join(__dirname, '../../../framework/visual-languages');

  async getAllVisuals(): Promise<VisualLanguage[]> {
    try {
      const entries = await fs.readdir(this.visualsPath, { withFileTypes: true });
      const visuals: VisualLanguage[] = [];

      for (const entry of entries) {
        if (entry.isDirectory()) {
          visuals.push({
            name: this.formatName(entry.name),
            slug: entry.name,
            description: this.getDescription(entry.name),
            features: this.getFeatures(entry.name)
          });
        }
      }

      return visuals;
    } catch (error) {
      return [];
    }
  }

  async getVisual(name: string): Promise<VisualLanguage | null> {
    const visuals = await this.getAllVisuals();
    return visuals.find(v => v.slug === name) || null;
  }

  private formatName(slug: string): string {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  private getDescription(slug: string): string {
    const descriptions: Record<string, string> = {
      'material3': 'Google Material Design 3 with elevation-based shadows',
      'neumorphic-material': 'Soft, raised surfaces with dual shadow system',
      'frosted-glass': 'Translucent surfaces with backdrop blur effects',
      'liquid-glass': 'Adaptive translucency with luminous highlights',
      'metro': 'Flat, typography-led tiles with bold color and hard edges',
      'nordic': 'Quiet Scandinavian surfaces with fine borders and restrained depth'
    };
    return descriptions[slug] || 'Custom visual language';
  }

  private getFeatures(slug: string): string[] {
    const features: Record<string, string[]> = {
      'material3': ['Elevation levels 0-5', 'Tonal palettes', 'Surface containers'],
      'neumorphic-material': ['Dual shadows (± convex/concave)', 'Soft raised surfaces', 'Subtle depth'],
      'frosted-glass': ['Backdrop blur', 'Translucent surfaces', 'Color saturation'],
      'liquid-glass': ['Layered blur', 'Adaptive translucency', 'Gradient shimmer'],
      'metro': ['Square tiles', 'Flat color states', 'Typography-led hierarchy'],
      'nordic': ['Fine dividers', 'Compact radii', 'Low elevation']
    };
    return features[slug] || [];
  }
}
