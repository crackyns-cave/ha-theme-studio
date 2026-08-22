#!/usr/bin/env node

const { buildTheme } = require('./build.js');

const VISUAL_LANGUAGES = [
  'material3',
  'neumorphic-material',
  'frosted-glass',
  'liquid-glass',
  'metro',
  'nordic'
];

const COLOR_PALETTES = [
  'material-purple',
  'ios-blue',
  'material-blue',
  'indigo-blue',
  'red',
  'green',
  'orange',
  'teal'
];

/**
 * Build all theme combinations
 */
async function buildAll() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║           HA Theme Studio - Build All Themes                 ║');
  console.log('║                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  console.log(`Building ${VISUAL_LANGUAGES.length} visuals × ${COLOR_PALETTES.length} palettes`);
  console.log(`Total: ${VISUAL_LANGUAGES.length * COLOR_PALETTES.length} theme combinations\n`);

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const visual of VISUAL_LANGUAGES) {
    for (const palette of COLOR_PALETTES) {
      const result = await buildTheme(visual, palette);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
      
      results.push({
        theme: `${visual}-${palette}`,
        ...result
      });
    }
  }

  // Summary
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                      BUILD SUMMARY                           ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
  
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failCount}`);
  console.log(`━ Total: ${results.length}\n`);

  if (successCount > 0) {
    console.log('Generated themes:');
    results
      .filter(r => r.success)
      .forEach(r => {
        const sizeKB = Math.round(r.size / 1024);
        console.log(`  • ${r.theme}.yaml (${sizeKB}KB, ${r.lines} lines)`);
      });
  }

  if (failCount > 0) {
    console.log('\nFailed themes:');
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`  ✗ ${r.theme}: ${r.error}`);
      });
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    BUILD COMPLETE                            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  return results;
}

// CLI execution
if (require.main === module) {
  buildAll()
    .then(results => {
      const allSuccess = results.every(r => r.success);
      process.exit(allSuccess ? 0 : 1);
    })
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { buildAll };
