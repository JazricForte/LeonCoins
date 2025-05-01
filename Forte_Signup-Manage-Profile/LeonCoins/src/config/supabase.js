import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = 'https://cbbxvpohvsspvcnizbzg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNiYnh2cG9odnNzcHZjbml6YnpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwODYwODcsImV4cCI6MjA2MTY2MjA4N30.odLCW8_5f1qO6S76R3tEtNAHZlJ_kur9AaMyW1hrTKE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});