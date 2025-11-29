/**
 * Download the penguin pointing meme from imgflip for landing page background
 */

import https from 'https'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PUBLIC_DIR = path.join(__dirname, '..', 'public')
const OUTPUT_PATH = path.join(PUBLIC_DIR, 'penguin-pointing-meme.gif')

// Try different possible URLs for the imgflip template
const POSSIBLE_URLS = [
  'https://i.imgflip.com/258651081.gif',
  'https://i.imgflip.com/258651081.jpg',
  'https://i.imgflip.com/258651081.mp4',
]

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    console.log(`📥 Attempting to download from: ${url}`)
    
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
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath)
        }
        reject(new Error(`HTTP ${response.statusCode}`))
        return
      }
      
      response.pipe(file)
      
      file.on('finish', () => {
        file.close()
        console.log(`✓ Successfully saved to: ${filepath}`)
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

async function downloadPenguinMeme() {
  console.log('🐧 Downloading penguin pointing meme...\n')
  
  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true })
  }
  
  // Try each URL until one works
  for (const url of POSSIBLE_URLS) {
    try {
      await downloadImage(url, OUTPUT_PATH)
      console.log(`\n✅ Success! Meme saved to public/penguin-pointing-meme.gif`)
      console.log(`   You can now use '/penguin-pointing-meme.gif' in your code`)
      return
    } catch (error) {
      console.log(`✗ Failed: ${url} - ${error.message}`)
      continue
    }
  }
  
  console.log('\n❌ All URLs failed. The image might not be directly accessible.')
  console.log('   You may need to:')
  console.log('   1. Visit https://imgflip.com/memetemplate/258651081/Penguin-pointing-at-shipping-label')
  console.log('   2. Right-click the image and "Save image as..."')
  console.log('   3. Save it to public/penguin-pointing-meme.gif')
}

downloadPenguinMeme().catch(console.error)

