import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, FileCode, Database, Cpu, Copy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export const CodeGenerator: React.FC = () => {
  const [language, setLanguage] = useState('typescript');
  const [framework, setFramework] = useState('react');
  const [generatedCode, setGeneratedCode] = useState('');

  const templates = [
    { name: 'React Component', lang: 'typescript', code: 'export const MyComponent = () => {\n  return <div>Hello World</div>;\n};' },
    { name: 'API Endpoint', lang: 'typescript', code: 'export async function handler(req, res) {\n  res.json({ message: "Hello" });\n}' },
    { name: 'Database Schema', lang: 'sql', code: 'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email TEXT UNIQUE\n);' },
    { name: 'Test Case', lang: 'typescript', code: 'describe("MyComponent", () => {\n  it("renders", () => {\n    expect(true).toBe(true);\n  });\n});' },
  ];

  const handleGenerate = () => {
    const mockCode = `// Generated ${framework} code
import React from 'react';

export const GeneratedComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h1>Generated Component</h1>
      <p>This was auto-generated!</p>
    </div>
  );
};

export default GeneratedComponent;`;
    
    setGeneratedCode(mockCode);
    toast.success('Code generated successfully!');
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success('Code copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold flex items-center space-x-2 mb-2">
          <Code className="w-8 h-8 text-primary" />
          <span>Code Generator</span>
        </h2>
        <p className="text-muted-foreground">
          Generate boilerplate code, components, and API endpoints
        </p>
      </div>

      <Tabs defaultValue="generator">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">
            <Sparkles className="w-4 h-4 mr-2" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileCode className="w-4 h-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="snippets">
            <Database className="w-4 h-4 mr-2" />
            Snippets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Code Generator</CardTitle>
              <CardDescription>Describe what you want to build and get production-ready code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="typescript">TypeScript</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Framework</Label>
                  <Select value={framework} onValueChange={setFramework}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React</SelectItem>
                      <SelectItem value="vue">Vue</SelectItem>
                      <SelectItem value="node">Node.js</SelectItem>
                      <SelectItem value="express">Express</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Describe what you want to build</Label>
                <Textarea
                  placeholder="E.g., A user authentication form with email and password validation..."
                  rows={4}
                />
              </div>

              <Button onClick={handleGenerate} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Code
              </Button>

              {generatedCode && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Generated Code</Label>
                    <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                  <pre className="p-4 bg-muted rounded-lg overflow-x-auto">
                    <code>{generatedCode}</code>
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Templates</CardTitle>
              <CardDescription>Quick-start templates for common patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {templates.map((template) => (
                  <Card
                    key={template.name}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => {
                      setGeneratedCode(template.code);
                      toast.success(`${template.name} template loaded!`);
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileCode className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.lang}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="snippets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Snippets</CardTitle>
              <CardDescription>Reusable code snippets for rapid development</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'useState Hook', desc: 'React state management' },
                { title: 'useEffect Hook', desc: 'React side effects' },
                { title: 'Async/Await', desc: 'Promise handling pattern' },
                { title: 'Try/Catch', desc: 'Error handling wrapper' },
              ].map((snippet) => (
                <div
                  key={snippet.title}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toast.success(`${snippet.title} snippet inserted!`)}
                >
                  <h4 className="font-semibold">{snippet.title}</h4>
                  <p className="text-sm text-muted-foreground">{snippet.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
