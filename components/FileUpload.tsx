"use client";
import { useDropzone } from "react-dropzone";
import React from "react";

const FileUpload = () => {
  const { getRootProps, getInputProps } = useDropzone();
  return (
    <div className="p-2 bg-white rounded-xl">
      <div
        {...getRootProps()}
        className="flex border-2 border-dashed border-gray-300 bg-gray-50 p-4 rounded-xl cursor-pointer items-center "
      >
        <input {...getInputProps()} />
        <p>Drag &apos;n &apos;drop some files here, or click to select files</p>
      </div>
    </div>
  );
};

export default FileUpload;
