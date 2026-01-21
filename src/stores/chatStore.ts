import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { ChatMessage, ChatSession } from '../types';
import { chatService } from '../services/chatService';
import { logger } from '../utils/logger';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  loadSessions: () => Promise<void>;
  createSession: (name: string) => Promise<string>;
  switchSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => Promise<void>;
  addMessage: (sessionId: string, message: ChatMessage) => void;
  updateMessage: (sessionId: string, messageId: string, content: string) => void;
  sendMessage: (sessionId: string, content: string, attachments?: string[]) => Promise<void>;
  getCurrentSession: () => ChatSession | undefined;
  setIsLoading: (loading: boolean) => void;
  clearCurrentSession: () => void;
}

const generateMessageId = (): string => {
  return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        sessions: [],
        currentSessionId: null,
        isLoading: false,

        loadSessions: async () => {
          try {
            logger.info('Loading chat sessions');
            set({ isLoading: true }, false, 'loadSessions/start');

            const sessions = await chatService.listSessions();

            set(
              {
                sessions,
                isLoading: false,
              },
              false,
              'loadSessions/success'
            );

            logger.info('Chat sessions loaded successfully', { count: sessions.length });
          } catch (error) {
            logger.error('Failed to load chat sessions', { error });
            set({ isLoading: false }, false, 'loadSessions/error');
            throw error;
          }
        },

        createSession: async (name: string) => {
          try {
            logger.info('Creating chat session', { name });
            set({ isLoading: true }, false, 'createSession/start');

            const sessionId = await chatService.createSession(name);
            const newSession: ChatSession = {
              id: sessionId,
              name,
              messages: [],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };

            set(
              (state) => ({
                sessions: [...state.sessions, newSession],
                currentSessionId: sessionId,
                isLoading: false,
              }),
              false,
              'createSession/success'
            );

            logger.info('Chat session created successfully', { sessionId, name });
            return sessionId;
          } catch (error) {
            logger.error('Failed to create chat session', { name, error });
            set({ isLoading: false }, false, 'createSession/error');
            throw error;
          }
        },

        switchSession: (sessionId: string) => {
          const { sessions } = get();
          const session = sessions.find((s) => s.id === sessionId);

          if (session) {
            logger.info('Switching chat session', { sessionId });
            set({ currentSessionId: sessionId }, false, 'switchSession');
          } else {
            logger.warn('Attempted to switch to non-existent session', { sessionId });
          }
        },

        deleteSession: async (sessionId: string) => {
          try {
            logger.info('Deleting chat session', { sessionId });
            set({ isLoading: true }, false, 'deleteSession/start');

            await chatService.deleteSession(sessionId);

            set(
              (state) => {
                const newSessions = state.sessions.filter((s) => s.id !== sessionId);
                const newCurrentSessionId =
                  state.currentSessionId === sessionId
                    ? newSessions.length > 0
                      ? newSessions[0].id
                      : null
                    : state.currentSessionId;

                return {
                  sessions: newSessions,
                  currentSessionId: newCurrentSessionId,
                  isLoading: false,
                };
              },
              false,
              'deleteSession/success'
            );

            logger.info('Chat session deleted successfully', { sessionId });
          } catch (error) {
            logger.error('Failed to delete chat session', { sessionId, error });
            set({ isLoading: false }, false, 'deleteSession/error');
            throw error;
          }
        },

        addMessage: (sessionId: string, message: ChatMessage) => {
          logger.debug('Adding message to session', { sessionId, messageId: message.id });
          
          set(
            (state) => ({
              sessions: state.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      messages: [...session.messages, message],
                      updatedAt: Date.now(),
                    }
                  : session
              ),
            }),
            false,
            'addMessage'
          );
        },

        updateMessage: (sessionId: string, messageId: string, content: string) => {
          logger.debug('Updating message', { sessionId, messageId });
          
          set(
            (state) => ({
              sessions: state.sessions.map((session) =>
                session.id === sessionId
                  ? {
                      ...session,
                      messages: session.messages.map((msg) =>
                        msg.id === messageId
                          ? { ...msg, content, isStreaming: false }
                          : msg
                      ),
                      updatedAt: Date.now(),
                    }
                  : session
              ),
            }),
            false,
            'updateMessage'
          );
        },

        sendMessage: async (sessionId: string, content: string, attachments?: string[]) => {
          try {
            logger.info('Sending message', { sessionId, hasAttachments: !!attachments?.length });

            const userMessage: ChatMessage = {
              id: generateMessageId(),
              role: 'user',
              content,
              timestamp: Date.now(),
              attachments,
            };

            get().addMessage(sessionId, userMessage);

            const assistantMessageId = generateMessageId();
            const assistantMessage: ChatMessage = {
              id: assistantMessageId,
              role: 'assistant',
              content: '',
              timestamp: Date.now(),
              isStreaming: true,
            };

            get().addMessage(sessionId, assistantMessage);

            const unlistenStream = await chatService.listenToStreamingMessage(
              ({ sessionId: streamSessionId, messageId, content: streamContent }) => {
                if (streamSessionId === sessionId && messageId === assistantMessageId) {
                  get().updateMessage(sessionId, messageId, streamContent);
                }
              }
            );

            await chatService.sendMessage(sessionId, content, attachments);

            const { sessions } = get();
            const session = sessions.find((s) => s.id === sessionId);
            if (session) {
              await chatService.saveSession(session);
            }

            unlistenStream();

            logger.info('Message sent successfully', { sessionId });
          } catch (error) {
            logger.error('Failed to send message', { sessionId, error });
            throw error;
          }
        },

        getCurrentSession: () => {
          const { sessions, currentSessionId } = get();
          return sessions.find((s) => s.id === currentSessionId);
        },

        setIsLoading: (loading: boolean) => {
          set({ isLoading: loading }, false, 'setIsLoading');
        },

        clearCurrentSession: () => {
          logger.info('Clearing current session');
          set({ currentSessionId: null }, false, 'clearCurrentSession');
        },
      }),
      {
        name: 'chat-storage',
        partialize: (state) => ({
          sessions: state.sessions,
          currentSessionId: state.currentSessionId,
        }),
      }
    ),
    { name: 'ChatStore' }
  )
);
