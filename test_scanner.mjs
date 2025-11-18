import jsQR from 'jsqr';
import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';

async function testQRScanning() {
  try {
    // Load the test QR code image
    const img = await loadImage('/home/ubuntu/test_qr.png');
    
    // Create a canvas and draw the image
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Try to decode the QR code
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    
    if (code) {
      console.log('✓ QR Code successfully scanned!');
      console.log('Data:', code.data);
      console.log('Location:', code.location);
    } else {
      console.log('✗ No QR code found in the image');
    }
  } catch (error) {
    console.error('Error testing QR scanning:', error.message);
  }
}

testQRScanning();
