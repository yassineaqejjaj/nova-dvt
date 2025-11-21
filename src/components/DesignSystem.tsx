import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Palette, 
  Type, 
  Layout, 
  Box, 
  Smile,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Mail
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

export const DesignSystem = () => {
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue] = useState(66);

  const colors = [
    { name: "Primary", variable: "--primary", class: "bg-primary" },
    { name: "Secondary", variable: "--secondary", class: "bg-secondary" },
    { name: "Accent", variable: "--accent", class: "bg-accent" },
    { name: "Muted", variable: "--muted", class: "bg-muted" },
    { name: "Destructive", variable: "--destructive", class: "bg-destructive" },
    { name: "Background", variable: "--background", class: "bg-background border" },
    { name: "Foreground", variable: "--foreground", class: "bg-foreground" },
  ];

  const buttonVariants = [
    { variant: "default" as const, label: "Default" },
    { variant: "destructive" as const, label: "Destructive" },
    { variant: "outline" as const, label: "Outline" },
    { variant: "secondary" as const, label: "Secondary" },
    { variant: "ghost" as const, label: "Ghost" },
    { variant: "link" as const, label: "Link" },
  ];

  const buttonSizes = [
    { size: "sm" as const, label: "Small" },
    { size: "default" as const, label: "Default" },
    { size: "lg" as const, label: "Large" },
  ];

  const badgeVariants = [
    { variant: "default" as const, label: "Default" },
    { variant: "secondary" as const, label: "Secondary" },
    { variant: "destructive" as const, label: "Destructive" },
    { variant: "outline" as const, label: "Outline" },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Design System</h1>
        <p className="text-muted-foreground">
          Système de design complet avec composants UI et tokens de style
        </p>
      </div>

      <Tabs defaultValue="colors" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="colors">
            <Palette className="w-4 h-4 mr-2" />
            Couleurs
          </TabsTrigger>
          <TabsTrigger value="typography">
            <Type className="w-4 h-4 mr-2" />
            Typographie
          </TabsTrigger>
          <TabsTrigger value="components">
            <Box className="w-4 h-4 mr-2" />
            Composants
          </TabsTrigger>
          <TabsTrigger value="forms">
            <Layout className="w-4 h-4 mr-2" />
            Formulaires
          </TabsTrigger>
          <TabsTrigger value="feedback">
            <Smile className="w-4 h-4 mr-2" />
            Feedback
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Palette de couleurs</CardTitle>
              <CardDescription>
                Tokens de couleurs sémantiques du design system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {colors.map((color) => (
                  <div key={color.name} className="space-y-2">
                    <div className={`h-20 rounded-lg ${color.class}`} />
                    <div>
                      <p className="font-semibold text-sm">{color.name}</p>
                      <code className="text-xs text-muted-foreground">
                        {color.variable}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hiérarchie typographique</CardTitle>
              <CardDescription>
                Échelle de tailles de texte et styles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 1</p>
                <h1 className="text-4xl font-bold">The quick brown fox</h1>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 2</p>
                <h2 className="text-3xl font-bold">The quick brown fox</h2>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Heading 3</p>
                <h3 className="text-2xl font-semibold">The quick brown fox</h3>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body Large</p>
                <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body</p>
                <p className="text-base">The quick brown fox jumps over the lazy dog</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Body Small</p>
                <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground mb-1">Caption</p>
                <p className="text-xs text-muted-foreground">The quick brown fox jumps over the lazy dog</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Boutons</CardTitle>
              <CardDescription>
                Variantes et tailles disponibles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium mb-4">Variantes</h4>
                <div className="flex flex-wrap gap-3">
                  {buttonVariants.map((btn) => (
                    <Button key={btn.variant} variant={btn.variant}>
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-4">Tailles</h4>
                <div className="flex items-center gap-3">
                  {buttonSizes.map((btn) => (
                    <Button key={btn.size} size={btn.size}>
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="text-sm font-medium mb-4">Avec icônes</h4>
                <div className="flex flex-wrap gap-3">
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Avec icône
                  </Button>
                  <Button variant="outline">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Outline
                  </Button>
                  <Button size="icon">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
              <CardDescription>
                Indicateurs et labels de statut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {badgeVariants.map((badge) => (
                  <Badge key={badge.variant} variant={badge.variant}>
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cards</CardTitle>
              <CardDescription>
                Conteneurs de contenu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Card simple</CardTitle>
                    <CardDescription>Description de la carte</CardDescription>
                  </CardHeader>
                  <CardContent>
                    Contenu de la carte
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Card avec footer</CardTitle>
                    <CardDescription>Avec bouton d'action</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">Contenu de la carte</p>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button size="sm">Action</Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Champs de formulaire</CardTitle>
              <CardDescription>
                Éléments d'entrée utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="input-demo">Input</Label>
                <Input id="input-demo" placeholder="Tapez quelque chose..." />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="textarea-demo">Textarea</Label>
                <Textarea id="textarea-demo" placeholder="Message..." />
              </div>

              <Separator />

              <div className="flex items-center space-x-2">
                <Switch id="switch-demo" />
                <Label htmlFor="switch-demo">Activer les notifications</Label>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Slider (valeur: {sliderValue})</Label>
                <Slider 
                  value={sliderValue} 
                  onValueChange={setSliderValue}
                  max={100}
                  step={1}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Checkboxes</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="check1" />
                  <label htmlFor="check1" className="text-sm">Option 1</label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="check2" />
                  <label htmlFor="check2" className="text-sm">Option 2</label>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Radio Group</Label>
                <RadioGroup defaultValue="option1">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option1" id="r1" />
                    <Label htmlFor="r1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="option2" id="r2" />
                    <Label htmlFor="r2">Option 2</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>États de feedback</CardTitle>
              <CardDescription>
                Indicateurs visuels pour l'utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Progress Bar</Label>
                <Progress value={progressValue} />
                <p className="text-xs text-muted-foreground">{progressValue}% complété</p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Skeleton Loading</Label>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Icônes de statut</Label>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Succès</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-destructive" />
                    <span className="text-sm">Erreur</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <span className="text-sm">Attention</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    <span className="text-sm">Info</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>États de boutons</Label>
                <div className="flex flex-wrap gap-3">
                  <Button>Normal</Button>
                  <Button disabled>Désactivé</Button>
                  <Button variant="outline">
                    <span className="animate-pulse">Chargement...</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Accéder à Storybook</CardTitle>
          <CardDescription>
            Pour une documentation complète et interactive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Lancez Storybook en local pour explorer tous les composants avec leurs variantes et props :
          </p>
          <div className="bg-muted p-4 rounded-lg">
            <code className="text-sm">npm run storybook</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
