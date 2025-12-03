import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Eye,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Shield,
  User,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface AccessLog {
  id: string;
  access_type: "view" | "contact" | "chat_init";
  ip_address: string;
  user_agent: string;
  created_at: string;
  accessor_profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface AccessLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  lostItemId: string;
  itemTitle: string;
}

export default function AccessLogModal({
  isOpen,
  onClose,
  lostItemId,
  itemTitle,
}: AccessLogModalProps) {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalContacts: 0,
    totalChats: 0,
    uniqueUsers: 0,
  });

  useEffect(() => {
    if (isOpen) {
      fetchAccessLogs();
    }
  }, [isOpen, lostItemId]);

  const fetchAccessLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("report_access_logs")
        .select(
          `
          *,
          accessor_profile:accessor_id (
            full_name,
            avatar_url
          )
        `
        )
        .eq("lost_item_id", lostItemId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;

      setAccessLogs(data || []);

      // Calculate stats
      const views =
        data?.filter((log) => log.access_type === "view").length || 0;
      const contacts =
        data?.filter((log) => log.access_type === "contact").length || 0;
      const chats =
        data?.filter((log) => log.access_type === "chat_init").length || 0;
      const uniqueUsers = new Set(
        data?.map((log) => log.accessor_id).filter(Boolean)
      ).size;

      setStats({
        totalViews: views,
        totalContacts: contacts,
        totalChats: chats,
        uniqueUsers,
      });
    } catch (error) {
      console.error("Error fetching access logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getAccessTypeIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="w-4 h-4" />;
      case "contact":
        return <Phone className="w-4 h-4" />;
      case "chat_init":
        return <MessageCircle className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  const getAccessTypeLabel = (type: string) => {
    switch (type) {
      case "view":
        return "Melihat laporan";
      case "contact":
        return "Menghubungi";
      case "chat_init":
        return "Memulai chat";
      default:
        return "Aktivitas";
    }
  };

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case "view":
        return "text-blue-600 bg-blue-100";
      case "contact":
        return "text-green-600 bg-green-100";
      case "chat_init":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatUserAgent = (userAgent: string) => {
    if (!userAgent) return "Unknown Device";

    // Simple user agent parsing
    if (userAgent.includes("Mobile")) return "Mobile Device";
    if (userAgent.includes("Chrome")) return "Chrome Browser";
    if (userAgent.includes("Firefox")) return "Firefox Browser";
    if (userAgent.includes("Safari")) return "Safari Browser";
    return "Desktop Browser";
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Log Akses Laporan
                    </h2>
                    <p className="text-sm text-gray-600">{itemTitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Stats */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalViews}
                  </div>
                  <div className="text-xs text-gray-600">Total Views</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.totalContacts}
                  </div>
                  <div className="text-xs text-gray-600">Kontak</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalChats}
                  </div>
                  <div className="text-xs text-gray-600">Chat</div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.uniqueUsers}
                  </div>
                  <div className="text-xs text-gray-600">Unique Users</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Memuat log akses...</p>
                </div>
              ) : accessLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada aktivitas akses</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {accessLogs.map((log, index) => (
                    <motion.div
                      key={log.id}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div
                            className={`p-2 rounded-lg ${getAccessTypeColor(
                              log.access_type
                            )}`}
                          >
                            {getAccessTypeIcon(log.access_type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">
                                {log.accessor_profile?.full_name ||
                                  "Pengguna Anonim"}
                              </span>
                              <span className="text-sm text-gray-500">
                                {getAccessTypeLabel(log.access_type)}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {format(
                                    new Date(log.created_at),
                                    "dd MMM yyyy, HH:mm",
                                    { locale: id }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{log.ip_address || "Unknown IP"}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>{formatUserAgent(log.user_agent)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4" />
                  <span>
                    Data akses disimpan untuk keamanan dan transparansi
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Tutup
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
