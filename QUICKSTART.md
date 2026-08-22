# Quick Start Guide - HA Theme Studio

Get up and running in 5 minutes!

---

## 🚀 Installation

### Option 1: Docker (Recommended)

```bash
# 1. Download or clone the project
cd ha-theme-studio

# 2. Start the container
docker compose up -d

# 3. Access the web UI
open http://localhost:3000
```

That's it! The application will:
- Initialize the framework on first run
- Start both frontend and backend servers
- Be ready to build themes

### Option 2: Development Mode

```bash
# 1. Install dependencies
npm run install:all

# 2. Start dev servers
npm run dev

# 3. Access the UI
open http://localhost:3000
```

---

## 📖 Your First Theme

### Using the Web UI

1. **Open the application**
   ```
   http://localhost:3000
   ```

2. **Configure your theme**
   - Select a Visual Language (e.g., "Material 3")
   - Choose a Color Palette (e.g., "Material Purple")
   - Toggle Light/Dark mode
   - Adjust border radius slider
   - Choose elevation level

3. **Build the theme**
   - Click "Build Theme" in the header
   - Wait for success message
   - Find your theme in `output/` directory

4. **Add to Home Assistant**
   ```bash
   # Copy to Home Assistant
   cp output/material3-material-purple.yaml ~/homeassistant/config/themes/
   
   # OR use direct integration (see below)
   ```

5. **Apply in Home Assistant**
   - Go to Settings → Themes
   - Select your theme
   - Enjoy!

---

## 🏠 Home Assistant Integration

### Direct Integration (No Manual Copying!)

Edit `docker-compose.yaml`:

```yaml
services:
  theme-studio:
    volumes:
      - ./framework:/framework
      # Point output directly to Home Assistant themes folder
      - /path/to/homeassistant/config/themes:/output
```

Now themes are **automatically available** in Home Assistant!

After building a theme:
1. Go to Home Assistant → Developer Tools → YAML
2. Click "Themes" reload button
3. Your new theme appears instantly!

---

## 🎨 Creating Custom Themes

### Quick Palette Creation

Want your brand colors?

1. **Create palette directory**
   ```bash
   mkdir framework/color-palettes/my-brand
   ```

2. **Copy a template**
   ```bash
   cp framework/color-palettes/material-purple/* \
      framework/color-palettes/my-brand/
   ```

3. **Edit the colors**
   ```yaml
   # framework/color-palettes/my-brand/11-light-mode.yaml
   light:
     primary-color: "#YOUR_BRAND_COLOR"
     accent-color: "#YOUR_ACCENT_COLOR"
     # ... customize as needed
   ```

4. **Build with your palette**
   - Refresh the UI
   - Select "My Brand" from palette dropdown
   - Build!

---

## 🛠️ Common Tasks

### Build All Themes at Once

**Via UI**:
- Click the menu icon (⋮) in header
- Select "Build All Themes"
- Wait ~3 seconds
- 32 themes created!

**Via Command Line**:
```bash
docker exec ha-theme-studio node /app/build-all.js
```

### Export Themes as ZIP

**Via UI**:
- Click menu icon (⋮)
- Select "Export as ZIP"
- Choose themes or export all
- Download ZIP file

**Via API**:
```bash
curl -X POST http://localhost:3001/api/build/export \
  -H "Content-Type: application/json" \
  -d '{"themes":["material3-material-purple"]}' \
  --output themes.zip
```

### Check What Themes Exist

```bash
# List generated themes
ls output/

# Or via API
curl http://localhost:3001/api/health
```

---

## 🐛 Troubleshooting

### "Framework folder not found"

**Solution**: The container copies the default framework on first run. If you see this error:

```bash
# Restart the container to trigger initialization
docker compose restart
```

### "Theme doesn't appear in Home Assistant"

**Checklist**:
1. ✅ Theme file exists in `output/`
2. ✅ File copied to HA's `config/themes/`
3. ✅ Reloaded themes in Developer Tools
4. ✅ Checked HA logs for YAML errors

### "Can't connect to backend"

**Check services are running**:
```bash
docker compose ps

# Should show both ports 3000 and 3001
```

**Check logs**:
```bash
docker compose logs
```

### "Build failed"

**Common causes**:
- Missing framework files
- Invalid visual language name
- Invalid palette name

**Solution**:
```bash
# Verify framework structure
docker exec ha-theme-studio ls -R /framework/

# Should show:
# /framework/core/
# /framework/visual-languages/
# /framework/color-palettes/
```

---

## 📊 What Visual Languages Are Available?

| Visual Language | Description | Best For |
|----------------|-------------|----------|
| **Material 3** | Google's latest Material Design | Modern, clean interfaces |
| **Neumorphic Material** | Soft, raised surfaces | Subtle, elegant look |
| **Frosted Glass** | Translucent blur effects | iOS-style, modern |
| **Liquid Glass** | Adaptive transparency | Premium, futuristic |

## 🎨 What Color Palettes Are Available?

- 🟣 Material Purple
- 🔵 iOS Blue
- 🔵 Material Blue
- 🔵 Indigo Blue
- 🔴 Red
- 🟢 Green
- 🟠 Orange
- 🔷 Teal

---

## 🎯 Quick Examples

### Example 1: iOS-style Theme

```
Visual Language: Frosted Glass
Color Palette: iOS Blue
Mode: Light
Radius: 12px
Elevation: Medium

Result: frosted-glass-ios-blue.yaml
```

### Example 2: Dark Material Theme

```
Visual Language: Material 3
Color Palette: Material Purple
Mode: Dark
Radius: 16px
Elevation: High

Result: material3-material-purple.yaml
```

### Example 3: Neumorphic Green

```
Visual Language: Neumorphic Material
Color Palette: Green
Mode: Light
Radius: 24px
Elevation: Medium

Result: neumorphic-material-green.yaml
```

---

## 🔗 Useful Links

- **Web UI**: http://localhost:3000
- **API**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/api/health

---

## 📚 Next Steps

1. ✅ Built your first theme
2. → Read [README.md](README.md) for full features
3. → Read [ARCHITECTURE.md](ARCHITECTURE.md) for advanced customization
4. → Join Home Assistant community forums

---

## 💡 Pro Tips

**Tip 1**: Use direct HA integration to avoid manual copying

**Tip 2**: Build all themes at once, then pick your favorite in HA

**Tip 3**: Use the preview panel to compare before building

**Tip 4**: Border radius 12-16px works well for most themes

**Tip 5**: Export themes as ZIP to share with friends!

---

**Happy Theming! 🎨**

Need help? Check the full [README.md](README.md) or [ARCHITECTURE.md](ARCHITECTURE.md)
