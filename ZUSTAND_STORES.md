# Zustand Global State Management - Skills Cowork

## Overview

This document describes the Zustand-based global state management system implemented for Skills Cowork. The system provides a clean, type-safe, and performant way to manage application state across all components.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        React Components                          │
│                     (UI/Presentation Layer)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │ useStore hooks
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Zustand Stores                             │
│  ┌──────────┬──────────┬───────────┬──────────┬────────┬─────┐ │
│  │   App    │  Editor  │   File    │   Chat   │ Skills │ Cfg │ │
│  │  Store   │  Store   │   System  │  Store   │ Store  │Store│ │
│  └────┬─────┴────┬─────┴─────┬─────┴────┬─────┴───┬────┴──┬──┘ │
└───────┼──────────┼───────────┼──────────┼─────────┼───────┼────┘
        │          │           │          │         │       │
        │ Actions & State Updates                            │
        ▼          ▼           ▼          ▼         ▼       ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Services Layer                             │
│  ┌──────────────┬────────────────┬────────────┬──────────────┐  │
│  │ fileService  │  chatService   │ skillsSvc  │ configSvc    │  │
│  └──────┬───────┴────────┬───────┴──────┬─────┴──────┬───────┘  │
└─────────┼────────────────┼──────────────┼────────────┼──────────┘
          │ Tauri/Mock IPC │              │            │
          ▼                ▼              ▼            ▼
        Backend (Tauri) / Mock Data (Development)
```

## Directory Structure

```
src/
├── types/              # TypeScript type definitions
│   ├── index.ts        # Main exports + legacy types
│   ├── chat.ts         # Chat-related types
│   ├── editor.ts       # Editor-related types
│   ├── file.ts         # File system types
│   ├── skills.ts       # Skills-related types
│   └── config.ts       # Configuration types
├── services/           # Services for backend communication
│   ├── index.ts        # Service exports
│   ├── fileService.ts      # File operations
│   ├── chatService.ts      # Chat operations
│   ├── skillsService.ts    # Skills operations
│   └── configService.ts    # Configuration operations
├── stores/             # Zustand stores
│   ├── index.ts        # Store exports
│   ├── appStore.ts         # Application state
│   ├── editorStore.ts      # Editor state
│   ├── fileSystemStore.ts  # File system state
│   ├── chatStore.ts        # Chat state
│   ├── skillsStore.ts      # Skills state
│   └── configStore.ts      # Configuration state
└── utils/              # Utilities
    ├── index.ts        # Utility exports
    └── logger.ts       # Logging utility
```

## Core Stores

### 1. App Store (`appStore.ts`)

Manages global application state including language, theme, and workspace management.

**Features:**
- Language switching (zh-CN / en-US)
- Theme switching (light / dark)
- Window size tracking
- Workspace management
- Persisted to localStorage

**Usage:**
```typescript
import { useAppStore } from '@/stores';

function Component() {
  const { currentTheme, setTheme } = useAppStore();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {currentTheme}
    </button>
  );
}
```

### 2. Editor Store (`editorStore.ts`)

Manages open files, active file, and editor operations.

**Features:**
- Open/close files
- Track file changes (dirty state)
- Save files individually or all at once
- Auto-detect file language
- Active file management

**Usage:**
```typescript
import { useEditorStore } from '@/stores';

function Editor() {
  const { openFile, getActiveFile } = useEditorStore();
  const activeFile = getActiveFile();
  
  return (
    <button onClick={() => openFile('/path/to/file.ts')}>
      Open File
    </button>
  );
}
```

### 3. File System Store (`fileSystemStore.ts`)

Manages file tree navigation and file system operations.

**Features:**
- Load and display file tree
- Create/delete files and folders
- Rename files
- Track expanded/selected nodes
- Auto-refresh after operations

### 4. Chat Store (`chatStore.ts`)

Manages chat sessions and message handling with streaming support.

**Features:**
- Multiple chat sessions
- Send/receive messages
- Streaming message support
- Session persistence
- Message attachments

### 5. Skills Store (`skillsStore.ts`)

Manages skills and skill packs.

**Features:**
- Load skills and skill packs
- Search and filter skills
- Category-based filtering
- Create/update/delete skills
- Install/uninstall skill packs

### 6. Config Store (`configStore.ts`)

Manages API configuration and credentials.

**Features:**
- Load/save API configuration
- Support multiple providers (ChatGLM, DeepSeek, Custom)
- API key management
- Configuration validation
- Persisted to localStorage

## Service Layer

All services support both Tauri IPC (for production) and mock data (for development).

### Tauri Detection

```typescript
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
```

### Mock vs Production

- **Development**: Services use localStorage and mock data
- **Production**: Services use Tauri IPC to communicate with Rust backend

### File Service Methods
- `readFile(path)` - Read file content
- `writeFile(path, content)` - Write file
- `deleteFile(path)` - Delete file
- `listDirectory(path)` - List directory contents
- `createDirectory(path)` - Create directory
- `selectDirectory()` - Open directory picker
- `renameFile(oldPath, newPath)` - Rename file
- `fileExists(path)` - Check file existence

### Chat Service Methods
- `sendMessage(sessionId, content, attachments)` - Send chat message
- `saveSession(session)` - Save session
- `loadSession(sessionId)` - Load session
- `listSessions()` - List all sessions
- `deleteSession(sessionId)` - Delete session
- `createSession(name)` - Create new session
- `listenToStreamingMessage(callback)` - Listen to streaming messages

### Skills Service Methods
- `loadSkills()` - Load all skills
- `loadSkillPacks()` - Load all skill packs
- `deleteSkill(skillId)` - Delete skill
- `uninstallSkillPack(packId)` - Uninstall skill pack
- `createSkill(skill)` - Create new skill
- `updateSkill(skillId, skill)` - Update skill
- `installSkillPack(packPath)` - Install skill pack

### Config Service Methods
- `loadConfig()` - Load configuration
- `saveConfig(config)` - Save configuration
- `getConfig()` - Get current config
- `updateApiKey(apiKey)` - Update API key
- `validateConfig(config)` - Validate configuration

## DevTools Integration

All stores are configured with Zustand DevTools for debugging:

1. Install Redux DevTools extension
2. Open DevTools
3. Navigate to Redux tab
4. View store states and actions in real-time

## State Persistence

Stores with persistence:
- **App Store**: Language, theme, workspaces
- **Chat Store**: Sessions and messages
- **Config Store**: API configuration

## Type Safety

- Zero `any` types used
- Complete TypeScript coverage
- Strict type checking enabled
- All interfaces exported from `src/types/`

## Error Handling

All async operations include:
- Try-catch blocks
- Logging via logger utility
- Error propagation to UI
- Fallback handling

## Logging

The logger utility (`src/utils/logger.ts`) provides:
- Timestamped logs
- Log levels (info, warn, error, debug)
- In-memory log storage (last 1000 entries)
- Console output with formatting

## Integration with Existing Code

The stores are designed to integrate seamlessly with the existing Next.js application:

1. **No Breaking Changes**: Legacy types are preserved for backward compatibility
2. **Drop-in Replacement**: Services work with both mock data and Tauri
3. **Gradual Migration**: Components can be migrated one at a time
4. **Type Compatible**: New types extend/enhance existing ones

## Usage Examples

### Initializing the App

```typescript
useEffect(() => {
  const initializeApp = async () => {
    try {
      await Promise.all([
        useConfigStore.getState().loadConfig(),
        useChatStore.getState().loadSessions(),
        useSkillsStore.getState().loadSkills(),
      ]);
      useAppStore.getState().setInitialized(true);
    } catch (error) {
      console.error('Failed to initialize:', error);
    }
  };
  
  initializeApp();
}, []);
```

### Opening a File

```typescript
const { openFile } = useEditorStore();

try {
  await openFile('/workspace/app.ts');
} catch (error) {
  console.error('Failed to open file:', error);
}
```

### Sending a Chat Message

```typescript
const { sendMessage, currentSessionId } = useChatStore();

if (currentSessionId) {
  await sendMessage(currentSessionId, 'Hello AI!');
}
```

### Searching Skills

```typescript
const { searchSkills, getFilteredSkills } = useSkillsStore();

searchSkills('python');
const results = getFilteredSkills();
```

## Benefits

1. **Type Safety**: Full TypeScript support with no `any` types
2. **Performance**: Zustand is lightweight and fast
3. **DevTools**: Full debugging support
4. **Persistence**: Selective state persistence
5. **Modularity**: Clear separation of concerns
6. **Testability**: Easy to test stores in isolation
7. **Flexibility**: Works with or without Tauri

## Next Steps

1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Use stores in components
4. Migrate existing state management gradually
5. Add Tauri backend commands as needed

## Dependencies Added

```json
{
  "zustand": "^4.5.0",
  "@tauri-apps/api": "^1.5.3"
}
```

## Acceptance Criteria Met

- ✅ All 6 core stores implemented
- ✅ Complete CRUD operations
- ✅ Services layer with Tauri/mock support
- ✅ TypeScript types with zero `any`
- ✅ Clear state flow
- ✅ Comprehensive error handling
- ✅ DevTools integration

## Conclusion

This Zustand-based state management system provides a solid foundation for Skills Cowork. It's production-ready, well-documented, and designed to integrate smoothly with the existing Next.js application.
