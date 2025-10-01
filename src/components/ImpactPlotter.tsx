import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Plus, Trash2, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImpactPlotterProps {
  open: boolean;
  onClose: () => void;
}

interface PlotItem {
  id: string;
  name: string;
  impact: number;
  effort: number;
}

export const ImpactPlotter: React.FC<ImpactPlotterProps> = ({ open, onClose }) => {
  const [items, setItems] = useState<PlotItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const addItem = () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    const newItem: PlotItem = {
      id: `item-${Date.now()}`,
      name: newItemName,
      impact: 5,
      effort: 5,
    };

    setItems([...items, newItem]);
    setNewItemName('');
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: 'impact' | 'effort', value: number) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: Math.max(1, Math.min(10, value)) } : item
    ));
  };

  const handleAutoPlot = async () => {
    if (items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('canvas-generator', {
        body: {
          template: 'impact-effort',
          projectContext: 'Analyze these items for impact vs effort prioritization',
          formData: {
            items: items.map(item => item.name)
          },
          documents: []
        }
      });

      if (error) throw error;

      if (data.content.items) {
        const updatedItems = items.map(item => {
          const analyzed = data.content.items.find((i: any) => i.name === item.name);
          return analyzed ? {
            ...item,
            impact: analyzed.impact || item.impact,
            effort: analyzed.effort || item.effort
          } : item;
        });
        setItems(updatedItems);
      }

      setShowChart(true);
      toast.success('Items analyzed and plotted!');
    } catch (error) {
      console.error('Error analyzing items:', error);
      toast.error('Failed to analyze items. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuadrant = (impact: number, effort: number): {
    label: string;
    color: string;
    priority: string;
  } => {
    if (impact > 5 && effort <= 5) {
      return { label: 'Quick Wins', color: 'bg-green-500', priority: 'High Priority' };
    } else if (impact > 5 && effort > 5) {
      return { label: 'Major Projects', color: 'bg-blue-500', priority: 'Plan Carefully' };
    } else if (impact <= 5 && effort <= 5) {
      return { label: 'Fill-Ins', color: 'bg-yellow-500', priority: 'Low Priority' };
    } else {
      return { label: 'Time Sinks', color: 'bg-red-500', priority: 'Avoid' };
    }
  };

  const sortedByPriority = [...items].sort((a, b) => {
    const scoreA = (a.impact / a.effort) * a.impact;
    const scoreB = (b.impact / b.effort) * b.impact;
    return scoreB - scoreA;
  });

  const handleExport = () => {
    const reportText = `
# Impact vs Effort Analysis

Generated: ${new Date().toLocaleDateString()}

## Prioritized Items

${sortedByPriority.map((item, index) => {
  const quadrant = getQuadrant(item.impact, item.effort);
  return `
${index + 1}. **${item.name}**
   - Impact: ${item.impact}/10
   - Effort: ${item.effort}/10
   - Category: ${quadrant.label}
   - Recommendation: ${quadrant.priority}
`;
}).join('\n')}

## Quadrant Summary

**Quick Wins** (High Impact, Low Effort): ${items.filter(i => i.impact > 5 && i.effort <= 5).length} items
**Major Projects** (High Impact, High Effort): ${items.filter(i => i.impact > 5 && i.effort > 5).length} items
**Fill-Ins** (Low Impact, Low Effort): ${items.filter(i => i.impact <= 5 && i.effort <= 5).length} items
**Time Sinks** (Low Impact, High Effort): ${items.filter(i => i.impact <= 5 && i.effort > 5).length} items
    `.trim();

    const blob = new Blob([reportText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impact-effort-analysis-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Analysis exported!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TrendingUp className="w-6 h-6" />
            <span>Impact vs Effort Plotter</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add Items to Analyze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter feature or initiative name..."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addItem()}
                />
                <Button onClick={addItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg">
                      <span className="flex-1 font-medium">{item.name}</span>
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs">Impact:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={item.impact}
                          onChange={(e) => updateItem(item.id, 'impact', parseInt(e.target.value))}
                          className="w-16"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label className="text-xs">Effort:</Label>
                        <Input
                          type="number"
                          min="1"
                          max="10"
                          value={item.effort}
                          onChange={(e) => updateItem(item.id, 'effort', parseInt(e.target.value))}
                          className="w-16"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visual Plot */}
          {items.length > 0 && showChart && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Impact vs Effort Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square border-2 border-border rounded-lg">
                  {/* Quadrant Labels */}
                  <div className="absolute top-2 left-2 text-xs font-semibold text-muted-foreground">
                    Major Projects
                  </div>
                  <div className="absolute top-2 right-2 text-xs font-semibold text-muted-foreground">
                    Quick Wins
                  </div>
                  <div className="absolute bottom-2 left-2 text-xs font-semibold text-muted-foreground">
                    Time Sinks
                  </div>
                  <div className="absolute bottom-2 right-2 text-xs font-semibold text-muted-foreground">
                    Fill-Ins
                  </div>

                  {/* Center Lines */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-px bg-border" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-full w-px bg-border" />
                  </div>

                  {/* Items */}
                  {items.map(item => {
                    const x = (item.effort / 10) * 100;
                    const y = 100 - (item.impact / 10) * 100;
                    const quadrant = getQuadrant(item.impact, item.effort);

                    return (
                      <div
                        key={item.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${x}%`, top: `${y}%` }}
                      >
                        <div className={`${quadrant.color} text-white px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shadow-lg`}>
                          {item.name}
                        </div>
                      </div>
                    );
                  })}

                  {/* Axis Labels */}
                  <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-muted-foreground">
                    Effort →
                  </div>
                  <div className="absolute top-0 bottom-0 -left-14 flex items-center">
                    <div className="transform -rotate-90 text-xs text-muted-foreground whitespace-nowrap">
                      Impact →
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Priority List */}
          {items.length > 0 && showChart && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recommended Priority Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sortedByPriority.map((item, index) => {
                    const quadrant = getQuadrant(item.impact, item.effort);
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">{index + 1}</Badge>
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={quadrant.color}>{quadrant.label}</Badge>
                          <Badge variant="outline">{quadrant.priority}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <div className="flex space-x-2">
              {!showChart && items.length > 0 && (
                <Button onClick={handleAutoPlot} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Auto-Analyze
                    </>
                  )}
                </Button>
              )}
              {showChart && (
                <>
                  <Button variant="outline" onClick={() => setShowChart(false)}>
                    Edit Items
                  </Button>
                  <Button onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
