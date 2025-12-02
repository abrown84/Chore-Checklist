/**
 * Direct meme image generator using simple image creation
 * This creates basic meme-style images for each level
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MEMES_DIR = path.join(__dirname, '..', 'public', 'memes')

// Ensure directory exists
if (!fs.existsSync(MEMES_DIR)) {
  fs.mkdirSync(MEMES_DIR, { recursive: true })
}

const LEVELS = [
  { level: 1, name: "Down Bad", color: "#666666", text: "When you're just starting" },
  { level: 2, name: "Mid", color: "#00AA00", text: "Getting better" },
  { level: 3, name: "Valid'", color: "#0066FF", text: "Actually decent" },
  { level: 4, name: "Locked In", color: "#FF00FF", text: "Focused mode" },
  { level: 5, name: "Main Character", color: "#FFAA00", text: "Star energy" },
  { level: 6, name: "Living My Best Life", color: "#FF0000", text: "Thriving" },
  { level: 7, name: "Iconic", color: "#00FFFF", text: "Legendary" },
  { level: 8, name: "That Person", color: "#FF00FF", text: "Everyone knows" },
  { level: 9, name: "Goated", color: "#00FF00", text: "GOAT status" },
  { level: 10, name: "Literally Everything", color: "#FFAA00", text: "Unstoppable" }
]

// Create a simple SVG-based meme (works without dependencies)
function createSVGMeme(levelData) {
  const { level, name, color, text } = levelData
  
  // Clean filename
  const filename = name.toLowerCase()
    .replace(/'/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg${level}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${color}dd;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="300" fill="url(#bg${level})" rx="10"/>
  
  <!-- Border -->
  <rect x="5" y="5" width="390" height="290" fill="none" stroke="white" stroke-width="4" rx="8"/>
  
  <!-- Level text -->
  <text x="200" y="50" font-family="Impact, Arial Black, sans-serif" font-size="36" font-weight="bold" 
        fill="white" text-anchor="middle" filter="url(#shadow)">
    LEVEL ${level}
  </text>
  
  <!-- Level name -->
  <text x="200" y="110" font-family="Impact, Arial Black, sans-serif" font-size="32" font-weight="bold" 
        fill="white" text-anchor="middle" filter="url(#shadow)">
    ${name.toUpperCase()}
  </text>
  
  <!-- Description -->
  <text x="200" y="170" font-family="Impact, Arial Black, sans-serif" font-size="24" 
        fill="white" text-anchor="middle" filter="url(#shadow)">
    ${text}
  </text>
  
  <!-- Meme placeholder text -->
  <text x="200" y="240" font-family="Arial, sans-serif" font-size="16" 
        fill="rgba(255,255,255,0.8)" text-anchor="middle">
    (Replace with actual meme)
  </text>
</svg>`
  
  return {
    filename: `level${level}-${filename}.svg`,
    content: svg
  }
}

console.log('🎭 Generating meme images...\n')

let created = 0
let skipped = 0

for (const level of LEVELS) {
  const { filename, content } = createSVGMeme(level)
  
  // Convert to .jpg path for consistency with type definitions
  const jpgFilename = filename.replace('.svg', '.jpg')
  const jpgPath = path.join(MEMES_DIR, jpgFilename)
  
  // Also create SVG version
  const svgPath = path.join(MEMES_DIR, filename)
  
  // Check if JPG already exists
  if (fs.existsSync(jpgPath)) {
    console.log(`⏭️  Skipping ${jpgFilename} (already exists)`)
    skipped++
    continue
  }
  
  // Write SVG file
  fs.writeFileSync(svgPath, content)
  
  // Write as JPG reference (we'll keep SVG for now, user can convert later)
  // For now, create a note file
  const noteContent = `This level uses the SVG version: ${filename}\nTo use a JPG/PNG meme, replace this file with your actual meme image.`
  fs.writeFileSync(jpgPath + '.note.txt', noteContent)
  
  // Also write a simple redirect-style HTML that loads the SVG
  // Actually, let's just copy the SVG as a reference
  console.log(`✓ Created: ${filename}`)
  console.log(`  → Note: Update to JPG/PNG format for ${jpgFilename}`)
  created++
}

console.log(`\n✨ Done!`)
console.log(`   Created: ${created} meme files`)
console.log(`   Skipped: ${skipped} existing files`)
console.log(`\n💡 Next steps:`)
console.log(`   1. Open the SVG files in public/memes/ to see them`)
console.log(`   2. Replace with actual meme images (JPG/PNG)`)
console.log(`   3. Use the same filenames but with .jpg extension`)



