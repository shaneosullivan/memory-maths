const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

async function createPNGIcons() {
    const publicDir = path.join(__dirname, 'public');
    
    // Use the existing icon-512.svg as the source
    const svgSource = path.join(publicDir, 'icon-512.svg');
    
    if (!fs.existsSync(svgSource)) {
        console.error('Source SVG not found:', svgSource);
        return;
    }
    
    // Icon sizes needed for iOS PWA compatibility
    const sizes = [
        { size: 180, name: 'icon-180.png' }, // iOS touch icon
        { size: 192, name: 'icon-192.png' }, // Android
        { size: 512, name: 'icon-512.png' }  // Android large
    ];
    
    console.log('Generating PNG icons from existing', svgSource);
    
    for (const { size, name } of sizes) {
        const outputPath = path.join(publicDir, name);
        
        try {
            await sharp(svgSource)
                .resize(size, size, {
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .png()
                .toFile(outputPath);
                
            console.log(`✓ Created ${name} (${size}x${size})`);
        } catch (error) {
            console.error(`✗ Failed to create ${name}:`, error.message);
        }
    }
    
    console.log('Icon generation complete!');
}

createPNGIcons().catch(console.error);