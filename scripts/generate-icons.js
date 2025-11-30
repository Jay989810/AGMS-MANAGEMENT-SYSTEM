/**
 * Icon Generation Script
 * This script helps create PWA icons from a source image
 * 
 * Usage:
 * 1. Place your source image (logo or icon) in the project root as "logo.png" or "logo.jpg"
 * 2. Run: node scripts/generate-icons.js
 * 3. Icons will be generated in the public/ folder
 * 
 * Requirements:
 * - Node.js
 * - sharp package: npm install sharp --save-dev
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
];

// Try different source image names
const sourceImages = [
  path.join(__dirname, '../logo.png'),
  path.join(__dirname, '../logo.jpg'),
  path.join(__dirname, '../icon.png'),
  path.join(__dirname, '../icon.jpg'),
  path.join(__dirname, '../church-logo.png'),
];

async function generateIcons() {
  // Find source image
  let sourceImage = null;
  for (const imgPath of sourceImages) {
    if (fs.existsSync(imgPath)) {
      sourceImage = imgPath;
      console.log(`Found source image: ${sourceImage}`);
      break;
    }
  }

  if (!sourceImage) {
    console.error('❌ No source image found!');
    console.log('\nPlease place one of these files in the project root:');
    console.log('  - logo.png');
    console.log('  - logo.jpg');
    console.log('  - icon.png');
    console.log('  - icon.jpg');
    console.log('  - church-logo.png');
    console.log('\nOr create icons manually:');
    console.log('  1. Create a 512x512 PNG image');
    console.log('  2. Save as public/icon-512.png');
    console.log('  3. Resize to 192x192 and save as public/icon-192.png');
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log('\nGenerating icons...\n');

  // Generate each icon size
  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(publicDir, name);
      
      await sharp(sourceImage)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 26, g: 35, b: 126, alpha: 1 }, // Navy blue background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Failed to generate ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Icons generated successfully!');
  console.log('\nIcons are in the public/ folder:');
  sizes.forEach(({ name }) => {
    console.log(`  - ${name}`);
  });
  console.log('\nYour PWA is ready to install!');
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  generateIcons().catch(console.error);
} catch (error) {
  console.error('❌ sharp package not found!');
  console.log('\nPlease install it:');
  console.log('  npm install sharp --save-dev');
  console.log('\nOr create icons manually using an image editor.');
  process.exit(1);
}

