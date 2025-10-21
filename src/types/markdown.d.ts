declare module '*.md' {
  const content: {
    frontmatter: {
      title: string;
      excerpt: string;
      author: string;
      date: string;
      category: string;
      readTime: string;
      image: string;
    };
    default: string;
  };
  export default content;
} 