import { Box, Paper, Typography, Card, CardContent, ThemeProvider, createTheme } from '@mui/material'
import { ColorPalette, ThemeConfig } from '../types'

interface PreviewProps {
  config: ThemeConfig
  palette?: ColorPalette
}

const fallbackColors = {
  primary: '#6750A4',
  secondary: '#625B71',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#B3261E',
  background: '#FEF7FF',
  surface: '#F3EDF7',
  text: '#1C1B1F',
}

export default function Preview({ config, palette }: PreviewProps) {
  const paletteColors = palette?.modes?.[config.mode] ?? palette?.colors ?? fallbackColors
  const colors = config.visual === 'neumorphic-material'
    ? {
        ...paletteColors,
        background: config.mode === 'light' ? '#ECEFF4' : '#2E3440',
        surface: config.mode === 'light' ? '#ECEFF4' : '#2E3440',
      }
    : paletteColors
  const shadowStrength = config.elevation === 'minimal' ? 2 : config.elevation === 'medium' ? 6 : 12
  const darkShadow = config.mode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.22)'
  const lightShadow = config.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)'

  const surfaceStyle = config.visual === 'neumorphic-material'
    ? {
        bgcolor: colors.surface,
        border: 0,
        boxShadow: `${shadowStrength}px ${shadowStrength}px ${shadowStrength * 2}px ${darkShadow}, -${shadowStrength}px -${shadowStrength}px ${shadowStrength * 2}px ${lightShadow}`,
      }
    : config.visual === 'frosted-glass'
      ? {
          bgcolor: `${colors.surface}cc`,
          border: `1px solid ${colors.primary}33`,
          backdropFilter: 'blur(16px)',
          boxShadow: `0 ${shadowStrength}px ${shadowStrength * 3}px ${darkShadow}`,
        }
      : config.visual === 'liquid-glass'
        ? {
            bgcolor: `${colors.surface}dd`,
            border: `1px solid ${colors.primary}55`,
            backdropFilter: 'blur(24px) saturate(140%)',
            boxShadow: `inset 0 1px 0 ${lightShadow}, 0 ${shadowStrength}px ${shadowStrength * 3}px ${darkShadow}`,
          }
        : {
            bgcolor: colors.surface,
            border: 0,
            boxShadow: `0 ${shadowStrength / 2}px ${shadowStrength * 2}px ${darkShadow}`,
          }

  const previewTheme = createTheme({
    palette: {
      mode: config.mode,
      primary: { main: colors.primary },
      secondary: { main: colors.secondary },
      success: { main: colors.success },
      warning: { main: colors.warning },
      error: { main: colors.error },
      background: { default: colors.background, paper: colors.surface },
      text: { primary: colors.text },
    },
    shape: { borderRadius: config.shape.radius },
  })

  return (
    <ThemeProvider theme={previewTheme}>
      <Box
        sx={{
          flex: 1,
          p: 3,
          bgcolor: 'background.default',
          color: 'text.primary',
          overflowY: 'auto',
          transition: 'background-color 180ms ease, color 180ms ease',
        }}
      >
      <Typography variant="h5" gutterBottom>
        Live Preview
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Preview of {config.visual} with {config.palette} palette
      </Typography>

      {/* Dashboard Card Preview */}
      <Card sx={{ ...surfaceStyle, mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Dashboard Card
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is how your cards will look with the selected theme.
          </Typography>
        </CardContent>
      </Card>

      {/* Tile Card Preview */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 2, mb: 2 }}>
        <Paper sx={{ ...surfaceStyle, p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Tile 1</Typography>
          <Typography variant="body2" color="text.secondary">
            State: On
          </Typography>
        </Paper>
        <Paper sx={{ ...surfaceStyle, p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Tile 2</Typography>
          <Typography variant="body2" color="text.secondary">
            State: Off
          </Typography>
        </Paper>
        <Paper sx={{ ...surfaceStyle, p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Tile 3</Typography>
          <Typography variant="body2" color="text.secondary">
            State: 22°C
          </Typography>
        </Paper>
      </Box>

      {/* Mushroom Card Style Preview */}
      <Card sx={{ ...surfaceStyle, mb: 2 }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            💡
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1">Living Room Light</Typography>
            <Typography variant="body2" color="text.secondary">
              Brightness: 75%
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* More preview components */}
      <Card sx={surfaceStyle}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Form Elements
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Paper
              sx={{
                px: 2,
                py: 1,
                borderRadius: `${config.shape.radius}px`,
              }}
            >
              Button
            </Paper>
            <Paper
              sx={{
                px: 2,
                py: 1,
                borderRadius: `${config.shape.radius}px`,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              Primary Button
            </Paper>
          </Box>
        </CardContent>
      </Card>
      </Box>
    </ThemeProvider>
  )
}
