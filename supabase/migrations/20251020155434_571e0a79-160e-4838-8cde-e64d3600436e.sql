-- Create a SECURITY DEFINER function to soft delete a context owned by the caller
create or replace function public.soft_delete_context(context_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _owner uuid;
begin
  select user_id into _owner from public.product_contexts where id = context_id;
  if _owner is null then
    raise exception 'Context not found';
  end if;
  if _owner <> auth.uid() then
    raise exception 'Not allowed';
  end if;

  update public.product_contexts
  set is_deleted = true,
      is_active = false,
      updated_at = now()
  where id = context_id;
end;
$$;

-- Allow authenticated users to execute the function
grant execute on function public.soft_delete_context(uuid) to authenticated;