-- Update coins for existing users based on their level and XP
-- Formula: Base coins from level + bonus from XP
-- Level contribution: level * 50 coins per level
-- XP contribution: 1 coin per 20 XP earned

UPDATE public.user_gamification
SET coins = (
  -- Base coins from level (50 coins per level reached)
  (level * 50) +
  -- Bonus coins from total XP (1 coin per 20 XP)
  (xp / 20)
)
WHERE coins = 0 OR coins IS NULL;

-- Also add a welcome bonus of 100 coins to all existing users
UPDATE public.user_gamification
SET coins = coins + 100
WHERE coins IS NOT NULL;