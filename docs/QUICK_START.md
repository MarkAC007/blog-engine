# Blog Engine Quick Start Guide

**Get up and running in 5 minutes**

---

## ⚡ Quick Installation

```bash
# Clone the repository
git clone https://github.com/your-org/blog-engine.git
cd blog-engine

# Install dependencies
npm install

# Set up environment (optional - only for AI features)
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

Open [http://localhost:8080/blog](http://localhost:8080/blog)

---

## 📝 Create Your First Blog Post

### 1. Create a Markdown File

```bash
touch src/content/blog/2024-01-15-my-first-post.md
```

### 2. Add Content

```markdown
---
title: "My First Blog Post"
excerpt: "This is my first post using the AI Blog Engine"
author: "Your Name"
date: "2024-01-15"
category: "Tutorial"
readTime: "3 min read"
image: /images/blog/2024-01-15-my-first-post.webp
---

# My First Blog Post

Welcome to my blog! This is so easy to use.

## Features I Love

- Simple markdown syntax
- Automatic SEO optimization
- Beautiful responsive design
- AI-powered images (optional)

## Code Example

```javascript
console.log("Hello, World!");
```

Start writing your content here!
```

### 3. Add an Image (Two Options)

#### Option A: Manual Image

1. Add your image to `public/images/blog/`
2. Reference it in the frontmatter: `image: /images/blog/your-image.webp`

#### Option B: AI-Generated Image

```bash
npm run generate:blog-image src/content/blog/2024-01-15-my-first-post.md
```

*Requires OpenAI and Gemini API keys in `.env`*

### 4. View Your Post

- **Listing**: http://localhost:8080/blog
- **Post**: http://localhost:8080/blog/2024-01-15-my-first-post

---

## 🎨 Frontmatter Reference

```yaml
---
title: string           # Post title (required)
excerpt: string         # Short description (required)
author: string          # Author name (required)
date: string           # ISO date YYYY-MM-DD (required)
category: string       # Category tag (required)
readTime: string       # e.g., "5 min read" (required)
image: string          # Path to image (required)
---
```

---

## 🚀 Build & Deploy

```bash
# Generate SEO files (sitemap, robots.txt)
npm run seo:gen

# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist/` folder to any static host (Netlify, Vercel, GitHub Pages, etc.)

---

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run seo:gen` | Generate sitemap & robots.txt |
| `npm run optimize:blog` | Convert PNG to WebP |
| `npm run generate:blog-image <file>` | AI-generate post image |

---

## ⚙️ Configuration

### Site Settings

Edit `src/seo/config.ts`:

```typescript
export const siteUrl = 'https://yourdomain.com';
export const siteName = 'Your Blog Name';
export const defaultTitle = 'Your Blog - Tagline';
export const defaultDescription = 'Your blog description';
export const twitterHandle = '@yourhandle';
```

### Environment Variables

Create `.env`:

```bash
# Site Configuration
VITE_SITE_URL=https://yourdomain.com
VITE_SITE_NAME=My Blog

# AI Features (Optional)
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

### Styling

Edit `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-brand-color',
      }
    }
  }
};
```

---

## 📐 File Structure

```
blog-engine/
├── src/
│   ├── content/blog/          # 📝 Your blog posts (*.md)
│   ├── pages/
│   │   ├── Blog.tsx          # Blog listing page
│   │   └── BlogPost.tsx      # Individual post renderer
│   ├── utils/
│   │   └── blogUtils.ts      # Markdown parser
│   └── seo/
│       ├── SEO.tsx           # SEO component
│       ├── config.ts         # 🔧 Configure here
│       └── schema.ts         # Schema.org helpers
│
├── public/
│   └── images/blog/          # 🖼️ Add images here
│
└── scripts/
    ├── generate-blog-image.js    # AI image generation
    ├── optimize-blog-images.js   # Image optimization
    └── generate-seo.mjs          # SEO generation
```

---

## 🎯 Common Tasks

### Add a New Category

Just use it in your frontmatter - categories are automatic:

```yaml
category: "New Category Name"
```

### Change Blog URL Structure

Edit `src/App.tsx`:

```typescript
// Change from /blog/:slug to /posts/:slug
<Route path="/posts/:slug" element={<BlogPost />} />
```

### Customize Post Layout

Edit `src/pages/BlogPost.tsx` to change:
- Typography styles
- Layout structure
- Color schemes
- Animation effects

### Add Author Pages

1. Create `src/pages/Author.tsx`
2. Filter posts by author in `getBlogPosts()`
3. Add route: `<Route path="/author/:name" element={<Author />} />`

---

## 🐛 Troubleshooting

### Posts Not Showing Up

- Check file is in `src/content/blog/` with `.md` extension
- Verify frontmatter is valid YAML between `---` markers
- Check console for parsing errors
- Ensure date is in `YYYY-MM-DD` format

### Images Not Loading

- Verify image path starts with `/images/blog/`
- Check file exists in `public/images/blog/`
- Clear cache and reload: Cmd/Ctrl + Shift + R

### Build Fails

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Syntax Highlighting Not Working

- Ensure code blocks specify language: ` ```javascript `
- Check `react-syntax-highlighter` is installed
- Verify `remarkGfm` plugin is imported

---

## 💡 Pro Tips

### 1. Use Template Files

Create `.template` files as starting points:

```bash
cp src/content/blog/blog-post.template src/content/blog/2024-01-15-new-post.md
```

### 2. Batch Image Optimization

```bash
# Place PNG images in public/images/blog/
npm run optimize:blog
# Auto-converts all to WebP
```

### 3. SEO Automation

Add to `package.json`:

```json
{
  "scripts": {
    "prebuild": "npm run seo:gen && npm run optimize:blog"
  }
}
```

Now SEO files generate automatically before each build!

### 4. Live Reload

The dev server watches for markdown changes - just save and refresh!

### 5. Draft Posts

Prefix with underscore to hide:

```bash
src/content/blog/_draft-post.md
```

Update `blogUtils.ts` to filter:

```typescript
.filter(([path]) => !path.includes('/_'))
```

---

## 📚 Next Steps

1. **Read Full Documentation**: See `README.md` for comprehensive guide
2. **Customize Styling**: Update `tailwind.config.js` and components
3. **Add Features**: RSS feed, search, categories, tags
4. **Deploy**: Push to Netlify, Vercel, or your preferred host
5. **Share**: Link to your open source blog engine in posts

---

## 🆘 Need Help?

- **Documentation**: Read the full [README.md](README.md)
- **Issues**: Check [GitHub Issues](https://github.com/your-org/blog-engine/issues)
- **Examples**: Study the `.template` files
- **Community**: Ask questions in Discussions

---

## 🎉 You're Ready!

Start creating amazing content with your AI-assisted blog engine!

```bash
# Create a post
touch src/content/blog/$(date +%Y-%m-%d)-my-awesome-post.md

# Generate an image
npm run generate:blog-image src/content/blog/$(date +%Y-%m-%d)-my-awesome-post.md

# Build and deploy
npm run build
```

Happy blogging! 🚀

---

*Last Updated: October 2024*

