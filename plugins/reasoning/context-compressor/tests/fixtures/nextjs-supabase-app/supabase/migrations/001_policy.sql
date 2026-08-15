create policy "read own rows" on profiles for select using (auth.uid() = id);
