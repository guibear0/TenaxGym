import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ozgckfxkxnljvkjwsntc.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im96Z2NrZnhreG5sanZrandzbnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3MzEzNTgsImV4cCI6MjA3MjMwNzM1OH0.In-6B40FjsB2F-DfJKzgrAd5ZHA0giAHTrGWB-FIDcA";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
