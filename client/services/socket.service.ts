import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/useAuthStore';

let socket: Socket | null = null;

export const socketService = {
  connect: () => {
    if (socket?.connected) return socket;
    const token = useAuthStore.getState().token;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    socket = io(API_URL, { auth: { token }, transports: ['websocket'], autoConnect: true });
    return socket;
  },
  disconnect: () => { socket?.disconnect(); socket = null; },
  joinConversation: (conversationId: string) => { socket?.emit('join_conversation', { conversation_id: conversationId }); },
  sendMessage: (payload: { conversation_id: string; content: string }) => { socket?.emit('send_message', payload); },
  onMessage: (cb: (msg: any) => void) => { socket?.on('new_message', cb); return () => socket?.off('new_message', cb); },
  onTyping: (cb: (data: { user_id: string; conversation_id: string }) => void) => { socket?.on('typing', cb); return () => socket?.off('typing', cb); },
  emitTyping: (conversationId: string) => { socket?.emit('typing', { conversation_id: conversationId }); },
  getSocket: () => socket,
};
