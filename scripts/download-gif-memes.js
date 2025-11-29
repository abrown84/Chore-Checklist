/**
 * Downloads GIF meme templates from Imgflip that match each level
 * Each GIF is selected to match the level's theme
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

// GIF meme template URLs - UNIQUE for each level, matching the theme
// Using direct Imgflip MP4 URLs (which work as GIFs in browsers)
// Format: https://i.imgflip.com/[id].mp4
const GIF_MEME_URLS = {
  // Level 1: "Down Bad" - confused/sad/lost
  'level1-down-bad.gif': 'https://i.imgflip.com/8gg6cb.mp4', // Confused Monkey
  
  // Level 2: "Mid" - average/mid reaction
  'level2-mid.gif': 'https://i.imgflip.com/3ohapu.mp4', // Disappearing kid (shrug/mid)
  
  // Level 3: "Valid'" - approval/validation (Bateman walking - main character energy)
  'level3-valid.gif': 'https://i.imgflip.com/53n4b7.mp4', // Bateman walking (valid/main character)
  
  // Level 4: "Locked In" - focused/determined
  'level4-locked-in.gif': 'https://i.imgflip.com/5cxb8b.mp4', // William Dafoe looking up (focused)
  
  // Level 5: "Main Character" - main character energy
  'level5-main-character.gif': 'https://i.imgflip.com/52b9vy.mp4', // Shrek running (main character)
  
  // Level 6: "Living My Best Life" - success/happiness
  'level6-living-my-best-life.gif': 'https://i.imgflip.com/3eet37.mp4', // Dancin bois (living best life)
  
  // Level 7: "Iconic" - iconic/legendary
  'level7-iconic.gif': 'https://i.imgflip.com/62yufy.mp4', // Oprah You Get A Car (iconic)
  
  // Level 8: "That Person" - that person vibe
  'level8-that-person.gif': 'https://i.imgflip.com/53g9gm.mp4', // Guy in the suit (that person)
  
  // Level 9: "Goated" - GOAT status
  'level9-goated.gif': 'https://i.imgflip.com/4zy1cr.mp4', // Xbox Achievement (GOAT status)
  
  // Level 10: "Literally Everything" - ultimate/everything
  'level10-literally-everything.gif': 'https://i.imgflip.com/502024819.mp4', // Surprised Announcer (literally everything/amazing)
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${path.basename(filepath)}`)
    console.log(`   From: ${url.substring(0, 60)}...`)
    
    const file = fs.createWriteStream(filepath)
    
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302 || response.statusCode === 307) {
        file.close()
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
        return downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject)
      }
      
      if (response.statusCode !== 200) {
        file.close()
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        const stats = fs.statSync(filepath)
        console.log(`✓ Saved: ${path.basename(filepath)} (${(stats.size / 1024).toFixed(1)} KB)`)
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

async function downloadAllGifs() {
  console.log('🎭 Downloading unique GIF memes from Imgflip...\n')
  
  let downloaded = 0
  let skipped = 0
  let failed = 0
  
  for (const [filename, url] of Object.entries(GIF_MEME_URLS)) {
    const filepath = path.join(MEMES_DIR, filename)
    
    // Delete existing file if it exists (to ensure fresh download)
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath)
    }
    
    try {
      await downloadImage(url, filepath)
      downloaded++
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
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
    console.log(`\n✅ Success! GIF memes saved to public/memes/`)
    console.log(`   Note: These are MP4 files that work as GIFs in browsers`)
    console.log(`   Update src/types/chore.ts to use .gif extension`)
  } else {
    console.log(`\n⚠️  No files downloaded. Check URLs and try again.`)
  }
}

downloadAllGifs().catch(console.error)

