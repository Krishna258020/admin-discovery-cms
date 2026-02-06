# TrekAdmin Discovery CMS

A modern, production-ready content management system for managing trek discovery content, themes, and weather forecasts. Built with React, TypeScript, and Vite.

## 🚀 Features

- **Theme Management**: Create and manage seasonal themes, festival campaigns, and promotional content
- **Content Discovery**: Manage "What's New", "Top Treks", and "Trek Shorts" content
- **Weather Forecasts**: Track and publish trek weather forecasts by region and season
- **Real-time Analytics**: Dashboard with engagement metrics and system health
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Type-Safe**: Full TypeScript support with strict type checking
- **Modular Architecture**: Clean component structure with reusable UI components

## 📁 Project Structure

```
trekadmin-discovery-cms/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── index.ts
│   ├── ContentManager.tsx     # Content management module
│   ├── ForecastManager.tsx    # Weather forecast module
│   └── ThemeManager.tsx       # Theme management module
├── hooks/                     # Custom React hooks
│   ├── useDebounce.ts
│   ├── useLocalStorage.ts
│   └── useMediaQuery.ts
├── utils/                     # Utility functions
│   ├── api.ts                 # API client functions
│   └── helpers.ts             # Helper utilities
├── App.tsx                    # Main application component
├── index.tsx                  # Application entry point
├── index.css                  # Global styles & design system
├── types.ts                   # TypeScript type definitions
├── constants.ts               # Mock data & constants
└── vite.config.ts             # Vite configuration
```

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool & dev server
- **Tailwind CSS** - Utility-first CSS (via CDN)
- **Lucide React** - Icon library
- **ESM** - Modern module system

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Krishna258020/admin-discovery-cms.git
cd admin-discovery-cms
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update `.env.local` with your configuration:
```env
VITE_API_URL=http://localhost:3001/api
GEMINI_API_KEY=your_api_key_here
```

## 🚀 Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Build

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run type-check` - Check types without emitting
- `npm run clean` - Clean build artifacts

## 🎨 Design System

The project includes a comprehensive design system with:

- **Color Palette**: Brand colors, neutrals, and semantic colors
- **Typography**: Inter font family with responsive sizing
- **Spacing Scale**: Consistent spacing from xs to 2xl
- **Shadows**: Elevation system with 4 levels
- **Border Radius**: Consistent rounding from sm to full
- **Transitions**: Smooth animations with cubic-bezier easing

All design tokens are defined in `index.css` as CSS custom properties.

## 🧩 Component Library

### UI Components

- **Button**: Multiple variants (primary, secondary, ghost, danger)
- **Badge**: Status indicators with color variants
- **Card**: Container component with optional header/footer
- **Input**: Form input with validation and icons
- **Modal**: Dialog component with backdrop
- **Spinner**: Loading indicators

### Feature Components

- **ThemeManager**: Manage home themes and campaigns
- **ContentManager**: Manage discovery content by category
- **ForecastManager**: Manage trek weather forecasts

## 🔧 Custom Hooks

- `useLocalStorage`: Persist state in localStorage
- `useMediaQuery`: Responsive breakpoint detection
- `useDebounce`: Debounce value changes

## 🌐 API Integration

The project includes a complete API client in `utils/api.ts` with:

- Theme API (CRUD operations)
- Content API (CRUD + reordering)
- Forecast API (CRUD + filtering)
- Analytics API (stats & metrics)
- Upload API (image uploads)

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `/api` |
| `GEMINI_API_KEY` | Gemini API key | - |
| `VITE_ENV` | Environment | `development` |
| `VITE_ENABLE_ANALYTICS` | Enable analytics | `true` |
| `VITE_ENABLE_DEBUG` | Debug mode | `false` |

## 👥 Team Collaboration

This repository is configured for team collaboration:

1. **Branch Strategy**: Use feature branches for development
2. **Current Branch**: `development` (active development)
3. **Main Branch**: `main` (production-ready code)

### Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name

# Create pull request on GitHub
```

## 📄 License

Private - All rights reserved

## 👨‍💻 Author

**Krishna258020**
- Email: krishnarajgopal97@gmail.com
- GitHub: [@Krishna258020](https://github.com/Krishna258020)

## 🤝 Contributing

This is a private repository. For team members:

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request
5. Wait for code review

## 📞 Support

For issues or questions, please contact the repository owner or create an issue on GitHub.
