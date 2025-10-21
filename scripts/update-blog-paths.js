#!/usr/bin/env node

/**
 * Blog Path Update Script
 * Automatically updates blog markdown files to use WebP images
 * Run: node scripts/update-blog-paths.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogContentDir = path.join(__dirname, '../src/content/blog');
const blogImagesDir = path.join(__dirname, '../public/images/blog');

async function updateBlogPaths() {
  console.log('🔄 Updating blog markdown files to use WebP images...');
  
  try {
    // Get all markdown files in blog content directory
    const files = await fs.readdir(blogContentDir);
    const markdownFiles = files.filter(file => file.endsWith('.md') && !file.includes('.template'));
    
    if (markdownFiles.length === 0) {
      console.log('❌ No markdown files found in blog content directory');
      return;
    }
    
    console.log(`📁 Found ${markdownFiles.length} markdown files to check`);
    
    let updatedFiles = 0;
    
    for (const file of markdownFiles) {
      const filePath = path.join(blogContentDir, file);
      const content = await fs.readFile(filePath, 'utf8');
      
      // Check if file contains PNG image references
      const pngImageRegex = /image:\s*"?\/images\/blog\/([^"\s]+\.png)"?/g;
      const matches = [...content.matchAll(pngImageRegex)];
      
      if (matches.length === 0) {
        console.log(`   ✅ ${file} - No PNG references found`);
        continue;
      }
      
      let updatedContent = content;
      let fileUpdated = false;
      
      for (const match of matches) {
        const pngPath = match[1];
        const webpPath = pngPath.replace('.png', '.webp');
        
        // Check if WebP version exists
        const webpFilePath = path.join(blogImagesDir, webpPath);
        try {
          await fs.access(webpFilePath);
          
          // Replace PNG with WebP in the content (handle with or without quotes)
          updatedContent = updatedContent.replace(
            new RegExp(`image:\\s*"?/images/blog/${pngPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"?`, 'g'),
            `image: /images/blog/${webpPath}`
          );
          fileUpdated = true;
          
          console.log(`   🔄 ${file} - Updated ${pngPath} → ${webpPath}`);
        } catch (error) {
          console.log(`   ⚠️  ${file} - WebP version not found for ${pngPath}`);
        }
      }
      
      if (fileUpdated) {
        await fs.writeFile(filePath, updatedContent, 'utf8');
        updatedFiles++;
      }
    }
    
    console.log(`\n✨ Blog path update complete!`);
    console.log(`   Updated ${updatedFiles} file(s)`);
    
    if (updatedFiles === 0) {
      console.log('   All files already use WebP images');
    }
    
  } catch (error) {
    console.error('❌ Error during blog path update:', error.message);
    process.exit(0); // Don't fail the build for this optional step
  }
}

updateBlogPaths();

