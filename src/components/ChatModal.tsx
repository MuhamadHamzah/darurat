import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Image,
  MapPin,
  Shield,
  CheckCircle,
  AlertTriangle,
  Bot,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  sender_id: string;
  message: string;
  message_type: "text" | "image" | "location" | "verification";
  ai_analysis?: any;
  is_ai_flagged: boolean;
  created_at: string;
  sender_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItem: {
    id: string;
    title: string;
    user_id: string;
    image_url?: string;
  };
  isOwner: boolean;
}

export default function ChatModal({
  isOpen,
  onClose,
  lostItem,
  isOwner,
}: ChatModalProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiVerificationScore, setAiVerificationScore] = useState<number | null>(
    null
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && user) {
      initializeChat();
    }
  }, [isOpen, user, lostItem.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const initializeChat = async () => {
    if (!user) return;

    try {
      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from("chat_conversations")
        .select("id")
        .eq("lost_item_id", lostItem.id)
        .eq(isOwner ? "reporter_id" : "finder_id", user.id)
        .single();

      let convId = existingConversation?.id;

      if (!convId && !isOwner) {
        // Create new conversation if finder initiates chat
        const { data: newConversation, error } = await supabase
          .from("chat_conversations")
          .insert([
            {
              lost_item_id: lostItem.id,
              reporter_id: lostItem.user_id,
              finder_id: user.id,
            },
          ])
          .select("id")
          .single();

        if (error) throw error;
        convId = newConversation.id;
      }

      if (convId) {
        setConversationId(convId);
        await loadMessages(convId);
        setupRealtimeSubscription(convId);
      }
    } catch (error) {
      console.error("Error initializing chat:", error);
      toast.error("Gagal memuat chat");
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          sender_profile:sender_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const setupRealtimeSubscription = (convId: string) => {
    const subscription = supabase
      .channel(`chat_${convId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${convId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !user) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("chat_messages").insert([
        {
          conversation_id: conversationId,
          sender_id: user.id,
          message: newMessage,
          message_type: "text",
        },
      ]);

      if (error) throw error;

      setNewMessage("");

      // Simulate AI analysis for demonstration
      if (
        newMessage.toLowerCase().includes("menemukan") ||
        newMessage.toLowerCase().includes("ketemu")
      ) {
        setTimeout(() => {
          simulateAIVerification();
        }, 2000);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Gagal mengirim pesan");
    } finally {
      setLoading(false);
    }
  };

  const simulateAIVerification = async () => {
    const score = Math.random() * 10; // Random score 0-10
    setAiVerificationScore(score);

    // Add AI analysis message
    if (conversationId && user) {
      await supabase.from("chat_messages").insert([
        {
          conversation_id: conversationId,
          sender_id: "ai-system",
          message: `AI Verification: Tingkat kepercayaan ${score.toFixed(
            1
          )}/10. ${
            score > 7
              ? "Kemungkinan besar valid."
              : score > 4
              ? "Perlu verifikasi lebih lanjut."
              : "Kemungkinan tidak valid."
          }`,
          message_type: "verification",
          ai_analysis: { score, confidence: score / 10 },
        },
      ]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full h-[80vh] flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Chat Verifikasi
                    </h3>
                    <p className="text-sm text-gray-600">{lostItem.title}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* AI Verification Score */}
              {aiVerificationScore !== null && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      AI Verification Score:
                    </span>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        aiVerificationScore > 7
                          ? "bg-green-100 text-green-700"
                          : aiVerificationScore > 4
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {aiVerificationScore.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Mulai percakapan untuk verifikasi
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Chat ini akan dianalisis oleh AI untuk memastikan keaslian
                    temuan
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? "bg-blue-500 text-white"
                          : message.sender_id === "ai-system"
                          ? "bg-purple-100 text-purple-800 border border-purple-200"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {message.sender_id === "ai-system" && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Bot className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            AI Assistant
                          </span>
                        </div>
                      )}

                      <p className="text-sm">{message.message}</p>

                      <div className="flex items-center justify-between mt-1">
                        <span
                          className={`text-xs ${
                            message.sender_id === user?.id
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.created_at)}
                        </span>

                        {message.is_ai_flagged && (
                          <AlertTriangle className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ketik pesan untuk verifikasi..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading || !conversationId}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !newMessage.trim() || !conversationId}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-2 flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                Chat ini dimonitor oleh AI untuk keamanan dan verifikasi
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
