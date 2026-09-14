import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export interface PendingMutation {
  id: string;
  type: 'create_folder' | 'create_session' | 'update_solve_stage' | 'toggle_accuracy';
  payload: any;
  createdAt: string;
}

const QUEUE_KEY = '@solari_mutation_queue';

export async function getLocalCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setLocalCache<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn(`Failed to cache ${key}:`, error);
  }
}

export async function enqueueMutation(mutation: Omit<PendingMutation, 'id' | 'createdAt'>): Promise<void> {
  try {
    const currentQueue = (await getLocalCache<PendingMutation[]>(QUEUE_KEY)) || [];
    const item: PendingMutation = {
      ...mutation,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString()
    };
    currentQueue.push(item);
    await setLocalCache(QUEUE_KEY, currentQueue);
  } catch (err) {
    console.error('Failed to enqueue mutation:', err);
  }
}

export async function flushMutationQueue(): Promise<number> {
  const queue = await getLocalCache<PendingMutation[]>(QUEUE_KEY);
  if (!queue || queue.length === 0) return 0;

  const remaining: PendingMutation[] = [];
  let processedCount = 0;

  for (const item of queue) {
    try {
      if (item.type === 'create_folder') {
        await supabase.from('study_folders').insert([item.payload]);
      } else if (item.type === 'create_session') {
        await supabase.from('chat_sessions').insert([item.payload]);
      } else if (item.type === 'update_solve_stage') {
        await supabase.from('chat_sessions').update(item.payload.updates).eq('id', item.payload.sessionId);
      } else if (item.type === 'toggle_accuracy') {
        await supabase.from('chat_messages').update({ include_in_accuracy: item.payload.include }).eq('id', item.payload.messageId);
      }
      processedCount++;
    } catch (err) {
      console.warn(`Mutation ${item.id} failed, retaining in queue:`, err);
      remaining.push(item);
    }
  }

  await setLocalCache(QUEUE_KEY, remaining);
  return processedCount;
}