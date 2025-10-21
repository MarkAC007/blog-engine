#!/usr/bin/env node

/**
 * Blog Image Generation Script
 * Automates the complete workflow: extract blog content → generate image prompt (OpenAI) → create image (Gemini) → optimize to WebP → update markdown file
 * 
 * Usage:
 * npm run generate:blog-image src/content/blog/2024-01-15-my-blog-post.md
 * npm run generate:blog-image src/content/blog/2024-01-15-my-blog-post.md -- --with-logo
 * 
 * The --with-logo flag will embed your site logo in the bottom-right corner with proper spacing.
 */

import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import matter from 'gray-matter';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// System prompt for OpenAI image prompt generation
const SYSTEM_PROMPT = `You are Blog Image Prompt Composer. Convert any user-provided blog content into a single, production-ready text-to-image prompt that proposes a creative, on-brand image to support the article. Do not explain your reasoning or include headings; output only the final prompt.

Instructions:
- Read the blog text to infer the primary topic, core message, audience, tone, and desired emotional effect. Choose one strong visual approach (literal editorial scene, conceptual metaphor, data visualization vibe, still life, illustration, 3D, etc.) that best amplifies the message.
- If brand or style guidelines are provided, follow them; otherwise default to a modern, clean editorial/hero-image aesthetic suitable for blogs. If the content is abstract, create a memorable metaphor grounded in the domain.
- Describe the image succinctly: subject/scene, setting, key elements and relationships, action/gesture if relevant, symbolism, mood, and narrative moment. Ensure the concept reads clearly at thumbnail size.
- Specify style and craft: photoreal/cinematic/illustrative/vector/3D, level of detail, texture, post-processing look (e.g., subtle filmic grade, clean flat illustration), inclusivity/diversity cues when humans appear (generic, non-identifiable unless explicitly provided).
- Composition and capture: focal point, negative space for potential headline if requested, rule-of-thirds/leading lines/symmetry, lens and shot type (e.g., 35mm medium shot, macro, aerial), camera angle, depth of field, background treatment (clean backdrop or environmental context).
- Lighting and color: lighting style (soft diffused daylight, moody rim light, studio softbox), time-of-day if pertinent, color palette (3–6 key hues) aligned to mood and accessibility.
- Technical/output: aspect ratio suited to placement (default 2:1 for blog hero images; use 4:3 for inline or 1:1 if specified), high resolution (4k), highly detailed if photoreal, clean vectors if illustrative. Avoid real logos/trademarks and identifiable people unless explicitly requested. Keep it safe and respectful.
- Negative cues: no text, no watermarks, no logos, no UI, no borders/frames, no heavy gradients or banding, no overexposed highlights, no artifacts, no stock-photo watermarks, no deformed anatomy.

Output format (single paragraph, no prefixes/suffixes):
[style/genre], [concise subject and scene], [visual approach/metaphor], [setting and key elements], [composition and camera/lens/angle/DoF], [lighting], mood: [adjectives], color palette: [key hues], aspect ratio: 2:1, resolution: 4k, [post-processing/look], negative: no text, no watermarks, no logos, no UI, no borders, no artifacts, no overexposure, clean and coherent.`;

// Initialize API clients
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Extract blog content from markdown file
 */
function extractBlogContent(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter, content } = matter(fileContent);
    return { frontmatter, content, filePath };
  } catch (error) {
    throw new Error(`Failed to read blog file: ${error.message}`);
  }
}

/**
 * Generate image prompt using OpenAI
 */
async function generateImagePrompt(content, systemPrompt) {
  try {
    console.log('🤖 Generating image prompt with OpenAI...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: content }
      ],
      temperature: 0.7,
    });

    const prompt = completion.choices[0].message.content.trim();
    console.log('✅ Image prompt generated successfully');
    return prompt;
  } catch (error) {
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

/**
 * Evaluate image quality using GPT-4 Vision
 */
async function evaluateImageQuality(imageData, blogContent) {
  try {
    console.log('🔍 Analyzing image quality with GPT-4 Vision...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a quality control agent for blog images. Analyze the provided image against the blog content and determine if it's suitable for a professional blog post.

Evaluation Criteria:
1. RELEVANCE: Does the image accurately represent the blog content and topic?
2. PROFESSIONAL QUALITY: Is the image professional, clean, and suitable for a business blog?
3. COMPOSITION: Is the image well-composed with good visual hierarchy?
4. STYLE CONSISTENCY: Does it match the tone and style of the content?
5. TECHNICAL QUALITY: Is the image clear, well-lit, and technically sound?

Respond with a JSON object:
{
  "approved": true/false,
  "reason": "Brief explanation of decision",
  "suggestions": ["Specific suggestions for improvement if not approved"]
}

Reject images that are:
- Irrelevant to the content
- Unprofessional or inappropriate
- Poorly composed or low quality
- Too generic or stock-photo-like
- Inconsistent with the blog's professional tone`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Blog Content: ${blogContent.substring(0, 1000)}...`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${imageData}`
              }
            }
          ]
        }
      ],
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    // Clean up markdown formatting if present
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const qualityResult = JSON.parse(cleanResponse);
    
    console.log(`📊 Quality assessment: ${qualityResult.approved ? 'APPROVED' : 'REJECTED'}`);
    if (!qualityResult.approved) {
      console.log(`❌ Reason: ${qualityResult.reason}`);
      console.log(`💡 Suggestions: ${qualityResult.suggestions.join(', ')}`);
    }
    
    return qualityResult;
  } catch (error) {
    console.warn(`⚠️  Quality check failed: ${error.message}`);
    // If quality check fails, approve by default to avoid blocking generation
    return { approved: true, reason: "Quality check unavailable", suggestions: [] };
  }
}

/**
 * Generate multiple image variations
 */
async function generateMultipleImages(basePrompt, content) {
  try {
    console.log('🎨 Generating 3 image variations...');
    
    // Generate 3 different prompts with variations
    const promptVariations = await generatePromptVariations(basePrompt, content);
    const imagePromises = promptVariations.map(async (prompt, index) => {
      console.log(`🖼️  Generating image ${index + 1}/3...`);
      const imageData = await generateImage(prompt, null);
      return {
        index: index + 1,
        data: imageData,
        prompt: prompt
      };
    });
    
    const images = await Promise.all(imagePromises);
    console.log(`✅ Generated ${images.length} image variations`);
    return images;
  } catch (error) {
    console.warn(`⚠️  Multiple image generation failed: ${error.message}`);
    // Fallback to single image
    const singleImage = await generateImage(basePrompt, null);
    return [{ index: 1, data: singleImage, prompt: basePrompt }];
  }
}

/**
 * Generate prompt variations for different image styles
 */
async function generatePromptVariations(basePrompt, content) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Generate 3 different prompt variations for the same blog content. Each should have a different visual approach:

1. PROFESSIONAL/REALISTIC: Clean, business-focused, realistic style
2. MODERN/ILLUSTRATIVE: Contemporary, stylized, illustrative approach  
3. CONCEPTUAL/ABSTRACT: More abstract, conceptual, creative interpretation

Each prompt should be optimized for Google Gemini image generation and maintain the 2:1 aspect ratio requirement.

Return as JSON array: ["prompt1", "prompt2", "prompt3"]`
        },
        {
          role: "user",
          content: `Base prompt: ${basePrompt}\n\nBlog content: ${content.substring(0, 500)}...`
        }
      ],
      temperature: 0.8
    });

    const response = completion.choices[0].message.content;
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanResponse);
  } catch (error) {
    console.warn(`⚠️  Prompt variation generation failed: ${error.message}`);
    // Fallback to base prompt with slight variations
    return [
      basePrompt,
      basePrompt + " Professional business style.",
      basePrompt + " Modern illustrative approach."
    ];
  }
}

/**
 * Select the best image from multiple options using GPT-4 Vision
 */
async function selectBestImage(imageOptions, blogContent) {
  try {
    console.log('🔍 Evaluating multiple images to select the best one...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert image selector for blog posts. Compare the provided images and select the BEST one for the blog content.

Evaluation Criteria:
1. RELEVANCE: How well does it represent the blog content?
2. PROFESSIONAL QUALITY: Is it suitable for a business blog?
3. COMPOSITION: Visual hierarchy and professional appearance
4. STYLE CONSISTENCY: Matches the blog's professional tone
5. TECHNICAL QUALITY: Clarity, lighting, and technical soundness

Respond with JSON:
{
  "selectedIndex": 1-3,
  "reason": "Why this image was selected",
  "scores": {
    "image1": {"relevance": 8, "quality": 7, "composition": 8},
    "image2": {"relevance": 9, "quality": 8, "composition": 7},
    "image3": {"relevance": 6, "quality": 9, "composition": 8}
  }
}`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Blog Content: ${blogContent.substring(0, 1000)}...\n\nPlease evaluate these ${imageOptions.length} images and select the best one.`
            },
            ...imageOptions.map((option, index) => ({
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${option.data}`
              }
            }))
          ]
        }
      ],
      max_tokens: 500
    });

    const response = completion.choices[0].message.content;
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const selection = JSON.parse(cleanResponse);
    
    const selectedImage = imageOptions[selection.selectedIndex - 1];
    console.log(`✅ Selected image ${selection.selectedIndex}: ${selection.reason}`);
    
    return selectedImage;
  } catch (error) {
    console.warn(`⚠️  Image selection failed: ${error.message}`);
    // Fallback to first image
    console.log('🔄 Falling back to first image option');
    return imageOptions[0];
  }
}

/**
 * Generate enhanced prompt based on quality feedback
 */
async function generateEnhancedPrompt(content, suggestions) {
  try {
    console.log('🔄 Generating enhanced prompt based on feedback...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT + "\n\nIMPORTANT: The previous image was rejected. Generate a new, improved prompt that addresses these specific issues: " + suggestions.join(', ')
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.8
    });

    return completion.choices[0].message.content.trim();
  } catch (error) {
    console.warn(`⚠️  Enhanced prompt generation failed: ${error.message}`);
    return content; // Fallback to original content
  }
}

/**
 * Add logo overlay to existing image using Gemini
 */
async function addLogoOverlay(imageData) {
  try {
    console.log('🎨 Adding ai-blog-engine logo overlay with Gemini...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    // Get logo as base64
    const logoBase64 = getLogoBase64();
    if (!logoBase64) {
      console.warn('⚠️  Could not load logo, returning original image');
      return imageData;
    }
    
    // Create request to add logo overlay
    const request = {
      contents: [{
        parts: [
          {
            text: "Add the ai-blog-engine logo as a SMALL floating overlay in the bottom right corner of this image. Make the logo approximately 60-80 pixels wide. Position it with proper spacing from the edges (approximately 5% margin from bottom and right edges). Directly below the logo, centered and aligned, include the text 'ai-blog-engine.io' in a SMALL, clean, professional font (approximately 12-14px size). The logo and text should appear as a subtle, small semi-transparent watermark overlay, not integrated into the background. Keep the branding minimal and unobtrusive while ensuring good contrast and readability."
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: imageData
            }
          },
          {
            inlineData: {
              mimeType: "image/png", 
              data: logoBase64
            }
          }
        ]
      }]
    };

    const result = await model.generateContent(request);
    const response = await result.response;
    
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      throw new Error('No image generated by Gemini');
    }

    // Extract image data from response
    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        console.log('✅ Logo overlay added successfully');
        return part.inlineData.data; // Return base64 image data
      }
    }
    
    throw new Error('No image data found in Gemini response');
  } catch (error) {
    console.warn(`⚠️  Could not add logo overlay: ${error.message}`);
    return imageData; // Return original image if logo addition fails
  }
}

/**
 * Generate image using Google Gemini
 */
async function generateImage(prompt, logoBase64 = null) {
  try {
    console.log('🎨 Generating image with Google Gemini...');
    
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-image" });
    
    // Prepare the request
    const request = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    };

    // Add logo if provided
    if (logoBase64) {
      console.log('🏷️  Including ai-blog-engine logo in image generation...');
      request.contents[0].parts.push({
        inlineData: {
          mimeType: "image/png",
          data: logoBase64
        }
      });
    }

    const result = await model.generateContent(request, {
      generationConfig: {
        // Try to force aspect ratio - though this may not work due to API limitations
        aspectRatio: "16:9"  // This might not work, but worth trying
      }
    });
    const response = await result.response;
    
    if (!response.candidates || !response.candidates[0] || !response.candidates[0].content) {
      throw new Error('No image generated by Gemini');
    }

    // Extract image data from response
    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        console.log('✅ Image generated successfully');
        return part.inlineData.data; // Return base64 image data
      }
    }
    
    throw new Error('No image data found in Gemini response');
  } catch (error) {
    throw new Error(`Gemini API error: ${error.message}`);
  }
}

/**
 * Ensure image has correct 2:1 aspect ratio by cropping if necessary
 */
async function ensureCorrectAspectRatio(imagePath) {
  try {
    console.log('🔄 Checking and adjusting aspect ratio...');
    
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    const { width, height } = metadata;
    
    // Calculate target dimensions for 2:1 aspect ratio
    const targetRatio = 2;
    const currentRatio = width / height;
    
    if (Math.abs(currentRatio - targetRatio) > 0.1) {
      console.log(`📐 Adjusting aspect ratio from ${currentRatio.toFixed(2)}:1 to 2:1`);
      
      let newWidth, newHeight, cropPosition;
      
      if (currentRatio > targetRatio) {
        // Image is too wide, crop width
        newHeight = height;
        newWidth = height * targetRatio;
        // Crop from left to preserve right side (where logo should be)
        cropPosition = 'right';
      } else {
        // Image is too tall, crop height
        newWidth = width;
        newHeight = width / targetRatio;
        // Crop from top to preserve bottom (where logo should be)
        cropPosition = 'bottom';
      }
      
      // Crop to preserve logo area - use temporary file to avoid overwriting
      const tempPath = imagePath.replace('.png', '_temp.png');
      await sharp(imagePath)
        .resize(newWidth, newHeight, {
          fit: 'cover',
          position: cropPosition
        })
        .toFile(tempPath);
      
      // Replace original with cropped version
      fs.renameSync(tempPath, imagePath);
        
      console.log(`✅ Aspect ratio adjusted to 2:1 (${newWidth}x${newHeight})`);
    } else {
      console.log(`✅ Aspect ratio is already correct (${currentRatio.toFixed(2)}:1)`);
    }
  } catch (error) {
    console.warn(`⚠️  Could not adjust aspect ratio: ${error.message}`);
  }
}

/**
 * Convert PNG to WebP using Sharp
 */
async function convertToWebP(pngPath) {
  try {
    console.log('🔄 Converting to WebP format...');
    
    const webpPath = pngPath.replace('.png', '.webp');
    
    await sharp(pngPath)
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    // Get file size comparison
    const pngStats = fs.statSync(pngPath);
    const webpStats = fs.statSync(webpPath);
    const savings = ((1 - webpStats.size / pngStats.size) * 100).toFixed(1);
    
    console.log(`✅ WebP conversion complete - ${savings}% size reduction`);
    console.log(`   PNG: ${(pngStats.size / 1024).toFixed(2)} KB`);
    console.log(`   WebP: ${(webpStats.size / 1024).toFixed(2)} KB`);
    
    return webpPath;
  } catch (error) {
    throw new Error(`WebP conversion failed: ${error.message}`);
  }
}

/**
 * Update markdown file with new image path
 */
function updateMarkdownImage(filePath, imagePath) {
  try {
    console.log('📝 Updating markdown file with new image path...');
    
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const newImagePath = `/images/blog/${path.basename(imagePath)}`;
    
    // Split content into frontmatter and content sections
    const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      throw new Error('No frontmatter found in markdown file');
    }
    
    const [, frontmatterContent, markdownContent] = frontmatterMatch;
    
    // Update only the image line in frontmatter
    const updatedFrontmatter = frontmatterContent.replace(/^image:\s*.+$/m, `image: ${newImagePath}`);
    
    // Reconstruct the file with preserved structure
    const newContent = `---\n${updatedFrontmatter}\n---\n${markdownContent}`;
    
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ Updated image path: ${newImagePath}`);
  } catch (error) {
    throw new Error(`Failed to update markdown: ${error.message}`);
  }
}

/**
 * Save prompt to file for manual review
 */
function savePromptFile(filePath, prompt) {
  const promptPath = filePath.replace('.md', '.prompt');
  fs.writeFileSync(promptPath, prompt);
  console.log(`💾 Prompt saved to: ${promptPath}`);
}

/**
 * Get logo as base64
 */
function getLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '../public/images/ai-blog-engine-logo.png');
    const logoBuffer = fs.readFileSync(logoPath);
    return logoBuffer.toString('base64');
  } catch (error) {
    console.warn('⚠️  Could not load logo file, proceeding without logo embedding');
    return null;
  }
}

/**
 * Main execution function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('❌ Error: Please provide a markdown file path');
    console.log('Usage: npm run generate:blog-image <markdown-file-path> [--with-logo]');
    process.exit(1);
  }

  const markdownPath = args[0];
  const withLogo = args.includes('--with-logo');
  
  // Validate environment variables
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ Error: GEMINI_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    console.log('🚀 Starting blog image generation workflow...\n');
    
    // Step 1: Extract blog content
    console.log('📖 Reading blog content...');
    const { frontmatter, content, filePath } = extractBlogContent(markdownPath);
    console.log(`✅ Loaded: ${frontmatter.title || 'Untitled'}`);
    
    // Step 2: Generate image prompt
    let prompt = await generateImagePrompt(content, SYSTEM_PROMPT);
    
    // Step 3: Generate base image first (without logo)
    console.log('🎨 Generating base image without logo...');
    
    console.log(`📝 Generated prompt: ${prompt.substring(0, 100)}...`);
    
    // Step 4: Generate base image (without logo)
    const baseImageData = await generateImage(prompt, null);
    
    // Step 5: Generate multiple images and select the best one
    console.log('🎨 Generating multiple image options...');
    const imageOptions = await generateMultipleImages(prompt, content);
    const selectedImage = await selectBestImage(imageOptions, content);
    let finalImageData = selectedImage.data;
    
    // Step 6: Add logo overlay if requested
    if (withLogo) {
      console.log('🏷️  Adding ai-blog-engine logo overlay...');
      finalImageData = await addLogoOverlay(finalImageData);
    }
    
    // Step 5: Save image
    const blogDir = path.join(__dirname, '../public/images/blog');
    const fileName = path.basename(markdownPath, '.md');
    const pngPath = path.join(blogDir, `${fileName}.png`);
    
    // Ensure blog directory exists
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    
    // Save the final image data to file
    const imageBuffer = Buffer.from(finalImageData, 'base64');
    fs.writeFileSync(pngPath, imageBuffer);
    console.log(`📁 Image saved to: ${pngPath}`);
    
    // Post-process to ensure correct aspect ratio (2:1)
    await ensureCorrectAspectRatio(pngPath);
    
    // Step 6: Convert to WebP
    const webpPath = await convertToWebP(pngPath);
    
    // Step 7: Update markdown
    updateMarkdownImage(filePath, webpPath);
    
    console.log('\n✨ Blog image generation workflow completed!');
    console.log(`\n📊 Generated files:`);
    console.log(`   PNG: ${pngPath}`);
    console.log(`   WebP: ${webpPath}`);
    console.log(`   Updated: ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // Save prompt for manual review
    try {
      const { content } = extractBlogContent(markdownPath);
      const prompt = await generateImagePrompt(content, SYSTEM_PROMPT);
      savePromptFile(markdownPath, prompt);
    } catch (saveError) {
      console.error(`❌ Failed to save prompt: ${saveError.message}`);
    }
    
    process.exit(1);
  }
}

// Run the script
main();
