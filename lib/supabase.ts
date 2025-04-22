import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jqqetydqvndhjcnefjic.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxcWV0eWRxdm5kaGpjbmVmamljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzMDcxNTIsImV4cCI6MjA2MDg4MzE1Mn0.WR-4O4gx3a8bqifzzvHI52Y8JU-vFzR0wgABvryakSg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
