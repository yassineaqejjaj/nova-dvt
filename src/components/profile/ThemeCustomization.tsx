import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export const ThemeCustomization = () => {
  const { currentTheme, setTheme, themes } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<'default' | 'client'>('default');

  const filteredThemes = themes.filter(t => t.category === selectedCategory);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Palette className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">Personnalisation du Thème</h2>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={selectedCategory === 'default' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('default')}
        >
          Thèmes par défaut
        </Button>
        <Button
          variant={selectedCategory === 'client' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('client')}
        >
          Thèmes clients
        </Button>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map((theme) => {
          const isSelected = currentTheme === theme.id;
          const isDark = theme.id.includes('dark');

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={`relative p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {/* Theme Preview */}
              <div className="mb-3 h-24 rounded-md overflow-hidden border">
                <div className="h-full flex">
                  <div 
                    className="flex-1" 
                    style={{ backgroundColor: theme.preview.background }}
                  />
                  <div className="flex-1 flex flex-col">
                    <div 
                      className="flex-1" 
                      style={{ backgroundColor: theme.preview.primary }}
                    />
                    <div 
                      className="flex-1" 
                      style={{ backgroundColor: theme.preview.secondary }}
                    />
                  </div>
                </div>
              </div>

              {/* Theme Info */}
              <div className="text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold">{theme.name}</h3>
                  {isSelected && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {theme.description}
                </p>
                <div className="flex gap-2">
                  {isDark && (
                    <Badge variant="secondary" className="text-xs">
                      Dark
                    </Badge>
                  )}
                  {theme.category === 'client' && (
                    <Badge variant="outline" className="text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 p-1.5 rounded-full bg-primary">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info Section */}
      <div className="mt-6 p-4 rounded-lg bg-muted">
        <p className="text-sm text-muted-foreground">
          <strong>💡 Astuce:</strong> Les thèmes clients sont conçus pour différents secteurs d'activité. 
          Choisissez celui qui correspond le mieux à votre identité visuelle.
        </p>
      </div>

      {/* Current Theme Display */}
      <div className="mt-6 pt-6 border-t">
        <p className="text-sm font-medium mb-3">Thème actuel</p>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
          <div 
            className="w-12 h-12 rounded-md border-2 border-primary"
            style={{ backgroundColor: themes.find(t => t.id === currentTheme)?.preview.primary }}
          />
          <div>
            <p className="font-medium">{themes.find(t => t.id === currentTheme)?.name}</p>
            <p className="text-sm text-muted-foreground">
              {themes.find(t => t.id === currentTheme)?.description}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
