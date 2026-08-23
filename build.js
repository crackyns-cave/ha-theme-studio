#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Detect environment: Docker uses /framework, local uses ./framework
const isDocker = require('fs').existsSync('/framework');
const FRAMEWORK_PATH = isDocker ? '/framework' : path.join(__dirname, 'framework');
const OUTPUT_PATH = isDocker ? '/output' : path.join(__dirname, 'output');
const ASSETS_PATH = process.env.ASSETS_PATH || path.join(OUTPUT_PATH, 'images');
const DEFAULT_IMAGES_PATH = isDocker
  ? '/app/default-framework/images'
  : path.join(__dirname, 'default-framework', 'images');

/**
 * Build a Home Assistant theme from framework components
 * Usage: node build.js <visual-language> <color-palette>
 */
async function buildTheme(visualLanguage, colorPalette) {
  console.log('==========================================');
  console.log(' HA Theme Studio - Theme Builder');
  console.log('==========================================\n');
  
  const themeName = `${visualLanguage}-${colorPalette}`;
  console.log(`Building: ${themeName}`);
  console.log(`  Visual: ${visualLanguage}`);
  console.log(`  Palette: ${colorPalette}\n`);

  try {
    // Component paths
    const corePath = path.join(FRAMEWORK_PATH, 'core');
    const visualPath = path.join(FRAMEWORK_PATH, 'visual-languages', visualLanguage);
    const palettePath = path.join(FRAMEWORK_PATH, 'color-palettes', colorPalette);

    // Verify paths exist
    await verifyPaths({ corePath, visualPath, palettePath });

    // Build order for YAML concatenation
    const components = [
      // Visual language header
      path.join(visualPath, '00-header.yaml'),
      
      // Core design tokens (must come before modes to define anchors)
      path.join(corePath, '01-design-tokens.yaml'),
      
      // Visual system (must come before modes to define visual anchors)
      path.join(visualPath, '02-visual-system.yaml'),
      
      // Light mode colors (references anchors from above)
      path.join(palettePath, '11-light-mode.yaml'),
      
      // Dark mode colors (references anchors from above)
      path.join(palettePath, '12-dark-mode.yaml'),
      
      // Material Web
      path.join(corePath, '03-material-web.yaml'),
      
      // WebAwesome
      path.join(corePath, '04-webawesome.yaml'),
      
      // HA Semantic
      path.join(corePath, '05-homeassistant-semantic.yaml'),
      
      // Mushroom
      path.join(corePath, '06-mushroom.yaml'),
      
      // Bubble Card
      path.join(corePath, '07-bubble-card.yaml'),
      
      // Energy
      path.join(corePath, '08-energy-colors.yaml'),
      
      // Rooms
      path.join(corePath, '09-room-colors.yaml'),
      
      // Card-mod
      path.join(visualPath, '10-card-mod.yaml')
    ];

    // Concatenate all YAML files
    let yamlContent = await concatenateYaml(components, visualLanguage);
    if (isGlassTheme(visualLanguage)) {
      await copyWallpaperAssets();
    }
    
    // Replace the visual language name with full theme name
    // Convert visual-language slug to Title Case
    const visualTitle = visualLanguage.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Convert palette slug to Title Case
    const paletteTitle = colorPalette.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Replace "Visual Language:" with "Visual Language - Palette:"
    const fullThemeName = `${visualTitle} - ${paletteTitle}`;
    yamlContent = yamlContent.replace(
      new RegExp(`^${visualTitle}:`, 'm'),
      `${fullThemeName}:`
    );
    yamlContent = yamlContent.replace(
      /^  card-mod-theme:.*$/m,
      `  card-mod-theme: ${fullThemeName}`
    );

    // Write output
    const outputFile = path.join(OUTPUT_PATH, `${themeName}.yaml`);
    await fs.mkdir(OUTPUT_PATH, { recursive: true });
    await fs.writeFile(outputFile, yamlContent, 'utf-8');

    // Stats
    const stats = await fs.stat(outputFile);
    const lines = yamlContent.split('\n').length;

    console.log('✓ Build successful!');
    console.log(`  Output: ${outputFile}`);
    console.log(`  Size: ${Math.round(stats.size / 1024)}KB`);
    console.log(`  Lines: ${lines}\n`);

    console.log('==========================================');
    
    return { success: true, outputFile, size: stats.size, lines };
  } catch (error) {
    console.error('✗ Build failed!');
    console.error(`  Error: ${error.message}\n`);
    console.log('==========================================');
    
    return { success: false, error: error.message };
  }
}

async function verifyPaths(paths) {
  for (const [name, p] of Object.entries(paths)) {
    try {
      await fs.access(p);
    } catch (error) {
      throw new Error(`Path not found: ${name} at ${p}`);
    }
  }
}

async function concatenateYaml(filePaths, visualLanguage) {
  const parts = [];
  
  for (const filePath of filePaths) {
    try {
      let content = await fs.readFile(filePath, 'utf-8');
      if (filePath.endsWith('11-light-mode.yaml') || filePath.endsWith('12-dark-mode.yaml')) {
        content = applyHomeAssistantTextSemantics(content);
      }
      if (visualLanguage === 'neumorphic-material') {
        if (filePath.endsWith('11-light-mode.yaml')) {
          content = applyNeumorphicMode(content, 'light');
        } else if (filePath.endsWith('12-dark-mode.yaml')) {
          content = applyNeumorphicMode(content, 'dark');
        }
      } else if (isGlassTheme(visualLanguage)) {
        if (filePath.endsWith('11-light-mode.yaml')) {
          content = applyGlassWallpaper(content, 'light');
        } else if (filePath.endsWith('12-dark-mode.yaml')) {
          content = applyGlassWallpaper(content, 'dark');
        }
      }
      parts.push(content);
    } catch (error) {
      console.warn(`Warning: Could not read ${filePath}, skipping...`);
    }
  }
  
  return parts.join('\n');
}

function applyHomeAssistantTextSemantics(content) {
  const getColor = key => content.match(new RegExp(`^\\s+${key}:\\s+["']?([^"'\\n]+)`, 'm'))?.[1]?.trim();
  const primary = getColor('primary-color');
  const primaryText = getColor('primary-text-color');
  const secondaryText = getColor('secondary-text-color');
  const disabledText = getColor('disabled-text-color');
  const contrastText = getColor('text-primary-color');

  if (!primary || !primaryText || !secondaryText || !disabledText || !contrastText) {
    throw new Error('Palette mode is missing required text color tokens');
  }

  const replacements = {
    'ha-color-text-link': primary,
    'ha-color-on-primary-quiet': primary,
    'ha-color-on-primary-normal': contrastText,
    'ha-color-on-primary-loud': contrastText,
    'ha-color-on-neutral-quiet': secondaryText,
    'ha-color-on-neutral-normal': primaryText,
    'ha-color-on-neutral-loud': contrastText,
    'ha-color-on-disabled-quiet': disabledText,
    'ha-color-on-disabled-normal': disabledText,
    'ha-color-on-disabled-loud': disabledText
  };

  for (const [key, value] of Object.entries(replacements)) {
    const pattern = new RegExp(`^(\\s+)${key}:.*$`, 'm');
    if (pattern.test(content)) {
      content = content.replace(pattern, `$1${key}: "${value}"`);
    } else {
      const anchor = /^(\s+)ha-color-text-primary:.*$/m;
      content = content.replace(anchor, `$&\n$1${key}: "${value}"`);
    }
  }

  return content;
}

function isGlassTheme(visualLanguage) {
  return visualLanguage === 'frosted-glass' || visualLanguage === 'liquid-glass';
}

function applyGlassWallpaper(content, mode) {
  const wallpaper = `center / cover no-repeat fixed url('/local/theme-studio/${mode}-bg.png')`;
  return content.replace(
    /^(\s+)lovelace-background:.*$/m,
    `$1lovelace-background: "${wallpaper}"`
  );
}

async function copyWallpaperAssets() {
  const frameworkImagesPath = path.join(FRAMEWORK_PATH, 'images');
  const sourcePath = await pathExists(frameworkImagesPath)
    ? frameworkImagesPath
    : DEFAULT_IMAGES_PATH;

  await fs.mkdir(ASSETS_PATH, { recursive: true });
  await Promise.all(['light-bg.png', 'dark-bg.png'].map(fileName =>
    fs.copyFile(path.join(sourcePath, fileName), path.join(ASSETS_PATH, fileName))
  ));
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function applyNeumorphicMode(content, mode) {
  const replacements = {
    'primary-background-color': `*glass-bg-${mode}-resting`,
    'secondary-background-color': `*glass-bg-${mode}-resting`,
    'lovelace-background': `*glass-bg-${mode}-resting`,
    'card-background-color': `*glass-bg-${mode}-resting`,
    'ha-card-background': `*glass-bg-${mode}-resting`,
    'sidebar-background-color': `*glass-bg-${mode}-subtle`,
    'neu-shadow-raised-sm': `*neu-${mode}-shadow-raised-sm`,
    'neu-shadow-raised': `*neu-${mode}-shadow-raised`,
    'neu-shadow-raised-lg': `*neu-${mode}-shadow-raised-lg`,
    'neu-shadow-raised-xl': `*neu-${mode}-shadow-raised-xl`,
    'neu-shadow-float': `*neu-${mode}-shadow-float`,
    'neu-shadow-pressed-sm': `*neu-${mode}-shadow-pressed-sm`,
    'neu-shadow-pressed': `*neu-${mode}-shadow-pressed`,
    'neu-shadow-pressed-lg': `*neu-${mode}-shadow-pressed-lg`,
    'neu-shadow-subtle': `*neu-${mode}-shadow-subtle`,
    'card-box-shadow': `*neu-${mode}-shadow-raised`,
    'card-box-shadow-hover': `*neu-${mode}-shadow-float`,
    'card-box-shadow-active': `*neu-${mode}-shadow-pressed-sm`,
    'button-box-shadow': `*neu-${mode}-shadow-raised-sm`,
    'button-box-shadow-hover': `*neu-${mode}-shadow-raised`,
    'button-box-shadow-active': `*neu-${mode}-shadow-pressed-sm`,
    'dialog-box-shadow': `*neu-${mode}-shadow-raised-xl`,
    'sidebar-shadow': `*neu-${mode}-shadow-raised-sm`,
    'app-header-shadow': `*neu-${mode}-shadow-subtle`,
    'bubble-shadow': `*neu-${mode}-shadow-raised`,
    'bubble-shadow-active': `*neu-${mode}-shadow-pressed-sm`,
    'bubble-shadow-hover': `*neu-${mode}-shadow-float`
  };

  return content.replace(/^(\s+)([a-z0-9-]+):.*$/gm, (line, indentation, key) => {
    const replacement = replacements[key];
    return replacement ? `${indentation}${key}: ${replacement}` : line;
  });
}

// CLI execution
if (require.main === module) {
  const [visual, palette] = process.argv.slice(2);
  
  if (!visual || !palette) {
    console.error('Usage: node build.js <visual-language> <color-palette>');
    console.error('Example: node build.js material3 material-purple');
    process.exit(1);
  }
  
  buildTheme(visual, palette)
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { buildTheme };
