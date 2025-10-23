import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Plus, 
  Search, 
  Clock, 
  Trash2,
  Users,
  Share2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConversationHistoryProps {
  currentConversationId?: string;
  onSelectConversation: (conversationId: string | null) => void;
  onNewConversation: () => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  currentConversationId,
  onSelectConversation,
  onNewConversation
}) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load owned and shared conversations
      const { data: ownedConvs, error: ownedError } = await supabase
        .from('nova_conversations')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (ownedError) throw ownedError;

      const { data: sharedConvs, error: sharedError } = await supabase
        .from('nova_shared_conversations')
        .select('conversation_id, permission, nova_conversations(*)')
        .eq('shared_with_user_id', user.id);

      if (sharedError) throw sharedError;

      const allConversations = [
        ...(ownedConvs || []).map(c => ({ ...c, isShared: false })),
        ...(sharedConvs || [])
          .filter(s => s.nova_conversations)
          .map(s => ({ 
            ...(s.nova_conversations as any), 
            isShared: true, 
            permission: s.permission 
          }))
      ];

      setConversations(allConversations);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des conversations",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      const { error } = await supabase
        .from('nova_conversations')
        .update({ is_active: false })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversationId === conversationId) {
        onSelectConversation(null);
      }

      toast({
        title: "Conversation supprimée",
        description: "La conversation a été archivée"
      });
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la conversation",
        variant: "destructive"
      });
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full border-r bg-muted/20">
      <div className="p-4 border-b space-y-3">
        <Button 
          onClick={onNewConversation}
          className="w-full"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Chargement...
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Aucune conversation
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors group",
                  "hover:bg-accent",
                  currentConversationId === conv.id && "bg-accent"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conv.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.updated_at).toLocaleDateString('fr-FR')}
                        </span>
                        {conv.isShared && (
                          <Badge variant="secondary" className="text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            Partagé
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  {!conv.isShared && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => handleDelete(conv.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
