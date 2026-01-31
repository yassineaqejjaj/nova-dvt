import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  Save, ArrowLeft, FileDown, FolderPlus, Calendar, Link2, 
  CheckCircle2, Sparkles, FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Epic, UserStory, ProductContextSummary } from './types';
import StoryCard from '../StoryCard';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

interface StepFinalizeProps {
  epic: Epic;
  context: ProductContextSummary | null;
  stories: UserStory[];
  onComplete: () => void;
  onBack: () => void;
}

const StepFinalize = ({ epic, context, stories, onComplete, onBack }: StepFinalizeProps) => {
  const [selectedStories, setSelectedStories] = useState<Set<string>>(
    new Set(stories.map(s => s.id))
  );
  const [isSaving, setIsSaving] = useState(false);
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());

  const toggleSelect = (storyId: string) => {
    setSelectedStories(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedStories.size === stories.length) {
      setSelectedStories(new Set());
    } else {
      setSelectedStories(new Set(stories.map(s => s.id)));
    }
  };

  const toggleExpand = (storyId: string) => {
    setExpandedStories(prev => {
      const next = new Set(prev);
      if (next.has(storyId)) {
        next.delete(storyId);
      } else {
        next.add(storyId);
      }
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedStories.size === 0) {
      toast.error('Sélectionnez au moins une story');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      const storiesToSave = stories.filter(s => selectedStories.has(s.id));

      // Save as artifact
      const { error } = await supabase
        .from('artifacts')
        .insert([{
          user_id: user.id,
          artifact_type: 'story' as const,
          title: `User Stories: ${epic.title}`,
          content: {
            type: 'user_stories',
            epic: {
              id: epic.id,
              title: epic.title,
              description: epic.description
            },
            stories: storiesToSave,
            context: context ? {
              id: context.id,
              name: context.name
            } : null,
            generatedAt: new Date().toISOString()
          } as any,
          metadata: {
            source_epic_id: epic.id,
            source_epic_title: epic.title,
            context_id: context?.id,
            context_name: context?.name,
            story_count: storiesToSave.length,
            total_points: storiesToSave.reduce((sum, s) => sum + s.effortPoints, 0),
            workflow_source: 'Epic to Stories Flow'
          }
        }]);

      if (error) throw error;

      toast.success(`${storiesToSave.length} stories enregistrées dans les artefacts`);
      onComplete();
    } catch (error: any) {
      console.error('Error saving stories:', error);
      toast.error('Échec de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const exportToCSV = () => {
    const storiesToExport = stories.filter(s => selectedStories.has(s.id));
    const headers = ['Titre', 'En tant que', 'Je veux', 'Afin de', 'Critères', 'Points', 'Priorité'];
    
    const rows = storiesToExport.map(story => [
      story.title,
      story.story.asA,
      story.story.iWant,
      story.story.soThat,
      story.acceptanceCriteria.join(' | '),
      story.effortPoints,
      story.priority
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `user-stories-${epic.title.slice(0, 30)}-${Date.now()}.csv`;
    link.click();
    toast.success('Export CSV réussi');
  };

  const exportToWord = async () => {
    const storiesToExport = stories.filter(s => selectedStories.has(s.id));

    try {
      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({
              text: `Epic: ${epic.title}`,
              heading: HeadingLevel.HEADING_1,
            }),
            new Paragraph({
              text: epic.description,
              spacing: { after: 400 }
            }),
            ...(context ? [
              new Paragraph({
                text: `Contexte: ${context.name}`,
                spacing: { after: 400 }
              })
            ] : []),
            new Paragraph({
              text: `User Stories (${storiesToExport.length})`,
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 600, after: 400 }
            }),
            ...storiesToExport.flatMap(story => [
              new Paragraph({
                text: story.title,
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400 }
              }),
              new Paragraph({
                children: [
                  new TextRun({ text: 'En tant que ', bold: true }),
                  new TextRun(story.story.asA),
                  new TextRun({ text: ', je veux ', bold: true }),
                  new TextRun(story.story.iWant),
                  new TextRun({ text: ', afin de ', bold: true }),
                  new TextRun(story.story.soThat)
                ]
              }),
              new Paragraph({
                children: [new TextRun({ text: 'Critères d\'acceptation:', bold: true })],
                spacing: { before: 200 }
              }),
              ...story.acceptanceCriteria.map(ac => 
                new Paragraph({ text: `• ${ac}` })
              ),
              new Paragraph({
                children: [
                  new TextRun({ text: `Points: ${story.effortPoints} | `, bold: true }),
                  new TextRun({ text: `Priorité: ${story.priority}`, bold: true })
                ],
                spacing: { after: 400, before: 200 }
              })
            ])
          ]
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `user-stories-${epic.title.slice(0, 30)}-${Date.now()}.docx`);
      toast.success('Export Word réussi');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Échec de l\'export');
    }
  };

  const selectedCount = selectedStories.size;
  const totalPoints = stories
    .filter(s => selectedStories.has(s.id))
    .reduce((sum, s) => sum + s.effortPoints, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Finaliser et enregistrer
        </CardTitle>
        <CardDescription>
          Sélectionnez les stories à conserver et choisissez la destination
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selection header */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={selectedStories.size === stories.length}
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <Label htmlFor="select-all" className="cursor-pointer">
              {selectedCount} / {stories.length} stories sélectionnées
            </Label>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary">{totalPoints} points</Badge>
            <Badge variant="outline">~{Math.ceil(totalPoints / 20)} sprints</Badge>
          </div>
        </div>

        {/* Stories list with checkboxes */}
        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
          {stories.map((story) => (
            <div
              key={story.id}
              className={`transition-opacity ${!selectedStories.has(story.id) ? 'opacity-50' : ''}`}
            >
              <StoryCard
                story={story}
                expanded={expandedStories.has(story.id)}
                onToggleExpand={() => toggleExpand(story.id)}
                onToggleInclude={(included) => {
                  if (included) {
                    setSelectedStories(prev => new Set([...prev, story.id]));
                  } else {
                    setSelectedStories(prev => {
                      const next = new Set(prev);
                      next.delete(story.id);
                      return next;
                    });
                  }
                }}
                showCheckbox
                isIncluded={selectedStories.has(story.id)}
              />
            </div>
          ))}
        </div>

        {/* Traceability info */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
          <p className="text-sm font-medium text-primary flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Traçabilité conservée
          </p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Epic source: <span className="text-foreground">{epic.title}</span></p>
            {context && (
              <p>• Contexte: <span className="text-foreground">{context.name}</span></p>
            )}
            <p>• Généré le: <span className="text-foreground">{new Date().toLocaleDateString('fr-FR')}</span></p>
          </div>
        </div>

        {/* Export options */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <FileDown className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToWord}>
            <FileText className="h-4 w-4 mr-2" />
            Exporter Word
          </Button>
        </div>

        {/* Next steps hint */}
        <div className="p-4 rounded-lg border bg-card">
          <p className="text-sm font-medium mb-2">Prochaines étapes possibles</p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <FolderPlus className="h-3 w-3" />
              Lier à un projet
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Calendar className="h-3 w-3" />
              Planifier en sprint
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Générer spéc technique
            </Badge>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <Button onClick={handleSave} disabled={isSaving || selectedCount === 0}>
            {isSaving ? (
              <>Enregistrement...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer {selectedCount} stories
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepFinalize;
