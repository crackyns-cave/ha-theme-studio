import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import archiver from 'archiver';
import { createWriteStream } from 'fs';

const execAsync = promisify(exec);

export interface BuildResult {
  success: boolean;
  themeName: string;
  outputPath: string;
  size: number;
  error?: string;
}

export class BuildService {
  // Detect environment: Docker vs local development
  private isDocker = require('fs').existsSync('/framework');
  private frameworkPath = this.isDocker ? '/framework' : path.join(__dirname, '../../../framework');
  private outputPath = this.isDocker ? '/output' : path.join(__dirname, '../../../output');
  private buildScriptPath = this.isDocker ? '/app/build.js' : path.join(__dirname, '../../../build.js');
  private buildAllScriptPath = this.isDocker ? '/app/build-all.js' : path.join(__dirname, '../../../build-all.js');

  async buildTheme(visual: string, palette: string): Promise<BuildResult> {
    try {
      const themeName = `${visual}-${palette}`;
      const outputFile = path.join(this.outputPath, `${themeName}.yaml`);

      console.log(`[BuildService] Building theme: ${themeName}`);
      console.log(`[BuildService] Build script path: ${this.buildScriptPath}`);
      console.log(`[BuildService] Output path: ${this.outputPath}`);

      // Execute build script
      const command = `node "${this.buildScriptPath}" ${visual} ${palette}`;
      console.log(`[BuildService] Executing: ${command}`);
      
      const { stdout, stderr } = await execAsync(command);
      if (stdout) console.log('[BuildService] stdout:', stdout);
      if (stderr) console.error('[BuildService] stderr:', stderr);

      // Get file stats
      const stats = await fs.stat(outputFile);

      console.log(`[BuildService] Theme built successfully: ${outputFile} (${stats.size} bytes)`);

      return {
        success: true,
        themeName,
        outputPath: outputFile,
        size: stats.size
      };
    } catch (error) {
      console.error('[BuildService] Build failed:', error);
      return {
        success: false,
        themeName: `${visual}-${palette}`,
        outputPath: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async buildFamily(palette: string): Promise<BuildResult[]> {
    const visuals = ['material3', 'neumorphic-material', 'frosted-glass', 'liquid-glass', 'metro', 'nordic'];
    const results: BuildResult[] = [];

    for (const visual of visuals) {
      const result = await this.buildTheme(visual, palette);
      results.push(result);
    }

    return results;
  }

  async buildAll(): Promise<BuildResult[]> {
    try {
      // Execute build-all script
      await execAsync(`node "${this.buildAllScriptPath}"`);

      // Read all generated files
      const files = await fs.readdir(this.outputPath);
      const results: BuildResult[] = [];

      for (const file of files) {
        if (file.endsWith('.yaml')) {
          const filePath = path.join(this.outputPath, file);
          const stats = await fs.stat(filePath);
          
          results.push({
            success: true,
            themeName: file.replace('.yaml', ''),
            outputPath: filePath,
            size: stats.size
          });
        }
      }

      return results;
    } catch (error) {
      return [{
        success: false,
        themeName: 'all',
        outputPath: '',
        size: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  async exportZip(themes: string[]): Promise<string> {
    const zipPath = path.join(this.outputPath, 'themes-export.zip');
    const output = createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    return new Promise((resolve, reject) => {
      output.on('close', () => resolve(zipPath));
      archive.on('error', (err) => reject(err));

      archive.pipe(output);

      // Add each theme file to the archive
      themes.forEach(theme => {
        const themePath = path.join(this.outputPath, `${theme}.yaml`);
        archive.file(themePath, { name: `${theme}.yaml` });
      });

      archive.finalize();
    });
  }
}
