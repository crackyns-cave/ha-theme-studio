import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import Inspector from './components/Inspector'
import Header from './components/Header'
import { ColorPalette, ThemeConfig, VisualLanguage } from './types'
import api from './utils/api'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6750A4',
    },
    background: {
      default: '#1C1B1F',
      paper: '#2B2930',
    },
  },
})

function App() {
  const [config, setConfig] = useState<ThemeConfig>({
    visual: 'material3',
    palette: 'material-purple',
    mode: 'light',
    shape: { radius: 12 },
    elevation: 'medium',
  })

  const [visualOptions, setVisualOptions] = useState<VisualLanguage[]>([])
  const [paletteOptions, setPaletteOptions] = useState<ColorPalette[]>([])

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      console.log('[App] Loading visual and palette options...');
      const [visuals, palettes] = await Promise.all([
        api.get('/visuals'),
        api.get('/palettes'),
      ])
      console.log('[App] Loaded visuals:', visuals.data);
      console.log('[App] Loaded palettes:', palettes.data);
      setVisualOptions(visuals.data)
      setPaletteOptions(palettes.data)
    } catch (error) {
      console.error('[App] Failed to load options:', error)
    }
  }

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    const newConfig = { ...config, ...updates };
    console.log('[App] Config updated:', newConfig);
    setConfig(newConfig);
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <Header config={config} />
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            config={config}
            visualOptions={visualOptions}
            paletteOptions={paletteOptions}
            onConfigChange={updateConfig}
          />
          <Preview
            config={config}
            palette={paletteOptions.find((palette) => palette.slug === config.palette)}
          />
          <Inspector
            config={config}
            palette={paletteOptions.find((palette) => palette.slug === config.palette)}
          />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
