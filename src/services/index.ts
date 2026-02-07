// Barrel export for the data access layer
// Components should import from here rather than directly from @/integrations/supabase/client

export {
  fetchUserProfile,
  fetchUserSquads,
  updateUserXP,
  fetchUserTheme,
  saveUserTheme,
  subscribeToProfileChanges,
} from './auth';

export {
  fetchOrCreateGamification,
  fetchDailyMissions,
  fetchBadges,
  fetchMysteryBoxes,
  completeMission,
  addRewards,
  buyStreakFreeze,
  openMysteryBox,
  generateBoxRewards,
  ensureDailyMissions,
  calculateLevel,
  subscribeToGamificationChanges,
} from './gamification';
export type {
  GamificationRecord,
  DailyMissionRecord,
  BadgeRecord,
  MysteryBoxRecord,
} from './gamification';

export {
  fetchArtifacts,
  fetchArtifactById,
  createArtifact,
  deleteArtifact,
  countUserArtifacts,
} from './artifacts';

export {
  trackEvent,
  trackWorkflowStart,
  trackWorkflowComplete,
  trackArtifactCreated,
  trackAgentConversation,
} from './analytics';
export type { EventType, EventData } from './analytics';

export { fetchSession, upsertSession } from './sessions';
export type { SessionData } from './sessions';

export { fetchInsights, dismissInsight, generateInsights } from './insights';
export type { InsightRecord } from './insights';

export { fetchPinnedItems, pinItem, unpinItem } from './pinned-items';
export type { PinnedItemRecord } from './pinned-items';
