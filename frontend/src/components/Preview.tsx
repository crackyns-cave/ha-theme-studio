import { Box, Paper, Typography, Card, CardContent } from '@mui/material'
import { ThemeConfig } from '../types'

interface PreviewProps {
  config: ThemeConfig
}

export default function Preview({ config }: PreviewProps) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 3,
        bgcolor: 'background.default',
        overflowY: 'auto',
      }}
    >
      <Typography variant="h5" gutterBottom>
        Live Preview
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Preview of {config.visual} with {config.palette} palette
      </Typography>

      {/* Dashboard Card Preview */}
      <Card sx={{ mb: 2 }}>
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
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Tile 1</Typography>
          <Typography variant="body2" color="text.secondary">
            State: On
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Tile 2</Typography>
          <Typography variant="body2" color="text.secondary">
            State: Off
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6">Tile 3</Typography>
          <Typography variant="body2" color="text.secondary">
            State: 22°C
          </Typography>
        </Paper>
      </Box>

      {/* Mushroom Card Style Preview */}
      <Card sx={{ mb: 2 }}>
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
      <Card>
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
  )
}
