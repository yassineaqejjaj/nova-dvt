import { supabase } from '@/integrations/supabase/client';
import type { Artifact } from '@/types';

export async function fetchArtifacts(userId: string): Promise<Artifact[]> {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (
    data?.map((a) => ({
      id: a.id,
      user_id: a.user_id,
      squad_id: a.squad_id ?? undefined,
      artifact_type: a.artifact_type as Artifact['artifact_type'],
      title: a.title,
      content: a.content,
      metadata: a.metadata ?? undefined,
      created_at: a.created_at,
      updated_at: a.updated_at,
    })) ?? []
  );
}

export async function fetchArtifactById(artifactId: string): Promise<Artifact | null> {
  const { data, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', artifactId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    user_id: data.user_id,
    squad_id: data.squad_id ?? undefined,
    artifact_type: data.artifact_type as Artifact['artifact_type'],
    title: data.title,
    content: data.content,
    metadata: data.metadata ?? undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function createArtifact(
  artifact: Omit<Artifact, 'id' | 'created_at' | 'updated_at'>
): Promise<Artifact> {
  const { data, error } = await supabase
    .from('artifacts')
    .insert({
      user_id: artifact.user_id,
      squad_id: artifact.squad_id,
      artifact_type: artifact.artifact_type as any,
      title: artifact.title,
      content: artifact.content as any,
      metadata: (artifact.metadata ?? {}) as any,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    user_id: data.user_id,
    squad_id: data.squad_id ?? undefined,
    artifact_type: data.artifact_type as Artifact['artifact_type'],
    title: data.title,
    content: data.content,
    metadata: data.metadata ?? undefined,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function deleteArtifact(artifactId: string): Promise<void> {
  const { error } = await supabase.from('artifacts').delete().eq('id', artifactId);
  if (error) throw error;
}

export async function countUserArtifacts(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('artifacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) throw error;
  return count ?? 0;
}
