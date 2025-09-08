import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Target, 
  TrendingUp, 
  Users, 
  Zap,
  Grid3X3,
  Download,
  Copy,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CanvasGeneratorProps {
  open: boolean;
  onClose: () => void;
}

interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: string[];
  prompts: Record<string, string>;
  color: string;
}

const canvasTemplates: CanvasTemplate[] = [
  {
    id: 'moscow',
    name: 'MoSCoW Prioritization',
    description: 'Prioritize features using Must have, Should have, Could have, Won\'t have',
    icon: <Target className="w-6 h-6" />,
    sections: ['Must Have', 'Should Have', 'Could Have', 'Won\'t Have'],
    prompts: {
      'Must Have': 'What features are critical for launch?',
      'Should Have': 'What features are important but not critical?',
      'Could Have': 'What would be nice to have if time permits?',
      'Won\'t Have': 'What are we explicitly not doing this time?'
    },
    color: 'bg-agent-blue'
  },
  {
    id: 'swot',
    name: 'SWOT Analysis',
    description: 'Analyze Strengths, Weaknesses, Opportunities, and Threats',
    icon: <TrendingUp className="w-6 h-6" />,
    sections: ['Strengths', 'Weaknesses', 'Opportunities', 'Threats'],
    prompts: {
      'Strengths': 'What advantages do we have?',
      'Weaknesses': 'What areas need improvement?',
      'Opportunities': 'What market opportunities exist?',
      'Threats': 'What external threats should we consider?'
    },
    color: 'bg-agent-green'
  },
  {
    id: 'business-model',
    name: 'Business Model Canvas',
    description: 'Map out your business model across 9 key building blocks',
    icon: <Grid3X3 className="w-6 h-6" />,
    sections: [
      'Key Partners', 'Key Activities', 'Key Resources', 'Value Propositions',
      'Customer Relationships', 'Channels', 'Customer Segments', 'Cost Structure', 'Revenue Streams'
    ],
    prompts: {
      'Key Partners': 'Who are our key partners and suppliers?',
      'Key Activities': 'What key activities does our business require?',
      'Key Resources': 'What key resources does our business require?',
      'Value Propositions': 'What value do we deliver to customers?',
      'Customer Relationships': 'What type of relationship do we have with customers?',
      'Channels': 'How do we reach and deliver to customers?',
      'Customer Segments': 'Who are we creating value for?',
      'Cost Structure': 'What are the most important costs in our business?',
      'Revenue Streams': 'For what value are customers willing to pay?'
    },
    color: 'bg-agent-purple'
  },
  {
    id: 'rice',
    name: 'RICE Scoring',
    description: 'Prioritize initiatives using Reach, Impact, Confidence, Effort',
    icon: <Zap className="w-6 h-6" />,
    sections: ['Initiative', 'Reach', 'Impact', 'Confidence', 'Effort', 'RICE Score'],
    prompts: {
      'Initiative': 'What initiative are you evaluating?',
      'Reach': 'How many people will this impact? (per quarter)',
      'Impact': 'What impact will this have? (3=massive, 2=high, 1=medium, 0.5=low, 0.25=minimal)',
      'Confidence': 'How confident are you? (100%=high, 80%=medium, 50%=low)',
      'Effort': 'How much effort is required? (person-months)',
      'RICE Score': 'Calculated automatically: (Reach × Impact × Confidence) / Effort'
    },
    color: 'bg-agent-orange'
  }
];

export const CanvasGenerator: React.FC<CanvasGeneratorProps> = ({
  open,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate | null>(null);
  const [projectContext, setProjectContext] = useState('');
  const [generatedCanvas, setGeneratedCanvas] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCanvas = async () => {
    if (!selectedTemplate || !projectContext.trim()) {
      toast.error('Please select a template and provide project context');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('chat-ai', {
        body: {
          prompt: `Generate a ${selectedTemplate.name} for the following project context:

PROJECT CONTEXT: ${projectContext}

Please provide structured content for each section of the ${selectedTemplate.name}:
${selectedTemplate.sections.map(section => `- ${section}: ${selectedTemplate.prompts[section] || 'Provide relevant content for this section'}`).join('\n')}

Respond with a JSON object where each key is a section name and the value is the generated content for that section. Keep each section concise but actionable (2-4 bullet points or short paragraphs).

Example format:
{
  "Section 1": "• Point 1\n• Point 2\n• Point 3",
  "Section 2": "Content for section 2..."
}`,
          messages: []
        }
      });

      if (error) throw error;

      let generatedData;
      try {
        const responseText = data.response || data.generatedText || '';
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          generatedData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('JSON parsing error:', parseError);
        // Fallback generation
        generatedData = selectedTemplate.sections.reduce((acc, section) => {
          acc[section] = `Generated content for ${section} based on: ${projectContext}`;
          return acc;
        }, {} as Record<string, string>);
      }

      setGeneratedCanvas(generatedData);
      toast.success(`${selectedTemplate.name} generated successfully!`);
    } catch (error) {
      console.error('Error generating canvas:', error);
      toast.error('Failed to generate canvas. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCanvas = () => {
    const content = Object.entries(generatedCanvas)
      .map(([section, content]) => `${section}:\n${content}\n`)
      .join('\n');
    
    navigator.clipboard.writeText(content);
    toast.success('Canvas copied to clipboard!');
  };

  const exportCanvas = () => {
    const content = Object.entries(generatedCanvas)
      .map(([section, content]) => `${section}:\n${content}\n`)
      .join('\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate?.name.replace(/\s+/g, '_')}_Canvas.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Canvas exported successfully!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Grid3X3 className="w-5 h-5 text-primary" />
            <span>Multi-Canvas Generator</span>
          </DialogTitle>
        </DialogHeader>

        {!selectedTemplate ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Choose a Framework</h3>
              <p className="text-muted-foreground mb-4">
                Select a product management framework to generate a structured canvas
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {canvasTemplates.map((template) => (
                <Card 
                  key={template.id} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${template.color} text-white`}>
                        {template.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {template.sections.slice(0, 4).map((section) => (
                        <Badge key={section} variant="outline" className="text-xs">
                          {section}
                        </Badge>
                      ))}
                      {template.sections.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.sections.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${selectedTemplate.color} text-white`}>
                  {selectedTemplate.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedTemplate.name}</h3>
                  <p className="text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                Back to Templates
              </Button>
            </div>

            {Object.keys(generatedCanvas).length === 0 ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="context">Project Context</Label>
                  <Textarea
                    id="context"
                    placeholder="Describe your project, product, or initiative that you want to analyze using this framework..."
                    value={projectContext}
                    onChange={(e) => setProjectContext(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button 
                  onClick={generateCanvas} 
                  disabled={isGenerating || !projectContext.trim()}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Canvas...
                    </>
                  ) : (
                    <>
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      Generate {selectedTemplate.name}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold">Generated Canvas</h4>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={copyCanvas}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportCanvas}>
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(generatedCanvas).map(([section, content]) => (
                    <Card key={section}>
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>{section}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm whitespace-pre-line">{content}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setGeneratedCanvas({});
                    setProjectContext('');
                  }}
                  className="w-full"
                >
                  Generate New Canvas
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};