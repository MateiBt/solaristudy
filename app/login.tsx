import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Account Creation
  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both an email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success!', 'Check your Supabase dashboard to see your new user.');
    }
    setLoading(false);
  }

  // Handle Logging In
  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both an email and password.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      // Redirect to home dashboard
      router.replace('/');
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        
        <View style={styles.headerContainer}>
          <View style={styles.logoBox}>
            <Feather name="hexagon" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>SolariStudy</Text>
          <Text style={styles.subtitle}>Your personal AI study engine.</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]} 
              onPress={signInWithEmail}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.button, styles.secondaryButton]} 
              onPress={signUpWithEmail}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F9FAFB' // Matches the dashboard background
  },
  content: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center', 
    maxWidth: 480, 
    width: '100%', 
    alignSelf: 'center' 
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 40 
  },
  logoBox: { 
    width: 64, 
    height: 64, 
    backgroundColor: '#185B37', // Signature Deep Green
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 20,
    shadowColor: '#185B37',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 4,
  },
  title: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 32, 
    color: '#111827', 
    letterSpacing: -0.5, 
    marginBottom: 8 
  },
  subtitle: { 
    fontFamily: 'Bricolage_400', 
    fontSize: 16, 
    color: '#6B7280' 
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 4,
  },
  inputLabel: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 12, 
    color: '#9CA3AF', 
    letterSpacing: 0.5, 
    marginBottom: 8, 
    marginTop: 16 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 12, 
    backgroundColor: '#F9FAFB', 
    paddingHorizontal: 16, 
    height: 52 
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    fontFamily: 'Bricolage_500', 
    fontSize: 15, 
    color: '#111827', 
    height: '100%',
    outlineStyle: 'solid',
    outlineColor: 'transparent',
  },
  buttonRow: { 
    marginTop: 32, 
    gap: 12 
  },
  button: { 
    height: 52, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: { 
    backgroundColor: '#185B37' 
  },
  primaryButtonText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 15, 
    color: '#FFFFFF' 
  },
  secondaryButton: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#E5E7EB' 
  },
  secondaryButtonText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 15, 
    color: '#4B5563' 
  }
});