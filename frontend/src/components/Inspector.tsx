import { Box, Paper, Typography, TextField } from '@mui/material'
import { ColorPalette, ThemeConfig } from '../types'

interface InspectorProps {
  config: ThemeConfig
  palette?: ColorPalette
}

export default function Inspector({ config, palette }: InspectorProps) {
  const paletteColors = palette?.modes?.[config.mode] ?? palette?.colors
  const colors = config.visual === 'neumorphic-material' && paletteColors
    ? {
        ...paletteColors,
        background: config.mode === 'light' ? '#ECEFF4' : '#2E3440',
        surface: config.mode === 'light' ? '#ECEFF4' : '#2E3440',
      }
    : paletteColors
  const variables = [
    { name: '--primary-color', value: colors?.primary ?? '#6750A4' },
    { name: '--accent-color', value: colors?.primary ?? '#6750A4' },
    { name: '--background-color', value: colors?.background ?? '#FEF7FF' },
    { name: '--card-background', value: colors?.surface ?? '#F3EDF7' },
    { name: '--text-primary', value: colors?.text ?? '#1C1B1F' },
    { name: '--border-radius', value: `${config.shape.radius}px` },
  ]

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 320 },
        flexShrink: 0,
        p: 3,
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Theme Variables
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        CSS variables generated for {config.visual}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {variables.map((variable) => (
          <Box key={variable.name}>
            <Typography variant="caption" color="text.secondary">
              {variable.name}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={variable.value}
              InputProps={{
                readOnly: true,
                sx: { fontFamily: 'monospace', fontSize: '0.875rem' },
              }}
            />
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Total variables: 400+
          <br />
          Including Material Web, WebAwesome, and Home Assistant semantic colors
        </Typography>
      </Box>
    </Paper>
  )
}
