/**
 * Script to download meme images from Pixabay
 * Note: Pixabay requires API key for programmatic access
 * Alternative: Search Pixabay manually and paste image URLs below
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

// Pixabay image URLs - Replace these with actual Pixabay meme image URLs
// You can find memes at: https://pixabay.com/images/search/meme/
const PIXABAY_MEME_URLS = {
  'level1-down-bad': null, // Add Pixabay image URL here
  'level2-mid': null,
  'level3-valid': null,
  'level4-locked-in': null,
  'level5-main-character': null,
  'level6-living-my-best-life': null,
  'level7-iconic': null,
  'level8-that-person': null,
  'level9-goated': null,
  'level10-literally-everything': null,
}

// Alternative: Use Unsplash or other free image sources
const ALTERNATIVE_MEME_URLS = {
  // These are placeholder URLs - replace with actual meme images
  // You can use: https://imgflip.com/memetemplates for meme templates
  // Or search on: https://knowyourmeme.com/ for specific memes
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'))
      return
    }

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
      
      // Check content type
      const contentType = response.headers['content-type']
      if (contentType && !contentType.startsWith('image/')) {
        reject(new Error(`Invalid content type: ${contentType}`))
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
  console.log('🎭 Downloading memes from Pixabay...\n')
  console.log('⚠️  Note: You need to add Pixabay image URLs to this script first!\n')
  console.log('💡 Instructions:')
  console.log('   1. Visit https://pixabay.com/images/search/meme/')
  console.log('   2. Search for memes matching each level name')
  console.log('   3. Right-click on an image → Copy image address')
  console.log('   4. Paste the URL into PIXABAY_MEME_URLS in this script')
  console.log('   5. Run this script again\n')
  
  const entries = Object.entries(PIXABAY_MEME_URLS)
  let downloaded = 0
  let skipped = 0
  
  for (const [filename, url] of entries) {
    const filepath = path.join(MEMES_DIR, `${filename}.jpg`)
    
    // Skip if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`)
      skipped++
      continue
    }
    
    if (!url) {
      console.log(`⚠️  No URL for ${filename} - skipping`)
      continue
    }
    
    try {
      await downloadImage(url, filepath)
      downloaded++
    } catch (error) {
      console.error(`✗ Failed to download ${filename}:`, error.message)
    }
  }
  
  console.log(`\n✨ Done!`)
  console.log(`   Downloaded: ${downloaded} memes`)
  console.log(`   Skipped: ${skipped} existing files`)
  
  if (downloaded === 0 && skipped === 0) {
    console.log(`\n💡 Tip: Add image URLs to PIXABAY_MEME_URLS in this script first!`)
  }
}

downloadAllMemes().catch(console.error)

