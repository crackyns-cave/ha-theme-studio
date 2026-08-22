import { useState, useEffect } from 'react'
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import Preview from './components/Preview'
import Inspector from './components/Inspector'
import Header from './components/Header'
import { ThemeConfig } from './types'
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

  const [visualOptions, setVisualOptions] = useState<any[]>([])
  const [paletteOptions, setPaletteOptions] = useState<any[]>([])

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      const [visuals, palettes] = await Promise.all([
        api.get('/visuals'),
        api.get('/palettes'),
      ])
      setVisualOptions(visuals.data)
      setPaletteOptions(palettes.data)
    } catch (error) {
      console.error('Failed to load options:', error)
    }
  }

  const updateConfig = (updates: Partial<ThemeConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
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
          <Preview config={config} />
          <Inspector config={config} />
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
