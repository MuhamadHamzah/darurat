import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  X,
  PlusCircle,
  Search,
  User,
  Phone,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  tips: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "Selamat Datang di DaruratKu!",
    description:
      "Platform terpercaya untuk melaporkan dan mencari barang hilang. Mari pelajari cara menggunakan aplikasi ini.",
    icon: AlertTriangle,
    color: "from-blue-500 to-green-500",
    tips: [
      "Aplikasi ini gratis dan mudah digunakan",
      "Bantu sesama menemukan barang yang hilang",
      "Keamanan dan privasi adalah prioritas kami",
    ],
  },
  {
    id: 2,
    title: "Laporkan Barang Hilang",
    description:
      "Buat laporan detail tentang barang yang hilang dengan foto dan informasi lengkap.",
    icon: PlusCircle,
    color: "from-red-500 to-orange-500",
    tips: [
      "Sertakan foto barang untuk identifikasi yang lebih mudah",
      "Berikan deskripsi yang detail dan akurat",
      "Cantumkan lokasi dan waktu terakhir melihat barang",
      "Atur reward jika diperlukan",
    ],
  },
  {
    id: 3,
    title: "Cari Barang Hilang",
    description:
      "Jelajahi laporan barang hilang dan bantu orang lain menemukan barang mereka.",
    icon: Search,
    color: "from-purple-500 to-pink-500",
    tips: [
      "Gunakan filter untuk mempersempit pencarian",
      "Periksa kategori yang sesuai",
      "Hubungi pemilik jika menemukan barang",
      "Laporkan temuan dengan bertanggung jawab",
    ],
  },
  {
    id: 4,
    title: "Kelola Profil Anda",
    description:
      "Pantau laporan Anda dan kelola status barang yang telah ditemukan.",
    icon: User,
    color: "from-indigo-500 to-purple-500",
    tips: [
      "Update status barang yang sudah ditemukan",
      "Kelola semua laporan Anda dalam satu tempat",
      "Hapus laporan yang tidak diperlukan lagi",
      "Pantau siapa saja yang mengakses laporan Anda",
    ],
  },
  {
    id: 5,
    title: "Kontak Darurat",
    description:
      "Akses cepat ke nomor darurat penting seperti polisi, pemadam kebakaran, dan layanan medis.",
    icon: Phone,
    color: "from-green-500 to-blue-500",
    tips: [
      "Tersedia 24/7 untuk situasi darurat",
      "Hubungi polisi untuk kasus kehilangan penting",
      "Akses layanan medis dan SAR jika diperlukan",
      "Gunakan dengan bijak dan bertanggung jawab",
    ],
  },
];

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function OnboardingTutorial({
  isOpen,
  onClose,
  onComplete,
}: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const currentTutorial = tutorialSteps[currentStep];
  const Icon = currentTutorial?.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="relative p-6 bg-gradient-to-r from-blue-50 to-green-50">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>

              <div className="text-center">
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${currentTutorial.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentTutorial.title}
                </h2>
                <p className="text-gray-600">{currentTutorial.description}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="space-y-3 mb-6">
                {currentTutorial.tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{tip}</p>
                  </motion.div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>
                    Langkah {currentStep + 1} dari {tutorialSteps.length}
                  </span>
                  <span>
                    {Math.round(
                      ((currentStep + 1) / tutorialSteps.length) * 100
                    )}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 bg-gradient-to-r ${currentTutorial.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        ((currentStep + 1) / tutorialSteps.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button
                    onClick={handleSkip}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Lewati
                  </button>
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Sebelumnya</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={handleNext}
                  className={`flex items-center space-x-2 px-6 py-3 bg-gradient-to-r ${currentTutorial.color} text-white rounded-lg font-medium hover:shadow-lg transition-all`}
                >
                  <span>
                    {currentStep === tutorialSteps.length - 1
                      ? "Mulai"
                      : "Selanjutnya"}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
