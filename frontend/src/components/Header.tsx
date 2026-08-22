import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material'
import { useState } from 'react'
import DownloadIcon from '@mui/icons-material/Download'
import BuildIcon from '@mui/icons-material/Build'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { ThemeConfig } from '../types'
import api from '../utils/api'

interface HeaderProps {
  config: ThemeConfig
}

export default function Header({ config }: HeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleBuildCurrent = async () => {
    try {
      const response = await api.post('/build/current', {
        visual: config.visual,
        palette: config.palette,
      })
      console.log('Build result:', response.data)
      alert('Theme built successfully!')
    } catch (error) {
      alert('Failed to build theme')
    }
  }

  const handleBuildAll = async () => {
    try {
      const response = await api.post('/build/all')
      console.log('Build all result:', response.data)
      alert('All themes built successfully!')
    } catch (error) {
      alert('Failed to build themes')
    }
    handleClose()
  }

  const handleExport = async () => {
    try {
      const themeName = `${config.visual}-${config.palette}`
      const response = await api.post('/build/export', {
        themes: [themeName],
      }, {
        responseType: 'blob',
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'themes.zip')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      alert('Failed to export themes')
    }
    handleClose()
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <AppBar position="static" elevation={0}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          HA Theme Studio
        </Typography>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<BuildIcon />}
            onClick={handleBuildCurrent}
            sx={{ bgcolor: 'primary.dark' }}
          >
            Build Theme
          </Button>

          <IconButton color="inherit" onClick={handleClick}>
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleBuildAll}>
              <BuildIcon sx={{ mr: 1 }} fontSize="small" />
              Build All Themes
            </MenuItem>
            <MenuItem onClick={handleExport}>
              <DownloadIcon sx={{ mr: 1 }} fontSize="small" />
              Export as ZIP
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
