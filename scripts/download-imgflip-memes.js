/**
 * Downloads popular meme templates from Imgflip
 * These are publicly available meme template images
 */

import https from 'https'
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

// Popular meme template URLs from Imgflip - ALL UNIQUE
// Format: https://i.imgflip.com/[id].jpg
const MEME_TEMPLATE_URLS = {
  'level1-down-bad.jpg': 'https://i.imgflip.com/1bgw.jpg', // This is Fine / Okay meme
  'level2-mid.jpg': 'https://i.imgflip.com/438jds.jpg', // Average Enjoyer
  'level3-valid.jpg': 'https://i.imgflip.com/1bhk.jpg', // Drake Pointing
  'level4-locked-in.jpg': 'https://i.imgflip.com/345v97.jpg', // Distracted Boyfriend
  'level5-main-character.jpg': 'https://i.imgflip.com/1bhw.jpg', // Drake Yes/No
  'level6-living-my-best-life.jpg': 'https://i.imgflip.com/26am.jpg', // Success Kid
  'level7-iconic.jpg': 'https://i.imgflip.com/30b1gx.jpg', // Woman Yelling at Cat
  'level8-that-person.jpg': 'https://i.imgflip.com/1otk96.jpg', // Change My Mind
  'level9-goated.jpg': 'https://i.imgflip.com/1ur9b0.jpg', // Expanding Brain / Galaxy Brain
  'level10-literally-everything.jpg': 'https://i.imgflip.com/24y43o.jpg', // Stonks / Upward Trend
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${path.basename(filepath)}`)
    
    const file = fs.createWriteStream(filepath)
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        file.close()
        fs.unlinkSync(filepath)
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject)
      }
      
      if (response.statusCode !== 200) {
        file.close()
        fs.unlinkSync(filepath)
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log(`✓ Saved: ${path.basename(filepath)}`)
        resolve()
      })
    }).on('error', (err) => {
      file.close()
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      reject(err)
    })
    
    file.on('error', (err) => {
      file.close()
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      reject(err)
    })
  })
}

async function downloadAllMemes() {
  console.log('🎭 Downloading meme templates from Imgflip...\n')
  
  let downloaded = 0
  let skipped = 0
  let failed = 0
  
  for (const [filename, url] of Object.entries(MEME_TEMPLATE_URLS)) {
    const filepath = path.join(MEMES_DIR, filename)
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`)
      skipped++
      continue
    }
    
    try {
      await downloadImage(url, filepath)
      downloaded++
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300))
    } catch (error) {
      console.error(`✗ Failed: ${filename} - ${error.message}`)
      failed++
    }
  }
  
  console.log(`\n✨ Download Summary:`)
  console.log(`   ✓ Downloaded: ${downloaded}`)
  console.log(`   ⏭️  Skipped: ${skipped}`)
  console.log(`   ✗ Failed: ${failed}`)
  
  if (downloaded > 0) {
    console.log(`\n✅ Success! Memes saved to public/memes/`)
    console.log(`   Note: Update src/types/chore.ts to use .jpg extension`)
  }
}

downloadAllMemes().catch(console.error)

