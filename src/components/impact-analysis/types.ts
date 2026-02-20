export interface Change {
  change_type: string;
  entity: string;
  before: string;
  after: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface ChangeSet {
  id: string;
  artefact_version_id: string;
  changes_json: Change[];
  created_at: string;
}

export interface ImpactRun {
  id: string;
  trigger_change_set_id: string | null;
  artefact_id: string;
  artefact_version_id: string | null;
  impact_score: number;
  summary: {
    total_changes: number;
    type_breakdown: Record<string, number>;
    high_severity_count: number;
    linked_artefacts: number;
    manual_links: number;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  user_id: string;
  created_at: string;
  completed_at: string | null;
}

export interface ImpactItem {
  id: string;
  impact_run_id: string;
  item_name: string;
  item_type: 'documentation' | 'backlog' | 'spec' | 'test' | 'code' | 'kpi' | 'data';
  impact_score: number;
  impact_reason: string;
  review_status: 'pending' | 'review_required' | 'reviewed' | 'ignored';
  related_artefact_id: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface ArtefactLink {
  id: string;
  source_id: string;
  target_type: string;
  target_id: string;
  link_type: string;
  confidence_score: number;
  user_id: string;
  created_at: string;
}
