import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Layout, Type, Image, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const DesignTool: React.FC = () => {
  const [selectedTool, setSelectedTool] = useState<string>('colors');

  const colorPalettes = [
    { name: 'Modern Blue', colors: ['#0066FF', '#4D94FF', '#99C2FF', '#E6F0FF'] },
    { name: 'Sunset Orange', colors: ['#FF6B35', '#FF8C61', '#FFAD8D', '#FFD4B9'] },
    { name: 'Forest Green', colors: ['#2D5016', '#5C8D2E', '#8FBC5E', '#C2E0A0'] },
    { name: 'Purple Dream', colors: ['#6B2D9E', '#9A5CCC', '#C48FE8', '#E8C7FF'] },
  ];

  const layoutTemplates = [
    { name: 'Dashboard', icon: '📊', description: 'Analytics dashboard layout' },
    { name: 'Landing Page', icon: '🚀', description: 'Hero-focused landing page' },
    { name: 'Form', icon: '📝', description: 'Multi-step form layout' },
    { name: 'Gallery', icon: '🖼️', description: 'Image gallery grid' },
  ];

  const typographyStyles = [
    { name: 'Modern Sans', font: 'Inter', preview: 'The quick brown fox' },
    { name: 'Classic Serif', font: 'Merriweather', preview: 'The quick brown fox' },
    { name: 'Elegant Script', font: 'Playfair Display', preview: 'The quick brown fox' },
    { name: 'Tech Mono', font: 'Roboto Mono', preview: 'The quick brown fox' },
  ];

  const handleGenerateDesign = () => {
    toast.success('Design generated!', {
      description: 'Your design assets are ready to use.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center space-x-2 mb-2">
          <Palette className="w-8 h-8 text-primary" />
          <span>Design System Tool</span>
        </h2>
        <p className="text-muted-foreground">
          Create consistent design systems and UI components
        </p>
      </div>

      <Tabs value={selectedTool} onValueChange={setSelectedTool}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors">
            <Palette className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="layouts">
            <Layout className="w-4 h-4 mr-2" />
            Layouts
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="w-4 h-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Image className="w-4 h-4 mr-2" />
            Assets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Palettes</CardTitle>
              <CardDescription>Choose or generate color schemes for your design</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {colorPalettes.map((palette) => (
                <div key={palette.name} className="space-y-2">
                  <h4 className="font-semibold">{palette.name}</h4>
                  <div className="flex space-x-2">
                    {palette.colors.map((color) => (
                      <div
                        key={color}
                        className="w-20 h-20 rounded-lg border shadow-sm cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          navigator.clipboard.writeText(color);
                          toast.success('Color copied!', { description: color });
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <Button onClick={handleGenerateDesign} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Palette
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="layouts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Layout Templates</CardTitle>
              <CardDescription>Pre-built responsive layouts for common use cases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {layoutTemplates.map((template) => (
                  <Card
                    key={template.name}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => toast.success(`${template.name} template selected!`)}
                  >
                    <CardContent className="pt-6 text-center">
                      <div className="text-4xl mb-2">{template.icon}</div>
                      <h4 className="font-semibold mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography Styles</CardTitle>
              <CardDescription>Font pairings and text styling recommendations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {typographyStyles.map((style) => (
                <div
                  key={style.name}
                  className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toast.success(`${style.name} typography selected!`)}
                >
                  <h4 className="font-semibold mb-2">{style.name}</h4>
                  <p
                    className="text-2xl"
                    style={{ fontFamily: style.font }}
                  >
                    {style.preview}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Font: {style.font}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Design Assets</CardTitle>
              <CardDescription>Icons, illustrations, and images for your project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Generate Custom Icon</Label>
                <Input placeholder="Describe the icon you need..." />
              </div>
              <div className="space-y-2">
                <Label>Generate Illustration</Label>
                <Input placeholder="Describe the illustration style..." />
              </div>
              <Button onClick={handleGenerateDesign} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Assets
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
