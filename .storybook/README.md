# Storybook Configuration

Ce projet inclut une intégration complète de Storybook pour la documentation et le développement du design system.

## Lancement de Storybook

Pour lancer Storybook en mode développement, ajoutez ce script à votre `package.json` :

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  }
}
```

Puis exécutez :

```bash
npm run storybook
```

Storybook sera accessible sur `http://localhost:6006`

## Structure

- **Stories** : Les stories sont dans `src/components/ui/*.stories.tsx`
- **Configuration** : `.storybook/main.ts` et `.storybook/preview.ts`
- **Design System** : Un module complet est accessible dans l'interface Nova (Workflows > Design System & Storybook)

## Composants disponibles

Les composants UI suivants ont des stories :
- Button (toutes les variantes et tailles)
- Input (tous les types)
- Card (différentes configurations)
- Badge (toutes les variantes)

## Ajouter une nouvelle story

Créez un fichier `*.stories.tsx` à côté de votre composant :

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'UI/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // vos props par défaut
  },
};
```

## Module Design System dans Nova

Un module interactif est accessible depuis Nova permettant d'explorer :
- Palette de couleurs (tokens sémantiques)
- Hiérarchie typographique
- Bibliothèque de composants
- Éléments de formulaire
- États de feedback

Accessible via : **Workflows > Mon Quotidien > Design System & Storybook**
