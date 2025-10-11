import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'default' | 'client';
  preview: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const themes: Theme[] = [
  {
    id: 'nova-light',
    name: 'Nova',
    description: 'Theme par défaut de Nova',
    category: 'default',
    preview: { primary: '#E31E24', secondary: '#8B5CF6', background: '#FFFFFF' }
  },
  {
    id: 'dark',
    name: 'Nova Dark',
    description: 'Mode sombre élégant',
    category: 'default',
    preview: { primary: '#EF4444', secondary: '#A78BFA', background: '#0F1419' }
  },
  {
    id: 'cardinal',
    name: 'Cardinal',
    description: 'Élégance bancaire classique',
    category: 'client',
    preview: { primary: '#C41E3A', secondary: '#1A1A1A', background: '#FAFAFA' }
  },
  {
    id: 'cardinal-dark',
    name: 'Cardinal Dark',
    description: 'Cardinal en mode sombre',
    category: 'client',
    preview: { primary: '#E63946', secondary: '#2D2D2D', background: '#0A0A0A' }
  },
  {
    id: 'atlantic',
    name: 'Atlantic',
    description: 'Innovation financière moderne',
    category: 'client',
    preview: { primary: '#0066CC', secondary: '#FF6B35', background: '#F8F9FA' }
  },
  {
    id: 'atlantic-dark',
    name: 'Atlantic Dark',
    description: 'Atlantic en mode sombre',
    category: 'client',
    preview: { primary: '#3399FF', secondary: '#FF8C5A', background: '#0B1929' }
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Énergie sportive et outdoor',
    category: 'client',
    preview: { primary: '#0082C3', secondary: '#2E7D32', background: '#FAFAFA' }
  },
  {
    id: 'forest-dark',
    name: 'Forest Dark',
    description: 'Forest en mode sombre',
    category: 'client',
    preview: { primary: '#29B6F6', secondary: '#66BB6A', background: '#0D1B1E' }
  },
  {
    id: 'crimson',
    name: 'Crimson',
    description: 'Audace culturelle',
    category: 'client',
    preview: { primary: '#E1000F', secondary: '#2C2C2C', background: '#F5F5F5' }
  },
  {
    id: 'crimson-dark',
    name: 'Crimson Dark',
    description: 'Crimson en mode sombre',
    category: 'client',
    preview: { primary: '#FF1A2B', secondary: '#1A1A1A', background: '#0F0F0F' }
  },
  {
    id: 'indigo',
    name: 'Indigo',
    description: 'Énergie et innovation',
    category: 'client',
    preview: { primary: '#5E35B1', secondary: '#00ACC1', background: '#FAFAFA' }
  },
  {
    id: 'indigo-dark',
    name: 'Indigo Dark',
    description: 'Indigo en mode sombre',
    category: 'client',
    preview: { primary: '#7E57C2', secondary: '#26C6DA', background: '#120E1F' }
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Dynamisme startup',
    category: 'client',
    preview: { primary: '#FF5722', secondary: '#607D8B', background: '#FAFAFA' }
  },
  {
    id: 'ember-dark',
    name: 'Ember Dark',
    description: 'Ember en mode sombre',
    category: 'client',
    preview: { primary: '#FF7043', secondary: '#78909C', background: '#121212' }
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Durabilité et nature',
    category: 'client',
    preview: { primary: '#558B2F', secondary: '#8D6E63', background: '#F5F5DC' }
  },
  {
    id: 'sage-dark',
    name: 'Sage Dark',
    description: 'Sage en mode sombre',
    category: 'client',
    preview: { primary: '#9CCC65', secondary: '#A1887F', background: '#1B1F1A' }
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Luxe premium',
    category: 'client',
    preview: { primary: '#1A237E', secondary: '#C5A572', background: '#FAFAFA' }
  },
  {
    id: 'midnight-dark',
    name: 'Midnight Dark',
    description: 'Sophistication premium',
    category: 'client',
    preview: { primary: '#3949AB', secondary: '#FFD54F', background: '#0A0E27' }
  }
];

interface ThemeContextType {
  currentTheme: string;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<string>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('nova-theme') || 'dark';
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeId: string) => {
    document.documentElement.setAttribute('data-theme', themeId);
    setCurrentTheme(themeId);
  };

  const setTheme = (themeId: string) => {
    applyTheme(themeId);
    localStorage.setItem('nova-theme', themeId);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
