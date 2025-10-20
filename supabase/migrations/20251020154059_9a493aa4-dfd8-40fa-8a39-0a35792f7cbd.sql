-- Add an additional permissive UPDATE policy to ensure owners can soft delete
create policy "Users can update their contexts (soft delete allowed)"
on public.product_contexts
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Ensure authenticated role has UPDATE privilege
grant update on table public.product_contexts to authenticated;