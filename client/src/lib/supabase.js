import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pkxaudywryxoxqjfhluq.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBreGF1ZHl3cnl4b3hxamZobHVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzNzY4NTQsImV4cCI6MjA5MDk1Mjg1NH0.fXMGMZhStC8dAdN5nPJCluXbGk8O-lDjimMV39SQJ0I'

export const supabase = createClient(supabaseUrl, supabaseKey)
