import React from "react";

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center ${className || ""}`}>
      <img
        src="/tailora-logo.png"
        alt="Tailora Logo"
        className="h-8 w-auto mr-2"
      />
      <span className="text-2xl font-semibold text-yellow-500 tracking-wide">
        Ailora
      </span>
    </div>
  );
};
