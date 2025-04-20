"use client";

import React from "react";
import { FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ResultComponentProps {
  isLoading: boolean;
  result: any;
  darkMode: boolean;
}

export function ParsedResult({
  isLoading,
  result,
  darkMode,
}: ResultComponentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl p-4 sm:p-8 w-full sm:w-[40rem] ${
        darkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"
      }`}
    >
      <h2 className="text-xl font-semibold mb-6">Resume Information</h2>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-8 sm:py-12"
          >
            <Loader2 size={40} className="animate-spin mb-4" />
            <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
              Processing your resume...
            </p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {[
              { label: "Name", value: result.name },
              { label: "Email", value: result.email },
              { label: "Phone", value: result.phone },
              { label: "College", value: result.college },
              { label: "Degree", value: result.degree },
              { label: "Graduation Year", value: result.graduating_year },
            ].map((item, index) => (
              <div key={index} className="pb-3 border-b last:border-b-0">
                <div
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </div>
                <div className="font-medium mt-1 break-words">
                  {item.value || "-"}
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 sm:py-12 text-center"
          >
            <FileText
              size={64}
              className={`mb-4 ${darkMode ? "text-gray-600" : "text-gray-300"}`}
            />
            <p
              className={`font-medium ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              Upload a resume to view extracted information
            </p>
            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              We'll analyze your resume and display the key details here
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
