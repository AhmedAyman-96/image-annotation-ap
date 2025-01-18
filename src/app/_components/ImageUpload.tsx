"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/app/_components/Spinner";
import toast from "react-hot-toast";

interface ImageUploadProps {
  userId: string;
  onUploadSuccess?: (fileURL: string, taskId: string) => void;
}

export default function ImageUpload({
  userId,
  onUploadSuccess,
}: ImageUploadProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [fileURL, setFileURL] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ["image/jpeg", "image/png"];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError("Only JPEG, PNG, and GIF images are allowed.");
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (selectedFile.size > maxSize) {
        setError("File size must be less than 5MB.");
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !userId) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setFileURL(data.fileURL);

        if (onUploadSuccess) {
          onUploadSuccess(data.fileURL, data.taskId);
        }

        router.push(`/tasks/${data.taskId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setError("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center justify-end space-x-4 mb-6">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id="fileInput"
      />
      <label
        htmlFor="fileInput"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer"
      >
        Choose File
      </label>

      {file && (
        <span className="text-sm text-gray-600">Selected: {file.name}</span>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading || !file}
        className={`px-4 py-2 text-white rounded-lg ${
          file
            ? "bg-green-500 hover:bg-green-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <Spinner className="w-5 h-5 mr-2" /> Uploading...
          </div>
        ) : (
          "Upload"
        )}
      </button>

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {fileURL && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Image uploaded successfully!</p>
          <img
            src={fileURL}
            alt="Uploaded"
            className="mt-2 max-w-full h-auto rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
