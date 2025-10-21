export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  content: string;
}

// Import all .md files from the blog directory
const blogFiles = import.meta.glob<string>('../content/blog/*.md', { 
  query: '?raw',
  import: 'default',
  eager: true 
});

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

function extractFrontmatter(content: string): Record<string, string> {
  try {
    const normalizedContent = normalizeLineEndings(content);
    
    // Match everything between the first two '---' markers
    const frontmatterMatch = normalizedContent.match(/^---\n([\s\S]*?)\n---/);
    
    if (!frontmatterMatch) {
      console.warn('No frontmatter found in content');
      return {};
    }
    
    const frontmatterContent = frontmatterMatch[1];
    const metadata: Record<string, string> = {};
    
    // Split into lines and process each line
    const lines = frontmatterContent.split('\n');
    for (const line of lines) {
      // Find the first ':' to split key and value
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) continue;
      
      const key = line.slice(0, colonIndex).trim();
      let value = line.slice(colonIndex + 1).trim();
      
      // Remove surrounding quotes if they exist
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      
      if (key) {
        metadata[key] = value;
      }
    }
    
    return metadata;
  } catch (error) {
    console.error('Error extracting frontmatter:', error);
    return {};
  }
}

function extractContent(content: string): string {
  try {
    const normalizedContent = normalizeLineEndings(content);
    
    // Remove the entire frontmatter section (including the --- markers)
    const contentWithoutFrontmatter = normalizedContent.replace(/^---\n[\s\S]*?\n---\n/, '');
    
    // Trim any leading/trailing whitespace
    return contentWithoutFrontmatter.trim();
  } catch (error) {
    console.error('Error extracting content:', error);
    return '';
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const posts = Object.entries(blogFiles)
      .filter(([path]) => !path.includes('.template'))
      .map(([path, content]) => {
        // Extract the slug from the filename
        const slug = path.split('/').pop()?.replace('.md', '') || '';
        
        // Extract frontmatter and content
        const metadata = extractFrontmatter(content);
        const postContent = extractContent(content);
        
        return {
          slug,
          title: metadata.title || 'Untitled',
          excerpt: metadata.excerpt || '',
          author: metadata.author || 'Anonymous',
          date: metadata.date || new Date().toISOString(),
          category: metadata.category || 'Uncategorized',
          readTime: metadata.readTime || '5 min read',
          image: metadata.image || '/images/default-blog-image.jpg',
          content: postContent
        };
      });

    // Sort posts by date in descending order
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error processing blog posts:', error);
    return [];
  }
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 