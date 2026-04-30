'use client';

import { Loader2 } from "lucide-react"; // Optional: Lucide icon for animation
import React from "react";

const Loader = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <div className="flex flex-col justify-center items-center h-screen gap-4 text-gray-500 dark:text-gray-400">
      <Loader2 className="animate-spin w-8 h-8" />
      <p className="text-lg">{text}</p>
    </div>
  );
};

export default Loader;
