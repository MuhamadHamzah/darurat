import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Shield,
  Flame,
  Heart,
  Search,
  Zap,
  Users,
  Baby,
  X,
  AlertTriangle,
} from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  number: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "police",
    name: "Polisi",
    number: "110",
    icon: Shield,
    color: "from-blue-500 to-blue-600",
    description: "Kepolisian Republik Indonesia",
  },
  {
    id: "fire",
    name: "Pemadam Kebakaran",
    number: "113",
    icon: Flame,
    color: "from-red-500 to-red-600",
    description: "Dinas Pemadam Kebakaran",
  },
  {
    id: "ambulance",
    name: "Ambulans",
    number: "118",
    icon: Heart,
    color: "from-green-500 to-green-600",
    description: "Layanan Medis Darurat",
  },
  {
    id: "sar",
    name: "SAR Nasional",
    number: "115",
    icon: Search,
    color: "from-orange-500 to-orange-600",
    description: "Badan SAR Nasional",
  },
  {
    id: "bnpb",
    name: "BNPB",
    number: "117",
    icon: AlertTriangle,
    color: "from-yellow-500 to-yellow-600",
    description: "Badan Nasional Penanggulangan Bencana",
  },
  {
    id: "pln",
    name: "PLN",
    number: "123",
    icon: Zap,
    color: "from-purple-500 to-purple-600",
    description: "Pelayanan Gangguan Listrik",
  },
  {
    id: "komnas-ham",
    name: "Komnas HAM",
    number: "021-3925230",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
    description: "Komisi Nasional Hak Asasi Manusia",
  },
  {
    id: "komnas-perempuan",
    name: "Komnas Perempuan",
    number: "021-3903963",
    icon: Users,
    color: "from-pink-500 to-pink-600",
    description: "Komisi Nasional Anti Kekerasan terhadap Perempuan",
  },
  {
    id: "kpai",
    name: "KPAI",
    number: "021-319-015-56",
    icon: Baby,
    color: "from-cyan-500 to-cyan-600",
    description: "Komisi Perlindungan Anak Indonesia",
  },
];

interface EmergencyContactsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmergencyContacts({
  isOpen,
  onClose,
}: EmergencyContactsProps) {
  const [selectedContact, setSelectedContact] =
    useState<EmergencyContact | null>(null);

  const handleCall = (contact: EmergencyContact) => {
    window.open(`tel:${contact.number}`, "_self");
  };

  const handleContactClick = (contact: EmergencyContact) => {
    setSelectedContact(contact);
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
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Kontak Darurat
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Hubungi layanan darurat dengan cepat
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Emergency Contacts Grid */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContacts.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <motion.div
                      key={contact.id}
                      className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all cursor-pointer group"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleContactClick(contact)}
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${contact.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {contact.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {contact.number}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-3">
                        {contact.description}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCall(contact);
                        }}
                        className={`w-full py-2 px-4 bg-gradient-to-r ${contact.color} text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center justify-center space-x-2`}
                      >
                        <Phone className="w-4 h-4" />
                        <span>Hubungi</span>
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Warning Notice */}
            <div className="p-6 bg-red-50 border-t border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-900">Penting!</h4>
                  <p className="text-sm text-red-700 mt-1">
                    Gunakan nomor darurat ini hanya untuk situasi yang
                    benar-benar memerlukan bantuan segera. Penyalahgunaan dapat
                    dikenakan sanksi hukum.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
