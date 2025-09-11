import React, { useState, useRef } from 'react';
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
  CheckCircle,
  Upload,
  FileText,
  X
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
  formFields?: Array<{
    name: string;
    label: string;
    type: 'input' | 'textarea' | 'select';
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
}

interface UploadedDocument {
  name: string;
  content: string;
  size: number;
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
    color: 'bg-agent-blue',
    formFields: [
      { name: 'timeline', label: 'Project Timeline', type: 'input', placeholder: 'e.g., 3 months', required: true },
      { name: 'budget', label: 'Budget Constraints', type: 'input', placeholder: 'Budget limitations' },
      { name: 'stakeholders', label: 'Key Stakeholders', type: 'textarea', placeholder: 'List key stakeholders and their priorities' }
    ]
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
    color: 'bg-agent-green',
    formFields: [
      { name: 'industry', label: 'Industry/Market', type: 'input', placeholder: 'e.g., SaaS, E-commerce', required: true },
      { name: 'company_size', label: 'Company Size', type: 'select', options: ['Startup', 'Small (1-50)', 'Medium (51-500)', 'Large (500+)'] },
      { name: 'competitors', label: 'Main Competitors', type: 'textarea', placeholder: 'List 3-5 main competitors' }
    ]
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
    color: 'bg-agent-purple',
    formFields: [
      { name: 'business_type', label: 'Business Type', type: 'select', options: ['B2B', 'B2C', 'B2B2C', 'Marketplace'], required: true },
      { name: 'revenue_model', label: 'Revenue Model', type: 'select', options: ['Subscription', 'One-time', 'Freemium', 'Commission', 'Advertising'] },
      { name: 'target_market', label: 'Target Market Size', type: 'input', placeholder: 'Estimated market size' }
    ]
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
    color: 'bg-agent-orange',
    formFields: [
      { name: 'initiatives', label: 'Initiatives to Evaluate', type: 'textarea', placeholder: 'List initiatives separated by lines', required: true },
      { name: 'team_size', label: 'Team Size', type: 'input', placeholder: 'Number of team members' },
      { name: 'timeframe', label: 'Evaluation Timeframe', type: 'select', options: ['Quarter', 'Half-year', 'Year'] }
    ]
  }
];

export const CanvasGenerator: React.FC<CanvasGeneratorProps> = ({
  open,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CanvasTemplate | null>(null);
  const [projectContext, setProjectContext] = useState('');
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [generatedCanvas, setGeneratedCanvas] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const uploadPromises = Array.from(files).map(async (file) => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error(`File ${file.name} is too large (max 5MB)`);
        return null;
      }

      try {
        const text = await file.text();
        return {
          name: file.name,
          content: text.substring(0, 10000), // Limit content to prevent token overflow
          size: file.size
        } as UploadedDocument;
      } catch (error) {
        toast.error(`Failed to read file ${file.name}`);
        return null;
      }
    });

    const uploadedDocs = (await Promise.all(uploadPromises)).filter(Boolean) as UploadedDocument[];
    setDocuments(prev => [...prev, ...uploadedDocs]);
    
    if (uploadedDocs.length > 0) {
      toast.success(`Uploaded ${uploadedDocs.length} document(s)`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
    toast.success('Document removed');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateCanvas = async () => {
    if (!selectedTemplate || !projectContext.trim()) {
      toast.error('Please select a template and provide project context');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('canvas-generator', {
        body: {
          template: selectedTemplate,
          projectContext,
          formData,
          documents
        }
      });

      if (error) throw error;

      if (data.canvas) {
        setGeneratedCanvas(data.canvas);
        toast.success(`${selectedTemplate.name} generated successfully!`);
      } else {
        throw new Error('No canvas data received');
      }
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
              <div className="space-y-6">
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

                {/* Custom form fields for selected template */}
                {selectedTemplate.formFields && selectedTemplate.formFields.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-md font-semibold">Additional Information</h4>
                    {selectedTemplate.formFields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {field.type === 'input' && (
                          <Input
                            id={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                          />
                        )}
                        {field.type === 'textarea' && (
                          <Textarea
                            id={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                            rows={3}
                          />
                        )}
                        {field.type === 'select' && field.options && (
                          <select
                            id={field.name}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData[field.name] || ''}
                            onChange={(e) => updateFormData(field.name, e.target.value)}
                          >
                            <option value="">Select an option...</option>
                            {field.options.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Document upload section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold">Supporting Documents</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      type="button"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.md,.csv,.json,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {documents.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Uploaded documents will be analyzed to enhance canvas generation
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{doc.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(doc.size / 1024).toFixed(1)} KB)
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                    setFormData({});
                    setDocuments([]);
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