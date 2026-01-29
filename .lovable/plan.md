
# Plan d'analyse et de correction du Chat Multi-Agent

## Dysfonctionnements identifiés à partir des screenshots

### 1. **Problème de rendu Markdown/Formatage** 
Sur les screenshots, on observe des problèmes de formatage dans les messages agents :

- **Icônes orphelines** (💡, ⚙️, 🎯) qui apparaissent seules sur une ligne sans contexte
- **Astérisques non rendus** : les marqueurs `*` ne sont pas convertis en texte en gras/italique (ex: `*personas*`, `*Personas*`, `*tonalité*`)
- **Structure de liste incohérente** : les puces apparaissent parfois avec `@`, parfois avec `*`
- **Titres de sections** terminant par `:` ne sont pas mis en valeur visuellement
- **Texte italique** visible brut (ex: `*wireframes*`) au lieu d'être rendu en italique

### 2. **Problème de différenciation visuelle des agents**
- Les messages de différents agents (Alex Kim, David Chang, Maya Patel) se confondent visuellement
- Le code couleur par rôle existe (`ROLE_COLORS`) mais n'est pas assez distinctif
- Les noms d'agents sont parfois répétés dans le contenu (ex: "Alex Kim:", "David Chang:")

### 3. **Absence de contrôle de verbosité effectif**
- Les toggles "Court/Structuré/Détaillé" existent dans l'UI mais le rendu ne change pas significativement
- Les instructions de mode sont envoyées à l'API mais le formatage frontend ne s'adapte pas

### 4. **Parsing de `StructuredMessage` trop basique**
- Le parser ne gère pas bien les messages multi-paragraphes complexes
- Les sections Insight/Reasoning/Conclusion ne correspondent pas toujours au contenu réel
- Les icônes de section (Lightbulb, MessageSquare, Target) ajoutent du bruit visuel

### 5. **`FormattedText` ne gère pas tous les cas**
- L'italique `*text*` n'est pas capturé quand il y a un autre `*` après (conflit regex)
- Les sous-listes (indentation `*`) ne sont pas rendues correctement
- Les titres avec `:` final ne sont pas stylisés

---

## Plan de correction

### Partie 1 : Améliorer le rendu Markdown (`FormattedText`)

**Fichier**: `src/components/ui/formatted-text.tsx`

| Correction | Détail |
|------------|--------|
| **1.1 Regex italique** | Corriger la regex pour capturer `*texte*` même si d'autres astérisques existent |
| **1.2 Titres avec `:`** | Détecter les patterns `**Titre :**` et les styliser comme headers |
| **1.3 Sous-listes** | Gérer l'indentation avec `*` comme marqueur de sous-bullet |
| **1.4 Nettoyage icônes** | Supprimer les icônes emoji orphelines (💡,⚙️,🎯) en début de ligne si non suivies de texte |

### Partie 2 : Simplifier `StructuredMessage`

**Fichier**: `src/components/chat/StructuredMessage.tsx`

| Correction | Détail |
|------------|--------|
| **2.1 Supprimer parsing sémantique** | Le parsing Insight/Reasoning/Conclusion crée plus de problèmes qu'il n'en résout — passer à un rendu direct |
| **2.2 Conserver collapse intelligent** | Garder la fonctionnalité de collapse pour les longs messages |
| **2.3 Utiliser `FormattedText` directement** | Sans section icons qui ajoutent du bruit |

### Partie 3 : Implémenter le mode "Texte concis" vs "Analyse détaillée"

**Fichier**: `src/components/ChatInterface.tsx`

| Fonctionnalité | Détail |
|----------------|--------|
| **3.1 Mode `short`** | Afficher uniquement la première phrase + collapse automatique |
| **3.2 Mode `structured`** | Afficher les bullet points sans prose |
| **3.3 Mode `detailed`** | Afficher le contenu complet avec headers mis en valeur |

### Partie 4 : Améliorer l'adaptation UI selon ResponseMode

**Fichier**: `src/components/chat/MessageBubble.tsx`

| Modification | Détail |
|--------------|--------|
| **4.1 Props `responseMode`** | Passer le mode au composant pour adapter le rendu |
| **4.2 Collapse dynamique** | Auto-collapse différent selon le mode sélectionné |
| **4.3 Style visuel par mode** | Badge visuel indiquant le mode de réponse |

### Partie 5 : Nettoyage des noms d'agents dans le contenu

**Fichier**: `supabase/functions/chat-ai/index.ts`

| Amélioration | Détail |
|--------------|--------|
| **5.1 Sanitization renforcée** | Ajouter patterns pour supprimer "Alex Kim:", "Du point de vue de David Chang," etc. |
| **5.2 Patterns français et anglais** | Couvrir les deux langues |

---

## Détail technique

### 1. Corrections `FormattedText`

```typescript
// Améliorer la regex italique pour éviter les conflits
const italicMatch = remaining.match(/(?<!\*)\*(?!\*)([^*\n]+)\*(?!\*)/);

// Gérer les titres avec double-colon
if (line.match(/^\*\*[^*]+:\*\*/)) {
  // Rendre comme header stylisé
}

// Nettoyer les emojis orphelins
const cleanLine = line.replace(/^[💡⚙️🎯@]\s*$/, '');
```

### 2. Simplification `StructuredMessage`

```typescript
// Avant: parsing complexe en sections
const sections = parseMessageSections(content);

// Après: rendu direct avec collapse intelligent
return (
  <div className="space-y-1">
    <FormattedText content={visibleContent} />
    {needsCollapsing && !isExpanded && (
      <Button onClick={() => setIsExpanded(true)}>
        Voir plus
      </Button>
    )}
  </div>
);
```

### 3. ResponseMode dans MessageBubble

```typescript
interface MessageBubbleProps {
  // ... existing props
  responseMode?: ResponseMode; // NEW
}

// Adapter le comportement de collapse
const getCollapseThreshold = (mode: ResponseMode) => {
  switch (mode) {
    case 'short': return 150; // caractères
    case 'structured': return 400;
    case 'detailed': return 800;
  }
};
```

### 4. Sanitization renforcée edge function

```typescript
// Ajouter ces patterns
stripLeading(/^\s*[A-Z][a-z]+\s+[A-Z][a-z]+\s*:\s*/); // "Alex Kim:"
stripLeading(/^\s*(?:du point de vue de|selon)\s+[^,.\n]{1,40}[,.:]\s*/i);
```

---

## Fichiers à modifier

| Fichier | Type de modification |
|---------|---------------------|
| `src/components/ui/formatted-text.tsx` | Amélioration regex et parsing |
| `src/components/chat/StructuredMessage.tsx` | Simplification majeure |
| `src/components/chat/MessageBubble.tsx` | Props responseMode + adaptation visuelle |
| `src/components/ChatInterface.tsx` | Passage du responseMode aux composants |
| `supabase/functions/chat-ai/index.ts` | Sanitization renforcée |

---

## Résumé des améliorations UX

| Problème | Solution |
|----------|----------|
| Markdown mal rendu | Regex corrigées dans `FormattedText` |
| Sections artificielles | Suppression du parsing Insight/Reasoning/Conclusion |
| Icônes parasites | Nettoyage des emojis orphelins |
| Noms d'agents répétés | Sanitization renforcée côté edge function |
| Pas de différence Court/Détaillé | Collapse dynamique selon le mode |
| Texte trop long | Collapse intelligent adapté au mode sélectionné |
