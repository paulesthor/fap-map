-- ACTIVEZ L'ACCÈS PUBLIC AUX PROFILS POUR LA RECHERCHE D'AMIS

-- 1. Activez lecture publique (tout le monde peut voir les profils)
create policy "Public profiles are viewable by everyone"
on profiles for select
to authenticated, anon
using ( true );

-- 2. (Optionnel) Vérifiez que les policies existent
-- Si vous avez déjà une policy restrictive, surprimez-la d'abord:
-- drop policy if exists "Users can see their own profile only" on profiles;
