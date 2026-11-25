import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface MessageParticipant {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_online?: boolean;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  type: string;
  created_at: string;
  is_read: boolean;
  sender: MessageParticipant;
}

export interface Conversation {
  id: string;
  type: string;
  name?: string;
  avatar_url?: string;
  participants: MessageParticipant[];
  last_message?: Message;
  unread_count: number;
  updated_at: string;
}

export const messageService = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get<ApiResponse<{ conversations: Conversation[] }>>(
      "/message/conversations"
    );
    return response.data.data.conversations ?? [];
  },

  createConversation: async (
    participantIds: string[],
    name?: string
  ): Promise<Conversation> => {
    const response = await api.post<ApiResponse<{ conversation: Conversation }>>(
      "/message/conversation",
      { participant_ids: participantIds, name }
    );
    return response.data.data.conversation;
  },

  getConversationMessages: async (
    conversationId: string,
    params?: Record<string, unknown>
  ): Promise<{ messages: Message[] }> => {
    const response = await api.get<ApiResponse<{ messages: Message[] }>>(
      `/message/conversation/${conversationId}/messages`,
      { params }
    );
    return response.data.data;
  },

  sendMessage: async (payload: {
    conversation_id: string;
    content: string;
    type?: string;
  }): Promise<Message> => {
    const response = await api.post<ApiResponse<{ message: Message }>>(
      "/message",
      payload
    );
    return response.data.data.message;
  },

  updateMessage: async (id: string, content: string): Promise<Message> => {
    const response = await api.put<ApiResponse<{ message: Message }>>(
      `/message/${id}`,
      { content }
    );
    return response.data.data.message;
  },

  deleteMessage: async (id: string): Promise<void> => {
    await api.delete(`/message/${id}`);
  },
};
