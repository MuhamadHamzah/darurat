import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function LoadingAnimation() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          className="relative mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Outer Ring */}
          <motion.div
            className="w-32 h-32 border-4 border-blue-200 rounded-full absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Middle Ring */}
          <motion.div
            className="w-24 h-24 border-4 border-green-300 rounded-full absolute inset-4"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />

          {/* Logo Container */}
          <motion.div
            className="w-32 h-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center relative z-10"
            animate={{
              scale: [1, 1.1, 1],
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.4)",
                "0 0 0 20px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <img
              src="/img/logo.png"
              alt="DaruratKu Logo"
              className="w-16 h-16 object-contain"
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.currentTarget.style.display = "none";
                e.currentTarget.nextElementSibling?.classList.remove("hidden");
              }}
            />
            <AlertTriangle className="w-16 h-16 text-white hidden" />
          </motion.div>
        </motion.div>

        {/* App Name */}
        <motion.h1
          className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          DaruratKu
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl text-gray-600 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          Temukan Barang Anda
        </motion.p>

        {/* Loading Dots */}
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>

        {/* Loading Text */}
        <motion.p
          className="text-gray-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          Memuat aplikasi...
        </motion.p>
      </div>
    </div>
  );
}
