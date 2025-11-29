# Level Memes Directory

This directory contains meme images associated with each level in the game.

## Current Status

✅ **Placeholder memes have been created!** SVG files are currently in place showing the level name and a placeholder message. You can replace these with actual meme images.

## File Naming Convention

Place your meme images here with the following naming convention:

- Level 1 (Down Bad): `level1-down-bad.svg` (or `.jpg`, `.png`, `.webp`)
- Level 2 (Mid): `level2-mid.svg`
- Level 3 (Valid'): `level3-valid.svg`
- Level 4 (Locked In): `level4-locked-in.svg`
- Level 5 (Main Character): `level5-main-character.svg`
- Level 6 (Living My Best Life): `level6-living-my-best-life.svg`
- Level 7 (Iconic): `level7-iconic.svg`
- Level 8 (That Person): `level8-that-person.svg`
- Level 9 (Goated): `level9-goated.svg`
- Level 10 (Literally Everything): `level10-literally-everything.svg`

## Supported Formats

- `.svg` (currently used for placeholders)
- `.jpg` / `.jpeg`
- `.png`
- `.webp`
- `.gif` (for animated memes!)

## Image Guidelines

- Recommended size: 400-800px width
- Aspect ratio: 16:9 or 4:3 works well
- Keep file sizes reasonable (< 500KB per image)
- The memes should be funny and relate to the level name/theme

## Where to Find Memes

Here are some great resources for finding memes:

1. **Meme Generators:**
   - [Imgflip](https://imgflip.com/memetemplates) - Popular meme templates
   - [Kapwing](https://www.kapwing.com/explore/meme-templates) - Easy meme maker
   - [Canva](https://www.canva.com/create/memes/) - Professional meme creation

2. **Meme Databases:**
   - [Know Your Meme](https://knowyourmeme.com/) - Meme encyclopedia
   - [Reddit r/memes](https://www.reddit.com/r/memes/) - Fresh memes
   - [9GAG](https://9gag.com/) - Popular meme site

3. **Specific Memes to Consider:**
   - **Level 1 "Down Bad"**: "Woman Yelling at Cat", "This is Fine", "Bad Luck Brian"
   - **Level 2 "Mid"**: "Average Enjoyer", "This is Fine Dog"
   - **Level 3 "Valid'"**: "Drake Pointing", "Galaxy Brain (small brain)"
   - **Level 4 "Locked In"**: "Distracted Boyfriend", "Guy Holding Up Stop Sign"
   - **Level 5 "Main Character"**: "Drake Pointing (at main character)", "Chad Yes"
   - **Level 6 "Living My Best Life"**: "Success Kid", "This is Where I'd Put My Trophy"
   - **Level 7 "Iconic"**: "Woman Yelling at Cat", "Distracted Boyfriend"
   - **Level 8 "That Person"**: "Drake", "Gigachad"
   - **Level 9 "Goated"**: "Galaxy Brain (expanded)", "This is Fine (but actually fine)"
   - **Level 10 "Literally Everything"**: "Drake Pointing (both)", "Ultimate Brain"

## Adding Memes

1. Find or create a meme that matches the level's theme
2. Save it with the exact filename listed above
3. Place it in this `public/memes/` directory (replace the SVG file)
4. The meme will automatically appear in the app wherever that level is displayed
5. **Important**: Update the file extension in `src/types/chore.ts` if you change from SVG to JPG/PNG

## Quick Start

1. Open `public/memes/` directory
2. You'll see SVG placeholder files
3. Replace them with your meme images (same filename, different extension)
4. Update the meme paths in `src/types/chore.ts` if needed

## Notes

- Current placeholders are SVG files showing level names
- Memes will gracefully fail to load if the file is missing (won't break the app)
- You can update memes anytime by replacing the image file with the same name
- SVG files are currently in use - you can replace with JPG/PNG for better quality

