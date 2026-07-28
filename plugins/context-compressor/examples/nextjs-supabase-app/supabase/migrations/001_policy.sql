create policy "Users can read own account"
on accounts for select
using (auth.uid() = user_id);
