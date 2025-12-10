/**
 * Script to create placeholder SVG memes for each level
 * Usage: node scripts/create-placeholder-memes.js
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MEMES_DIR = path.join(__dirname, '..', 'public', 'memes')

// Create memes directory if it doesn't exist
if (!fs.existsSync(MEMES_DIR)) {
  fs.mkdirSync(MEMES_DIR, { recursive: true })
}

const LEVEL_INFO = [
  { level: 1, name: 'Down Bad', color: '#666666' },
  { level: 2, name: 'Mid', color: '#00AA00' },
  { level: 3, name: "Valid'", color: '#0066FF' },
  { level: 4, name: 'Locked In', color: '#FF00FF' },
  { level: 5, name: 'Main Character', color: '#FFAA00' },
  { level: 6, name: 'Living My Best Life', color: '#FF0000' },
  { level: 7, name: 'Iconic', color: '#00FFFF' },
  { level: 8, name: 'That Person', color: '#FF00FF' },
  { level: 9, name: 'Goated', color: '#00FF00' },
  { level: 10, name: 'Literally Everything', color: '#FFAA00' }
]

function createPlaceholderSVG(level, name, color) {
  const filename = `level${level}-${name.toLowerCase().replace(/['\s]/g, '-').replace(/-+/g, '-')}.svg`
  
  // Create SVG with level name and placeholder text
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad${level}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="400" height="300" fill="url(#grad${level})" rx="10"/>
  <text x="200" y="120" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
    Level ${level}
  </text>
  <text x="200" y="160" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle">
    ${name}
  </text>
  <text x="200" y="200" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.8)" text-anchor="middle">
    Meme Coming Soon
  </text>
  <text x="200" y="240" font-family="Arial, sans-serif" font-size="14" fill="rgba(255,255,255,0.6)" text-anchor="middle">
    Replace with your meme image
  </text>
</svg>`
  
  return { filename, svg }
}

function createPlaceholderMemes() {
  console.log('🎨 Creating placeholder meme images...\n')
  
  for (const levelInfo of LEVEL_INFO) {
    const { filename, svg } = createPlaceholderSVG(
      levelInfo.level,
      levelInfo.name,
      levelInfo.color
    )
    
    const filepath = path.join(MEMES_DIR, filename.replace('.svg', '.jpg'))
    
    // Skip if already exists (don't overwrite real memes)
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (file already exists)`)
      continue
    }
    
    // Write SVG file
    const svgPath = path.join(MEMES_DIR, filename)
    fs.writeFileSync(svgPath, svg)
    console.log(`✓ Created: ${filename}`)
  }
  
  console.log('\n✨ Done! Placeholder SVG files created in public/memes/')
  console.log('\n💡 Next steps:')
  console.log('   1. Replace these SVG files with actual meme images')
  console.log('   2. Use the same filenames but with .jpg, .png, or .webp extensions')
  console.log('   3. Or use the download-memes.js script with real meme URLs')
}

createPlaceholderMemes()










