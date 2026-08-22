# HA Theme Studio Architecture

## Overview

HA Theme Studio is a containerized web application that provides a UI for managing and building Home Assistant themes using a mix-and-match framework architecture.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Docker Container                        │
│                                                              │
│  ┌──────────────┐           ┌──────────────┐               │
│  │   Frontend   │           │   Backend    │               │
│  │   (React)    │  ────────>│  (Express)   │               │
│  │   Port 3000  │           │   Port 3001  │               │
│  └──────────────┘           └──────────────┘               │
│         │                           │                        │
│         │                           ↓                        │
│         │                   ┌──────────────┐                │
│         │                   │Build Scripts │                │
│         │                   │  (Node.js)   │                │
│         │                   └──────────────┘                │
│         │                           │                        │
│         └───────────────────────────┘                        │
│                                     │                        │
│  ┌──────────────────────────────────┼──────────────────┐   │
│  │                                  ↓                   │   │
│  │  /framework (bind mount)    /output (bind mount)    │   │
│  │  ├── core/                  ├── material3-*.yaml    │   │
│  │  ├── visual-languages/      ├── frosted-*.yaml      │   │
│  │  └── color-palettes/        └── *.yaml              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### 1. Frontend (React + TypeScript + Vite)

**Path**: `frontend/`

**Tech Stack**:
- React 18.2
- TypeScript 5.3
- Material UI 5.15
- Vite 5.0
- Axios for API calls

**Components**:

```
frontend/src/
├── components/
│   ├── Header.tsx       # Build actions, export menu
│   ├── Sidebar.tsx      # Configuration panel
│   ├── Preview.tsx      # Live theme preview
│   └── Inspector.tsx    # Theme variables viewer
├── types/
│   └── index.ts         # TypeScript interfaces
├── utils/
│   └── api.ts           # Axios client
└── App.tsx              # Main application
```

**Responsibilities**:
- User interface for theme configuration
- Live preview rendering
- API communication
- State management (React hooks)

---

### 2. Backend (Express + TypeScript)

**Path**: `backend/`

**Tech Stack**:
- Node.js 20
- Express 4.18
- TypeScript 5.3
- js-yaml for YAML parsing
- archiver for ZIP creation

**API Routes**:

```
backend/src/routes/
├── theme.routes.ts      # GET/POST /api/themes
├── palette.routes.ts    # GET/POST /api/palettes
├── visual.routes.ts     # GET /api/visuals
└── build.routes.ts      # POST /api/build/*
```

**Services**:

```
backend/src/services/
├── theme.service.ts     # Theme config management
├── palette.service.ts   # Palette discovery & CRUD
├── visual.service.ts    # Visual language metadata
└── build.service.ts     # Theme compilation orchestration
```

**Responsibilities**:
- REST API endpoints
- Framework file discovery
- Theme configuration persistence
- Build process orchestration
- ZIP export generation

---

### 3. Build System (Node.js)

**Files**: `build.js`, `build-all.js`

**How It Works**:

```javascript
// build.js - Single theme builder
async function buildTheme(visualLanguage, colorPalette) {
  const components = [
    'core/01-design-tokens.yaml',
    `visual-languages/${visualLanguage}/00-header.yaml`,
    `visual-languages/${visualLanguage}/02-visual-system.yaml`,
    'core/03-material-web.yaml',
    // ... 13 total components
    `color-palettes/${colorPalette}/11-light-mode.yaml`,
    `color-palettes/${colorPalette}/12-dark-mode.yaml`,
  ]
  
  // Concatenate in order
  const merged = components.map(readYAML).join('\n\n')
  
  // Write to output
  writeFile(`/output/${visualLanguage}-${colorPalette}.yaml`, merged)
}
```

**Build Order** (Critical):
1. Core design tokens
2. Visual language header
3. Visual system (shadows, blur, etc.)
4. Material Web components
5. WebAwesome components
6. Home Assistant semantic
7. Mushroom cards
8. Bubble cards
9. Energy colors
10. Room colors
11. Card-mod styling
12. Light mode palette
13. Dark mode palette

**Why Order Matters**:
- YAML anchors must be defined before use
- Theme metadata must come first
- Color palettes override earlier defaults

---

### 4. Framework Structure

**Path**: `framework/` (bind mounted)

```
framework/
├── core/                    # Shared by ALL themes
│   ├── 01-design-tokens.yaml      (8KB)
│   ├── 03-material-web.yaml       (28KB)
│   ├── 04-webawesome.yaml         (12KB)
│   ├── 05-homeassistant-semantic.yaml (4KB)
│   ├── 06-mushroom.yaml           (8KB)
│   ├── 07-bubble-card.yaml        (4KB)
│   ├── 08-energy-colors.yaml      (2KB)
│   └── 09-room-colors.yaml        (2KB)
│
├── visual-languages/        # Mix-and-match visual systems
│   ├── material3/
│   │   ├── 00-header.yaml         (metadata)
│   │   ├── 02-visual-system.yaml  (shadows, elevation)
│   │   └── 10-card-mod.yaml       (CSS injection)
│   ├── neumorphic-material/
│   ├── frosted-glass/
│   └── liquid-glass/
│
└── color-palettes/          # Mix-and-match color schemes
    ├── material-purple/
    │   ├── 11-light-mode.yaml     (400+ variables)
    │   └── 12-dark-mode.yaml      (400+ variables)
    ├── ios-blue/
    ├── material-blue/
    ├── indigo-blue/
    ├── red/
    ├── green/
    ├── orange/
    └── teal/
```

---

### 5. Docker Container

**Multi-stage Build**:

```dockerfile
# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
COPY frontend/ /app/frontend
RUN npm ci && npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder
COPY backend/ /app/backend
RUN npm ci && npm run build

# Stage 3: Production
FROM node:20-alpine
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY default-framework /app/default-framework
COPY build*.js /app/
ENTRYPOINT ["/app/docker-entrypoint.sh"]
```

**Startup Flow** (`docker-entrypoint.sh`):

```bash
1. Check if /framework is empty
2. If empty → copy /app/default-framework to /framework
3. If not empty → skip (preserve user modifications)
4. Start Express server
5. Serve React frontend (static files)
```

---

## Data Flow

### Build Process Flow

```
1. User selects theme config in UI
   ↓
2. Frontend sends POST /api/build/current
   {
     visual: "material3",
     palette: "material-purple"
   }
   ↓
3. Backend receives request
   ↓
4. BuildService.buildTheme() calls build.js
   ↓
5. build.js:
   a. Reads 13 YAML files from /framework
   b. Concatenates in order
   c. Writes to /output/material3-material-purple.yaml
   ↓
6. Backend returns build result
   {
     success: true,
     themeName: "material3-material-purple",
     outputPath: "/output/material3-material-purple.yaml",
     size: 98304
   }
   ↓
7. Frontend shows success message
```

### Theme Application Flow (Home Assistant)

```
1. User builds theme in Theme Studio
   ↓
2. Theme written to /output/ (bind mounted to HA's /config/themes/)
   ↓
3. User reloads themes in Home Assistant
   Developer Tools → YAML → Themes
   ↓
4. Theme appears in Frontend → Settings → Themes
   ↓
5. User selects theme
   ↓
6. Home Assistant applies 400+ CSS variables
```

---

## API Design

### RESTful Endpoints

```
GET  /api/health                    # Health check
GET  /api/visuals                   # List visual languages
GET  /api/visuals/:name             # Get visual details
GET  /api/palettes                  # List palettes
GET  /api/palettes/:name            # Get palette details
POST /api/palettes                  # Create new palette
GET  /api/themes/current            # Get current config
POST /api/themes/current            # Save current config
POST /api/themes/preview            # Generate preview
POST /api/build/current             # Build single theme
POST /api/build/family              # Build all visuals, one palette
POST /api/build/all                 # Build all combinations
POST /api/build/export              # Export as ZIP
```

### Request/Response Examples

**Build Current Theme**:
```json
POST /api/build/current
{
  "visual": "frosted-glass",
  "palette": "ios-blue"
}

Response:
{
  "success": true,
  "themeName": "frosted-glass-ios-blue",
  "outputPath": "/output/frosted-glass-ios-blue.yaml",
  "size": 97856,
  "componentsCount": 13
}
```

**Export Themes**:
```json
POST /api/build/export
{
  "themes": [
    "material3-material-purple",
    "frosted-glass-ios-blue"
  ]
}

Response: themes.zip (application/zip)
```

---

## State Management

### Frontend State

```typescript
interface ThemeConfig {
  visual: string           // Selected visual language
  palette: string          // Selected color palette
  mode: 'light' | 'dark'   // Theme mode
  shape: {
    radius: number         // Border radius (8-48px)
  }
  elevation: 'minimal' | 'medium' | 'high'
}
```

**State Storage**:
- In-memory (React useState)
- Persisted via API (POST /api/themes/current)
- No local storage (server is source of truth)

### Backend State

- **No database** - filesystem is the database
- Configuration stored in `/framework/current-config.json`
- Framework files in `/framework/`
- Generated themes in `/output/`

---

## File System Conventions

### Naming Conventions

**Visual Languages**:
- Slug format: `kebab-case`
- Examples: `material3`, `frosted-glass`, `neumorphic-material`

**Color Palettes**:
- Slug format: `kebab-case`
- Examples: `material-purple`, `ios-blue`, `indigo-blue`

**Generated Themes**:
- Format: `{visual}-{palette}.yaml`
- Examples: `material3-material-purple.yaml`, `frosted-glass-ios-blue.yaml`

### File Numbering System

Files are numbered to enforce build order:

```
00-header.yaml         # Theme metadata (name, mode)
01-design-tokens.yaml  # Base design system
02-visual-system.yaml  # Visual language specifics
03-material-web.yaml   # Material components
...
10-card-mod.yaml       # CSS overrides
11-light-mode.yaml     # Light mode colors
12-dark-mode.yaml      # Dark mode colors
```

---

## Security Considerations

### Input Validation

- Visual language names validated against filesystem
- Palette names validated against filesystem
- No arbitrary file paths accepted
- User input sanitized before shell commands

### File System Access

- Read-only access to `/framework/`
- Write-only access to `/output/`
- No access to parent directories
- No symbolic link traversal

### API Security

- CORS enabled for localhost development
- Production should use reverse proxy
- Rate limiting recommended
- No authentication (internal tool)

---

## Performance Optimization

### Build Performance

- Single theme build: ~50-100ms
- All themes build: ~2-3 seconds (32 themes)
- YAML parsing cached in memory
- Parallel builds possible (future enhancement)

### Frontend Performance

- React components memoized
- API calls debounced
- Preview updates throttled
- Material UI components lazy loaded

### Docker Optimization

- Multi-stage build reduces image size
- Alpine Linux base (smallest footprint)
- node_modules excluded from final image (copied separately)
- Build cache layers optimized

---

## Extensibility

### Adding New Visual Languages

1. Create directory: `framework/visual-languages/my-visual/`
2. Add required files:
   - `00-header.yaml`
   - `02-visual-system.yaml`
   - `10-card-mod.yaml`
3. Define visual system using YAML anchors
4. Auto-detected by backend

### Adding New Color Palettes

1. Create directory: `framework/color-palettes/my-palette/`
2. Add mode files:
   - `11-light-mode.yaml` (400+ variables)
   - `12-dark-mode.yaml` (400+ variables)
3. Follow existing palette structure
4. Auto-detected by backend

### Adding New Core Components

1. Add file to `framework/core/`
2. Use numeric prefix for ordering
3. Update `build.js` components array
4. Rebuild themes

---

## Testing Strategy

### Unit Tests (TODO)

- Service layer functions
- YAML parsing logic
- File system utilities
- Build script validation

### Integration Tests (TODO)

- API endpoint testing
- End-to-end build process
- Docker container startup
- Framework initialization

### Manual Testing

- Build single theme
- Build all themes
- Export ZIP
- Verify in Home Assistant
- Check file sizes

---

## Deployment Scenarios

### Standalone

```bash
docker compose up -d
# Access: localhost:3000
```

### With Home Assistant

```yaml
services:
  homeassistant:
    volumes:
      - ./output:/config/themes
  
  theme-studio:
    volumes:
      - ./framework:/framework
      - ./output:/output
```

### Cloud Deployment

- Not recommended (filesystem-dependent)
- Consider volume persistence
- Backup `/framework/` regularly

---

## Monitoring & Debugging

### Logs

```bash
# View container logs
docker logs ha-theme-studio

# Follow logs
docker logs -f ha-theme-studio

# Backend logs
docker exec ha-theme-studio cat /app/backend/logs/app.log
```

### Health Checks

```bash
# Container health
docker inspect ha-theme-studio | grep Health

# API health
curl http://localhost:3001/api/health
```

### Debug Mode

```bash
# Start with debug logging
docker run -e DEBUG=* ha-theme-studio
```

---

## Future Enhancements

### Planned Features

- [ ] Real-time theme preview (iframe with HA cards)
- [ ] Theme validation & linting
- [ ] Version control for themes
- [ ] Theme marketplace/sharing
- [ ] Automated testing
- [ ] CI/CD pipeline
- [ ] Multi-user support
- [ ] Theme analytics

### Performance Improvements

- [ ] Parallel theme builds
- [ ] Incremental builds (cache unchanged components)
- [ ] Streaming YAML parsing
- [ ] Worker threads for build process

### UI Enhancements

- [ ] Theme comparison view
- [ ] Color picker integration
- [ ] Advanced preview (real HA cards)
- [ ] Theme history/undo
- [ ] Keyboard shortcuts

---

## Troubleshooting

### Common Issues

**Issue**: Themes not appearing in Home Assistant

**Solution**:
1. Verify bind mount: `docker-compose.yaml` has correct path
2. Check permissions: HA can read `/config/themes/`
3. Reload themes: Developer Tools → YAML → Themes

**Issue**: Build fails with "File not found"

**Solution**:
1. Verify framework structure: `docker exec ha-theme-studio ls /framework/`
2. Check file permissions
3. Reinitialize: `docker exec ha-theme-studio rm -rf /framework/*` then restart

**Issue**: Frontend can't connect to backend

**Solution**:
1. Check ports: `docker ps` shows 3000 and 3001
2. Check CORS: Backend allows localhost:3000
3. Check proxy: Vite proxy configured correctly

---

## Contributing

See [README.md](README.md) for contribution guidelines.

---

## License

MIT License - See [LICENSE](LICENSE) file.
