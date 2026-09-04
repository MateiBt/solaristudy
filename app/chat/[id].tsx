import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { WebView } from 'react-native-webview';
import { generateAIResponse } from '../../lib/ai';
import { createFolder, createSession, deleteSession, getFolders, getSessions, updateSessionState, updateSolveStage } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import { ChatMessage, ChatSession, SessionMode, SolveStage, StudyFolder } from '../../lib/types';

const PHYSICS_TOPICS = [
  'Classical Mechanics', 'Quantum Mechanics', 'Electromagnetism', 
  'Statistical Physics', 'Condensed Matter', 'General Relativity', 
  'Optics', 'Quantum Field Theory', 'Other topics'
];

const MathBubble = ({ content }: { content: string }) => {
  const [height, setHeight] = useState(40);

  if (Platform.OS === 'web') {
    return (
      <Markdown style={markdownStyles}>
        {content || '...'}
      </Markdown>
    );
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
      <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; 
          font-size: 15px; 
          color: #111827; 
          margin: 0; 
          padding: 0;
          word-wrap: break-word;
        }
        p { margin-top: 0; margin-bottom: 12px; }
        p:last-child { margin-bottom: 0; }
        code { background: #F3F4F6; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 13px; }
        pre { background: #F3F4F6; padding: 12px; border-radius: 8px; overflow-x: auto; font-family: monospace; font-size: 13px;}
        pre code { background: transparent; padding: 0; }
        strong { font-weight: 600; }
        em { font-style: italic; }
      </style>
    </head>
    <body>
      <div id="content"></div>
      <script>
        document.getElementById('content').innerHTML = marked.parse(${JSON.stringify(content)});
        
        renderMathInElement(document.body, {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false}
          ],
          throwOnError: false
        });

        const sendHeight = () => {
          const contentHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
          window.ReactNativeWebView.postMessage(contentHeight.toString());
        };
        
        const observer = new MutationObserver(sendHeight);
        observer.observe(document.body, { childList: true, subtree: true, attributes: true });
        
        window.onload = sendHeight;
        setTimeout(sendHeight, 200); 
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height, width: '100%', minHeight: 40 }}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{ height, width: '100%', backgroundColor: 'transparent' }}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMessage={(event) => {
          const contentHeight = Number(event.nativeEvent.data);
          if (contentHeight > 0) setHeight(contentHeight + 16); 
        }}
      />
    </View>
  );
};

export default function ChatScreen() {
  const { id, folderId: paramFolderId, sessionId: paramSessionId } = useLocalSearchParams();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const subjectId = id ? id.toString() : 'general';
  const subjectName = subjectId.charAt(0).toUpperCase() + subjectId.slice(1);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{id: string, name: string}[]>([]); 
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);

  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [attachment, setAttachment] = useState<{ uri: string, base64: string, mimeType: string } | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null); 

  const [activeMode, setActiveMode] = useState<SessionMode>('SolariLearn');
  const [solvePhase, setSolvePhase] = useState<SolveStage>('ingest_problems');

  const [focusTimerStatus, setFocusTimerStatus] = useState<'idle' | 'running'>('idle');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [initialFocusSeconds, setInitialFocusSeconds] = useState<number>(0);

  const [showTitleModal, setShowTitleModal] = useState(false);
  const [suggestedTitle, setSuggestedTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<ChatSession | null>(null);

  useEffect(() => {
    if (paramFolderId && !currentFolderId) {
      setCurrentFolderId(paramFolderId.toString());
    }
  }, [paramFolderId]);

  useEffect(() => {
    loadSidebarData();
  }, [subjectId, currentFolderId]);

  useEffect(() => {
    if (activeSession) {
      loadMessages(activeSession.id);
      setActiveMode(activeSession.mode || 'SolariLearn');
      setSolvePhase(activeSession.solve_stage || 'ingest_problems');
      setSelectedTopic(activeSession.topic || null); 
    } else {
      setMessages([]);
      setSelectedTopic(null);
    }
  }, [activeSession]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (focusTimerStatus === 'running' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (focusTimerStatus === 'running' && timeRemaining <= 0) {
      handleFinishFocus();
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusTimerStatus, timeRemaining]);

  async function loadSidebarData() {
    try {
      setIsLoadingSidebar(true);
      const targetFolderId = currentFolderId || (paramFolderId ? paramFolderId.toString() : null);
      
      const [fetchedFolders, fetchedSessions] = await Promise.all([
        getFolders(subjectId, targetFolderId),
        getSessions(subjectId, targetFolderId)
      ]);
      
      setFolders(fetchedFolders);
      setSessions(fetchedSessions);
      
      if (paramSessionId && !activeSession) {
        const targetSession = fetchedSessions.find(s => s.id === paramSessionId.toString());
        if (targetSession) {
          setActiveSession(targetSession);
        }
      } else if (!activeSession && targetFolderId === null && fetchedSessions.length > 0 && !paramSessionId) {
          const unarchived = fetchedSessions.filter(s => !s.is_archived);
          if (unarchived.length > 0) setActiveSession(unarchived[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingSidebar(false);
    }
  }

  async function loadMessages(sessionId: string) {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      setMessages(prev => {
        const fetchedMsgs = data || [];
        const dbIds = new Set(fetchedMsgs.map(m => m.id));
        const tempMsgs = prev.filter(m => String(m.id).startsWith('temp-') && !dbIds.has(m.id));
        return [...fetchedMsgs, ...tempMsgs];
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function handleCreateFolder() {
    if (!newFolderName.trim()) return;
    try {
      const newFolder = await createFolder(subjectId, newFolderName.trim(), currentFolderId);
      setFolders(prev => [...prev, newFolder]);
      setShowFolderModal(false);
      setNewFolderName('');
    } catch (error) {
      console.error(error);
    }
  }

  function handleNavigateToFolder(folder: StudyFolder) {
    setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  }

  function handleNavigateBack() {
    const newStack = [...folderStack];
    newStack.pop();
    setFolderStack(newStack);
    setCurrentFolderId(newStack.length > 0 ? newStack[newStack.length - 1].id : null);
  }

  function handleSetupNewSession() {
    setActiveSession(null);
    setMessages([]);
    setSelectedTopic(null);
    setSolvePhase('ingest_problems');
    setFocusTimerStatus('idle');
  }

  async function handleAttachImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        base64: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].base64) {
        setAttachment({
          uri: result.assets[0].uri,
          base64: result.assets[0].base64,
          mimeType: result.assets[0].mimeType || 'image/jpeg'
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function handleStartFocus(minutes: number) {
    const totalSeconds = minutes * 60;
    setInitialFocusSeconds(totalSeconds);
    setTimeRemaining(totalSeconds);
    setFocusTimerStatus('running');
    if (activeSession) {
       await updateSolveStage(activeSession.id, 'focus_timer', { startedAt: new Date().toISOString(), duration: totalSeconds });
    }
  }

  async function handleFinishFocus() {
    const actualSecondsSpent = Math.max(0, initialFocusSeconds - timeRemaining);
    setFocusTimerStatus('idle');
    setSolvePhase('grading_and_review');
    
    if (activeSession) {
       const newTotalActualSeconds = (activeSession.actual_focus_seconds || 0) + actualSecondsSpent;
       
       await updateSolveStage(activeSession.id, 'grading_and_review', { 
         completedAt: new Date().toISOString(),
         actualFocusSeconds: newTotalActualSeconds
       });
       
       const contentMsg = "Focus session complete! 🎯 Submit your answers or workings whenever you're ready for grading.";
       
       const tempMsgId = 'sys-' + Date.now();
       setMessages(prev => [...prev, {
         id: tempMsgId,
         session_id: activeSession.id,
         user_id: activeSession.user_id,
         sender: 'ai',
         content: contentMsg,
         status: 'completed',
         ocr_content: null,
         media_url: null,
         score_earned: null,
         score_possible: null,
         include_in_accuracy: false,
         created_at: new Date().toISOString()
       }]);

       supabase.from('chat_messages').insert([{
         session_id: activeSession.id,
         user_id: activeSession.user_id,
         sender: 'ai',
         content: contentMsg,
         status: 'completed'
       }]).select().single().then(({ data }) => {
         if (data) setMessages(prev => prev.map(m => m.id === tempMsgId ? data as ChatMessage : m));
       });
       
       setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  async function handleSendMessage(overrideText?: string) {
    const rawInputText = overrideText || inputText.trim();
    const currentAttachment = attachment;

    if ((!rawInputText && !currentAttachment) || isSending) return;
    
    setIsSending(true);
    setInputText(''); 
    setAttachment(null);
    
    try {
      let sessionToUse = activeSession;
      
      if (!sessionToUse) {
        sessionToUse = await createSession(
          subjectId, 
          currentFolderId, 
          activeMode, 
          'gemini-3.5-flash-lite', 
          undefined, 
          selectedTopic && selectedTopic !== 'Other topics' ? selectedTopic : null
        );
        setSessions(prev => [sessionToUse!, ...prev]);
        setActiveSession(sessionToUse);
      }
      if (!sessionToUse) throw new Error("Failed to initialize session.");

      let aiPromptText = rawInputText;
      if (messages.length === 0 && selectedTopic && selectedTopic !== 'Other topics') {
        aiPromptText = `[Topic context: ${selectedTopic}]\n\n${rawInputText}`;
      }

      const displayContent = currentAttachment 
        ? (rawInputText ? `[Image Attached] ${rawInputText}` : `[Image Attached]`) 
        : rawInputText;

      const tempUserMsgId = 'temp-user-' + Date.now();
      setMessages(prev => [...prev, {
        id: tempUserMsgId,
        session_id: sessionToUse.id,
        user_id: sessionToUse.user_id,
        sender: 'user',
        content: displayContent,
        status: 'completed',
        ocr_content: null,
        media_url: null,
        score_earned: null,
        score_possible: null,
        include_in_accuracy: true,
        created_at: new Date().toISOString()
      }]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

      supabase.from('chat_messages').insert([{
        session_id: sessionToUse.id,
        user_id: sessionToUse.user_id,
        sender: 'user',
        content: displayContent,
        status: 'completed'
      }]).select().single().then(({ data, error }) => {
        if (!error && data) {
          setMessages(prev => prev.map(m => m.id === tempUserMsgId ? data as ChatMessage : m));
        }
      });

      if (!sessionToUse.title_confirmed) {
        const hint = rawInputText ? rawInputText.split(' ')[0] : 'Image';
        setSuggestedTitle(`Understanding ${hint.charAt(0).toUpperCase() + hint.slice(1)}`);
        setCustomTitle('');
        setShowTitleModal(true);
      }

      const tempAiMsgId = 'temp-ai-' + Date.now();
      setMessages(prev => [...prev, {
        id: tempAiMsgId,
        session_id: sessionToUse.id,
        user_id: sessionToUse.user_id,
        sender: 'ai',
        content: '',
        status: 'streaming',
        ocr_content: null,
        media_url: null,
        score_earned: null,
        score_possible: null,
        include_in_accuracy: true,
        created_at: new Date().toISOString()
      }]);

      const aiResponseText = await generateAIResponse(aiPromptText, {
        mode: activeMode,
        model_id: sessionToUse.model_id,
        solvePhase: activeMode === 'SolariSolve' ? solvePhase : undefined,
        conversationHistory: messages.map(m => ({ sender: m.sender as 'user' | 'ai', content: m.content })),
      }, (streamedText) => {
        setMessages(prev => prev.map(m => m.id === tempAiMsgId ? { ...m, content: streamedText } : m));
      });

      if (activeMode === 'SolariSolve' && solvePhase === 'ingest_problems') {
        setSolvePhase('focus_timer');
        await updateSolveStage(sessionToUse.id, 'focus_timer');
      }

      const { data: insertedAiMsg, error: aiError } = await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionToUse.id,
          user_id: sessionToUse.user_id,
          sender: 'ai',
          content: aiResponseText,
          status: 'completed'
        }])
        .select()
        .single();
        
      if (!aiError && insertedAiMsg) {
        setMessages(prev => prev.map(m => m.id === tempAiMsgId ? insertedAiMsg as ChatMessage : m));
      }
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);

    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  async function handleConfirmTitle(titleToSave: string) {
    if (!activeSession || !titleToSave.trim()) return;
    try {
      const finalTitle = titleToSave.trim();
      await updateSessionState(activeSession.id, { title: finalTitle, title_confirmed: true });
      const updatedSession = { ...activeSession, title: finalTitle, title_confirmed: true };
      setActiveSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === activeSession.id ? updatedSession : s));
      setShowTitleModal(false);
    } catch (error) {
      console.error(error);
    }
  }

  function handleTopRightMenu() {
    if (activeSession) {
      openSessionOptions(activeSession);
    } else {
      handleSetupNewSession();
    }
  }

  function openSessionOptions(session: ChatSession) {
    setSessionToEdit(session);
    setShowOptionsModal(true);
  }

  async function handleClearChat() {
    if (!sessionToEdit) return;
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('session_id', sessionToEdit.id);
      
      if (error) throw error;
      
      if (activeSession?.id === sessionToEdit.id) {
        setMessages([]);
        setSolvePhase('ingest_problems');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowOptionsModal(false);
    }
  }

  async function handleToggleFavorite() {
    if (!sessionToEdit) return;
    const newStatus = !sessionToEdit.is_favorited;
    try {
      await updateSessionState(sessionToEdit.id, { is_favorited: newStatus });
      setSessions(prev => prev.map(s => s.id === sessionToEdit.id ? { ...s, is_favorited: newStatus } : s));
      if (activeSession?.id === sessionToEdit.id) {
        setActiveSession({ ...activeSession, is_favorited: newStatus });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowOptionsModal(false);
    }
  }

  async function handleArchiveSession() {
    if (!sessionToEdit) return;
    try {
      await updateSessionState(sessionToEdit.id, { is_archived: true });
      setSessions(prev => prev.map(s => s.id === sessionToEdit.id ? { ...s, is_archived: true } : s));
      if (activeSession?.id === sessionToEdit.id) setActiveSession(null);
    } catch (error) {
      console.error(error);
    } finally {
      setShowOptionsModal(false);
    }
  }

  async function handleDeleteSession() {
    if (!sessionToEdit) return;
    try {
      await deleteSession(sessionToEdit.id);
      setSessions(prev => prev.filter(s => s.id !== sessionToEdit.id));
      if (activeSession?.id === sessionToEdit.id) setActiveSession(null);
    } catch (error) {
      console.error(error);
    } finally {
      setShowOptionsModal(false);
    }
  }

  const displayedSessions = sessions
    .filter(s => !s.is_archived)
    .sort((a, b) => Number(b.is_favorited) - Number(a.is_favorited));

  const isPhysicsInitial = subjectId.toLowerCase() === 'physics' && messages.length === 0;

  const renderModeSelector = () => (
    <View style={styles.modeCardsWrapper}>
      <Text style={styles.modeCardsTitle}>Select your study mode</Text>
      <View style={styles.modeCardsContainer}>
        <TouchableOpacity 
          style={[styles.modeCard, activeMode === 'SolariLearn' && styles.modeCardActive]}
          onPress={() => setActiveMode('SolariLearn')}
          activeOpacity={0.8}
        >
          <View style={[styles.modeIconBox, activeMode === 'SolariLearn' && styles.modeIconBoxActive]}>
            <Feather name="book-open" size={20} color={activeMode === 'SolariLearn' ? "#185B37" : "#6B7280"} />
          </View>
          <Text style={[styles.modeCardTitle, activeMode === 'SolariLearn' && styles.modeCardTitleActive]}>SolariLearn</Text>
          <Text style={styles.modeCardSub}>Socratic tutoring, concept breakdowns, and step-by-step mastery.</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.modeCard, activeMode === 'SolariSolve' && styles.modeCardActive]}
          onPress={() => setActiveMode('SolariSolve')}
          activeOpacity={0.8}
        >
          <View style={[styles.modeIconBox, activeMode === 'SolariSolve' && styles.modeIconBoxActive]}>
            <Feather name="target" size={20} color={activeMode === 'SolariSolve' ? "#185B37" : "#6B7280"} />
          </View>
          <Text style={[styles.modeCardTitle, activeMode === 'SolariSolve' && styles.modeCardTitleActive]}>SolariSolve</Text>
          <Text style={styles.modeCardSub}>Upload problems, start a focus timer, and get line-by-line grading.</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFocusEngine = () => (
    <View style={styles.focusEngineContainer}>
      {focusTimerStatus === 'idle' ? (
        <>
          <Feather name="clock" size={48} color="#185B37" style={{ marginBottom: 24 }} />
          <Text style={styles.focusTitle}>Set your focus time</Text>
          <Text style={styles.focusSubtitle}>Commit to a block of uninterrupted problem-solving.</Text>
          <View style={styles.focusPresetsRow}>
            {[15, 30, 45, 60].map(mins => (
              <TouchableOpacity key={mins} style={styles.focusPresetBtn} onPress={() => handleStartFocus(mins)}>
                <Text style={styles.focusPresetText}>{mins} min</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.focusTimerText}>
            {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={styles.focusSubtitle}>Deep work in progress. Solve the ingested problems.</Text>
          <TouchableOpacity style={styles.finishFocusBtn} onPress={handleFinishFocus}>
            <Text style={styles.finishFocusBtnText}>Finish Focus Session</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const getPlaceholderText = () => {
    if (activeMode === 'SolariSolve') {
      return solvePhase === 'grading_and_review' ? "Submit your answers for grading..." : "Upload problems to start...";
    }
    return "Ask a question...";
  };

  const renderInputBox = () => (
    <View style={styles.inputContainer}>
      
      <View style={styles.previewsRow}>
        {selectedTopic && messages.length === 0 && (
          <View style={styles.dockedChipContainer}>
            <View style={styles.dockedChip}>
              <Text style={styles.dockedChipText}>Topic: {selectedTopic}</Text>
              <TouchableOpacity onPress={() => setSelectedTopic(null)} style={styles.dockedChipClose}>
                <Feather name="x" size={14} color="#185B37" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {attachment && (
          <View style={styles.attachmentPreviewContainer}>
            <Image source={{ uri: attachment.uri }} style={styles.attachmentImage} />
            <TouchableOpacity style={styles.removeAttachmentBtn} onPress={() => setAttachment(null)}>
              <Feather name="x" size={12} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.inputBox}>
        <TouchableOpacity style={styles.attachButton} onPress={handleAttachImage}>
          <Feather name="paperclip" size={20} color={attachment ? "#185B37" : "#9CA3AF"} />
        </TouchableOpacity>
        
        <TextInput 
          style={styles.textInput}
          placeholder={getPlaceholderText()}
          placeholderTextColor="#9CA3AF"
          multiline
          value={inputText}
          onChangeText={setInputText}
          onKeyPress={(e: any) => {
            if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />

        <TouchableOpacity 
          style={[styles.sendButton, ((!inputText.trim() && !attachment) || isSending) && { backgroundColor: '#E5E7EB' }]}
          onPress={() => handleSendMessage()}
          disabled={(!inputText.trim() && !attachment) || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Feather name="arrow-up" size={18} color={(!inputText.trim() && !attachment) ? "#9CA3AF" : "#FFFFFF"} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      
      <Modal visible={showTitleModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBox}>
                <Feather name="cpu" size={20} color="#185B37" />
              </View>
              <Text style={styles.modalTitle}>Name this session</Text>
            </View>
            <Text style={styles.modalSubtitle}>SolariStudy generated a title based on your first prompt.</Text>
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionLabel}>AI SUGGESTION</Text>
              <View style={styles.suggestionRow}>
                <Text style={styles.suggestionText}>"{suggestedTitle}"</Text>
                <TouchableOpacity style={styles.acceptButton} onPress={() => handleConfirmTitle(suggestedTitle)}>
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalDivider}>
              <Text style={styles.modalDividerText}>OR ENTER CUSTOM</Text>
            </View>
            <View style={styles.customInputWrapper}>
              <TextInput 
                style={styles.customInput}
                placeholder="Type a custom title..."
                placeholderTextColor="#9CA3AF"
                value={customTitle}
                onChangeText={setCustomTitle}
                onSubmitEditing={() => handleConfirmTitle(customTitle)}
              />
              <TouchableOpacity 
                style={[styles.saveCustomButton, !customTitle.trim() && { opacity: 0.5 }]}
                onPress={() => handleConfirmTitle(customTitle)}
                disabled={!customTitle.trim()}
              >
                <Feather name="check" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showFolderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxWidth: 400 }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconBox, { backgroundColor: '#F3F4F6' }]}>
                <Feather name="folder-plus" size={20} color="#4B5563" />
              </View>
              <Text style={styles.modalTitle}>New Folder</Text>
            </View>
            <Text style={styles.modalSubtitle}>Create a folder to organize your sessions.</Text>
            <View style={styles.customInputWrapper}>
              <TextInput 
                style={styles.customInput}
                placeholder="Folder name..."
                placeholderTextColor="#9CA3AF"
                value={newFolderName}
                onChangeText={setNewFolderName}
                onSubmitEditing={handleCreateFolder}
                autoFocus
              />
            </View>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowFolderModal(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, !newFolderName.trim() && { opacity: 0.5 }]} 
                onPress={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                <Text style={styles.confirmButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showOptionsModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowOptionsModal(false)}>
          <TouchableOpacity activeOpacity={1} style={[styles.modalCard, { maxWidth: 320 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{sessionToEdit?.title || 'New Session'}</Text>
            </View>

            <TouchableOpacity style={styles.optionActionBtn} onPress={() => {
              setShowOptionsModal(false);
              setCustomTitle(sessionToEdit?.title || '');
              setSuggestedTitle('');
              setShowTitleModal(true);
            }}>
              <Feather name="edit-2" size={18} color="#4B5563" />
              <Text style={styles.optionActionText}>Rename Session</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionActionBtn} onPress={handleToggleFavorite}>
              <Feather name="star" size={18} color="#4B5563" />
              <Text style={styles.optionActionText}>{sessionToEdit?.is_favorited ? "Remove from Favorites" : "Favorite Session"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionActionBtn} onPress={handleClearChat}>
              <Feather name="message-square" size={18} color="#4B5563" />
              <Text style={styles.optionActionText}>Clear Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionActionBtn} onPress={handleArchiveSession}>
              <Feather name="archive" size={18} color="#4B5563" />
              <Text style={styles.optionActionText}>Archive Session</Text>
            </TouchableOpacity>

            <View style={styles.sidebarSeparator} />

            <TouchableOpacity style={styles.optionActionBtn} onPress={handleDeleteSession}>
              <Feather name="trash-2" size={18} color="#EF4444" />
              <Text style={[styles.optionActionText, { color: '#EF4444' }]}>Delete Session</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <View style={styles.leftSidebar}>
        <View style={styles.sidebarHeaderRow}>
          {currentFolderId ? (
            <TouchableOpacity style={styles.backToRootBtn} onPress={handleNavigateBack}>
              <Feather name="chevron-left" size={18} color="#111827" />
              <Text style={styles.backToRootText} numberOfLines={1}>
                {folderStack.length > 0 ? folderStack[folderStack.length - 1].name : subjectName}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.sidebarTitle}>{subjectName}</Text>
          )}
          
          <View style={styles.sidebarActions}>
            <TouchableOpacity onPress={() => setShowFolderModal(true)} style={styles.sidebarActionBtn}>
              <Feather name="folder-plus" size={16} color="#4B5563" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSetupNewSession} style={styles.sidebarActionBtn}>
              <Feather name="edit" size={16} color="#4B5563" />
            </TouchableOpacity>
          </View>
        </View>
        
        {isLoadingSidebar ? (
          <ActivityIndicator color="#185B37" style={{ marginTop: 24 }} />
        ) : (folders.length === 0 && displayedSessions.length === 0) ? (
          <Text style={styles.emptyText}>Start your first session.</Text>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Folders</Text>
            {folders.map((folder) => (
              <TouchableOpacity 
                key={folder.id} 
                style={styles.folderItem} 
                activeOpacity={0.6}
                onPress={() => handleNavigateToFolder(folder)}
              >
                <Feather name="folder" size={14} color="#6B7280" style={{ marginRight: 12 }} />
                <Text style={styles.folderText} numberOfLines={1}>{folder.name}</Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Recent</Text>
            {displayedSessions.map((session) => (
              <TouchableOpacity 
                key={session.id} 
                style={[styles.historyItem, activeSession?.id === session.id && styles.historyItemActive]} 
                activeOpacity={0.6}
                onPress={() => setActiveSession(session)}
                onLongPress={() => openSessionOptions(session)}
                delayLongPress={300}
              >
                <Feather 
                  name={session.is_favorited ? "star" : "message-circle"} 
                  size={14} 
                  color={session.is_favorited ? "#F59E0B" : (activeSession?.id === session.id ? "#185B37" : "#6B7280")} 
                  style={{ marginRight: 12 }}
                />
                <Text 
                  style={[
                    styles.historyText, 
                    session.is_favorited && { color: '#F59E0B' },
                    activeSession?.id === session.id && { fontFamily: 'Bricolage_600', color: '#185B37' }
                  ]} 
                  numberOfLines={1}
                >
                  {session.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.mainWorkspace}>
        <View style={styles.headerContainer}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
              <Feather name="arrow-left" size={20} color="#4B5563" />
            </TouchableOpacity>
            <View style={styles.headerTitleGroup}>
              <Text style={styles.headerTitle}>
                {activeSession ? activeSession.title : `New ${subjectName} Session`}
              </Text>
              <View style={styles.modelBadge}>
                <Feather name="zap" size={10} color="#185B37" style={{ marginRight: 4 }} />
                <Text style={styles.modelBadgeText}>
                  {activeSession ? `[${activeSession.mode === 'SolariSolve' ? 'Solve' : 'Learn'}] • ` : ''}Gemini 3.5 Flash Lite
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={handleTopRightMenu}
          >
            <Feather name="more-horizontal" size={20} color="#4B5563" />
          </TouchableOpacity>
        </View>

        {messages.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.welcomeGreeting}>Welcome back, Scholar!</Text>
            <Text style={styles.welcomeSub}>Plan, solve, and master your topics with ease.</Text>

            {renderModeSelector()}

            {isPhysicsInitial && !selectedTopic && (
              <View style={styles.topicContainer}>
                <Text style={styles.topicPromptText}>Which branch of physics are we focusing on today?</Text>
                <View style={styles.topicChipsWrapper}>
                  {PHYSICS_TOPICS.map(topic => (
                    <TouchableOpacity 
                      key={topic} 
                      style={styles.topicChip} 
                      onPress={() => setSelectedTopic(topic)}
                    >
                      <Text style={styles.topicChipText}>{topic}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.centeredInputZone}>
              {renderInputBox()}
            </View>
          </View>
        ) : (
          <>
            {activeMode === 'SolariSolve' && solvePhase === 'focus_timer' ? (
              renderFocusEngine()
            ) : (
              <>
                <ScrollView 
                  ref={scrollViewRef}
                  style={styles.chatArea} 
                  showsVerticalScrollIndicator={false} 
                  contentContainerStyle={styles.scrollContent}
                  onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                  {messages.map((msg, idx) => (
                    <View key={msg.id || idx.toString()} style={[styles.chatBubbleContainer, msg.sender === 'user' ? styles.userBubbleContainer : styles.aiBubbleContainer]}>
                      {msg.sender === 'ai' && (
                        <View style={styles.avatarContainer}>
                          <Feather name="cpu" size={18} color="#FFFFFF" />
                        </View>
                      )}
                      <View style={[styles.bubbleContent, msg.sender === 'user' ? styles.userBubble : styles.aiBubble]}>
                        {msg.sender === 'user' ? (
                          <Text style={[styles.bubbleText, styles.userBubbleText]}>
                            {msg.content}
                          </Text>
                        ) : (
                          msg.id?.startsWith('temp-') ? (
                            <Text style={[styles.bubbleText, { color: '#111827' }]}>
                              {msg.content || '...'} 
                            </Text>
                          ) : (
                            <MathBubble content={msg.content} />
                          )
                        )}
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.bottomInputZone}>
                  {renderInputBox()}
                </View>
              </>
            )}
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const markdownStyles = StyleSheet.create({
  body: { fontFamily: 'Bricolage_400', fontSize: 15, lineHeight: 24, color: '#111827' },
  code_block: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8, fontFamily: 'monospace', marginVertical: 8 },
  strong: { fontFamily: 'Bricolage_600' },
  em: { fontStyle: 'italic' }
});

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#F4F5F7' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#FFF', padding: 24, borderRadius: 16, width: 400, shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.1, shadowRadius: 24, elevation: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  modalIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E6F0EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  modalTitle: { fontSize: 18, fontFamily: 'Bricolage_600', color: '#111827' },
  modalSubtitle: { fontFamily: 'Bricolage_400', fontSize: 14, color: '#6B7280', marginBottom: 24 },
  
  optionActionBtn: { paddingVertical: 12, flexDirection: 'row', alignItems: 'center' },
  optionActionText: { marginLeft: 12, fontFamily: 'Bricolage_500', fontSize: 15, color: '#4B5563' },

  suggestionBox: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 20, marginBottom: 24 },
  suggestionLabel: { fontFamily: 'Bricolage_600', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.5, marginBottom: 8 },
  suggestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionText: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#111827', flex: 1, marginRight: 12 },
  acceptButton: { backgroundColor: '#185B37', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  acceptButtonText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#FFFFFF' },
  modalDivider: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  modalDividerText: { fontFamily: 'Bricolage_600', fontSize: 11, color: '#9CA3AF', letterSpacing: 0.5 },
  customInputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#FFFFFF', paddingHorizontal: 12, height: 52 },
  customInput: { flex: 1, fontFamily: 'Bricolage_400', fontSize: 15, color: '#111827', outlineStyle: 'none' as any },
  saveCustomButton: { backgroundColor: '#111827', width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6' },
  cancelButtonText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#4B5563' },
  confirmButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#185B37' },
  confirmButtonText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#FFFFFF' },

  leftSidebar: { 
    width: 280, 
    backgroundColor: '#FFFFFF', 
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    padding: 24, 
    display: Platform.OS === 'web' ? 'flex' : 'none' 
  },
  sidebarHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  sidebarTitle: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#111827', letterSpacing: -0.3 },
  sidebarActions: { flexDirection: 'row', gap: 12 },
  sidebarActionBtn: { padding: 4, backgroundColor: '#F9FAFB', borderRadius: 6, borderWidth: 1, borderColor: '#E5E7EB' },
  
  backToRootBtn: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  backToRootText: { fontFamily: 'Bricolage_600', fontSize: 15, color: '#111827', marginLeft: 4 },
  
  sectionLabel: { fontFamily: 'Bricolage_600', fontSize: 12, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 },
  emptyText: { fontFamily: 'Bricolage_400', fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 24 },
  sidebarSeparator: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 8 },
  
  folderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  folderText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#4B5563', flex: 1 },
  
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, marginBottom: 4 },
  historyItemActive: { backgroundColor: '#E6F0EB' },
  historyText: { fontFamily: 'Bricolage_400', fontSize: 14, color: '#4B5563', flex: 1 },

  mainWorkspace: { flex: 1, flexDirection: 'column', backgroundColor: '#F4F5F7' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  headerLeftGroup: { flexDirection: 'row', alignItems: 'center' },
  headerTitleGroup: { marginLeft: 16, justifyContent: 'center' },
  iconButton: { padding: 8, backgroundColor: '#FFFFFF', borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  headerTitle: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#111827', letterSpacing: -0.3 },
  
  modelBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F0EB', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginTop: 4 },
  modelBadgeText: { fontFamily: 'Bricolage_600', fontSize: 10, color: '#185B37', textTransform: 'uppercase', letterSpacing: 0.5 },

  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  welcomeGreeting: { fontFamily: 'Bricolage_600', fontSize: 32, color: '#111827', marginBottom: 8 },
  welcomeSub: { fontFamily: 'Bricolage_400', fontSize: 18, color: '#6B7280', marginBottom: 40 },
  
  modeCardsWrapper: { marginBottom: 32, width: '100%', maxWidth: 640 },
  modeCardsTitle: { fontFamily: 'Bricolage_600', fontSize: 15, color: '#4B5563', marginBottom: 16, textAlign: 'center' },
  modeCardsContainer: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: 16, justifyContent: 'center' },
  modeCard: { flex: 1, backgroundColor: '#FFFFFF', padding: 20, borderRadius: 20, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  modeCardActive: { borderColor: '#185B37', backgroundColor: '#F9FCFA' },
  modeIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modeIconBoxActive: { backgroundColor: '#E6F0EB' },
  modeCardTitle: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#111827', marginBottom: 6 },
  modeCardTitleActive: { color: '#185B37' },
  modeCardSub: { fontFamily: 'Bricolage_400', fontSize: 13, color: '#6B7280', lineHeight: 20 },

  focusEngineContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F7', padding: 24 },
  focusTitle: { fontFamily: 'Bricolage_600', fontSize: 28, color: '#111827', marginBottom: 12 },
  focusSubtitle: { fontFamily: 'Bricolage_400', fontSize: 16, color: '#6B7280', marginBottom: 32, textAlign: 'center' },
  focusPresetsRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', justifyContent: 'center' },
  focusPresetBtn: { paddingVertical: 12, paddingHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  focusPresetText: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#185B37' },
  focusTimerText: { fontFamily: 'Bricolage_600', fontSize: 80, color: '#111827', letterSpacing: -2, marginBottom: 16, fontVariant: ['tabular-nums'] },
  finishFocusBtn: { marginTop: 24, paddingVertical: 16, paddingHorizontal: 32, backgroundColor: '#111827', borderRadius: 16 },
  finishFocusBtnText: { fontFamily: 'Bricolage_600', fontSize: 16, color: '#FFFFFF' },

  topicContainer: { maxWidth: 640, width: '100%', marginBottom: 32 },
  topicPromptText: { fontFamily: 'Bricolage_600', fontSize: 15, color: '#4B5563', marginBottom: 16, textAlign: 'center' },
  topicChipsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  topicChip: { backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  topicChipText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#185B37' },

  centeredInputZone: { width: '100%', maxWidth: 800 },
  bottomInputZone: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 16, width: '100%', maxWidth: 848, alignSelf: 'center' },

  inputContainer: { width: '100%' },
  previewsRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8, marginLeft: 12, flexWrap: 'wrap' },
  
  dockedChipContainer: { marginRight: 12, marginBottom: 4 },
  dockedChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E6F0EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#D1E5DB' },
  dockedChipText: { fontFamily: 'Bricolage_500', fontSize: 13, color: '#185B37', marginRight: 6 },
  dockedChipClose: { padding: 2 },

  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: '#E5E7EB', 
    borderRadius: 32, 
    paddingHorizontal: 8, 
    paddingVertical: 6, 
    backgroundColor: '#FFFFFF',
    minHeight: 56,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 2 
  },
  attachButton: { padding: 8, justifyContent: 'center', alignItems: 'center' },
  textInput: { 
    flex: 1, 
    fontFamily: 'Bricolage_400', 
    fontSize: 15, 
    color: '#111827', 
    maxHeight: 120,
    minHeight: 24, 
    paddingHorizontal: 8,
    paddingVertical: 0, 
    textAlignVertical: 'center', 
    outlineStyle: 'none' as any,
  },
  sendButton: { backgroundColor: '#185B37', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  
  attachmentPreviewContainer: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4 },
  attachmentImage: { width: 64, height: 64, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  removeAttachmentBtn: { position: 'absolute', top: -6, left: 54, backgroundColor: '#111827', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  chatArea: { flex: 1, paddingHorizontal: 24 },
  scrollContent: { paddingBottom: 40, maxWidth: 800, width: '100%', alignSelf: 'center', paddingTop: 24 },
  chatBubbleContainer: { flexDirection: 'row', marginBottom: 24, width: '100%' },
  userBubbleContainer: { justifyContent: 'flex-end', paddingLeft: 60 },
  aiBubbleContainer: { justifyContent: 'flex-start', paddingRight: 60 },
  bubbleContent: { padding: 16, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  userBubble: { backgroundColor: '#E6F0EB', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: '#FFFFFF', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#E5E7EB' },
  bubbleText: { fontFamily: 'Bricolage_400', fontSize: 15, lineHeight: 24 },
  userBubbleText: { color: '#111827' },
  avatarContainer: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#185B37', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
});