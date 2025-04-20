"use client";

import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { UploadResume } from "../components/UploadResume";
import { ParsedResult } from "../components/ParsedResult";

export default function HomePage() {
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: light)"
    ).matches;
    setDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFileURL(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setFileURL(null);
      setShowPreview(false);
    }
  }, [file]);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a resume PDF first");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to upload resume");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-200 text-gray-800"
      } transition-colors duration-300`}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center text-center mb-12 relative">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full cursor-pointer absolute top-0 right-0 sm:right-4 ${
              darkMode
                ? "bg-gray-800 text-yellow-300"
                : "bg-white text-gray-700"
            }`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tight font-serif mb-2"
          >
            Resume Parser
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 0.2 } }}
            className={`mt-2 max-w-lg text-lg italic ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Extract key information from your resume in seconds
          </motion.p>
        </div>

        <div className="flex justify-center gap-8 flex-wrap">
          <UploadResume
            file={file}
            setFile={setFile}
            fileURL={fileURL}
            isLoading={isLoading}
            error={error}
            setError={setError}
            darkMode={darkMode}
            handleUpload={handleUpload}
            showPreview={showPreview}
            setShowPreview={setShowPreview}
          />

          <ParsedResult
            isLoading={isLoading}
            result={result}
            darkMode={darkMode}
          />
        </div>

        {/* Footer */}
        <div
          className={`mt-12 text-center text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <p>
            © {new Date().getFullYear()} Resume Parser · Extract resume data
            with precision
          </p>
        </div>
      </div>
    </div>
  );
}
