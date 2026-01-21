import { logger } from '../utils/logger';
import { ChatSession, ChatMessage } from '../types';

const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;

export const chatService = {
  async sendMessage(
    sessionId: string,
    content: string,
    attachments?: string[]
  ): Promise<void> {
    try {
      logger.debug('Sending message', { sessionId, content, attachments });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('send_chat_message', {
          sessionId,
          content,
          attachments: attachments || [],
        });
        logger.info('Message sent successfully', { sessionId });
        return;
      }
      
      logger.warn('Using mock chat service');
    } catch (error) {
      logger.error('Failed to send message', { sessionId, error });
      throw error;
    }
  },

  async saveSession(session: ChatSession): Promise<void> {
    try {
      logger.debug('Saving session', { sessionId: session.id });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('save_chat_session', { session });
        logger.info('Session saved successfully', { sessionId: session.id });
        return;
      }
      
      // Mock: save to localStorage
      const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      const index = sessions.findIndex((s: ChatSession) => s.id === session.id);
      if (index >= 0) {
        sessions[index] = session;
      } else {
        sessions.push(session);
      }
      localStorage.setItem('chat_sessions', JSON.stringify(sessions));
      logger.info('Mock session saved to localStorage', { sessionId: session.id });
    } catch (error) {
      logger.error('Failed to save session', { sessionId: session.id, error });
      throw error;
    }
  },

  async loadSession(sessionId: string): Promise<ChatSession> {
    try {
      logger.debug('Loading session', { sessionId });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const session = await invoke<ChatSession>('load_chat_session', { sessionId });
        logger.info('Session loaded successfully', { sessionId });
        return session;
      }
      
      // Mock: load from localStorage
      const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      const session = sessions.find((s: ChatSession) => s.id === sessionId);
      if (!session) {
        throw new Error('Session not found');
      }
      return session;
    } catch (error) {
      logger.error('Failed to load session', { sessionId, error });
      throw error;
    }
  },

  async listSessions(): Promise<ChatSession[]> {
    try {
      logger.debug('Listing sessions');
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const sessions = await invoke<ChatSession[]>('list_chat_sessions');
        logger.info('Sessions listed successfully', { count: sessions.length });
        return sessions;
      }
      
      // Mock: load from localStorage
      const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      logger.info('Mock sessions loaded from localStorage', { count: sessions.length });
      return sessions;
    } catch (error) {
      logger.error('Failed to list sessions', { error });
      throw error;
    }
  },

  async deleteSession(sessionId: string): Promise<void> {
    try {
      logger.debug('Deleting session', { sessionId });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        await invoke('delete_chat_session', { sessionId });
        logger.info('Session deleted successfully', { sessionId });
        return;
      }
      
      // Mock: delete from localStorage
      const sessions = JSON.parse(localStorage.getItem('chat_sessions') || '[]');
      const filtered = sessions.filter((s: ChatSession) => s.id !== sessionId);
      localStorage.setItem('chat_sessions', JSON.stringify(filtered));
      logger.info('Mock session deleted from localStorage', { sessionId });
    } catch (error) {
      logger.error('Failed to delete session', { sessionId, error });
      throw error;
    }
  },

  async createSession(name: string): Promise<string> {
    try {
      logger.debug('Creating session', { name });
      
      if (isTauri) {
        const { invoke } = await import('@tauri-apps/api/tauri');
        const sessionId = await invoke<string>('create_chat_session', { name });
        logger.info('Session created successfully', { sessionId, name });
        return sessionId;
      }
      
      // Mock: create session
      const sessionId = `session-${Date.now()}`;
      logger.info('Mock session created', { sessionId, name });
      return sessionId;
    } catch (error) {
      logger.error('Failed to create session', { name, error });
      throw error;
    }
  },

  listenToStreamingMessage(
    callback: (message: { sessionId: string; messageId: string; content: string }) => void
  ): Promise<() => void> {
    if (isTauri) {
      return import('@tauri-apps/api/event').then(({ listen }) =>
        listen<{ sessionId: string; messageId: string; content: string }>(
          'chat-message-stream',
          (event) => {
            logger.debug('Received streaming message', event.payload);
            callback(event.payload);
          }
        )
      );
    }
    
    // Mock: return empty unsubscribe function
    logger.warn('Using mock streaming service');
    return Promise.resolve(() => {});
  },
};
