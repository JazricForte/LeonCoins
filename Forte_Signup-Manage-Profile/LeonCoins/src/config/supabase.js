import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Replace these with your actual Supabase project URL and public API key
const SUPABASE_URL = 'https://cbbxvpohvsspvcnizbzg.supabase.co';
const SUPABASE_ANON_KEY = 'yeyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYnh2cG9odnNzcHZjbml6YnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODYwODcsImV4cCI6MjA2MTY2MjA4N30.odLCW8_5f1qO6S76R3tEtNAHZlJ_kur9AaMyW1hrTKE';

// Create a Supabase client with React Native-specific settings
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // React Native does not use URLs for auth redirects
  },
});