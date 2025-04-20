"use client";

import React, { useState } from "react";
import { Upload, FileText, Eye, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadComponentProps {
  file: File | null;
  setFile: (file: File | null) => void;
  fileURL: string | null;
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  darkMode: boolean;
  handleUpload: () => void;
  showPreview: boolean;
  setShowPreview: (show: boolean) => void;
}

export function UploadResume({
  file,
  setFile,
  fileURL,
  isLoading,
  error,
  setError,
  darkMode,
  handleUpload,
  showPreview,
  setShowPreview,
}: UploadComponentProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === "application/pdf") {
        setFile(droppedFile);
        setError(null);
      } else {
        setError("Please upload a PDF file.");
      }
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`rounded-xl p-4 sm:p-8 w-full sm:w-[40rem] mb-8 sm:mb-0 ${
        darkMode ? "bg-gray-800 shadow-lg" : "bg-white shadow-md"
      }`}
    >
      <div className="flex items-center mb-6">
        <FileText
          className={darkMode ? "text-gray-300" : "text-gray-700"}
          size={24}
        />
        <h2 className="text-xl font-semibold ml-2">Upload Your Resume</h2>
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-4 sm:p-8 mb-6 text-center transition-colors ${
          dragActive
            ? darkMode
              ? "border-white bg-gray-700"
              : "border-black bg-gray-100"
            : darkMode
            ? "border-gray-600"
            : "border-gray-300"
        } ${file ? (darkMode ? "bg-gray-700/50" : "bg-gray-100/70") : ""}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="resume-upload"
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="resume-upload" className="cursor-pointer">
          <Upload className="mx-auto mb-4" size={32} />
          <p className="mb-2 font-medium">
            {file ? file.name : "Drag & drop your resume or click to browse"}
          </p>
          <p
            className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Supported format: PDF
          </p>
        </label>
      </div>

      {/* Preview Button - Only show when a file is selected */}
      {file && (
        <div className="mb-6">
          <button
            onClick={togglePreview}
            className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer ${
              darkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-100 text-black hover:bg-gray-200"
            }`}
          >
            {showPreview ? (
              <>
                <X size={18} className="mr-2" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye size={18} className="mr-2" />
                Preview Resume
              </>
            )}
          </button>
        </div>
      )}

      {/* PDF Preview - Only show when preview is active */}
      <AnimatePresence>
        {showPreview && fileURL && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div
              className={`p-2 rounded-lg ${
                darkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <object
                data={fileURL}
                type="application/pdf"
                className="w-full h-96 rounded border"
              >
                <p>
                  Unable to display PDF. You can{" "}
                  <a
                    href={fileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    download it instead
                  </a>
                  .
                </p>
              </object>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleUpload}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-colors cursor-pointer ${
          darkMode
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-black text-white hover:bg-gray-800"
        } disabled:opacity-60`}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="animate-spin mr-2" />
            Analyzing Resume...
          </>
        ) : (
          "Extract Information"
        )}
      </button>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-lg ${
            darkMode ? "bg-red-900/30 text-red-200" : "bg-red-50 text-red-600"
          }`}
        >
          {error}
        </motion.div>
      )}
    </motion.div>
  );
}
