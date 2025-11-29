/**
 * Script to download meme images from direct URLs
 * Add your meme image URLs below and run this script
 */

import https from 'https'
import http from 'http'
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

// ADD YOUR MEME IMAGE URLs HERE
// You can find memes at:
// - Imgflip: https://imgflip.com/memetemplates
// - Pixabay: https://pixabay.com/images/search/meme/
// - Know Your Meme: https://knowyourmeme.com/
// 
// To get a URL: Right-click on an image → Copy image address
const MEME_URLS = {
  'level1-down-bad.jpg': null, // Paste URL here
  'level2-mid.jpg': null,
  'level3-valid.jpg': null,
  'level4-locked-in.jpg': null,
  'level5-main-character.jpg': null,
  'level6-living-my-best-life.jpg': null,
  'level7-iconic.jpg': null,
  'level8-that-person.jpg': null,
  'level9-goated.jpg': null,
  'level10-literally-everything.jpg': null,
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'))
      return
    }

    console.log(`📥 Downloading from: ${url.substring(0, 60)}...`)

    const protocol = url.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(filepath)
    
    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307 || response.statusCode === 308) {
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
      
      // Determine file extension from content-type or URL
      const contentType = response.headers['content-type']
      const urlExt = path.extname(new URL(url).pathname)
      
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
    
    request.setTimeout(30000, () => {
      request.destroy()
      file.close()
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
      }
      reject(new Error('Download timeout'))
    })
  })
}

async function downloadAllMemes() {
  console.log('🎭 Downloading meme images...\n')
  
  let downloaded = 0
  let skipped = 0
  let missing = 0
  
  for (const [filename, url] of Object.entries(MEME_URLS)) {
    const filepath = path.join(MEMES_DIR, filename)
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`)
      skipped++
      continue
    }
    
    if (!url) {
      console.log(`⚠️  No URL configured for ${filename}`)
      missing++
      continue
    }
    
    try {
      await downloadImage(url, filepath)
      downloaded++
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error(`✗ Failed to download ${filename}:`, error.message)
    }
  }
  
  console.log(`\n✨ Download Summary:`)
  console.log(`   ✓ Downloaded: ${downloaded}`)
  console.log(`   ⏭️  Skipped (exists): ${skipped}`)
  console.log(`   ⚠️  Missing URLs: ${missing}`)
  
  if (missing > 0) {
    console.log(`\n💡 Next steps:`)
    console.log(`   1. Find meme images at: https://imgflip.com/memetemplates`)
    console.log(`   2. Right-click image → Copy image address`)
    console.log(`   3. Paste URL into MEME_URLS in this script`)
    console.log(`   4. Run this script again`)
  } else if (downloaded > 0) {
    console.log(`\n✅ Success! Memes downloaded to public/memes/`)
    console.log(`   Update file extensions in src/types/chore.ts if needed`)
  }
}

downloadAllMemes().catch(console.error)

