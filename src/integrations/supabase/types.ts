export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      agent_actions: {
        Row: {
          action_args: Json | null
          action_label: string
          action_type: string
          agent_key: string
          agent_name: string
          created_at: string
          error_message: string | null
          executed_at: string | null
          expires_at: string | null
          id: string
          priority: number | null
          result: Json | null
          squad_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          action_args?: Json | null
          action_label: string
          action_type: string
          agent_key: string
          agent_name: string
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: number | null
          result?: Json | null
          squad_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          action_args?: Json | null
          action_label?: string
          action_type?: string
          agent_key?: string
          agent_name?: string
          created_at?: string
          error_message?: string | null
          executed_at?: string | null
          expires_at?: string | null
          id?: string
          priority?: number | null
          result?: Json | null
          squad_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_actions_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_analytics: {
        Row: {
          agent_id: string
          agent_name: string
          contributions_count: number | null
          created_at: string
          decision_id: string | null
          id: string
          ignored_count: number | null
          influenced_decision: number | null
          signal_score: number | null
          stance_consistency: number | null
          strengths: Json | null
          survived_synthesis: number | null
          weaknesses: Json | null
          word_count_avg: number | null
        }
        Insert: {
          agent_id: string
          agent_name: string
          contributions_count?: number | null
          created_at?: string
          decision_id?: string | null
          id?: string
          ignored_count?: number | null
          influenced_decision?: number | null
          signal_score?: number | null
          stance_consistency?: number | null
          strengths?: Json | null
          survived_synthesis?: number | null
          weaknesses?: Json | null
          word_count_avg?: number | null
        }
        Update: {
          agent_id?: string
          agent_name?: string
          contributions_count?: number | null
          created_at?: string
          decision_id?: string | null
          id?: string
          ignored_count?: number | null
          influenced_decision?: number | null
          signal_score?: number | null
          stance_consistency?: number | null
          strengths?: Json | null
          survived_synthesis?: number | null
          weaknesses?: Json | null
          word_count_avg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_analytics_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decision_log"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_memory: {
        Row: {
          agent_key: string
          content: string
          context_id: string | null
          created_at: string
          expires_at: string | null
          id: string
          importance: number | null
          memory_type: string
          metadata: Json | null
          squad_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_key: string
          content: string
          context_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          importance?: number | null
          memory_type: string
          metadata?: Json | null
          squad_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_key?: string
          content?: string
          context_id?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          importance?: number | null
          memory_type?: string
          metadata?: Json | null
          squad_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memory_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_memory_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_personalities: {
        Row: {
          agent_id: string
          created_at: string
          custom_traits: Json | null
          id: string
          personality_type: string
          updated_at: string
          user_id: string
          visual_style: Json | null
        }
        Insert: {
          agent_id: string
          created_at?: string
          custom_traits?: Json | null
          id?: string
          personality_type?: string
          updated_at?: string
          user_id: string
          visual_style?: Json | null
        }
        Update: {
          agent_id?: string
          created_at?: string
          custom_traits?: Json | null
          id?: string
          personality_type?: string
          updated_at?: string
          user_id?: string
          visual_style?: Json | null
        }
        Relationships: []
      }
      agent_registry: {
        Row: {
          agent_key: string
          avatar: string | null
          backstory: string | null
          biases: string | null
          capabilities: string[] | null
          created_at: string
          decision_style: string
          family_color: string | null
          id: string
          is_conductor: boolean | null
          max_tokens: number | null
          name: string
          priorities: string[] | null
          role: string | null
          specialty: string
          system_prompt: string
          tags: string[] | null
          temperature: number | null
          tools_allowed: string[] | null
          updated_at: string
        }
        Insert: {
          agent_key: string
          avatar?: string | null
          backstory?: string | null
          biases?: string | null
          capabilities?: string[] | null
          created_at?: string
          decision_style?: string
          family_color?: string | null
          id?: string
          is_conductor?: boolean | null
          max_tokens?: number | null
          name: string
          priorities?: string[] | null
          role?: string | null
          specialty: string
          system_prompt: string
          tags?: string[] | null
          temperature?: number | null
          tools_allowed?: string[] | null
          updated_at?: string
        }
        Update: {
          agent_key?: string
          avatar?: string | null
          backstory?: string | null
          biases?: string | null
          capabilities?: string[] | null
          created_at?: string
          decision_style?: string
          family_color?: string | null
          id?: string
          is_conductor?: boolean | null
          max_tokens?: number | null
          name?: string
          priorities?: string[] | null
          role?: string | null
          specialty?: string
          system_prompt?: string
          tags?: string[] | null
          temperature?: number | null
          tools_allowed?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string | null
          event_data: Json | null
          event_type: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      artefact_links: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          link_type: string
          source_id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          link_type: string
          source_id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          link_type?: string
          source_id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artefact_links_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      artefact_versions: {
        Row: {
          artefact_id: string
          author_id: string
          content: Json
          created_at: string
          id: string
          previous_version_id: string | null
          version_number: number
        }
        Insert: {
          artefact_id: string
          author_id: string
          content: Json
          created_at?: string
          id?: string
          previous_version_id?: string | null
          version_number?: number
        }
        Update: {
          artefact_id?: string
          author_id?: string
          content?: Json
          created_at?: string
          id?: string
          previous_version_id?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "artefact_versions_artefact_id_fkey"
            columns: ["artefact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artefact_versions_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "artefact_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          artifact_type: Database["public"]["Enums"]["artifact_type"]
          content: Json
          created_at: string | null
          id: string
          metadata: Json | null
          prd_id: string | null
          product_context_id: string | null
          squad_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artifact_type: Database["public"]["Enums"]["artifact_type"]
          content: Json
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prd_id?: string | null
          product_context_id?: string | null
          squad_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artifact_type?: Database["public"]["Enums"]["artifact_type"]
          content?: Json
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prd_id?: string | null
          product_context_id?: string | null
          squad_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_prd_id_fkey"
            columns: ["prd_id"]
            isOneToOne: false
            referencedRelation: "prds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_product_context_id_fkey"
            columns: ["product_context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      change_sets: {
        Row: {
          artefact_version_id: string
          changes_json: Json
          created_at: string
          id: string
        }
        Insert: {
          artefact_version_id: string
          changes_json?: Json
          created_at?: string
          id?: string
        }
        Update: {
          artefact_version_id?: string
          changes_json?: Json
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "change_sets_artefact_version_id_fkey"
            columns: ["artefact_version_id"]
            isOneToOne: false
            referencedRelation: "artefact_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          artifact_references: string[] | null
          content: string
          created_at: string
          id: string
          mentioned_agents: string[] | null
          sender_agent_id: string | null
          sender_agent_name: string | null
          sender_type: string
          squad_id: string
          user_id: string
        }
        Insert: {
          artifact_references?: string[] | null
          content: string
          created_at?: string
          id?: string
          mentioned_agents?: string[] | null
          sender_agent_id?: string | null
          sender_agent_name?: string | null
          sender_type: string
          squad_id: string
          user_id: string
        }
        Update: {
          artifact_references?: string[] | null
          content?: string
          created_at?: string
          id?: string
          mentioned_agents?: string[] | null
          sender_agent_id?: string | null
          sender_agent_name?: string | null
          sender_type?: string
          squad_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      code_index: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          id: string
          language: string | null
          last_commit: string | null
          metadata: Json | null
          product_context_id: string | null
          symbols: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          id?: string
          language?: string | null
          last_commit?: string | null
          metadata?: Json | null
          product_context_id?: string | null
          symbols?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          id?: string
          language?: string | null
          last_commit?: string | null
          metadata?: Json | null
          product_context_id?: string | null
          symbols?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "code_index_product_context_id_fkey"
            columns: ["product_context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      coins_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      context_history: {
        Row: {
          context_id: string
          created_at: string
          id: string
          snapshot: Json
          version: number
        }
        Insert: {
          context_id: string
          created_at?: string
          id?: string
          snapshot: Json
          version: number
        }
        Update: {
          context_id?: string
          created_at?: string
          id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "context_history_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_missions: {
        Row: {
          bonus_multiplier: number | null
          coins_reward: number
          completed: boolean
          completed_at: string | null
          created_at: string
          description: string
          difficulty: string
          estimated_time: string
          id: string
          mission_date: string
          mission_type: string
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          bonus_multiplier?: number | null
          coins_reward: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description: string
          difficulty: string
          estimated_time: string
          id?: string
          mission_date?: string
          mission_type: string
          title: string
          user_id: string
          xp_reward: number
        }
        Update: {
          bonus_multiplier?: number | null
          coins_reward?: number
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          description?: string
          difficulty?: string
          estimated_time?: string
          id?: string
          mission_date?: string
          mission_type?: string
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      data_index: {
        Row: {
          columns: string[] | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          product_context_id: string | null
          source_type: string | null
          table_name: string
          updated_at: string
          used_by_dashboards: string[] | null
          user_id: string
        }
        Insert: {
          columns?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          product_context_id?: string | null
          source_type?: string | null
          table_name: string
          updated_at?: string
          used_by_dashboards?: string[] | null
          user_id: string
        }
        Update: {
          columns?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          product_context_id?: string | null
          source_type?: string | null
          table_name?: string
          updated_at?: string
          used_by_dashboards?: string[] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "data_index_product_context_id_fkey"
            columns: ["product_context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_log: {
        Row: {
          assumptions: Json | null
          confidence_factors: Json | null
          confidence_level: string | null
          consensus_points: Json | null
          context: string | null
          counterfactual_analysis: Json | null
          created_at: string
          debate_messages: Json | null
          debate_topic: string
          id: string
          kpis_to_watch: Json | null
          non_negotiables: Json | null
          option_chosen: Json | null
          options_considered: Json
          outcome: Json | null
          squad_id: string | null
          tensions_remaining: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assumptions?: Json | null
          confidence_factors?: Json | null
          confidence_level?: string | null
          consensus_points?: Json | null
          context?: string | null
          counterfactual_analysis?: Json | null
          created_at?: string
          debate_messages?: Json | null
          debate_topic: string
          id?: string
          kpis_to_watch?: Json | null
          non_negotiables?: Json | null
          option_chosen?: Json | null
          options_considered?: Json
          outcome?: Json | null
          squad_id?: string | null
          tensions_remaining?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assumptions?: Json | null
          confidence_factors?: Json | null
          confidence_level?: string | null
          consensus_points?: Json | null
          context?: string | null
          counterfactual_analysis?: Json | null
          created_at?: string
          debate_messages?: Json | null
          debate_topic?: string
          id?: string
          kpis_to_watch?: Json | null
          non_negotiables?: Json | null
          option_chosen?: Json | null
          options_considered?: Json
          outcome?: Json | null
          squad_id?: string | null
          tensions_remaining?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_log_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_validations: {
        Row: {
          assumption_status: string | null
          attachment_url: string | null
          confidence_impact: string | null
          content: string | null
          created_at: string
          decision_id: string
          id: string
          title: string
          user_id: string
          validates_assumption: string | null
          validation_type: string | null
        }
        Insert: {
          assumption_status?: string | null
          attachment_url?: string | null
          confidence_impact?: string | null
          content?: string | null
          created_at?: string
          decision_id: string
          id?: string
          title: string
          user_id: string
          validates_assumption?: string | null
          validation_type?: string | null
        }
        Update: {
          assumption_status?: string | null
          attachment_url?: string | null
          confidence_impact?: string | null
          content?: string | null
          created_at?: string
          decision_id?: string
          id?: string
          title?: string
          user_id?: string
          validates_assumption?: string | null
          validation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decision_validations_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decision_log"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_code_map: {
        Row: {
          code_index_id: string | null
          confidence: number | null
          created_at: string
          feature_id: string
          file_path: string
          id: string
          link_source: string | null
          user_id: string
        }
        Insert: {
          code_index_id?: string | null
          confidence?: number | null
          created_at?: string
          feature_id: string
          file_path: string
          id?: string
          link_source?: string | null
          user_id: string
        }
        Update: {
          code_index_id?: string | null
          confidence?: number | null
          created_at?: string
          feature_id?: string
          file_path?: string
          id?: string
          link_source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_code_map_code_index_id_fkey"
            columns: ["code_index_id"]
            isOneToOne: false
            referencedRelation: "code_index"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_code_map_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_data_map: {
        Row: {
          confidence: number | null
          created_at: string
          data_index_id: string | null
          event_name: string | null
          feature_id: string
          id: string
          kpi_name: string | null
          link_source: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          data_index_id?: string | null
          event_name?: string | null
          feature_id: string
          id?: string
          kpi_name?: string | null
          link_source?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          data_index_id?: string | null
          event_name?: string | null
          feature_id?: string
          id?: string
          kpi_name?: string | null
          link_source?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feature_data_map_data_index_id_fkey"
            columns: ["data_index_id"]
            isOneToOne: false
            referencedRelation: "data_index"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_data_map_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          feature_name: string
          id: string
          status: Database["public"]["Enums"]["feature_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          feature_name: string
          id?: string
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          feature_name?: string
          id?: string
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      friction_patterns: {
        Row: {
          created_at: string
          decision_ids: Json | null
          id: string
          is_structural: boolean | null
          last_occurred: string | null
          occurrence_count: number | null
          resolution_rate: number | null
          tension_left: string
          tension_right: string
          tension_signature: string
        }
        Insert: {
          created_at?: string
          decision_ids?: Json | null
          id?: string
          is_structural?: boolean | null
          last_occurred?: string | null
          occurrence_count?: number | null
          resolution_rate?: number | null
          tension_left: string
          tension_right: string
          tension_signature: string
        }
        Update: {
          created_at?: string
          decision_ids?: Json | null
          id?: string
          is_structural?: boolean | null
          last_occurred?: string | null
          occurrence_count?: number | null
          resolution_rate?: number | null
          tension_left?: string
          tension_right?: string
          tension_signature?: string
        }
        Relationships: []
      }
      impact_items: {
        Row: {
          created_at: string
          id: string
          impact_reason: string | null
          impact_run_id: string
          impact_score: number | null
          item_name: string
          item_type: string
          metadata: Json | null
          related_artefact_id: string | null
          review_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          impact_reason?: string | null
          impact_run_id: string
          impact_score?: number | null
          item_name: string
          item_type: string
          metadata?: Json | null
          related_artefact_id?: string | null
          review_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          impact_reason?: string | null
          impact_run_id?: string
          impact_score?: number | null
          item_name?: string
          item_type?: string
          metadata?: Json | null
          related_artefact_id?: string | null
          review_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_items_impact_run_id_fkey"
            columns: ["impact_run_id"]
            isOneToOne: false
            referencedRelation: "impact_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_items_related_artefact_id_fkey"
            columns: ["related_artefact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_queue: {
        Row: {
          artefact_id: string
          created_at: string
          id: string
          impact_run_id: string | null
          scheduled_at: string
          status: string
          user_id: string
        }
        Insert: {
          artefact_id: string
          created_at?: string
          id?: string
          impact_run_id?: string | null
          scheduled_at?: string
          status?: string
          user_id: string
        }
        Update: {
          artefact_id?: string
          created_at?: string
          id?: string
          impact_run_id?: string | null
          scheduled_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_queue_artefact_id_fkey"
            columns: ["artefact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_queue_impact_run_id_fkey"
            columns: ["impact_run_id"]
            isOneToOne: false
            referencedRelation: "impact_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_runs: {
        Row: {
          artefact_id: string
          artefact_version_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          impact_score: number | null
          status: string
          summary: Json | null
          trigger_change_set_id: string | null
          user_id: string
        }
        Insert: {
          artefact_id: string
          artefact_version_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          impact_score?: number | null
          status?: string
          summary?: Json | null
          trigger_change_set_id?: string | null
          user_id: string
        }
        Update: {
          artefact_id?: string
          artefact_version_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          impact_score?: number | null
          status?: string
          summary?: Json | null
          trigger_change_set_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_runs_artefact_id_fkey"
            columns: ["artefact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_runs_artefact_version_id_fkey"
            columns: ["artefact_version_id"]
            isOneToOne: false
            referencedRelation: "artefact_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_runs_trigger_change_set_id_fkey"
            columns: ["trigger_change_set_id"]
            isOneToOne: false
            referencedRelation: "change_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      insights: {
        Row: {
          created_at: string
          data: Json | null
          description: string
          dismissed: boolean | null
          expires_at: string | null
          id: string
          insight_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          description: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          insight_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          description?: string
          dismissed?: boolean | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          is_active: boolean | null
          updated_at: string | null
          workspace_id: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          integration_type: Database["public"]["Enums"]["integration_type"]
          is_active?: boolean | null
          updated_at?: string | null
          workspace_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_type?: Database["public"]["Enums"]["integration_type"]
          is_active?: boolean | null
          updated_at?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_e5ae858b: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      link_suggestions: {
        Row: {
          artefact_id: string
          confidence: number
          created_at: string
          id: string
          reasoning: string | null
          status: string
          suggested_link_type: string
          suggested_target_id: string
          suggested_target_type: string
          user_id: string
        }
        Insert: {
          artefact_id: string
          confidence?: number
          created_at?: string
          id?: string
          reasoning?: string | null
          status?: string
          suggested_link_type?: string
          suggested_target_id: string
          suggested_target_type: string
          user_id: string
        }
        Update: {
          artefact_id?: string
          confidence?: number
          created_at?: string
          id?: string
          reasoning?: string | null
          status?: string
          suggested_link_type?: string
          suggested_target_id?: string
          suggested_target_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_suggestions_artefact_id_fkey"
            columns: ["artefact_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      mystery_boxes: {
        Row: {
          box_type: string
          created_at: string
          expires_at: string | null
          id: string
          opened: boolean
          opened_at: string | null
          rewards: Json | null
          user_id: string
        }
        Insert: {
          box_type: string
          created_at?: string
          expires_at?: string | null
          id?: string
          opened?: boolean
          opened_at?: string | null
          rewards?: Json | null
          user_id: string
        }
        Update: {
          box_type?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          opened?: boolean
          opened_at?: string | null
          rewards?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      nova_conversations: {
        Row: {
          context_snapshot: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          messages: Json
          title: string
          updated_at: string | null
          user_id: string
          workflow_state: Json | null
        }
        Insert: {
          context_snapshot?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          messages?: Json
          title: string
          updated_at?: string | null
          user_id: string
          workflow_state?: Json | null
        }
        Update: {
          context_snapshot?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          messages?: Json
          title?: string
          updated_at?: string | null
          user_id?: string
          workflow_state?: Json | null
        }
        Relationships: []
      }
      nova_feedback: {
        Row: {
          conversation_id: string | null
          created_at: string | null
          feedback_text: string | null
          id: string
          message_index: number
          rating: number | null
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_index: number
          rating?: number | null
        }
        Update: {
          conversation_id?: string | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          message_index?: number
          rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "nova_feedback_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "nova_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      nova_shared_conversations: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          permission: string
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          permission: string
          shared_by_user_id: string
          shared_with_user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          permission?: string
          shared_by_user_id?: string
          shared_with_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nova_shared_conversations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "nova_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      orchestration_sessions: {
        Row: {
          assigned_agents: string[] | null
          conductor_notes: string | null
          context_id: string | null
          created_at: string
          current_round: number | null
          final_synthesis: Json | null
          goals: Json | null
          id: string
          is_active: boolean | null
          max_rounds: number | null
          phase: string
          round_outputs: Json | null
          session_type: string
          squad_id: string | null
          tasks: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_agents?: string[] | null
          conductor_notes?: string | null
          context_id?: string | null
          created_at?: string
          current_round?: number | null
          final_synthesis?: Json | null
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          max_rounds?: number | null
          phase?: string
          round_outputs?: Json | null
          session_type?: string
          squad_id?: string | null
          tasks?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_agents?: string[] | null
          conductor_notes?: string | null
          context_id?: string | null
          created_at?: string
          current_round?: number | null
          final_synthesis?: Json | null
          goals?: Json | null
          id?: string
          is_active?: boolean | null
          max_rounds?: number | null
          phase?: string
          round_outputs?: Json | null
          session_type?: string
          squad_id?: string | null
          tasks?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orchestration_sessions_context_id_fkey"
            columns: ["context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orchestration_sessions_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      pinned_items: {
        Row: {
          created_at: string
          id: string
          item_data: Json | null
          item_id: string
          item_type: string
          position: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_data?: Json | null
          item_id: string
          item_type: string
          position?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_data?: Json | null
          item_id?: string
          item_type?: string
          position?: number | null
          user_id?: string
        }
        Relationships: []
      }
      prds: {
        Row: {
          created_at: string
          document_content: Json
          id: string
          idea_description: string
          product_context_id: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_content: Json
          id?: string
          idea_description: string
          product_context_id?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_content?: Json
          id?: string
          idea_description?: string
          product_context_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prds_product_context_id_fkey"
            columns: ["product_context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
        ]
      }
      product_contexts: {
        Row: {
          constraints: string | null
          created_at: string
          id: string
          is_active: boolean
          is_deleted: boolean
          metadata: Json | null
          name: string
          objectives: Json | null
          target_audience: string | null
          target_kpis: Json | null
          updated_at: string
          user_id: string
          vision: string | null
        }
        Insert: {
          constraints?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          metadata?: Json | null
          name: string
          objectives?: Json | null
          target_audience?: string | null
          target_kpis?: Json | null
          updated_at?: string
          user_id: string
          vision?: string | null
        }
        Update: {
          constraints?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          is_deleted?: boolean
          metadata?: Json | null
          name?: string
          objectives?: Json | null
          target_audience?: string | null
          target_kpis?: Json | null
          updated_at?: string
          user_id?: string
          vision?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          level: number
          role: string | null
          streak: number
          theme: string | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          role?: string | null
          streak?: number
          theme?: string | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          role?: string | null
          streak?: number
          theme?: string | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      shareable_moments: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string | null
          moment_type: string
          share_data: Json | null
          shared: boolean | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          moment_type: string
          share_data?: Json | null
          shared?: boolean | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          moment_type?: string
          share_data?: Json | null
          shared?: boolean | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      squad_agents: {
        Row: {
          added_at: string
          agent_avatar: string | null
          agent_backstory: string | null
          agent_capabilities: string[] | null
          agent_family_color: string
          agent_id: string
          agent_name: string
          agent_specialty: string
          agent_tags: string[] | null
          agent_xp_required: number
          id: string
          squad_id: string
        }
        Insert: {
          added_at?: string
          agent_avatar?: string | null
          agent_backstory?: string | null
          agent_capabilities?: string[] | null
          agent_family_color?: string
          agent_id: string
          agent_name: string
          agent_specialty: string
          agent_tags?: string[] | null
          agent_xp_required?: number
          id?: string
          squad_id: string
        }
        Update: {
          added_at?: string
          agent_avatar?: string | null
          agent_backstory?: string | null
          agent_capabilities?: string[] | null
          agent_family_color?: string
          agent_id?: string
          agent_name?: string
          agent_specialty?: string
          agent_tags?: string[] | null
          agent_xp_required?: number
          id?: string
          squad_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_agents_squad_id_fkey"
            columns: ["squad_id"]
            isOneToOne: false
            referencedRelation: "squads"
            referencedColumns: ["id"]
          },
        ]
      }
      squads: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          purpose: string | null
          updated_at: string
          user_id: string
          workspace_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          purpose?: string | null
          updated_at?: string
          user_id: string
          workspace_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          purpose?: string | null
          updated_at?: string
          user_id?: string
          workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "squads_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      test_index: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          product_context_id: string | null
          related_feature_id: string | null
          related_file_path: string | null
          status: string | null
          tags: string[] | null
          test_file: string
          test_name: string | null
          test_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          product_context_id?: string | null
          related_feature_id?: string | null
          related_file_path?: string | null
          status?: string | null
          tags?: string[] | null
          test_file: string
          test_name?: string | null
          test_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          product_context_id?: string | null
          related_feature_id?: string | null
          related_file_path?: string | null
          status?: string | null
          tags?: string[] | null
          test_file?: string
          test_name?: string | null
          test_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_index_product_context_id_fkey"
            columns: ["product_context_id"]
            isOneToOne: false
            referencedRelation: "product_contexts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_index_related_feature_id_fkey"
            columns: ["related_feature_id"]
            isOneToOne: false
            referencedRelation: "artifacts"
            referencedColumns: ["id"]
          },
        ]
      }
      unlocked_agents: {
        Row: {
          agent_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_key: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          target: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievement_key: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          target: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievement_key?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          target?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_description: string
          badge_icon: string
          badge_id: string
          badge_name: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_description: string
          badge_icon: string
          badge_id: string
          badge_name: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_description?: string
          badge_icon?: string
          badge_id?: string
          badge_name?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_gamification: {
        Row: {
          average_quality_score: number | null
          coins: number
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          level: number
          longest_streak: number
          streak_freezes_available: number
          total_artefacts_created: number
          total_missions_completed: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          average_quality_score?: number | null
          coins?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          streak_freezes_available?: number
          total_artefacts_created?: number
          total_missions_completed?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          average_quality_score?: number | null
          coins?: number
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          level?: number
          longest_streak?: number
          streak_freezes_available?: number
          total_artefacts_created?: number
          total_missions_completed?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_gamification_badges: {
        Row: {
          badge_category: string
          badge_description: string
          badge_icon: string
          badge_id: string
          badge_name: string
          id: string
          rarity: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          badge_category: string
          badge_description: string
          badge_icon: string
          badge_id: string
          badge_name: string
          id?: string
          rarity: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          badge_category?: string
          badge_description?: string
          badge_icon?: string
          badge_id?: string
          badge_name?: string
          id?: string
          rarity?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          id: string
          last_active_at: string
          last_context_id: string | null
          last_squad_id: string | null
          last_tab: string | null
          last_workflow_type: string | null
          session_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_active_at?: string
          last_context_id?: string | null
          last_squad_id?: string | null
          last_tab?: string | null
          last_workflow_type?: string | null
          session_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_active_at?: string
          last_context_id?: string | null
          last_squad_id?: string | null
          last_tab?: string | null
          last_workflow_type?: string | null
          session_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_thinking_analytics: {
        Row: {
          alternative_proposal_rate: number | null
          debates_participated: number | null
          early_agreement_rate: number | null
          id: string
          ideation_contribution_rate: number | null
          insights: Json | null
          opt_in: boolean | null
          risk_raising_rate: number | null
          strongest_impact_area: string | null
          synthesis_contribution_rate: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          alternative_proposal_rate?: number | null
          debates_participated?: number | null
          early_agreement_rate?: number | null
          id?: string
          ideation_contribution_rate?: number | null
          insights?: Json | null
          opt_in?: boolean | null
          risk_raising_rate?: number | null
          strongest_impact_area?: string | null
          synthesis_contribution_rate?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          alternative_proposal_rate?: number | null
          debates_participated?: number | null
          early_agreement_rate?: number | null
          id?: string
          ideation_contribution_rate?: number | null
          insights?: Json | null
          opt_in?: boolean | null
          risk_raising_rate?: number | null
          strongest_impact_area?: string | null
          synthesis_contribution_rate?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_weekly_challenges: {
        Row: {
          challenge_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          progress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          progress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_weekly_challenges_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "weekly_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_challenges: {
        Row: {
          badge_reward: string | null
          challenge_id: string
          coins_reward: number
          created_at: string
          description: string
          icon: string
          id: string
          target: number
          title: string
          week_end: string
          week_start: string
          xp_reward: number
        }
        Insert: {
          badge_reward?: string | null
          challenge_id: string
          coins_reward: number
          created_at?: string
          description: string
          icon: string
          id?: string
          target: number
          title: string
          week_end: string
          week_start: string
          xp_reward: number
        }
        Update: {
          badge_reward?: string | null
          challenge_id?: string
          coins_reward?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          target?: number
          title?: string
          week_end?: string
          week_start?: string
          xp_reward?: number
        }
        Relationships: []
      }
      workspace_members: {
        Row: {
          id: string
          joined_at: string | null
          role: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role?: string
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          source: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      soft_delete_context: { Args: { context_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      artifact_type: "canvas" | "story" | "impact_analysis" | "epic"
      feature_status: "enabled" | "disabled" | "beta"
      integration_type: "jira" | "slack" | "figma"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      artifact_type: ["canvas", "story", "impact_analysis", "epic"],
      feature_status: ["enabled", "disabled", "beta"],
      integration_type: ["jira", "slack", "figma"],
    },
  },
} as const
