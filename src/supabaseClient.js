import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://znsagnymmfippbfkmtfq.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpuc2FnbnltbWZpcHBiZmttdGZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjE4ODEsImV4cCI6MjA4NzczNzg4MX0.7vps69P-uldaND0HciRdg68gojGlQnNcho25PHkSKWo"

export const supabase = createClient(supabaseUrl, supabaseKey)
