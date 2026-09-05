import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions
} from 'react-native';
import { supabase } from '../lib/supabase';

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleAuth() {
    if (!email.trim()) {
      setErrorMsg('Please enter an email address.');
      return;
    }
    if (!isResetting && !password.trim()) {
      setErrorMsg('Please enter a password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isResetting) {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) throw error;
        setSuccessMsg('Password reset instructions sent to your email.');
        setIsResetting(false);
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        setSuccessMsg('Account created! Please check your email to verify.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        router.replace('/');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.card, width > 600 && styles.cardDesktop]}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Feather name="hexagon" size={28} color="#185B37" />
          </View>
          <Text style={styles.title}>SolariStudy</Text>
          <Text style={styles.subtitle}>
            {isResetting 
              ? "Reset your password" 
              : isSignUp 
                ? "Create your scholar account" 
                : "Sign in to your account"}
          </Text>
        </View>

        {errorMsg !== '' && (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={16} color="#EF4444" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        {successMsg !== '' && (
          <View style={styles.successBox}>
            <Feather name="check-circle" size={16} color="#10B981" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="scholar@example.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>
          </View>

          {!isResetting && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Feather name="lock" size={18} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  style={styles.visibilityToggle} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!isResetting && !isSignUp && (
            <TouchableOpacity 
              style={styles.forgotPassword} 
              onPress={() => {
                setIsResetting(true);
                setErrorMsg('');
                setSuccessMsg('');
              }}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isResetting ? "Send Reset Link" : isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {isResetting ? (
            <TouchableOpacity onPress={() => setIsResetting(false)}>
              <Text style={styles.footerText}>
                Remember your password? <Text style={styles.footerLink}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
              setSuccessMsg('');
            }}>
              <Text style={styles.footerText}>
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <Text style={styles.footerLink}>
                  {isSignUp ? "Sign in" : "Sign up"}
                </Text>
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 4,
  },
  cardDesktop: {
    maxWidth: 440,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#E6F0EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Bricolage_600',
    fontSize: 24,
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Bricolage_400',
    fontSize: 15,
    color: '#6B7280',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 24,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#EF4444',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginBottom: 24,
    gap: 8,
  },
  successText: {
    flex: 1,
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#10B981',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Bricolage_600',
    fontSize: 13,
    color: '#4B5563',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    height: 52,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Bricolage_400',
    fontSize: 15,
    color: '#111827',
    outlineStyle: 'none' as any,
  },
  visibilityToggle: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    fontFamily: 'Bricolage_500',
    fontSize: 13,
    color: '#185B37',
  },
  submitButton: {
    backgroundColor: '#185B37',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#FFFFFF',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Bricolage_400',
    fontSize: 14,
    color: '#6B7280',
  },
  footerLink: {
    fontFamily: 'Bricolage_600',
    color: '#185B37',
  },
});