#!/usr/bin/env node

/**
 * Blog Image Optimization Script
 * Converts all blog images to WebP format with quality optimization
 * Run: node scripts/optimize-blog-images.js
 */

import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogImagesDir = path.join(__dirname, '../public/images/blog');
const outputDir = blogImagesDir; // Keep in same directory

async function optimizeBlogImages() {
  console.log('🎨 Starting blog image optimization...');
  
  try {
    // Get all PNG files in blog directory
    const files = await fs.readdir(blogImagesDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    // Check for existing WebP files to avoid re-processing
    const existingWebpFiles = files.filter(file => file.endsWith('.webp'));
    const webpBaseNames = existingWebpFiles.map(file => file.replace('.webp', ''));
    
    // Filter out PNG files that already have WebP versions
    const newPngFiles = pngFiles.filter(pngFile => {
      const baseName = pngFile.replace('.png', '');
      return !webpBaseNames.includes(baseName);
    });
    
    if (newPngFiles.length === 0) {
      console.log('✅ All PNG files already have WebP versions');
      return;
    }
    
    console.log(`📁 Found ${newPngFiles.length} new PNG files to optimize:`);
    newPngFiles.forEach(file => console.log(`   - ${file}`));
    console.log('');
    
    let totalOriginalSize = 0;
    let totalOptimizedSize = 0;
    
    for (const file of newPngFiles) {
      const inputPath = path.join(blogImagesDir, file);
      const outputFile = file.replace('.png', '.webp');
      const outputPath = path.join(outputDir, outputFile);
      
      try {
        // Get original file size
        const originalStats = await fs.stat(inputPath);
        const originalSizeKB = (originalStats.size / 1024).toFixed(1);
        totalOriginalSize += originalStats.size;
        
        // Optimize with sharp
        await sharp(inputPath)
          .webp({ 
            quality: 85, // High quality for blog images
            effort: 6    // Maximum compression effort
          })
          .toFile(outputPath);
        
        // Get optimized file size
        const optimizedStats = await fs.stat(outputPath);
        const optimizedSizeKB = (optimizedStats.size / 1024).toFixed(1);
        totalOptimizedSize += optimizedStats.size;
        
        const savings = ((1 - (optimizedStats.size / originalStats.size)) * 100).toFixed(1);
        
        console.log(`✅ ${file} → ${outputFile}`);
        console.log(`   ${originalSizeKB} KB → ${optimizedSizeKB} KB (${savings}% savings)`);
        console.log('');
        
      } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
      }
    }
    
    // Summary
    const totalOriginalSizeKB = (totalOriginalSize / 1024).toFixed(1);
    const totalOptimizedSizeKB = (totalOptimizedSize / 1024).toFixed(1);
    const totalSavings = ((1 - (totalOptimizedSize / totalOriginalSize)) * 100).toFixed(1);
    
    console.log('📊 Optimization Summary:');
    console.log(`   Total original size: ${totalOriginalSizeKB} KB`);
    console.log(`   Total optimized size: ${totalOptimizedSizeKB} KB`);
    console.log(`   Total savings: ${totalSavings}%`);
    console.log(`   Space saved: ${(totalOriginalSize - totalOptimizedSize) / 1024 / 1024} MB`);
    
    console.log('\n✨ Blog image optimization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Update blog markdown files to use .webp extensions');
    console.log('   2. Test blog pages to ensure images load correctly');
    console.log('   3. Consider removing original PNG files after verification');
    
  } catch (error) {
    console.error('❌ Error during blog image optimization:', error);
  }
}

optimizeBlogImages();
