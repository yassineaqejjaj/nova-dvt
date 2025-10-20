-- Enable realtime for product_contexts table
ALTER TABLE public.product_contexts REPLICA IDENTITY FULL;

-- Add table to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE public.product_contexts;