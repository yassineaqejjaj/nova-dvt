-- Grant all earned badges to user based on their achievements
-- User stats: Level 21, 23 agents, 14 squads, 23 artifacts, missions completed

-- Getting Started Badges
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
VALUES 
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'welcome', 'getting_started', 'Welcome Aboard', 'Join Nova and start your product management journey', '🎉', 'common'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'first_squad', 'getting_started', 'Squad Leader', 'Create your first AI squad', '👥', 'common'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'first_agent', 'getting_started', 'Recruiter', 'Unlock your first AI agent', '🤝', 'common'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'first_chat', 'getting_started', 'Conversation Starter', 'Have your first conversation with an AI agent', '💬', 'common')
ON CONFLICT DO NOTHING;

-- Collaboration Badges
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
VALUES 
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'team_player', 'collaboration', 'Team Player', 'Work with multiple agents in a single conversation', '🤝', 'rare'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'agent_collector', 'collaboration', 'Agent Collector', 'Unlock 10 different AI agents', '🎭', 'rare'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'squad_master', 'collaboration', 'Squad Master', 'Create 5 specialized squads', '⚡', 'epic'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'full_team', 'collaboration', 'Full Team', 'Create a squad with 5 agents', '👨‍👩‍👧‍👦', 'rare')
ON CONFLICT DO NOTHING;

-- Productivity Badges
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
VALUES 
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'canvas_creator', 'productivity', 'Canvas Creator', 'Generate your first business canvas', '🎨', 'rare'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'prd_master', 'productivity', 'PRD Master', 'Create a complete Product Requirements Document', '📝', 'rare'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'artifact_creator', 'productivity', 'Artifact Creator', 'Create 10 different artifacts', '📦', 'epic'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'speed_demon', 'productivity', 'Speed Demon', 'Use Instant PRD to generate documentation in under 20 seconds', '⚡', 'epic'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'multi_framework', 'productivity', 'Framework Expert', 'Generate 5 different types of canvases', '🗺️', 'epic')
ON CONFLICT DO NOTHING;

-- Mastery Badges (already has level_10)
-- They're level 21 so they should get level_25 badge too when they reach 25
-- For now keeping level_10

-- Special Badges
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
VALUES 
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'early_adopter', 'special', 'Early Adopter', 'Join Nova during its early access phase', '🚀', 'legendary'),
  ('b2b669ba-5cd6-49be-b758-ed83a243202b', 'beta_tester', 'special', 'Beta Tester', 'Help shape Nova by testing new features', '🧪', 'epic')
ON CONFLICT DO NOTHING;