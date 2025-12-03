import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Navigation, X, Map } from "lucide-react";

interface MapLocationPickerProps {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
    description: string;
  }) => void;
  initialLocation?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function MapLocationPicker({
  onLocationSelect,
  initialLocation = "",
  isOpen,
  onClose,
}: MapLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState(initialLocation);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
    description: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [locationDescription, setLocationDescription] = useState("");

  // Mock geocoding function - in real app, use Google Maps API
  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);

    // Mock data - replace with actual Google Maps API call
    const mockResults = [
      {
        address: `${query}, Jakarta Pusat, DKI Jakarta`,
        lat: -6.2088,
        lng: 106.8456,
        description: "Area pusat kota Jakarta dengan berbagai fasilitas umum",
      },
      {
        address: `${query}, Jakarta Selatan, DKI Jakarta`,
        lat: -6.2615,
        lng: 106.8106,
        description: "Kawasan bisnis dan perumahan di Jakarta Selatan",
      },
      {
        address: `${query}, Jakarta Barat, DKI Jakarta`,
        lat: -6.1745,
        lng: 106.8227,
        description: "Area komersial dan industri di Jakarta Barat",
      },
      {
        address: `Mall Taman Anggrek, Jakarta Barat`,
        lat: -6.1781,
        lng: 106.7906,
        description:
          "Pusat perbelanjaan besar dengan berbagai toko dan restoran",
      },
      {
        address: `Stasiun Gambir, Jakarta Pusat`,
        lat: -6.1754,
        lng: 106.8304,
        description:
          "Stasiun kereta api utama dengan akses transportasi publik",
      },
    ];

    setTimeout(() => {
      setSuggestions(
        mockResults.filter((result) =>
          result.address.toLowerCase().includes(query.toLowerCase())
        )
      );
      setIsLoading(false);
    }, 500);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Mock reverse geocoding
          const currentLocation = {
            address: "Lokasi Saat Ini",
            lat: latitude,
            lng: longitude,
            description: "Lokasi berdasarkan GPS perangkat Anda",
          };
          setSelectedLocation(currentLocation);
          setSearchQuery(currentLocation.address);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsLoading(false);
        }
      );
    }
  };

  const handleLocationSelect = (location: any) => {
    setSelectedLocation(location);
    setSearchQuery(location.address);
    setLocationDescription(location.description);
    setSuggestions([]);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        ...selectedLocation,
        description: locationDescription || selectedLocation.description,
      });
      onClose();
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchQuery !== "Lokasi Saat Ini") {
        searchLocation(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
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
                    <Map className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Pilih Lokasi
                    </h2>
                    <p className="text-sm text-gray-600">
                      Tentukan lokasi barang hilang
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Cari lokasi (contoh: Mall Taman Anggrek)"
                />
              </div>

              {/* Current Location Button */}
              <button
                onClick={getCurrentLocation}
                disabled={isLoading}
                className="w-full mb-4 py-3 px-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Navigation className="w-4 h-4" />
                <span>
                  {isLoading
                    ? "Mendapatkan lokasi..."
                    : "Gunakan Lokasi Saat Ini"}
                </span>
              </button>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Saran Lokasi:
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => handleLocationSelect(suggestion)}
                        className="w-full p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-3">
                          <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {suggestion.address}
                            </p>
                            <p className="text-sm text-gray-600">
                              {suggestion.description}
                            </p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Location */}
              {selectedLocation && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900">
                        Lokasi Terpilih:
                      </h4>
                      <p className="text-green-800">
                        {selectedLocation.address}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {selectedLocation.description}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Location Description */}
              {selectedLocation && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi Detail Lokasi (Opsional)
                  </label>
                  <textarea
                    value={locationDescription}
                    onChange={(e) => setLocationDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Contoh: Di dekat food court lantai 3, area parkir motor, atau landmark terdekat..."
                  />
                </div>
              )}

              {/* Mock Map Preview */}
              {selectedLocation && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Preview Lokasi:
                  </h4>
                  <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm">
                        Peta akan ditampilkan di sini
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Lat: {selectedLocation.lat.toFixed(6)}, Lng:{" "}
                        {selectedLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedLocation}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-lg hover:from-blue-600 hover:to-green-600 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Konfirmasi Lokasi
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
