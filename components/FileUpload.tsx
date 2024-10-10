"use client";
import { useDropzone } from "react-dropzone";
import React from "react";
import { Inbox } from "lucide-react";

const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      console.log(acceptedFiles);
    },
  });
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps()}
        className="flex border-2 border-dashed border-gray-300 bg-gray-50 p-4 rounded-xl cursor-pointer text-center justify-center items-center "
      >
        <input {...getInputProps()} />
        <p className="">Drag & Drop PDF Here</p>
        <Inbox className="w-10 h-10 text-gray-500 ml-2" />
      </div>
    </div>
  );
};


export default FileUpload;
