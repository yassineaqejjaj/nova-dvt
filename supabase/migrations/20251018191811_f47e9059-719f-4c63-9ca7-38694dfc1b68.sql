-- Créer le profil manquant pour l'utilisateur existant
INSERT INTO public.profiles (user_id, display_name, role, level, xp, streak)
VALUES ('7b266450-6351-4428-90ba-e6a7dbef5e08', 'yassine', 'PM', 1, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Créer l'enregistrement de gamification si manquant
INSERT INTO public.user_gamification (user_id, level, xp, coins, current_streak, longest_streak, streak_freezes_available)
VALUES ('7b266450-6351-4428-90ba-e6a7dbef5e08', 1, 0, 0, 0, 0, 0)
ON CONFLICT (user_id) DO NOTHING;

-- Vérifier que le trigger handle_new_user existe et fonctionne
-- Si le trigger n'existe pas, le recréer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();