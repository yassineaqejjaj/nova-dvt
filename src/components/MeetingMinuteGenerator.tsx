import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Upload, 
  FileText, 
  Loader2, 
  CheckCircle, 
  Edit, 
  Link, 
  X,
  Clock,
  Users,
  AlertCircle,
  Lightbulb,
  Target,
  MessageSquare
} from 'lucide-react';

interface MeetingElement {
  id: string;
  type: 'decision' | 'action' | 'question' | 'insight' | 'risk' | 'idea';
  content: string;
  confidence: number;
  rationale?: string;
  assignedTo?: string;
  deadline?: string;
  source_quote?: string;
  timestamp?: string;
  link?: string;
  linked_to?: { type: string; id: string; confidence: number }[];
  status: 'pending' | 'validated' | 'ignored';
}

interface MeetingData {
  title: string;
  date: string;
  duration: number;
  participants: string[];
  transcript: string;
  summary: string;
  elements: MeetingElement[];
}

export const MeetingMinuteGenerator: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'complete'>('upload');
  const [uploadType, setUploadType] = useState<'file' | 'paste' | 'url'>('paste');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);

  const handleEditElement = (id: string) => {
    setMeetingData(prev => {
      if (!prev) return prev;
      const current = prev.elements.find(e => e.id === id);
      const updatedContent = prompt('Modifier l\'élément :', current?.content || '');
      if (updatedContent === null) return prev;
      return {
        ...prev,
        elements: prev.elements.map(e => e.id === id ? { ...e, content: updatedContent } : e)
      };
    });
  };

  const handleLinkElement = (id: string) => {
    const link = prompt('Ajouter un lien (URL ou référence) :', '');
    if (!link) return;
    setMeetingData(prev => prev ? {
      ...prev,
      elements: prev.elements.map(e => e.id === id ? { ...e, link } : e)
    } : prev);
  };

  const handleIgnoreElement = (id: string) => {
    setMeetingData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        elements: prev.elements.filter(e => e.id !== id)
      };
    });
    setSelectedElements(prev => prev.filter(eid => eid !== id));
    toast.success('Élément ignoré');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        'text/plain',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'audio/mpeg',
        'audio/mp4',
        'audio/wav',
        'audio/x-m4a'
      ];
      
      if (validTypes.includes(file.type)) {
        setSelectedFile(file);
        toast.success(`File selected: ${file.name}`);
      } else {
        toast.error('Invalid file type. Please upload .txt, .docx, .pdf, or audio files.');
      }
    }
  };

  const processTranscription = async () => {
    setStep('processing');
    setProcessingProgress(10);

    try {
      let transcriptText = '';
      
      // Handle different input types
      if (uploadType === 'paste') {
        transcriptText = textInput;
        setProcessingProgress(30);
      } else if (uploadType === 'file' && selectedFile) {
        // For audio files, transcribe
        if (selectedFile.type.startsWith('audio/')) {
          toast.info('Transcribing audio... This may take a few minutes.');
          setProcessingProgress(20);
          
          const reader = new FileReader();
          const audioBase64 = await new Promise<string>((resolve) => {
            reader.onload = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]);
            };
            reader.readAsDataURL(selectedFile);
          });

          const { data: transcriptData, error: transcriptError } = await supabase.functions.invoke(
            'transcribe-audio',
            { body: { audio: audioBase64 } }
          );

          if (transcriptError) throw transcriptError;
          transcriptText = transcriptData.text;
          setProcessingProgress(50);
        } else {
          // For text files, read content
          const text = await selectedFile.text();
          transcriptText = text;
          setProcessingProgress(30);
        }
      }

      // Extract meeting elements using AI
      toast.info('Analyzing meeting content with AI...');
      setProcessingProgress(60);

      const { data: analysisData, error: analysisError } = await supabase.functions.invoke(
        'extract-meeting-elements',
        { 
          body: { 
            transcript: transcriptText,
            meetingTitle: `Meeting - ${new Date().toLocaleDateString()}`
          } 
        }
      );

      if (analysisError) throw analysisError;

      setProcessingProgress(90);

      // Format the data
      const elements: MeetingElement[] = [
        ...(analysisData.decisions || []).map((d: any) => ({ id: d.id ?? crypto.randomUUID(), ...d, type: 'decision', status: 'pending' })),
        ...(analysisData.actions || []).map((a: any) => ({ id: a.id ?? crypto.randomUUID(), ...a, type: 'action', status: 'pending' })),
        ...(analysisData.questions || []).map((q: any) => ({ id: q.id ?? crypto.randomUUID(), ...q, type: 'question', status: 'pending' })),
        ...(analysisData.insights || []).map((i: any) => ({ id: i.id ?? crypto.randomUUID(), ...i, type: 'insight', status: 'pending' })),
        ...(analysisData.risks || []).map((r: any) => ({ id: r.id ?? crypto.randomUUID(), ...r, type: 'risk', status: 'pending' })),
        ...(analysisData.ideas || []).map((i: any) => ({ id: i.id ?? crypto.randomUUID(), ...i, type: 'idea', status: 'pending' }))
      ];

      setMeetingData({
        title: analysisData.title || `Meeting - ${new Date().toLocaleDateString()}`,
        date: new Date().toISOString(),
        duration: analysisData.duration || 60,
        participants: analysisData.participants || [],
        transcript: transcriptText,
        summary: analysisData.summary || '',
        elements
      });

      setProcessingProgress(100);
      setStep('review');
      toast.success('Meeting analysis complete!');

    } catch (error: any) {
      console.error('Processing error:', error);
      toast.error(error.message || 'Failed to process meeting');
      setStep('upload');
      setProcessingProgress(0);
    }
  };

  const toggleElement = (id: string) => {
    setSelectedElements(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleValidateAll = async () => {
    if (!meetingData) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Extract decisions and actions for user stories
      const decisions = meetingData.elements.filter(e => e.type === 'decision' && (selectedElements.length === 0 || selectedElements.includes(e.id)));
      const actions = meetingData.elements.filter(e => e.type === 'action' && (selectedElements.length === 0 || selectedElements.includes(e.id)));

      // Convert decisions and actions to user stories
      const stories = [
        ...decisions.map((d, i) => ({
          id: crypto.randomUUID(),
          epicId: 'meeting-' + Date.now(),
          title: `Décision: ${d.content.substring(0, 50)}`,
          story: {
            asA: 'membre de l\'équipe',
            iWant: d.content,
            soThat: d.rationale || 'implémenter la décision prise'
          },
          acceptanceCriteria: [d.content],
          effortPoints: 3,
          priority: 'high' as const,
          dependencies: [],
          status: 'draft' as const,
          tags: ['meeting', 'decision']
        })),
        ...actions.map((a, i) => ({
          id: crypto.randomUUID(),
          epicId: 'meeting-' + Date.now(),
          title: `Action: ${a.content.substring(0, 50)}`,
          story: {
            asA: a.assignedTo || 'membre de l\'équipe',
            iWant: a.content,
            soThat: 'compléter l\'action assignée'
          },
          acceptanceCriteria: [a.content],
          effortPoints: 2,
          priority: 'medium' as const,
          dependencies: [],
          status: 'draft' as const,
          tags: ['meeting', 'action']
        }))
      ];

      // Save meeting artifact with stories
      const { error: artifactError } = await supabase
        .from('artifacts')
        .insert([{
          user_id: user.id,
          artifact_type: 'canvas' as const,
          title: meetingData.title,
          content: {
            type: 'meeting_minutes',
            summary: meetingData.summary,
            elements: meetingData.elements.filter(e => 
              selectedElements.length === 0 || selectedElements.includes(e.id)
            ),
            userStories: stories,
            transcript: meetingData.transcript,
            participants: meetingData.participants,
            date: meetingData.date,
            duration: meetingData.duration
          } as any
        }]);

      if (artifactError) throw artifactError;

      setStep('complete');
      toast.success(`Compte-rendu sauvegardé avec ${stories.length} user stories générées !`);

    } catch (error: any) {
      console.error('Erreur de sauvegarde:', error);
      toast.error('Échec de sauvegarde du compte-rendu');
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'decision': return <Target className="w-4 h-4" />;
      case 'action': return <CheckCircle className="w-4 h-4" />;
      case 'question': return <MessageSquare className="w-4 h-4" />;
      case 'insight': return <Lightbulb className="w-4 h-4" />;
      case 'risk': return <AlertCircle className="w-4 h-4" />;
      case 'idea': return <Lightbulb className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 80) return <Badge className="bg-green-500">✓ High</Badge>;
    if (confidence >= 60) return <Badge className="bg-yellow-500">⚠️ Medium</Badge>;
    return <Badge className="bg-gray-500">? Low</Badge>;
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <Tabs value={uploadType} onValueChange={(v) => setUploadType(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paste">Coller le texte</TabsTrigger>
          <TabsTrigger value="file">Charger un fichier</TabsTrigger>
          <TabsTrigger value="url">Google Meet</TabsTrigger>
        </TabsList>

        <TabsContent value="paste" className="space-y-4">
          <Textarea
            placeholder="Collez la transcription de votre réunion ici..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="min-h-[300px]"
          />
        </TabsContent>

        <TabsContent value="file" className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".txt,.docx,.pdf,.mp3,.m4a,.wav"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {selectedFile ? selectedFile.name : 'Cliquez pour télécharger ou glissez-déposez'}
              </p>
              <p className="text-xs text-muted-foreground">
                Formats supportés : .txt, .docx, .pdf, .mp3, .m4a, .wav
              </p>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Collez le lien vers votre document de transcription Google Meet
          </p>
          <Textarea
            placeholder="https://docs.google.com/document/d/..."
            className="min-h-[100px]"
          />
        </TabsContent>
      </Tabs>

      <Button
        onClick={processTranscription}
        disabled={
          (uploadType === 'paste' && !textInput) ||
          (uploadType === 'file' && !selectedFile)
        }
        size="lg"
        className="w-full"
      >
        <Loader2 className="w-4 h-4 mr-2" />
        Analyser la réunion
      </Button>
    </div>
  );

  const renderProcessingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center">
        <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin text-primary" />
        <h3 className="text-lg font-semibold mb-2">Traitement de la réunion...</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {processingProgress < 50
            ? 'Transcription audio...'
            : 'Extraction des éléments clés avec l\'IA...'}
        </p>
        <Progress value={processingProgress} className="w-full" />
        <p className="text-xs text-muted-foreground mt-2">{processingProgress}%</p>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    if (!meetingData) return null;

    const groupedElements = {
      decision: meetingData.elements.filter(e => e.type === 'decision'),
      action: meetingData.elements.filter(e => e.type === 'action'),
      question: meetingData.elements.filter(e => e.type === 'question'),
      insight: meetingData.elements.filter(e => e.type === 'insight'),
      risk: meetingData.elements.filter(e => e.type === 'risk'),
      idea: meetingData.elements.filter(e => e.type === 'idea')
    };

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{meetingData.title}</CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {meetingData.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {meetingData.participants.length} participants
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="font-medium mb-2">🎯 AI Summary</h4>
              <p className="text-sm text-muted-foreground">{meetingData.summary}</p>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="decisions" className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="decisions">
              Décisions ({groupedElements.decision.length})
            </TabsTrigger>
            <TabsTrigger value="actions">
              Actions ({groupedElements.action.length})
            </TabsTrigger>
            <TabsTrigger value="questions">
              Questions ({groupedElements.question.length})
            </TabsTrigger>
            <TabsTrigger value="insights">
              Insights ({groupedElements.insight.length})
            </TabsTrigger>
            <TabsTrigger value="risks">
              Risques ({groupedElements.risk.length})
            </TabsTrigger>
            <TabsTrigger value="ideas">
              Idées ({groupedElements.idea.length})
            </TabsTrigger>
          </TabsList>

          {Object.entries(groupedElements).map(([type, elements]) => (
            <TabsContent key={type} value={`${type}s`} className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold capitalize">
                  {type === 'decision' ? 'Décisions' : 
                   type === 'action' ? 'Actions' : 
                   type === 'question' ? 'Questions' : 
                   type === 'insight' ? 'Insights' : 
                   type === 'risk' ? 'Risques' : 'Idées'}
                </h3>
                <Button variant="outline" size="sm" onClick={handleValidateAll}>
                  Tout valider
                </Button>
              </div>

              {elements.map((element) => (
                <Card key={element.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedElements.includes(element.id)}
                        onCheckedChange={() => toggleElement(element.id)}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getElementIcon(element.type)}
                            <p className="font-medium">{element.content}</p>
                          </div>
                          {getConfidenceBadge(element.confidence)}
                        </div>

                        {element.rationale && (
                          <p className="text-sm text-muted-foreground">
                            <strong>Justification :</strong> {element.rationale}
                          </p>
                        )}

                        {element.assignedTo && (
                          <p className="text-sm">
                            <strong>Assigné à :</strong> {element.assignedTo}
                            {element.deadline && ` | Échéance : ${element.deadline}`}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditElement(element.id)}>
                            <Edit className="w-3 h-3 mr-1" />
                            Éditer
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleLinkElement(element.id)}>
                            <Link className="w-3 h-3 mr-1" />
                            Lier
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleIgnoreElement(element.id)}>
                            <X className="w-3 h-3 mr-1" />
                            Ignorer
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {elements.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No {type}s detected
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex gap-3">
          <Button onClick={() => setStep('upload')} variant="outline" className="flex-1">
            Retour
          </Button>
          <Button onClick={handleValidateAll} className="flex-1">
            <CheckCircle className="w-4 h-4 mr-2" />
            Valider et Intégrer
          </Button>
        </div>
      </div>
    );
  };

      const renderCompleteStep = () => (
    <div className="text-center space-y-6 py-8">
      <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-white" />
      </div>
      <div>
        <h3 className="text-2xl font-bold mb-2">Compte-rendu sauvegardé !</h3>
        <p className="text-muted-foreground">
          Votre réunion a été analysée et sauvegardée dans vos artefacts.
        </p>
      </div>
      <div className="flex gap-3 justify-center">
        <Button onClick={() => {
          setStep('upload');
          setMeetingData(null);
          setSelectedElements([]);
          setTextInput('');
          setSelectedFile(null);
        }}>
          Traiter une autre réunion
        </Button>
        <Button variant="outline">
          Voir les artefacts
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Meeting Minute Generator</h1>
        <p className="text-muted-foreground">
          Transform meeting recordings and transcripts into structured, actionable insights with AI
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {step === 'upload' && renderUploadStep()}
          {step === 'processing' && renderProcessingStep()}
          {step === 'review' && renderReviewStep()}
          {step === 'complete' && renderCompleteStep()}
        </CardContent>
      </Card>
    </div>
  );
};
