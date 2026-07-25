// ================================================
// 🎨 CHANGE YOUR THEME COLORS HERE — ONE PLACE
// ================================================
export const COLORS = {
  // Brand
  primary:       '#3b82f6',   // Blue  → change to any color
  primaryDark:   '#2563eb',   // Darker blue for hover
  secondary:     '#8b5cf6',   // Purple

  // Status
  success:       '#22c55e',   // Green
  warning:       '#f59e0b',   // Amber
  error:         '#ef4444',   // Red
  info:          '#06b6d4',   // Cyan

  // Backgrounds
  bgPage:        '#0f172a',   // Page background (darkest)
  bgCard:        '#1e293b',   // Card/paper background
  bgElevated:    '#273549',   // Slightly elevated card

  // Text
  textPrimary:   '#f1f5f9',   // Main text
  textSecondary: '#94a3b8',   // Muted text
  textDisabled:  '#475569',   // Disabled text

  // Border
  border:        'rgba(148,163,184,0.12)',
  borderHover:   'rgba(148,163,184,0.25)',
};

// ================================================
// MUI THEME — built from tokens above
// ================================================
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary:    { main: COLORS.primary, dark: COLORS.primaryDark },
    secondary:  { main: COLORS.secondary },
    success:    { main: COLORS.success },
    warning:    { main: COLORS.warning },
    error:      { main: COLORS.error },
    info:       { main: COLORS.info },
    background: { default: COLORS.bgPage, paper: COLORS.bgCard },
    text:       { primary: COLORS.textPrimary, secondary: COLORS.textSecondary, disabled: COLORS.textDisabled },
    divider:    COLORS.border,
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700, letterSpacing: '-0.3px' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    button: { fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.4)',
    '0 4px 12px rgba(0,0,0,0.4)',
    '0 8px 24px rgba(0,0,0,0.5)',
    ...Array(21).fill('0 8px 24px rgba(0,0,0,0.5)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          transition: 'all 0.15s ease',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': { boxShadow: `0 4px 14px ${COLORS.primary}40`, transform: 'translateY(-1px)' },
        },
        outlined: {
          borderColor: COLORS.border,
          '&:hover': { borderColor: COLORS.primary },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${COLORS.border}`,
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          '&:hover': { borderColor: COLORS.borderHover },
        },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', fullWidth: true },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: COLORS.border },
            '&:hover fieldset': { borderColor: COLORS.borderHover },
          },
        },
      },
    },
    MuiPaper:   { styleOverrides: { root: { backgroundImage: 'none', border: `1px solid ${COLORS.border}` } } },
    MuiChip:    { styleOverrides: { root: { fontWeight: 500 } } },
    MuiDivider: { styleOverrides: { root: { borderColor: COLORS.border } } },
    MuiSelect:  { styleOverrides: { outlined: { '& fieldset': { borderColor: COLORS.border } } } },
  },
});

export default theme;