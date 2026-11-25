import { useState, useEffect, useCallback } from "react";
import {
  Conversation,
  Message,
  messageService,
} from "@/services/message.service";
import { socketService } from "@/services/socket.service";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getConversations();
      setConversations(data ?? []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return { conversations, loading, error, refetch: fetchConversations };
};

export const useConversationMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await messageService.getConversationMessages(conversationId);
      setMessages(data.messages);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;
    socketService.connect();
    const off = socketService.onMessage((msg: Message) => {
      if (msg.conversation_id === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => {
      off?.();
    };
  }, [conversationId]);

  const sendMessage = async (content: string): Promise<void> => {
    if (!conversationId) return;
    try {
      setSending(true);
      const msg = await messageService.sendMessage({
        conversation_id: conversationId,
        content,
      });
      setMessages((prev) => [...prev, msg]);
    } finally {
      setSending(false);
    }
  };

  return { messages, loading, error, sendMessage, sending };
};
