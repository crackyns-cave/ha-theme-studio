export interface ThemeConfig {
  visual: string
  palette: string
  mode: 'light' | 'dark'
  shape: {
    radius: number
  }
  elevation: 'minimal' | 'medium' | 'high'
}

export interface PaletteColors {
  primary: string
  secondary: string
  tertiary?: string
  success: string
  warning: string
  error: string
  background: string
  surface: string
  text: string
}

export interface ColorPalette {
  name: string
  slug: string
  colors: PaletteColors
  modes: {
    light: PaletteColors
    dark: PaletteColors
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
