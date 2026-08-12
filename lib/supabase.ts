import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Your actual Supabase URL and Publishable Key
const supabaseUrl = 'https://wyivhhhhosokazyrovti.supabase.co';
const supabaseAnonKey = 'sb_publishable_4h-y-Ke4lkfWbcQzspUW8A_pNygZnQC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});