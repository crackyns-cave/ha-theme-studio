import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Typography,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
} from '@mui/material'
import { ThemeConfig, VisualLanguage, ColorPalette } from '../types'

interface SidebarProps {
  config: ThemeConfig
  visualOptions: VisualLanguage[]
  paletteOptions: ColorPalette[]
  onConfigChange: (updates: Partial<ThemeConfig>) => void
}

export default function Sidebar({ config, visualOptions, paletteOptions, onConfigChange }: SidebarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', md: 320 },
        flexShrink: 0,
        p: 3,
        bgcolor: 'background.paper',
        borderRight: 1,
        borderColor: 'divider',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Configuration
      </Typography>

      <Box sx={{ mt: 3 }}>
        {/* Visual Language Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Visual Language</InputLabel>
          <Select
            value={config.visual}
            label="Visual Language"
            onChange={(e) => onConfigChange({ visual: e.target.value })}
          >
            {visualOptions.map((visual) => (
              <MenuItem key={visual.slug} value={visual.slug}>
                {visual.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Color Palette Selector */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Color Palette</InputLabel>
          <Select
            value={config.palette}
            label="Color Palette"
            onChange={(e) => onConfigChange({ palette: e.target.value })}
          >
            {paletteOptions.map((palette) => (
              <MenuItem key={palette.slug} value={palette.slug}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: 1,
                      bgcolor: palette.colors.primary,
                    }}
                  />
                  {palette.name}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Divider sx={{ my: 3 }} />

        {/* Mode Toggle */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Theme Mode
          </Typography>
          <ToggleButtonGroup
            value={config.mode}
            exclusive
            onChange={(_, value) => value && onConfigChange({ mode: value })}
            fullWidth
            size="small"
          >
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Shape Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Border Radius: {config.shape.radius}px
          </Typography>
          <Slider
            value={config.shape.radius}
            onChange={(_, value) =>
              onConfigChange({ shape: { radius: value as number } })
            }
            min={8}
            max={48}
            step={4}
            marks
            valueLabelDisplay="auto"
          />
        </Box>

        {/* Elevation Controls */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Elevation
          </Typography>
          <ToggleButtonGroup
            value={config.elevation}
            exclusive
            onChange={(_, value) => value && onConfigChange({ elevation: value })}
            fullWidth
            size="small"
            orientation="vertical"
          >
            <ToggleButton value="minimal">Minimal</ToggleButton>
            <ToggleButton value="medium">Medium</ToggleButton>
            <ToggleButton value="high">High</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Visual Language Info */}
        {visualOptions.find((v) => v.slug === config.visual) && (
          <Box sx={{ mt: 4, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {visualOptions.find((v) => v.slug === config.visual)?.description}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  )
}
