-- Exécuter après inscription et confirmation du compte admin.
-- Remplacer VOTRE-UUID par l’UUID auth.users.id trouvé dans Authentication > Users.
-- Exécuter dans SQL Editor seulement, jamais depuis le navigateur.
insert into public.user_roles (user_id, role)
values ('1f30ae33-dcab-4712-af03-cf4f22157574'::uuid, 'admin')
on conflict (user_id) do update set role = excluded.role;
