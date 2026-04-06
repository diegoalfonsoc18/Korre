import { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { THEME_COLORS } from '@/lib/theme';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  colors: (typeof THEME_COLORS)[Theme];
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState<Theme>((systemColorScheme as Theme) || 'dark');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Usar el tema del sistema cuando la app se monta
    if (systemColorScheme) {
      setTheme(systemColorScheme as Theme);
    }
    setIsInitialized(true);
  }, []);

  const colors = THEME_COLORS[theme];

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
