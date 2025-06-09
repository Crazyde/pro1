import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsyifesmccwcgcnhesld.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zeWlmZXNtY2N3Y2djbmhlc2xkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MzE2MzksImV4cCI6MjA2MjMwNzYzOX0._CsBJvfG3ilQZDh2VCv4ySapfVG6VWNx7yDi3FCcrJc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);