/**
 * Script to download meme images for each level
 * Usage: node scripts/download-memes.js
 * 
 * You can customize the meme URLs in the MEME_URLS object below
 */

import https from 'https'
import http from 'http'
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

// Meme URLs - Add your meme image URLs here
// You can find memes from:
// - Imgflip: https://imgflip.com/memetemplates
// - Know Your Meme: https://knowyourmeme.com/
// - Or create your own at meme generators
const MEME_URLS = {
  'level1-down-bad.jpg': 'https://via.placeholder.com/400x300/666666/FFFFFF?text=Down+Bad+Meme',
  'level2-mid.jpg': 'https://via.placeholder.com/400x300/00AA00/FFFFFF?text=Mid+Meme',
  'level3-valid.jpg': 'https://via.placeholder.com/400x300/0066FF/FFFFFF?text=Valid+Meme',
  'level4-locked-in.jpg': 'https://via.placeholder.com/400x300/FF00FF/FFFFFF?text=Locked+In+Meme',
  'level5-main-character.jpg': 'https://via.placeholder.com/400x300/FFAA00/FFFFFF?text=Main+Character+Meme',
  'level6-living-best-life.jpg': 'https://via.placeholder.com/400x300/FF0000/FFFFFF?text=Living+My+Best+Life+Meme',
  'level7-iconic.jpg': 'https://via.placeholder.com/400x300/00FFFF/FFFFFF?text=Iconic+Meme',
  'level8-that-person.jpg': 'https://via.placeholder.com/400x300/FF00FF/FFFFFF?text=That+Person+Meme',
  'level9-goated.jpg': 'https://via.placeholder.com/400x300/00FF00/FFFFFF?text=Goated+Meme',
  'level10-literally-everything.jpg': 'https://via.placeholder.com/400x300/FFAA00/FFFFFF?text=Literally+Everything+Meme'
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(filepath)
    
    protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        // Handle redirects
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject)
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log(`✓ Downloaded: ${path.basename(filepath)}`)
        resolve()
      })
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}) // Delete the file on error
      reject(err)
    })
  })
}

async function downloadAllMemes() {
  console.log('🎭 Downloading level memes...\n')
  
  const entries = Object.entries(MEME_URLS)
  
  for (const [filename, url] of entries) {
    const filepath = path.join(MEMES_DIR, filename)
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`)
      continue
    }
    
    try {
      await downloadImage(url, filepath)
    } catch (error) {
      console.error(`✗ Failed to download ${filename}:`, error.message)
    }
  }
  
  console.log('\n✨ Done! Check public/memes/ directory')
  console.log('\n💡 Tip: Replace the placeholder images with your actual memes!')
}

downloadAllMemes().catch(console.error)


