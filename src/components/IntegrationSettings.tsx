import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { Integration } from '@/types';
import { Plug, CheckCircle, XCircle, Settings } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface IntegrationConfig {
  id: 'jira' | 'slack' | 'figma';
  name: string;
  description: string;
  icon: string;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'password';
    placeholder: string;
    required: boolean;
  }>;
}

const integrationConfigs: IntegrationConfig[] = [
  {
    id: 'jira',
    name: 'Jira',
    description: 'Sync user stories and tasks with Jira',
    icon: '🔷',
    fields: [
      { name: 'domain', label: 'Jira Domain', type: 'text', placeholder: 'yourcompany.atlassian.net', required: true },
      { name: 'email', label: 'Email', type: 'text', placeholder: 'you@company.com', required: true },
      { name: 'api_token', label: 'API Token', type: 'password', placeholder: 'Your Jira API token', required: true },
      { name: 'project_key', label: 'Project Key', type: 'text', placeholder: 'PROJ', required: true },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Send notifications and updates to Slack',
    icon: '💬',
    fields: [
      { name: 'webhook_url', label: 'Webhook URL', type: 'password', placeholder: 'https://hooks.slack.com/services/...', required: true },
      { name: 'channel', label: 'Default Channel', type: 'text', placeholder: '#general', required: true },
    ],
  },
  {
    id: 'figma',
    name: 'Figma',
    description: 'Link designs and prototypes from Figma',
    icon: '🎨',
    fields: [
      { name: 'access_token', label: 'Access Token', type: 'password', placeholder: 'Your Figma access token', required: true },
      { name: 'team_id', label: 'Team ID', type: 'text', placeholder: 'Your team ID', required: false },
    ],
  },
];

interface IntegrationSettingsProps {
  workspaceId: string;
}

export const IntegrationSettings: React.FC<IntegrationSettingsProps> = ({ workspaceId }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [configData, setConfigData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, [workspaceId]);

  const loadIntegrations = async () => {
    try {
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
    }
  };

  const openConfigDialog = (config: IntegrationConfig) => {
    const existing = integrations.find(i => i.integration_type === config.id);
    setSelectedIntegration(config);
    setConfigData(existing?.config || {});
    setShowConfigDialog(true);
  };

  const handleSaveIntegration = async () => {
    if (!selectedIntegration) return;

    // Validate required fields
    const missingFields = selectedIntegration.fields
      .filter(f => f.required && !configData[f.name])
      .map(f => f.label);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const existing = integrations.find(i => i.integration_type === selectedIntegration.id);

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('integrations')
          .update({ config: configData, updated_at: new Date().toISOString() })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('integrations')
          .insert({
            workspace_id: workspaceId,
            integration_type: selectedIntegration.id,
            config: configData,
            is_active: true,
          });

        if (error) throw error;
      }

      await loadIntegrations();
      setShowConfigDialog(false);
      setConfigData({});
      
      toast({
        title: 'Success',
        description: `${selectedIntegration.name} integration ${existing ? 'updated' : 'connected'}`,
      });
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save integration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleIntegration = async (integration: Integration) => {
    try {
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: !integration.is_active })
        .eq('id', integration.id);

      if (error) throw error;
      await loadIntegrations();
      
      toast({
        title: 'Success',
        description: `Integration ${integration.is_active ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle integration',
        variant: 'destructive',
      });
    }
  };

  const getIntegrationStatus = (config: IntegrationConfig) => {
    return integrations.find(i => i.integration_type === config.id);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Integrations</h2>
        <p className="text-muted-foreground">
          Connect your favorite tools to enhance your workflow
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {integrationConfigs.map(config => {
          const status = getIntegrationStatus(config);
          const isConnected = !!status;
          const isActive = status?.is_active;

          return (
            <Card key={config.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{config.icon}</div>
                    <div>
                      <CardTitle>{config.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {config.description}
                      </CardDescription>
                    </div>
                  </div>
                  {isConnected && (
                    <Badge variant={isActive ? 'default' : 'secondary'}>
                      {isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={isConnected ? 'outline' : 'default'}
                  className="w-full"
                  size="sm"
                  onClick={() => openConfigDialog(config)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {isConnected ? 'Configure' : 'Connect'}
                </Button>
                {isConnected && status && (
                  <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <span className="text-xs text-muted-foreground">Enable/Disable</span>
                    <Switch
                      checked={isActive}
                      onCheckedChange={() => toggleIntegration(status)}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span className="text-2xl">{selectedIntegration?.icon}</span>
              <span>Configure {selectedIntegration?.name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedIntegration?.fields.map(field => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={configData[field.name] || ''}
                  onChange={(e) => setConfigData({ ...configData, [field.name]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveIntegration} disabled={saving}>
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};