-- Sync level and XP from profiles to user_gamification
UPDATE public.user_gamification ug
SET 
  level = p.level,
  xp = p.xp,
  coins = GREATEST(ug.coins, (p.level * 50) + (p.xp / 20) + 100)
FROM public.profiles p
WHERE ug.user_id = p.user_id
  AND (ug.level != p.level OR ug.xp != p.xp);

-- Now unlock level-based badges for users with correct levels
-- Grant level 10 badge (Rising Star) to users at level 10+
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
SELECT 
  ug.user_id,
  'level_10',
  'mastery',
  'Rising Star',
  'Reach level 10',
  '⭐',
  'rare'
FROM public.user_gamification ug
WHERE ug.level >= 10
  AND NOT EXISTS (
    SELECT 1 FROM public.user_gamification_badges ugb 
    WHERE ugb.user_id = ug.user_id AND ugb.badge_id = 'level_10'
  );

-- Grant level 25 badge (Expert) to users at level 25+
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
SELECT 
  ug.user_id,
  'level_25',
  'mastery',
  'Expert',
  'Reach level 25',
  '🏆',
  'epic'
FROM public.user_gamification ug
WHERE ug.level >= 25
  AND NOT EXISTS (
    SELECT 1 FROM public.user_gamification_badges ugb 
    WHERE ugb.user_id = ug.user_id AND ugb.badge_id = 'level_25'
  );

-- Grant level 50 badge (Master) to users at level 50+
INSERT INTO public.user_gamification_badges (user_id, badge_id, badge_category, badge_name, badge_description, badge_icon, rarity)
SELECT 
  ug.user_id,
  'level_50',
  'mastery',
  'Master',
  'Reach level 50',
  '👑',
  'legendary'
FROM public.user_gamification ug
WHERE ug.level >= 50
  AND NOT EXISTS (
    SELECT 1 FROM public.user_gamification_badges ugb 
    WHERE ugb.user_id = ug.user_id AND ugb.badge_id = 'level_50'
  );