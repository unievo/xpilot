# AGENTS.md - Astro Project Briefing

Astro is a dedicated AI software agent for MultiversX. It is based on Astro, a fork of Cline. It includes Astro's general functionality, with additional customizations and features.

## Core Commands

### Build & Development
- `npm run build` - Production build using ESBuild with dual targets
- `npm run build:standalone` - Standalone server build for non-VSCode environments
- `npm run build:watch` - Watch mode for development with auto-rebuild
- `npm run build:proto` - Generate TypeScript from Protocol Buffer definitions
- `npm run dev:extension` - Development mode with watch and hot reload
- `npm run dev:webview` - Start Vite dev server with HMR for React frontend

### Testing & Quality
- `npm test` - Run full test suite (unit + integration + e2e)
- `npm run test:unit` - Jest unit tests with coverage
- `npm run test:integration` - Service integration tests
- `npm run test:e2e` - Playwright end-to-end tests in VSCode
- `npm run lint` - Biome linting (replaces ESLint)
- `npm run format` - Biome code formatting (replaces Prettier)
- `npm run typecheck` - TypeScript strict type checking

### Package & Deploy
- `npm run package` - Create `.vsix` extension package
- `npm run package:standalone` - Package standalone server distribution
- `npm run vscode:prepublish` - Pre-publish build hook

## Development Patterns & Constraints

### Customization from Cline
Astro builds upon the architecture and patterns established in Cline, with modifications to support its specialized agent functionalities. Key adaptations include agent-specific branding and configuration settings:
- **Custom configuration file**: `src/shared/Configuration.ts` 
- **Custom package configuration**: `package.json`

### Code Architecture
- **gRPC-First Communication**: All UI-backend communication uses Protocol Buffers over gRPC streaming
- **Multi-Instance Pattern**: Supports simultaneous sidebar and tab webview instances with shared state
- **Host Abstraction Layer**: Platform-agnostic core with VSCode-specific host implementations
- **Event-Driven State**: Real-time state synchronization via gRPC streaming subscriptions
- **Command-Query Separation**: UI dispatches commands, subscribes to state changes
- **Service Registry Pattern**: Centralized dependency injection with lifecycle management

### Code Style & Standards
- **Biome Toolchain**: Single tool for linting, formatting, and import sorting
- **TypeScript Strict**: All strict mode flags enabled, no implicit any
- **Path Aliases**: Extensive use of `@core`, `@services`, `@shared`, `@utils` imports
- **No console.log**: Use Logger service for all output
- **Async-First**: Promise-based APIs with proper error handling
- **No Comments Unless Required**: Self-documenting code preferred

### Testing Strategy
- **Co-located Tests**: `.test.ts` files alongside source or in `__tests__/` directories
- **gRPC Service Testing**: Mock service implementations for unit tests
- **Extension Context Testing**: Tests require VSCode extension environment simulation
- **Cross-Platform Testing**: Windows/Mac/Linux compatibility matrix
- **Performance Testing**: gRPC request/response recording and playback

## Project Layout

### Core Application (`src/core/`)
- `controller/` - **gRPC service implementations organized by domain**
  - `account/` - Authentication and user management endpoints
  - `browser/` - Chrome DevTools Protocol browser automation
  - `checkpoints/` - File diff and restore capabilities
  - `commands/` - VSCode command integrations (add, fix, explain, improve)
  - `dictation/` - Audio recording and transcription services
  - `mcp/` - Model Context Protocol server management
  - `models/` - AI provider model discovery and configuration
  - `task/` - Task lifecycle management and history
  - `state/` - Global application state management
  - `web/` - Web content fetching and Open Graph data
- `webview/` - **WebView provider abstractions with multi-instance support**
- `assistant-message/` - **AI conversation message processing and streaming**
- `workspace/` - **Workspace context and file system operations**

### Platform Hosts (`src/hosts/`)
- `vscode/` - **VSCode extension host implementation**
  - `hostbridge/` - gRPC client for host services
  - Command utils, diff providers, webview providers
- `external/` - **External host capabilities for standalone mode**
- `host-provider/` - **Host abstraction factory pattern**

### Business Services (`src/services/`)
- `auth/` - **Authentication flows (OAuth, API keys, cloud accounts)**
- `telemetry/` - **PostHog analytics with privacy controls**
- `logging/` - **Centralized logging with multiple output channels**
- `test/` - **Testing utilities and mock implementations**
- `dictation/` - **Audio recording service with cleanup**
- `error/` - **Error reporting and crash analytics**
- `feature-flags/` - **Runtime feature toggle management**
- `posthog/` - **Analytics client with batching and retry**

### External Integrations (`src/integrations/`)
- `checkpoints/` - **File diff tracking and restoration system**
- `git/` - **Git operations and AI-powered commit generation**
- `claude-code/` - **Anthropic Claude API integration**
- MCP servers, browser automation, external tools

### Protocol Communication (`proto/`)
- `cline/` - **Main service definitions**
  - `ui.proto` - UI state management and webview communication
  - `task.proto` - Task execution and lifecycle
  - `models.proto` - AI provider model management
  - `mcp.proto` - Model Context Protocol server management
  - `account.proto` - User authentication and organization management
  - `browser.proto` - Browser automation capabilities
  - `dictation.proto` - Audio recording and transcription
- `host/` - **Host bridge service definitions**
  - `workspace.proto` - File system and workspace operations
  - `diff.proto` - File diffing and merge operations
  - `env.proto` - Environment and system information
  - `window.proto` - UI notifications and dialogs
  - `testing.proto` - Test execution and debugging

### Frontend Interface (`webview-ui/`)
- **React 18** with TypeScript and Tailwind CSS
- **Vite build system** with HMR and hot reload
- **gRPC-Web client** for real-time backend communication
- **VSCode Webview Toolkit** components for native look-and-feel

## Build System & Code Generation

### ESBuild Pipeline (esbuild.mjs)
- **Dual Target Architecture**:
  - Extension bundle: `dist/extension.js` (VSCode-specific)
  - Standalone bundle: `dist-standalone/cline-core.js` (platform-agnostic)
- **Advanced Path Resolution**: Custom alias resolver plugin for `@` imports
- **Tree Shaking**: Production minification with development source maps
- **External Dependencies**: VSCode API, gRPC reflection, better-sqlite3 excluded
- **Asset Pipeline**: Automatic WASM file copying for tree-sitter language parsers
- **Environment Injection**: Build-time variable replacement for API keys

### Protocol Buffer Code Generation (scripts/build-proto.mjs)
- **Multi-Target Generation**:
  - Generic TypeScript interfaces for shared types
  - gRPC-JS service implementations for server-side
  - nice-grpc promise-based clients for frontend
  - Binary descriptor sets for runtime reflection
- **Cross-Platform Compatibility**: Windows/Mac/Linux protoc handling
- **Apple Silicon Support**: Automatic Rosetta 2 compatibility checking
- **Generated Code Organization**: Separate output directories by target type

### Development Tooling
- **Hot Module Replacement**: Vite dev server with React Fast Refresh
- **Extension Hot Reload**: File watcher triggers VSCode window reload
- **gRPC Request Recording**: Automated test fixture generation
- **Problem Matcher Integration**: ESBuild errors formatted for VSCode

## External Dependencies & APIs

### Required Environment Variables
- `CLINE_ENVIRONMENT` - Runtime environment (development/staging/production)
- `TELEMETRY_SERVICE_API_KEY` - PostHog analytics service key
- `ERROR_SERVICE_API_KEY` - Error reporting service credentials

### AI Provider Ecosystem (User-Configured)
- **Cloud APIs**: Anthropic Claude, OpenAI GPT, OpenRouter, Groq, Baseten
- **Local Models**: Ollama, LM Studio, VSCode Language Models API
- **Enterprise**: SAP AI Core, Hugging Face Inference, Vercel AI Gateway
- **Custom**: Requesty proxy, OpenAI-compatible endpoints

### External Service Integrations
- **Browser Automation**: Chrome DevTools Protocol for web scraping and interaction
- **MCP (Model Context Protocol)**: Extensible tool and resource server ecosystem
- **Git Integration**: Native git operations with AI-powered commit message generation
- **Authentication**: Firebase Auth for cloud accounts, OAuth for providers
- **Analytics**: PostHog for feature flags, usage tracking, and A/B testing
- **File Parsing**: Tree-sitter WASM parsers for syntax analysis across 15+ languages

## Security & Privacy Architecture

### Webview Security Model
- **Content Security Policy**: Strict CSP with nonce-based script execution
- **Resource Isolation**: Extension-scoped asset access only
- **External Domain Allowlist**: Limited to AI providers and analytics endpoints
- **Script Injection Prevention**: No unsafe-inline, eval restrictions

### Sensitive Data Protection
- **VSCode Secure Storage**: API keys encrypted at rest in OS keychain
- **OAuth Token Management**: Secure refresh token handling with automatic cleanup
- **Workspace Scoping**: File access limited to opened workspace boundaries
- **Telemetry Privacy**: User-controlled data collection with granular opt-out

### Multi-Instance State Management
- **Shared Authentication**: Account state synchronized across all webview instances
- **Instance Isolation**: Task state isolated per webview instance
- **Cross-Window Communication**: gRPC streaming for real-time state updates

## Development Workflow & Environment

### Prerequisites & Setup
- **Node.js 18+** with npm 8+
- **VSCode** with extension development support
- **Protocol Buffers**: Auto-installed via grpc-tools package
- **Platform-Specific**: Rosetta 2 required for macOS Apple Silicon
- **Optional**: Chrome/Chromium for browser automation features

### Development Commands
1. `npm install` - Install dependencies and prepare workspace
2. `npm run build:proto` - Generate TypeScript from Protocol Buffer definitions
3. `npm run build` - Initial build of both extension and standalone targets
4. **F5 in VSCode** - Launch Extension Development Host with debugger attached
5. `npm run dev:webview` - Start frontend development server with HMR

### Testing Workflow
- **Unit Tests**: `npm run test:unit` - Fast feedback for service logic
- **Integration Tests**: `npm run test:integration` - Full service stack testing
- **E2E Tests**: `npm run test:e2e` - VSCode extension behavior validation
- **Continuous Testing**: `npm run test:watch` - Auto-run tests on file changes

## Critical Implementation Gotchas

### gRPC Communication Architecture
- **Streaming-First**: All UI state updates use bidirectional gRPC streams
- **Service Discovery**: Generated service clients auto-discover endpoints
- **Error Handling**: gRPC status codes mapped to user-friendly error messages
- **Connection Lifecycle**: Automatic reconnection with exponential backoff

### Multi-Instance Webview Management
- **Instance Tracking**: Static registry maintains active webview references
- **State Isolation**: Each instance has independent task and conversation state
- **Focus Management**: Last active instance tracking for command routing
- **Cleanup**: Proper disposal prevents memory leaks on webview destruction

### File System & Workspace Integration
- **Path Resolution**: Custom workspace resolver handles cross-platform paths
- **Security Boundaries**: All file operations scoped to workspace directories
- **Change Detection**: File watcher integration for real-time updates
- **Permission Handling**: User prompts for file modifications outside workspace

### Binary Dependencies & Bundling
- **External Modules**: better-sqlite3, grpc packages cannot be bundled by ESBuild
- **WASM Assets**: Tree-sitter parsers copied as separate files to output directory
- **Platform Binaries**: ripgrep binary discovered from VSCode installation
- **Runtime Loading**: Dynamic imports for platform-specific functionality

### Browser Automation & Chrome Integration
- **Chrome Discovery**: Automatic detection of Chrome/Chromium installation paths
- **Debug Mode**: Programmatic Chrome launch with remote debugging enabled
- **Connection Management**: Chrome DevTools Protocol WebSocket connection handling
- **Error Recovery**: Graceful fallback when browser automation unavailable

### Performance & Memory Management
- **Lazy Loading**: Development tools and testing utilities loaded on demand
- **Stream Cleanup**: Proper disposal of gRPC streams prevents resource leaks
- **WebView Context**: `retainContextWhenHidden` prevents expensive re-initialization
- **Tree Shaking**: ESBuild eliminates unused code paths in production builds

### Testing & Development Environment
- **Extension Context**: Tests require VSCode extension API simulation
- **gRPC Mocking**: Service implementations need proper stream lifecycle mocking
- **Async Cleanup**: Streaming operations require explicit cleanup in test teardown
- **Platform Testing**: Separate test execution for Windows/Mac/Linux file system differences