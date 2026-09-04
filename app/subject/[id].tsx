import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { createFolder, deleteFolder, getFolders, getScopedSubjectSessions, updateSessionState } from '../../lib/db';
import { SUBJECT_REGISTRY } from '../../lib/subjects';
import { ChatSession, SessionFilters, StudyFolder } from '../../lib/types';

export default function SubjectExploreScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const subjectId = id ? id.toString() : 'general';
  const subjectConfig = SUBJECT_REGISTRY[subjectId] || SUBJECT_REGISTRY['physics'];

  const [isLoading, setIsLoading] = useState(true);
  const [folders, setFolders] = useState<StudyFolder[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string, name: string }[]>([]);
  
  const [filters, setFilters] = useState<SessionFilters>({
    mode: 'All',
    status: 'Active',
    topic: 'All'
  });

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadDirectoryData();
  }, [subjectId, currentFolderId, filters]);

  async function loadDirectoryData() {
    try {
      setIsLoading(true);
      const [fetchedFolders, fetchedSessions] = await Promise.all([
        getFolders(subjectId, currentFolderId),
        getScopedSubjectSessions(subjectId, currentFolderId, filters)
      ]);
      setFolders(fetchedFolders);
      setSessions(fetchedSessions);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
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

  async function handleDeleteFolder(folderId: string) {
    try {
      await deleteFolder(folderId);
      setFolders(prev => prev.filter(f => f.id !== folderId));
    } catch (error) {
      console.error(error);
    }
  }

  function handleNavigateDown(folder: StudyFolder) {
    setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }]);
    setCurrentFolderId(folder.id);
  }

  function handleNavigateUp(index: number) {
    if (index === -1) {
      setFolderStack([]);
      setCurrentFolderId(null);
    } else {
      const newStack = folderStack.slice(0, index + 1);
      setFolderStack(newStack);
      setCurrentFolderId(newStack[newStack.length - 1].id);
    }
  }

  async function handleToggleFavorite(session: ChatSession) {
    try {
      const newStatus = !session.is_favorited;
      await updateSessionState(session.id, { is_favorited: newStatus });
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, is_favorited: newStatus } : s));
    } catch (error) {
      console.error(error);
    }
  }

  async function handleArchive(session: ChatSession) {
    try {
      await updateSessionState(session.id, { is_archived: true });
      if (filters.status !== 'Archived') {
        setSessions(prev => prev.filter(s => s.id !== session.id));
      } else {
        loadDirectoryData();
      }
    } catch (error) {
      console.error(error);
    }
  }

  function handleStartNewSession() {
    let url = `/chat/${subjectId}`;
    if (currentFolderId) {
      url += `?folderId=${currentFolderId}`;
    }
    router.push(url as any);
  }

  const renderBreadcrumbs = () => (
    <View style={styles.breadcrumbRow}>
      <TouchableOpacity onPress={() => handleNavigateUp(-1)}>
        <Text style={[styles.breadcrumbText, currentFolderId === null && styles.breadcrumbActive]}>
          {subjectConfig.name} Root
        </Text>
      </TouchableOpacity>
      
      {folderStack.map((f, index) => (
        <React.Fragment key={f.id}>
          <Feather name="chevron-right" size={14} color="#9CA3AF" style={{ marginHorizontal: 8 }} />
          <TouchableOpacity onPress={() => handleNavigateUp(index)}>
            <Text style={[styles.breadcrumbText, currentFolderId === f.id && styles.breadcrumbActive]}>
              {f.name}
            </Text>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      
      <Modal visible={showFolderModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Folder</Text>
            <TextInput 
              style={styles.textInput}
              placeholder="Folder name..."
              placeholderTextColor="#9CA3AF"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowFolderModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmBtn, { backgroundColor: subjectConfig.color }]} 
                onPress={handleCreateFolder}
              >
                <Text style={styles.confirmBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={[styles.subjectBanner, { backgroundColor: subjectConfig.bgColor }]}>
        <View style={styles.bannerContent}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/')}>
            <Feather name="arrow-left" size={20} color={subjectConfig.color} />
          </TouchableOpacity>
          <View style={[styles.iconWrap, { backgroundColor: '#FFFFFF' }]}>
            <Feather name={subjectConfig.icon as any} size={24} color={subjectConfig.color} />
          </View>
          <View>
            <Text style={[styles.bannerTitle, { color: subjectConfig.color }]}>{subjectConfig.name} Hub</Text>
            <Text style={[styles.bannerSub, { color: subjectConfig.color, opacity: 0.8 }]}>
              {subjectConfig.description}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.mainScroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.navigationHeader}>
          {renderBreadcrumbs()}
          <TouchableOpacity 
            style={[styles.newSessionBtn, { backgroundColor: subjectConfig.color }]}
            onPress={handleStartNewSession}
          >
            <Feather name="plus" size={16} color="#FFFFFF" />
            <Text style={styles.newSessionBtnText}>New Session</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Folders</Text>
            <TouchableOpacity onPress={() => setShowFolderModal(true)}>
              <Text style={[styles.actionText, { color: subjectConfig.color }]}>+ New Folder</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.folderGrid}>
            {folders.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>No folders here.</Text>
              </View>
            ) : (
              folders.map(folder => (
                <View key={folder.id} style={styles.folderCard}>
                  <TouchableOpacity style={styles.folderClickable} onPress={() => handleNavigateDown(folder)}>
                    <View style={[styles.folderIconBox, { backgroundColor: subjectConfig.bgColor }]}>
                      <Feather name="folder" size={20} color={subjectConfig.color} />
                    </View>
                    <Text style={styles.folderCardTitle} numberOfLines={1}>{folder.name}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.folderDeleteBtn} onPress={() => handleDeleteFolder(folder.id)}>
                    <Feather name="trash-2" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Sessions</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {(['Active', 'Favorited', 'Archived'] as const).map(status => (
              <TouchableOpacity 
                key={status}
                style={[styles.filterPill, filters.status === status && { backgroundColor: subjectConfig.color, borderColor: subjectConfig.color }]}
                onPress={() => setFilters(prev => ({ ...prev, status }))}
              >
                <Text style={[styles.filterPillText, filters.status === status && { color: '#FFFFFF' }]}>{status}</Text>
              </TouchableOpacity>
            ))}
            
            <View style={styles.filterDivider} />

            {(['All', 'SolariLearn', 'SolariSolve'] as const).map(mode => (
              <TouchableOpacity 
                key={mode}
                style={[styles.filterPill, filters.mode === mode && { backgroundColor: subjectConfig.color, borderColor: subjectConfig.color }]}
                onPress={() => setFilters(prev => ({ ...prev, mode }))}
              >
                <Text style={[styles.filterPillText, filters.mode === mode && { color: '#FFFFFF' }]}>
                  {mode === 'All' ? 'All Modes' : mode.replace('Solari', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {subjectId === 'physics' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.filterScroll, { marginTop: 12 }]}>
              {['All', ...subjectConfig.topics].map(topic => (
                <TouchableOpacity 
                  key={topic}
                  style={[styles.topicChip, filters.topic === topic && { backgroundColor: '#F3F4F6', borderColor: '#D1D5DB' }]}
                  onPress={() => setFilters(prev => ({ ...prev, topic }))}
                >
                  <Text style={[styles.topicChipText, filters.topic === topic && { color: '#111827' }]}>{topic}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {isLoading ? (
            <ActivityIndicator size="large" color={subjectConfig.color} style={{ marginTop: 40 }} />
          ) : sessions.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No sessions match your criteria.</Text>
            </View>
          ) : (
            <View style={styles.sessionList}>
              {sessions.map(session => (
                <View key={session.id} style={styles.sessionCard}>
                  <TouchableOpacity 
                    style={styles.sessionCardContent}
                    onPress={() => router.push(`/chat/${subjectId}?sessionId=${session.id}` as any)}
                  >
                    <View style={styles.sessionHeaderRow}>
                      <View style={styles.sessionTags}>
                        <View style={[styles.tagPill, { backgroundColor: session.mode === 'SolariSolve' ? '#FEF2F2' : '#EFF6FF' }]}>
                          <Text style={[styles.tagText, { color: session.mode === 'SolariSolve' ? '#DC2626' : '#2563EB' }]}>
                            {session.mode === 'SolariSolve' ? 'Solve' : 'Learn'}
                          </Text>
                        </View>
                        {session.topic && (
                          <View style={styles.tagPill}>
                            <Text style={styles.tagText}>{session.topic}</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.sessionDate}>
                        {new Date(session.updated_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={styles.sessionTitle} numberOfLines={2}>{session.title}</Text>
                  </TouchableOpacity>

                  <View style={styles.sessionActions}>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleToggleFavorite(session)}>
                      <Feather name="star" size={18} color={session.is_favorited ? "#F59E0B" : "#9CA3AF"} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={() => handleArchive(session)}>
                      <Feather name="archive" size={18} color={session.is_archived ? "#185B37" : "#9CA3AF"} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  subjectBanner: { paddingHorizontal: 32, paddingVertical: 40, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  bannerContent: { maxWidth: 1000, alignSelf: 'center', width: '100%', flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 24 },
  iconWrap: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 24 },
  bannerTitle: { fontFamily: 'Bricolage_600', fontSize: 32, marginBottom: 4 },
  bannerSub: { fontFamily: 'Bricolage_400', fontSize: 16 },
  
  mainScroll: { flex: 1 },
  scrollContent: { padding: 32, maxWidth: 1064, alignSelf: 'center', width: '100%', paddingBottom: 80 },
  
  navigationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40, flexWrap: 'wrap', gap: 16 },
  breadcrumbRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  breadcrumbText: { fontFamily: 'Bricolage_500', fontSize: 16, color: '#6B7280' },
  breadcrumbActive: { color: '#111827', fontFamily: 'Bricolage_600' },
  
  newSessionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 24, gap: 8 },
  newSessionBtnText: { fontFamily: 'Bricolage_500', color: '#FFFFFF', fontSize: 15 },
  
  sectionContainer: { marginBottom: 48 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontFamily: 'Bricolage_600', fontSize: 20, color: '#111827', marginBottom: 24 },
  actionText: { fontFamily: 'Bricolage_500', fontSize: 14 },
  
  folderGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  folderCard: { width: 240, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center' },
  folderClickable: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 12 },
  folderIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  folderCardTitle: { fontFamily: 'Bricolage_500', fontSize: 15, color: '#111827', flex: 1 },
  folderDeleteBtn: { padding: 16, justifyContent: 'center', alignItems: 'center' },
  
  filterScroll: { flexDirection: 'row', marginBottom: 24 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF', marginRight: 12 },
  filterPillText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#4B5563' },
  filterDivider: { width: 1, height: 24, backgroundColor: '#E5E7EB', marginHorizontal: 12, alignSelf: 'center' },
  topicChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#F3F4F6', backgroundColor: '#FFFFFF', marginRight: 8 },
  topicChipText: { fontFamily: 'Bricolage_400', fontSize: 13, color: '#6B7280' },
  
  sessionList: { gap: 16 },
  sessionCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', padding: 20 },
  sessionCardContent: { flex: 1, marginRight: 24 },
  sessionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sessionTags: { flexDirection: 'row', gap: 8 },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F3F4F6' },
  tagText: { fontFamily: 'Bricolage_500', fontSize: 12, color: '#4B5563' },
  sessionDate: { fontFamily: 'Bricolage_400', fontSize: 13, color: '#9CA3AF' },
  sessionTitle: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#111827' },
  sessionActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  iconBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  
  emptyBox: { width: '100%', paddingVertical: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  emptyText: { fontFamily: 'Bricolage_400', color: '#9CA3AF', fontSize: 15 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: 400, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24 },
  modalTitle: { fontFamily: 'Bricolage_600', fontSize: 18, color: '#111827', marginBottom: 24 },
  textInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontFamily: 'Bricolage_400', fontSize: 15, outlineStyle: 'none' as any },
  modalActionRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 24, gap: 12 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6' },
  cancelBtnText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#4B5563' },
  confirmBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  confirmBtnText: { fontFamily: 'Bricolage_500', fontSize: 14, color: '#FFFFFF' }
});