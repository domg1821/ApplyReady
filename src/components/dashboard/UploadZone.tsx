"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface UploadZoneProps {
  onTextExtracted: (text: string) => void;
  loading?: boolean;
}

export function UploadZone({ onTextExtracted, loading }: UploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const f = acceptedFiles[0];
      if (!f) return;

      if (f.size > 5 * 1024 * 1024) {
        toast.error("File must be under 5MB");
        return;
      }

      setFile(f);
      setUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", f);

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");

        const { text } = await res.json() as { text: string };
        onTextExtracted(text);
        toast.success("Resume parsed successfully");
      } catch {
        toast.error("Failed to parse PDF. Try pasting text instead.");
        setFile(null);
      } finally {
        setUploading(false);
      }
    },
    [onTextExtracted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    disabled: uploading || loading,
  });

  if (file) {
    return (
      <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 bg-indigo-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
            {uploading ? (
              <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
            ) : (
              <FileText className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-sm text-gray-500">
              {uploading ? "Extracting text…" : "Parsed successfully"}
            </p>
          </div>
          {!uploading && (
            <button
              onClick={() => setFile(null)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
        isDragActive
          ? "border-indigo-400 bg-indigo-50"
          : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
      }`}
    >
      <input {...getInputProps()} />
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Upload className="w-6 h-6 text-gray-400" />
      </div>
      <p className="font-medium text-gray-700 mb-1">
        {isDragActive ? "Drop your resume here" : "Drop your resume PDF here"}
      </p>
      <p className="text-sm text-gray-400">or click to browse · PDF only · Max 5MB</p>
    </div>
  );
}
