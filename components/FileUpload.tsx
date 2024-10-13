"use client";
import { useDropzone } from "react-dropzone";
import React, { useState } from "react";
import { Inbox, Loader2 } from "lucide-react";
import { uploadToS3 } from "@/lib/s3";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          "File size is too big. Please upload a file smaller than 10MB."
        );
        return;
      }

      try {
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Something went wrong in uploading to S3");
          return;
        }
        mutate(data, {
          onSuccess: ({ chatId }) => {
            console.log(chatId);
            toast.success("Chat Created!");
            router.push(`/chat/${chatId}`);
          },
          onError: (data) => {
            toast.error("Error Creating chat");
            console.error(data);
          },
        });
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong");
      } finally {
        setIsUploading(false);
      }
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps()}
        className="flex border-2 border-dashed border-gray-300 bg-gray-50 p-4 rounded-xl cursor-pointer text-center justify-center items-center "
      >
        <input {...getInputProps()} />
        {isUploading || isPending ? (
          <>
            {/*loading*/}
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
            <p className="mt-2 text-sm text-slate-400">Processing...</p>
          </>
        ) : (
          <>
            <p className="">Drag & Drop PDF Here</p>
            <Inbox className="w-10 h-10 text-gray-500 ml-2" />
          </>
        )}
      </div>
    </div>
  );
};


export default FileUpload;
