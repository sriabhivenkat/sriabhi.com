// components/CopyableCodeBlock.tsx
"use client";

import { useState } from "react";
import { Check, Copy } from "@deemlol/next-icons";

export default function CopyableCodeBlock({
  children,
}: {
  children: any;
}) {
  const [copied, setCopied] = useState(false);

  const codeText =
    typeof children === "string"
      ? children
      : Array.isArray(children)
      ? children.join("")
      : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeText);

    // show checkmark
    setCopied(true);

    // revert back to copy icon after 0.5 sec
    setTimeout(() => setCopied(false), 500);
  };

  return (
    <div className="relative my-4 group">
      <button
        onClick={handleCopy}
        className="
          absolute top-2 right-2 
          p-1 rounded
          transition
          text-gray-700
          hover:text-black
          hover:cursor-pointer
        "
      >
        {copied ? 
            <div className="flex items-center gap-1">
                <Check size={18} color={"green"}/> 
                <p className="text-xs text-green-700 font-inter">Code copied!</p> 
            </div>
            : 
            <Copy size={18} />
        }
      </button>

      <pre className="max-w-full overflow-x-auto">
        <code className="bg-gray-100 p-4 rounded block whitespace-pre-wrap break-words text-xs">
          {codeText}
        </code>
      </pre>
    </div>
  );
}
