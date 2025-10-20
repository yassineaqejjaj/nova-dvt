import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileText, Sparkles, Loader2, Save, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ReleaseNotes {
  version: string;
  releaseDate: string;
  headline: string;
  summary: string;
  newFeatures: { title: string; description: string }[];
  improvements: { title: string; description: string }[];
  bugFixes: { title: string; description: string }[];
  breakingChanges: { title: string; description: string }[];
  upgradeInstructions: string[];
  markdown: string;
}

export const ReleaseNotesGenerator = () => {
  const [version, setVersion] = useState("");
  const [changes, setChanges] = useState("");
  const [targetAudience, setTargetAudience] = useState("users");
  const [isGenerating, setIsGenerating] = useState(false);
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNotes | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateReleaseNotes = async () => {
    if (!version.trim() || !changes.trim()) {
      toast.error("Veuillez remplir la version et les changements");
      return;
    }

    setIsGenerating(true);
    try {
      const audienceContext = targetAudience === 'technical' 
        ? 'technique, incluant des détails d\'implémentation'
        : 'grand public, avec des explications simples et centrées sur les bénéfices utilisateur';

      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          message: `Version: ${version}
Audience: ${audienceContext}

Changements:
${changes}

Génère des release notes professionnelles et structurées (JSON uniquement):
{
  "version": "${version}",
  "releaseDate": "${new Date().toLocaleDateString('fr-FR')}",
  "headline": "Titre accrocheur pour cette release (1 phrase)",
  "summary": "Résumé des changements principaux (2-3 phrases)",
  "newFeatures": [
    {
      "title": "Nom de la fonctionnalité",
      "description": "Description détaillée du bénéfice utilisateur"
    }
  ],
  "improvements": [
    {
      "title": "Amélioration",
      "description": "Description de l'amélioration"
    }
  ],
  "bugFixes": [
    {
      "title": "Correction",
      "description": "Description du bug corrigé"
    }
  ],
  "breakingChanges": [
    {
      "title": "Changement cassant (si applicable)",
      "description": "Impact et migration nécessaire"
    }
  ],
  "upgradeInstructions": ["Instruction 1", "Instruction 2"]
}`,
          mode: 'simple'
        }
      });

      if (error) throw error;

      const content = data?.response || data;
      let jsonString = typeof content === 'string' ? content : JSON.stringify(content);
      jsonString = jsonString.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = jsonString.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonString = jsonMatch[0];
      
      const result = JSON.parse(jsonString);
      
      // Generate markdown
      const markdown = generateMarkdown(result);
      setReleaseNotes({ ...result, markdown });
      toast.success("Release notes générées avec succès!");
    } catch (error) {
      console.error('Error generating release notes:', error);
      toast.error("Erreur lors de la génération des release notes");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMarkdown = (notes: Omit<ReleaseNotes, 'markdown'>) => {
    let md = `# ${notes.headline}\n\n`;
    md += `**Version ${notes.version}** - ${notes.releaseDate}\n\n`;
    md += `${notes.summary}\n\n`;

    if (notes.newFeatures?.length > 0) {
      md += `## ✨ Nouvelles Fonctionnalités\n\n`;
      notes.newFeatures.forEach(f => {
        md += `### ${f.title}\n${f.description}\n\n`;
      });
    }

    if (notes.improvements?.length > 0) {
      md += `## 🚀 Améliorations\n\n`;
      notes.improvements.forEach(i => {
        md += `- **${i.title}**: ${i.description}\n`;
      });
      md += '\n';
    }

    if (notes.bugFixes?.length > 0) {
      md += `## 🐛 Corrections de Bugs\n\n`;
      notes.bugFixes.forEach(b => {
        md += `- **${b.title}**: ${b.description}\n`;
      });
      md += '\n';
    }

    if (notes.breakingChanges?.length > 0) {
      md += `## ⚠️ Changements Cassants\n\n`;
      notes.breakingChanges.forEach(c => {
        md += `### ${c.title}\n${c.description}\n\n`;
      });
    }

    if (notes.upgradeInstructions?.length > 0) {
      md += `## 📋 Instructions de Mise à Jour\n\n`;
      notes.upgradeInstructions.forEach((inst, i) => {
        md += `${i + 1}. ${inst}\n`;
      });
    }

    return md;
  };

  const copyToClipboard = async () => {
    if (!releaseNotes) return;
    
    try {
      await navigator.clipboard.writeText(releaseNotes.markdown);
      setCopied(true);
      toast.success("Copié dans le presse-papier!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Erreur lors de la copie");
    }
  };

  const saveAsArtifact = async () => {
    if (!releaseNotes) {
      toast.error("Aucune release note à sauvegarder");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from('artifacts').insert({
        user_id: user.id,
        artifact_type: 'canvas' as const,
        title: `Release Notes v${releaseNotes.version}`,
        content: { ...releaseNotes, changes, targetAudience },
        metadata: { type: 'release-notes', version: releaseNotes.version, generatedAt: new Date().toISOString() }
      } as any);

      if (error) throw error;
      toast.success("Release notes sauvegardées dans les artifacts!");
    } catch (error) {
      console.error('Error saving artifact:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Release Notes Generator
          </h1>
          <p className="text-muted-foreground mt-2">
            Générez des release notes professionnelles pour chaque version de votre produit
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations de Release</CardTitle>
          <CardDescription>
            Décrivez les changements de cette version
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Numéro de version *</label>
              <Input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="Ex: 2.5.0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Audience cible</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="users">Utilisateurs finaux</option>
                <option value="technical">Audience technique</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Changements de cette version *</label>
            <Textarea
              value={changes}
              onChange={(e) => setChanges(e.target.value)}
              placeholder="Listez les changements, nouvelles fonctionnalités, améliorations et corrections...
Ex:
- Ajout d'un système de notifications en temps réel
- Amélioration des performances du dashboard
- Correction du bug d'affichage sur mobile"
              rows={10}
            />
          </div>

          <Button
            onClick={generateReleaseNotes}
            disabled={isGenerating || !version.trim() || !changes.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Génération en cours...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Générer les Release Notes
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {releaseNotes && (
        <>
          <div className="flex gap-2">
            <Button onClick={saveAsArtifact} disabled={isSaving} variant="outline">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Sauvegarder
            </Button>
            <Button onClick={copyToClipboard} variant="outline">
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              Copier Markdown
            </Button>
          </div>

          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Aperçu</TabsTrigger>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="bg-gradient-primary text-white">
                  <CardTitle className="text-2xl">{releaseNotes.headline}</CardTitle>
                  <CardDescription className="text-white/80">
                    Version {releaseNotes.version} - {releaseNotes.releaseDate}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <p className="text-muted-foreground">{releaseNotes.summary}</p>

                  {releaseNotes.newFeatures?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-4">✨ Nouvelles Fonctionnalités</h3>
                        <div className="space-y-4">
                          {releaseNotes.newFeatures.map((feature, i) => (
                            <Card key={i} className="bg-muted/50">
                              <CardHeader>
                                <CardTitle className="text-base">{feature.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {releaseNotes.improvements?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">🚀 Améliorations</h3>
                        <ul className="space-y-2">
                          {releaseNotes.improvements.map((improvement, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <div>
                                <span className="font-medium">{improvement.title}:</span>{' '}
                                <span className="text-muted-foreground">{improvement.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {releaseNotes.bugFixes?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">🐛 Corrections de Bugs</h3>
                        <ul className="space-y-2">
                          {releaseNotes.bugFixes.map((fix, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-primary font-bold">•</span>
                              <div>
                                <span className="font-medium">{fix.title}:</span>{' '}
                                <span className="text-muted-foreground">{fix.description}</span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}

                  {releaseNotes.breakingChanges?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3 text-destructive">⚠️ Changements Cassants</h3>
                        <div className="space-y-3">
                          {releaseNotes.breakingChanges.map((change, i) => (
                            <Card key={i} className="border-destructive/50 bg-destructive/5">
                              <CardHeader>
                                <CardTitle className="text-sm text-destructive">{change.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm">{change.description}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {releaseNotes.upgradeInstructions?.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-lg font-semibold mb-3">📋 Instructions de Mise à Jour</h3>
                        <ol className="space-y-2 list-decimal list-inside">
                          {releaseNotes.upgradeInstructions.map((instruction, i) => (
                            <li key={i} className="text-muted-foreground">{instruction}</li>
                          ))}
                        </ol>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="markdown" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{releaseNotes.markdown}</code>
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
