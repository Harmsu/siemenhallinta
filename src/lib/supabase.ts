import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vhcehzlcitjvlcyldyqc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZoY2VoemxjaXRqdmxjeWxkeXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMDE0NTYsImV4cCI6MjA4NTc3NzQ1Nn0.u6lXBIKk7TFnMq3KhaxDGJHjg9O7pf8_oGwmW4Kn9SE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
