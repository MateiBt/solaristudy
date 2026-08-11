import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const subjectName = id ? id.toString().charAt(0).toUpperCase() + id.toString().slice(1) : 'Session';

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <View style={styles.mainWorkspace}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={24} color="#222222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{subjectName} Session</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Feather name="more-horizontal" size={24} color="#222222" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.chatArea} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.aiMessage}>
            <View style={styles.avatarContainer}>
              <Feather name="cpu" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.messageContent}>
              <Text style={styles.messageText}>Welcome to your {subjectName} session. I am ready to analyze your problem. Which mode would you like to use today?</Text>
            </View>
          </View>
          
          <View style={styles.modeSelectionContainer}>
            <TouchableOpacity style={styles.modeCard} activeOpacity={0.7}>
              <View style={styles.modeIconContainerLearn}>
                <Feather name="compass" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>SolariLearn</Text>
                <Text style={styles.modeDescription}>Step-by-step hints and Socratic guidance to help you find the answer yourself.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modeCard} activeOpacity={0.7}>
              <View style={styles.modeIconContainerSolve}>
                <Feather name="zap" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.modeTextContainer}>
                <Text style={styles.modeTitle}>SolariSolve</Text>
                <Text style={styles.modeDescription}>Direct LaTeX conversion, full solution breakdown, and instant formula extraction.</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.inputZone}>
          <View style={styles.inputBox}>
            <TouchableOpacity style={styles.attachButton}>
              <Feather name="camera" size={22} color="#666666" />
            </TouchableOpacity>
            <TextInput 
              style={styles.textInput}
              placeholder="Upload a problem or start typing..."
              placeholderTextColor="#999999"
              multiline
            />
            <TouchableOpacity style={styles.sendButton}>
              <Feather name="arrow-up" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.rightSidebar}>
        <Text style={styles.sidebarTitle}>Past Chats</Text>
        
        <TouchableOpacity style={styles.historyItem}>
          <Feather name="message-circle" size={16} color="#666666" style={styles.historyIcon} />
          <Text style={styles.historyText} numberOfLines={1}>Projectile Motion Q4</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.historyItem}>
          <Feather name="message-circle" size={16} color="#666666" style={styles.historyIcon} />
          <Text style={styles.historyText} numberOfLines={1}>Newton's Second Law</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.historyItem}>
          <Feather name="message-circle" size={16} color="#666666" style={styles.historyIcon} />
          <Text style={styles.historyText} numberOfLines={1}>Friction on an incline</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#FFFFFF' },
  mainWorkspace: { flex: 1, flexDirection: 'column' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  iconButton: { padding: 8, backgroundColor: '#F5F5F5', borderRadius: 8 },
  headerTitle: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#222222', letterSpacing: -0.3 },
  chatArea: { flex: 1, paddingHorizontal: 24, paddingTop: 24 },
  scrollContent: { paddingBottom: 40 },
  aiMessage: { flexDirection: 'row', marginBottom: 24, paddingRight: 40 },
  avatarContainer: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#222222', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  messageContent: { flex: 1, paddingTop: 6 },
  messageText: { fontFamily: 'Bricolage_400', fontSize: 16, color: '#222222', lineHeight: 24 },
  modeSelectionContainer: { paddingLeft: 52, paddingRight: 20 },
  modeCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FAFAFA', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEA', marginBottom: 12 },
  modeIconContainerLearn: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  modeIconContainerSolve: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#FF8C00', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  modeTextContainer: { flex: 1 },
  modeTitle: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#222222', marginBottom: 4, letterSpacing: -0.3 },
  modeDescription: { fontFamily: 'Bricolage_400', fontSize: 14, color: '#666666', lineHeight: 20 },
  inputZone: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 12, backgroundColor: '#FFFFFF' },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 24, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#FAFAFA' },
  attachButton: { padding: 8, marginRight: 4, justifyContent: 'center', alignItems: 'center' },
  textInput: { flex: 1, fontFamily: 'Bricolage_400', fontSize: 16, color: '#222222', maxHeight: 100, minHeight: 24, paddingTop: 8, paddingBottom: 8 },
  sendButton: { backgroundColor: '#222222', padding: 10, borderRadius: 100, marginLeft: 8, justifyContent: 'center', alignItems: 'center' },
  rightSidebar: { width: 300, borderLeftWidth: 1, borderLeftColor: '#F0F0F0', backgroundColor: '#FAFAFA', padding: 24, display: Platform.OS === 'web' ? 'flex' : 'none' },
  sidebarTitle: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#222222', letterSpacing: -0.3, marginBottom: 20 },
  historyItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  historyIcon: { marginRight: 12 },
  historyText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#444444', flex: 1 }
});