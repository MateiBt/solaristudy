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
            <Feather name="cpu" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>SolariStudy</Text>
          <Text style={styles.subtitle}>Your personal AI study engine.</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>EMAIL</Text>
          <View style={styles.inputWrapper}>
            <Feather name="mail" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.inputWrapper}>
            <Feather name="lock" size={20} color="#666666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999999"
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
    backgroundColor: '#FFFFFF' 
  },
  content: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center', 
    maxWidth: 500, 
    width: '100%', 
    alignSelf: 'center' 
  },
  headerContainer: { 
    alignItems: 'center', 
    marginBottom: 48 
  },
  logoBox: { 
    width: 64, 
    height: 64, 
    backgroundColor: '#222222', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  title: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 32, 
    color: '#222222', 
    letterSpacing: -0.5, 
    marginBottom: 8 
  },
  subtitle: { 
    fontFamily: 'Bricolage_400', 
    fontSize: 16, 
    color: '#666666' 
  },
  formContainer: { 
    width: '100%' 
  },
  inputLabel: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 12, 
    color: '#888888', 
    letterSpacing: 1, 
    marginBottom: 8, 
    marginTop: 16 
  },
  inputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#EAEAEA', 
    borderRadius: 12, 
    backgroundColor: '#FAFAFA', 
    paddingHorizontal: 16, 
    height: 56 
  },
  inputIcon: { 
    marginRight: 12 
  },
  input: { 
    flex: 1, 
    fontFamily: 'Bricolage_500', 
    fontSize: 16, 
    color: '#222222', 
    height: '100%' 
  },
  buttonRow: { 
    marginTop: 32, 
    gap: 12 
  },
  button: { 
    height: 56, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  primaryButton: { 
    backgroundColor: '#222222' 
  },
  primaryButtonText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 16, 
    color: '#FFFFFF' 
  },
  secondaryButton: { 
    backgroundColor: '#FFFFFF', 
    borderWidth: 1, 
    borderColor: '#EAEAEA' 
  },
  secondaryButtonText: { 
    fontFamily: 'Bricolage_600', 
    fontSize: 16, 
    color: '#222222' 
  }
});