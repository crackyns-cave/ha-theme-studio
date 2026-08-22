#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Detect environment: Docker uses /framework, local uses ./framework
const isDocker = require('fs').existsSync('/framework');
const FRAMEWORK_PATH = isDocker ? '/framework' : path.join(__dirname, 'framework');
const OUTPUT_PATH = isDocker ? '/output' : path.join(__dirname, 'output');

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
    let yamlContent = await concatenateYaml(components);
    
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

async function concatenateYaml(filePaths) {
  const parts = [];
  
  for (const filePath of filePaths) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      parts.push(content);
    } catch (error) {
      console.warn(`Warning: Could not read ${filePath}, skipping...`);
    }
  }
  
  return parts.join('\n');
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
