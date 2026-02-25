-- Enable Realtime on impact tables
ALTER PUBLICATION supabase_realtime ADD TABLE impact_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE impact_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE impact_items;