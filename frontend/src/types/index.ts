export interface ThemeConfig {
  visual: string
  palette: string
  mode: 'light' | 'dark'
  shape: {
    radius: number
  }
  elevation: 'minimal' | 'medium' | 'high'
}

export interface ColorPalette {
  name: string
  slug: string
  colors: {
    primary: string
    secondary: string
    tertiary?: string
    success: string
    warning: string
    error: string
  }
}

export interface VisualLanguage {
  name: string
  slug: string
  description: string
  features: string[]
}

export interface BuildResult {
  success: boolean
  themeName: string
  outputPath: string
  size: number
  error?: string
}
