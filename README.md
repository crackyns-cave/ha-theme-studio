# HA Theme Studio

**Professional Home Assistant Theme Builder & Framework**

A containerized web application for creating, managing, previewing, and building production-quality Home Assistant themes.

[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev/)

---

## 🎨 Features

### Mix-and-Match Architecture

**Visual Languages** × **Color Palettes** × **Modes** = Unlimited Themes

- ✅ 4 Visual Languages (Material 3, Neumorphic, Frosted Glass, Liquid Glass)
- ✅ 8 Color Palettes (Material Purple, iOS Blue, Material Blue, Indigo, Red, Green, Orange, Teal)
- ✅ Light & Dark Modes
- ✅ **32+ Possible Combinations**

### Visual Languages

| Language | Description | Features |
|----------|-------------|----------|
| **Material 3** | Google Material Design 3 | Elevation levels 0-5, tonal palettes, surface containers |
| **Neumorphic Material** | Soft raised surfaces | Dual shadows (convex/concave), subtle depth |
| **Frosted Glass** | Translucent blur effects | Backdrop blur, color saturation |
| **Liquid Glass** | Adaptive translucency | Layered blur, gradient shimmer, luminous highlights |

### Color Palettes

🟣 **material-purple** - Material Design 3 Purple (#6750A4)  
🔵 **ios-blue** - Apple iOS Blue (#007AFF)  
🔵 **material-blue** - Material Design Blue (#2196F3)  
🔵 **indigo-blue** - Indigo (#464feb)  
🔴 **red** - Material Red (#F44336)  
🟢 **green** - Material Green (#4CAF50)  
🟠 **orange** - Material Orange (#FF9800)  
🔷 **teal** - Material Teal (#009688)

---

## 🚀 Quick Start

### Using Docker Compose (Recommended)

```bash
# Clone or download the project
cd ha-theme-studio

# Start the application
docker compose up -d

# Access the web UI
open http://localhost:3000
```

The application will:
1. Copy the default framework to `./framework/` (if empty)
2. Start the web UI on port 3000
3. Start the API on port 3001
4. Generate themes in `./output/`

### Development Mode

```bash
# Install dependencies
npm run install:all

# Start both backend and frontend in dev mode
npm run dev

# Or start separately:
npm run dev:backend   # API on :3001
npm run dev:frontend  # UI on :3000
```

---

## 📁 Project Structure

```
ha-theme-studio/
├── backend/              # Express API (TypeScript)
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   └── index.ts      # Entry point
│   └── package.json
│
├── frontend/             # React UI (TypeScript + Vite)
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types/        # TypeScript types
│   │   ├── utils/        # Utilities
│   │   └── App.tsx       # Main app
│   └── package.json
│
├── default-framework/    # Default theme framework (baked into Docker image)
│   ├── core/             # 8 shared components (68KB)
│   ├── visual-languages/ # 4 visual systems (92KB)
│   └── color-palettes/   # 8+ color schemes (256KB+)
│
├── framework/            # User's framework (bind mount from /framework)
│   └── (same structure as default-framework)
│
├── output/               # Generated themes (bind mount from /output)
│   └── *.yaml
│
├── build.js              # Single theme builder
├── build-all.js          # Batch theme builder
├── Dockerfile
├── docker-compose.yaml
└── README.md
```

---

## 🏗️ Framework Architecture

### Core Components (Shared by All Themes)

```
core/
├── 01-design-tokens.yaml         # Base design system
├── 03-material-web.yaml          # Material Web Components
├── 04-webawesome.yaml            # WebAwesome Components
├── 05-homeassistant-semantic.yaml # HA semantic colors
├── 06-mushroom.yaml              # Mushroom Cards
├── 07-bubble-card.yaml           # Bubble Cards
├── 08-energy-colors.yaml         # Energy Dashboard
└── 09-room-colors.yaml           # Room colors
```

### Visual Languages (Mix-and-Match)

```
visual-languages/
├── material3/
│   ├── 00-header.yaml
│   ├── 02-visual-system.yaml
│   └── 10-card-mod.yaml
├── neumorphic-material/
├── frosted-glass/
└── liquid-glass/
```

### Color Palettes (Mix-and-Match)

```
color-palettes/
├── material-purple/
│   ├── 11-light-mode.yaml  (400+ variables)
│   └── 12-dark-mode.yaml   (400+ variables)
├── ios-blue/
├── material-blue/
├── indigo-blue/
├── red/
├── green/
├── orange/
└── teal/
```

---

## 🔧 Building Themes

### Web UI

1. Open http://localhost:3000
2. Select Visual Language
3. Select Color Palette
4. Choose Light/Dark mode
5. Adjust shape & elevation
6. Click "Build Theme"

### Command Line (Inside Container)

```bash
# Build a single theme
docker exec ha-theme-studio node /app/build.js frosted-glass material-purple

# Build all combinations (32 themes)
docker exec ha-theme-studio node /app/build-all.js
```

### API

```bash
# Build current theme
curl -X POST http://localhost:3001/api/build/current \
  -H "Content-Type: application/json" \
  -d '{"visual":"material3","palette":"material-purple"}'

# Build all themes
curl -X POST http://localhost:3001/api/build/all

# Export as ZIP
curl -X POST http://localhost:3001/api/build/export \
  -H "Content-Type: application/json" \
  -d '{"themes":["material3-material-purple","frosted-glass-ios-blue"]}' \
  --output themes.zip
```

---

## 🏠 Home Assistant Integration

### Direct Integration (Recommended)

Mount your Home Assistant themes folder as the output directory:

```yaml
# docker-compose.yaml
services:
  homeassistant:
    image: ghcr.io/home-assistant/home-assistant:stable
    volumes:
      - ./ha/config:/config

  theme-studio:
    volumes:
      - ./framework:/framework
      - ./ha/config/themes:/output  # <- Direct integration
```

Now themes built in Theme Studio automatically appear in Home Assistant!

### Manual Copy

```bash
# Copy generated themes to Home Assistant
cp output/*.yaml /path/to/homeassistant/config/themes/

# Reload themes in Home Assistant
# Developer Tools → YAML → Themes
```

---

## 🎨 Creating Custom Palettes

### Using the Web UI

1. Navigate to Palettes section
2. Click "New Palette"
3. Define colors (primary, secondary, success, warning, error)
4. System generates complete light & dark modes (400+ variables)
5. Build themes with your new palette

### Manual Creation

Create a new directory in `framework/color-palettes/`:

```bash
mkdir framework/color-palettes/my-palette
```

Create `11-light-mode.yaml` and `12-dark-mode.yaml`:

```yaml
# 11-light-mode.yaml
light:
  primary-color: "#YOUR_COLOR"
  accent-color: "#YOUR_COLOR"
  # ... (400+ variables)
```

Use existing palettes as templates.

---

## 🧩 Creating Custom Visual Languages

1. Create directory in `framework/visual-languages/`:

```bash
mkdir framework/visual-languages/my-visual
```

2. Create required files:

```
my-visual/
├── 00-header.yaml        # Theme metadata
├── 02-visual-system.yaml # Shadows, blur, borders
└── 10-card-mod.yaml      # Card styling
```

3. Define your visual system using YAML anchors:

```yaml
# 02-visual-system.yaml
shadows: &shadows
  card: "0px 4px 12px rgba(0,0,0,0.2)"
  elevated: "0px 8px 24px rgba(0,0,0,0.3)"
```

4. Build themes with your visual language:

```bash
node build.js my-visual material-purple
```

---

## 🔌 API Reference

### Endpoints

#### GET `/api/health`
Health check

#### GET `/api/visuals`
Get all available visual languages

#### GET `/api/palettes`
Get all available color palettes

#### POST `/api/build/current`
Build a single theme
```json
{
  "visual": "material3",
  "palette": "material-purple"
}
```

#### POST `/api/build/family`
Build all visuals with one palette
```json
{
  "palette": "material-purple"
}
```

#### POST `/api/build/all`
Build all theme combinations (32 themes)

#### POST `/api/build/export`
Export themes as ZIP
```json
{
  "themes": ["material3-material-purple", "frosted-glass-ios-blue"]
}
```

---

## 📦 Theme Compatibility

Generated themes support:

- ✅ Home Assistant 2024+
- ✅ Sections View
- ✅ Sidebar View
- ✅ Tile Cards
- ✅ Mushroom Cards
- ✅ Bubble Cards
- ✅ card-mod
- ✅ Material Web Components
- ✅ WebAwesome Components
- ✅ Energy Dashboard
- ✅ Area/Room Colors

---

## 🧪 Testing

### Verify Build System

```bash
# Build a test theme
docker exec ha-theme-studio node /app/build.js material3 material-purple

# Check output
docker exec ha-theme-studio ls -lh /output/material3-material-purple.yaml
```

### Verify API

```bash
# Health check
curl http://localhost:3001/api/health

# Get visuals
curl http://localhost:3001/api/visuals

# Get palettes
curl http://localhost:3001/api/palettes
```

---

## 🔐 Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | production | Environment mode |
| `PORT` | 3001 | Backend API port |

---

## 📊 Statistics

- **Visual Languages**: 4
- **Color Palettes**: 8
- **Possible Themes**: 32 (4 × 8)
- **Framework Size**: ~400KB
- **Generated Theme Size**: ~90-100KB each
- **YAML Variables**: 400+ per theme
- **Core Components**: 8 shared files

---

## 🛠️ Development

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Git

### Setup

```bash
# Clone repository
git clone <repo-url>
cd ha-theme-studio

# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

### Building

```bash
# Build backend
cd backend && npm run build

# Build frontend
cd frontend && npm run build

# Build Docker image
docker build -t ha-theme-studio .
```

---

## 🚢 Deployment

### Production Docker

```bash
docker compose up -d
```

### Custom Configuration

```yaml
# docker-compose.yaml
services:
  theme-studio:
    build: .
    ports:
      - "3000:3000"
      - "3001:3001"
    volumes:
      - ./my-framework:/framework
      - ./my-themes:/output
    environment:
      - NODE_ENV=production
```

---

## 📝 License

MIT License - Feel free to use and modify for your Home Assistant setup!

---

## 🙏 Acknowledgments

- Home Assistant community
- Material Design 3
- WebAwesome Components
- Mushroom Cards
- Bubble Cards

---

## 📮 Support

For issues, questions, or contributions:
- GitHub Issues
- Home Assistant Community Forums

---

**Happy Theme Building! 🎨**
