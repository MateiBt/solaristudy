import { Feather } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../lib/supabase';

const FAQS = [
  {
    id: '1',
    question: 'What is the difference between SolariLearn and SolariSolve?',
    answer: 'SolariLearn is designed for open-ended, Socratic tutoring where the AI guides you to the answer without giving it away directly. SolariSolve focuses on structured problem ingestion, focus timers, and step-by-step grading of your final proofs.'
  },
  {
    id: '2',
    question: 'How do I format math equations in the chat?',
    answer: 'SolariStudy supports KaTeX for beautiful math rendering. You can write inline equations by wrapping them in single dollar signs ($E=mc^2$) and block equations with double dollar signs ($$a^2 + b^2 = c^2$$).'
  },
  {
    id: '3',
    question: 'How does the grading accuracy engine work?',
    answer: 'When you complete a focus session in SolariSolve, the AI extracts a structured score (e.g., 8/10). You can toggle whether an attempt counts towards your global dashboard analytics using the accuracy badge under the graded message.'
  }
];

export default function SupportScreen() {
  const navigation = useNavigation();
  const [activeFaq, setActiveFaq] = useState<string | null>(null);

  const [category, setCategory] = useState<'Bug' | 'Feature' | 'Other'>('Bug');
  const [subject, setSubject] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmitFeedback() {
    if (!subject.trim() || !details.trim()) {
      Alert.alert('Incomplete Form', 'Please fill in both the subject and details fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.from('feedback').insert({
        user_id: session?.user?.id || null,
        category,
        subject,
        details,
      });

      if (error) throw error;

      Alert.alert('Feedback Sent', 'Thank you for helping improve SolariStudy!');
      setSubject('');
      setDetails('');
    } catch (error: any) {
      Alert.alert('Submission Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topNav}>
          <TouchableOpacity 
            style={styles.menuButton} 
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          >
            <Feather name="menu" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Help & Support</Text>
          <Text style={styles.subtitle}>Find answers or report an issue with the platform.</Text>
        </View>

        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.sectionCard}>
          {FAQS.map((faq, index) => {
            const isActive = activeFaq === faq.id;
            return (
              <View key={faq.id} style={[styles.faqItem, index === FAQS.length - 1 && { borderBottomWidth: 0 }]}>
                <TouchableOpacity 
                  style={styles.faqHeader} 
                  activeOpacity={0.7}
                  onPress={() => setActiveFaq(isActive ? null : faq.id)}
                >
                  <Text style={[styles.faqQuestion, isActive && { color: '#185B37' }]}>
                    {faq.question}
                  </Text>
                  <Feather name={isActive ? "chevron-up" : "chevron-down"} size={20} color={isActive ? "#185B37" : "#9CA3AF"} />
                </TouchableOpacity>
                {isActive && (
                  <View style={styles.faqBody}>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>System Status</Text>
        <View style={styles.sectionCard}>
          <View style={[styles.statusRow, { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
            <View style={styles.statusLeft}>
              <Feather name="server" size={18} color="#4B5563" style={styles.statusIcon} />
              <Text style={styles.statusText}>Supabase Edge Functions</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.statusBadgeText}>Operational</Text>
            </View>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Feather name="cpu" size={18} color="#4B5563" style={styles.statusIcon} />
              <Text style={styles.statusText}>Gemini AI Engine</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.statusBadgeText}>Operational</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Submit Feedback</Text>
        <View style={[styles.sectionCard, { padding: 20 }]}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <View style={styles.chipRow}>
              {(['Bug', 'Feature', 'Other'] as const).map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.chip, category === cat && styles.chipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject</Text>
            <TextInput 
              style={styles.input}
              placeholder="Briefly describe the issue..."
              placeholderTextColor="#9CA3AF"
              value={subject}
              onChangeText={setSubject}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Details</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              placeholder="Provide more details, steps to reproduce, or feature ideas..."
              placeholderTextColor="#9CA3AF"
              value={details}
              onChangeText={setDetails}
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]}
            onPress={handleSubmitFeedback}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Feather name="send" size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  scrollContent: {
    padding: 24,
    paddingTop: 40,
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 64
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40
  },
  menuButton: {
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  headerContainer: {
    marginBottom: 32
  },
  header: {
    fontFamily: 'Bricolage_600',
    fontSize: 32,
    color: '#111827',
    marginBottom: 8
  },
  subtitle: {
    fontFamily: 'Bricolage_400',
    fontSize: 16,
    color: '#6B7280'
  },
  sectionTitle: {
    fontFamily: 'Bricolage_600',
    fontSize: 14,
    color: '#9CA3AF',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 32
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden'
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20
  },
  faqQuestion: {
    flex: 1,
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#111827',
    paddingRight: 16
  },
  faqBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 0
  },
  faqAnswer: {
    fontFamily: 'Bricolage_400',
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusIcon: {
    marginRight: 12
  },
  statusText: {
    fontFamily: 'Bricolage_500',
    fontSize: 15,
    color: '#111827'
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6
  },
  statusBadgeText: {
    fontFamily: 'Bricolage_600',
    fontSize: 12,
    color: '#10B981'
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontFamily: 'Bricolage_600',
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 8
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  chipActive: {
    backgroundColor: '#E6F0EB',
    borderColor: '#185B37'
  },
  chipText: {
    fontFamily: 'Bricolage_500',
    fontSize: 14,
    color: '#4B5563'
  },
  chipTextActive: {
    color: '#185B37',
    fontFamily: 'Bricolage_600'
  },
  input: {
    fontFamily: 'Bricolage_400',
    fontSize: 15,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    outlineStyle: 'none' as any
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16
  },
  submitButton: {
    backgroundColor: '#185B37',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 12,
    marginTop: 8
  },
  submitButtonText: {
    fontFamily: 'Bricolage_600',
    fontSize: 15,
    color: '#FFFFFF'
  }
});