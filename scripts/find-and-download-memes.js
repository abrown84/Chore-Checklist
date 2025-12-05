/**
 * Script to find and download meme images
 * Uses multiple sources including Pixabay, Unsplash, and meme template sites
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

// Meme mappings - These are popular meme template URLs or search terms
// Level-specific meme suggestions with potential sources
const MEME_SOURCES = {
  'level1-down-bad': {
    suggestions: [
      'This is Fine meme',
      'Bad Luck Brian',
      'First Day on Internet Kid'
    ],
    searchTerms: 'down bad meme template'
  },
  'level2-mid': {
    suggestions: [
      'Average Enjoyer',
      'This is Fine Dog',
      'Roll Safe'
    ],
    searchTerms: 'mid meme template'
  },
  'level3-valid': {
    suggestions: [
      'Drake Pointing',
      'Galaxy Brain (small)',
      'Change My Mind'
    ],
    searchTerms: 'valid meme template'
  },
  'level4-locked-in': {
    suggestions: [
      'Distracted Boyfriend',
      'Guy Holding Stop Sign',
      'Focused Student'
    ],
    searchTerms: 'locked in focused meme'
  },
  'level5-main-character': {
    suggestions: [
      'Drake Pointing (at main character)',
      'Chad Yes',
      'Gigachad'
    ],
    searchTerms: 'main character meme'
  },
  'level6-living-my-best-life': {
    suggestions: [
      'Success Kid',
      'Woman Yelling at Cat (happy)',
      'Feeling Good'
    ],
    searchTerms: 'living best life meme'
  },
  'level7-iconic': {
    suggestions: [
      'Woman Yelling at Cat',
      'Drake Approved',
      'Stonks'
    ],
    searchTerms: 'iconic meme template'
  },
  'level8-that-person': {
    suggestions: [
      'Drake',
      'Gigachad',
      'Distinguished Gentleman'
    ],
    searchTerms: 'that person meme'
  },
  'level9-goated': {
    suggestions: [
      'Galaxy Brain (expanded)',
      'Gigachad',
      'Epic Handshake'
    ],
    searchTerms: 'goated meme template'
  },
  'level10-literally-everything': {
    suggestions: [
      'Drake Pointing (both)',
      'Ultimate Brain',
      'Infinity Gauntlet'
    ],
    searchTerms: 'ultimate everything meme'
  }
}

// Direct download URLs for popular meme templates
// These are placeholder URLs - replace with actual meme image URLs
const DIRECT_MEME_URLS = {
  // You can find these by:
  // 1. Going to https://imgflip.com/memetemplates
  // 2. Right-clicking on a meme template → Copy image address
  // 3. Pasting the URL here
}

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(new Error('No URL provided'))
      return
    }

    const protocol = url.startsWith('https') ? https : http
    
    const file = fs.createWriteStream(filepath)
    
    const request = protocol.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
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
      fs.unlink(filepath, () => {})
      reject(err)
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      fs.unlink(filepath, () => {})
      reject(new Error('Download timeout'))
    })
  })
}

function createMemeGuide() {
  console.log('🎭 Meme Download Guide\n')
  console.log('📋 Instructions for each level:\n')
  
  Object.entries(MEME_SOURCES).forEach(([filename, info]) => {
    const levelNum = filename.match(/\d+/)?.[0]
    console.log(`Level ${levelNum}:`)
    console.log(`  Search for: "${info.searchTerms}"`)
    console.log(`  Suggestions: ${info.suggestions.join(', ')}`)
    console.log('')
  })
  
  console.log('📥 Download Sources:')
  console.log('  1. Imgflip: https://imgflip.com/memetemplates')
  console.log('  2. Pixabay: https://pixabay.com/images/search/meme/')
  console.log('  3. Know Your Meme: https://knowyourmeme.com/')
  console.log('  4. Kapwing: https://www.kapwing.com/explore/meme-templates')
  console.log('')
  console.log('🔧 How to download:')
  console.log('  1. Search for the meme on one of the sites above')
  console.log('  2. Right-click on the image → "Copy image address"')
  console.log('  3. Paste the URL into DIRECT_MEME_URLS in this script')
  console.log('  4. Run: node scripts/find-and-download-memes.js')
  console.log('')
}

async function downloadFromDirectUrls() {
  console.log('🎭 Downloading memes from direct URLs...\n')
  
  if (Object.keys(DIRECT_MEME_URLS).length === 0) {
    console.log('⚠️  No direct URLs configured.\n')
    createMemeGuide()
    return
  }
  
  let downloaded = 0
  let skipped = 0
  
  for (const [filename, url] of Object.entries(DIRECT_MEME_URLS)) {
    const filepath = path.join(MEMES_DIR, `${filename}.jpg`)
    
    if (fs.existsSync(filepath)) {
      console.log(`⏭️  Skipping ${filename} (already exists)`)
      skipped++
      continue
    }
    
    if (!url) {
      console.log(`⚠️  No URL for ${filename}`)
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
  
  if (downloaded === 0) {
    createMemeGuide()
  }
}

// Check if script is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  downloadFromDirectUrls().catch(console.error)
} else {
  createMemeGuide()
}




