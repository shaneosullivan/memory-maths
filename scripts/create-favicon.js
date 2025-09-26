const fs = require('fs');
const sharp = require('sharp');
const path = require('path');

async function createFavicon() {
    const publicDir = path.join(__dirname, '..', 'public');
    const appDir = path.join(__dirname, '..', 'app');
    
    // Use the divide symbol favicon SVG as the source
    const svgSource = path.join(publicDir, 'favicon-divide.svg');
    
    if (!fs.existsSync(svgSource)) {
        console.error('Source SVG not found:', svgSource);
        return;
    }
    
    console.log('Creating favicon from', svgSource);
    
    try {
        // Create a 32x32 PNG first (standard favicon size)
        const tempPng = path.join(publicDir, 'temp-favicon-32.png');
        
        await sharp(svgSource)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(tempPng);
            
        console.log('✓ Created temporary 32x32 PNG');
        
        // Convert PNG to ICO format
        // Since we don't have ImageMagick, we'll create multiple sizes and use the PNG as favicon
        const faviconPath = path.join(appDir, 'favicon.ico');
        
        // Create 16x16 and 32x32 versions for better ICO support
        await sharp(svgSource)
            .resize(16, 16, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(path.join(publicDir, 'favicon-16x16.png'));
            
        await sharp(svgSource)
            .resize(32, 32, {
                fit: 'contain',
                background: { r: 255, g: 255, b: 255, alpha: 0 }
            })
            .png()
            .toFile(path.join(publicDir, 'favicon-32x32.png'));
        
        // For now, copy the 32x32 PNG as favicon.ico (browsers will accept it)
        fs.copyFileSync(tempPng, faviconPath);
        
        // Clean up temp file
        fs.unlinkSync(tempPng);
        
        console.log('✓ Created favicon.ico from logo');
        console.log('✓ Created favicon-16x16.png');
        console.log('✓ Created favicon-32x32.png');
        
    } catch (error) {
        console.error('✗ Failed to create favicon:', error.message);
    }
}

createFavicon().catch(console.error);