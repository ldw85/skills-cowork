# Skills Cowork

AI-powered coding assistant with a three-column layout.

## Features

- **Three-column layout**: Sidebar (220px), Editor (flexible), Chat (400px)
- **File Browser**: Tree view for file navigation
- **Skills Management**: Browse and manage AI skills
- **Skill Packs**: Manage installed skill packs
- **Monaco Editor**: Full-featured code editor with syntax highlighting
- **AI Chat**: Interactive chat with AI assistant
- **Multi-language Support**: Chinese and English
- **Theme Switching**: Light and dark themes
- **Settings**: API configuration, workspace, font settings

## Tech Stack

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Ant Design 5** - UI components
- **Monaco Editor** - Code editor
- **i18next** - Internationalization
- **React Context** - State management

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── settings/          # Settings page
├── components/            # React components
│   ├── common/           # Shared components
│   ├── editor/           # Editor components
│   ├── chat/             # Chat components
│   ├── layout/           # Layout components
│   └── sidebar/          # Sidebar components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
└── types/                # TypeScript types
```

## Features Overview

### Sidebar Tabs

1. **Files**: Browse project files in a tree structure
2. **Skills**: Search and manage AI skills
3. **Skill Packs**: View installed skill packs

### Editor Panel

- Multi-tab editor with file tabs
- Syntax highlighting for multiple languages
- Light/dark theme support
- Line numbers and minimap

### Chat Panel

- Real-time AI chat interface
- Code block highlighting
- Message history
- Keyboard shortcuts (Ctrl+Enter to send)

### Settings

- API provider configuration
- API key and endpoint
- Workspace path
- Font settings
- Theme and language preferences

## Internationalization

The app supports Chinese (zh-CN) and English (en-US). Language files are located in:

- `public/locales/zh-CN/common.json`
- `public/locales/en-US/common.json`

## Theme

The app supports light and dark themes. The theme can be changed from:
- Top bar dropdown
- Settings page

## License

MIT
