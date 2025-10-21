# Contributing to AI Blog Engine

First off, thank you for considering contributing to AI Blog Engine! It's people like you that make this project such a great tool for the community.

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if relevant**
- **Include your environment details** (OS, Node version, npm version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the proposed functionality**
- **Explain why this enhancement would be useful**
- **List any similar features in other projects**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## Development Process

### Setting Up Your Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/blog-engine.git
cd blog-engine

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server
npm run dev
```

### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes following the coding standards below

3. Test your changes:
   ```bash
   npm run build
   npm run preview
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request on GitHub

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Properly type all functions and variables
- Avoid using `any` type unless absolutely necessary
- Use interfaces for object shapes

### Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Keep functions small and focused
- Comment complex logic
- Use ES6+ features where appropriate

### File Organization

- Place components in `src/components/`
- Place pages in `src/pages/`
- Place utilities in `src/utils/`
- Place types in `src/types/`
- Keep related files together

### Commit Messages

- Use clear and descriptive commit messages
- Start with a verb (Add, Fix, Update, Remove, etc.)
- Reference issues when applicable
- Examples:
  - `Add RSS feed generation`
  - `Fix markdown parsing for code blocks`
  - `Update documentation for SEO configuration`
  - `Remove deprecated API calls #123`

## Documentation

- Update the README.md if you change functionality
- Add JSDoc comments for complex functions
- Update relevant documentation in the `docs/` folder
- Include code examples where appropriate

## Testing

Currently, this project doesn't have automated tests, but you should:

- Manually test all changes
- Verify the build works: `npm run build`
- Test in different browsers
- Ensure responsive design works
- Verify blog posts render correctly
- Check that SEO generation still works

## Areas Where We Need Help

- Adding automated tests (Jest, React Testing Library)
- Improving accessibility (ARIA labels, keyboard navigation)
- Adding new features (RSS feed, search, categories)
- Improving documentation
- Creating tutorial videos or blog posts
- Reporting bugs and suggesting enhancements
- Improving performance
- Adding i18n/l10n support

## Project Structure

```
blog-engine/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── content/blog/   # Blog post markdown files
│   └── config.ts       # Site configuration
├── scripts/            # Build and utility scripts
├── public/             # Static assets
└── docs/               # Additional documentation
```

## Questions?

Don't hesitate to ask questions! You can:

- Open an issue with the "question" label
- Start a discussion in GitHub Discussions
- Check the existing documentation in `docs/`

## Recognition

Contributors will be recognized in:

- The project README
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉

