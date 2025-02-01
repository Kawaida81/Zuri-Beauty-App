export interface Theme {
  colors: {
    primary: string;
    success: string;
    warning: string;
    danger: string;
    textPrimary: string;
    textSecondary: string;
    bgPrimary: string;
    bgSecondary: string;
    border: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

export const theme: Theme = {
  colors: {
    primary: 'var(--primary-color)',
    success: 'var(--success-color)',
    warning: 'var(--warning-color)',
    danger: 'var(--danger-color)',
    textPrimary: 'var(--text-primary)',
    textSecondary: 'var(--text-secondary)',
    bgPrimary: 'var(--bg-primary)',
    bgSecondary: 'var(--bg-secondary)',
    border: 'var(--border-color)',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
  },
} 