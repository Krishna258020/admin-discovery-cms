# Contributing to TrekAdmin Discovery CMS

Thank you for your interest in contributing to TrekAdmin Discovery CMS! This document provides guidelines and instructions for contributing.

## 🌿 Branch Strategy

We use a feature branch workflow:

- `main` - Production-ready code
- `development` - Active development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Emergency fixes for production

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/Krishna258020/admin-discovery-cms.git
   cd admin-discovery-cms
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a feature branch**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

1. **Make your changes**
   - Write clean, readable code
   - Follow the existing code style
   - Add comments for complex logic
   - Update types in `types.ts` if needed

2. **Test your changes**
   ```bash
   npm run dev
   npm run type-check
   ```

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

## 📝 Commit Message Convention

We follow the Conventional Commits specification:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add weather forecast filtering
fix: resolve theme priority sorting issue
docs: update API documentation
refactor: simplify content manager logic
```

## 🎨 Code Style Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type unless absolutely necessary
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### CSS/Styling

- Use Tailwind CSS utility classes
- Follow the design system in `index.css`
- Keep custom CSS minimal
- Use CSS variables for theming

### File Organization

```
components/
  ├── ui/              # Reusable UI components
  ├── Feature.tsx      # Feature-specific components
  └── index.ts         # Barrel exports

hooks/                 # Custom React hooks
utils/                 # Utility functions
types.ts              # Type definitions
constants.ts          # Constants and mock data
```

## 🧪 Testing

Before submitting a PR:

1. Test all functionality manually
2. Run type checking: `npm run type-check`
3. Ensure no console errors
4. Test on different screen sizes

## 📤 Submitting Changes

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select `development` as base branch
   - Select your feature branch as compare branch
   - Fill in the PR template

3. **PR Description should include:**
   - What changes were made
   - Why the changes were necessary
   - Any breaking changes
   - Screenshots (if UI changes)

## 🔍 Code Review Process

1. At least one team member must review
2. All comments must be addressed
3. CI checks must pass
4. No merge conflicts

## 🐛 Reporting Bugs

When reporting bugs, include:

- Clear description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Browser/OS information

## 💡 Suggesting Features

When suggesting features:

- Describe the feature clearly
- Explain the use case
- Provide examples if possible
- Consider implementation complexity

## 📚 Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

## ❓ Questions?

If you have questions, reach out to:
- Repository Owner: krishnarajgopal97@gmail.com
- Create an issue on GitHub

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project.
