"use client";

import React, { useState } from "react";
import { User } from "lucide-react";

export const DEFAULT_USER_AVATAR = "/default-avatar.svg";

interface UserAvatarProps {
  src?: string | null;
  alt?: string;
  className?: string;
  shape?: "circle" | "rounded";
  fallbackName?: string;
  onClick?: () => void;
}

export function UserAvatar({
  src,
  alt = "User Avatar",
  className = "w-12 h-12 rounded-2xl",
  shape = "rounded",
  fallbackName,
  onClick,
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const cleanSrc = src && typeof src === "string" ? src.trim() : "";
  const isUnsplashDummy =
    cleanSrc.includes("images.unsplash.com/photo-1535713875002") ||
    cleanSrc.includes("images.unsplash.com/photo-1544005313") ||
    cleanSrc.includes("images.unsplash.com/photo-1506794778202");
  const isBrokenOrEmpty =
    !cleanSrc ||
    cleanSrc === "undefined" ||
    cleanSrc === "null" ||
    cleanSrc === "/default-avatar.svg" ||
    isUnsplashDummy ||
    hasError;

  const hasCustomRadius = className.includes("rounded-");
  const shapeClass = hasCustomRadius ? "" : (shape === "circle" ? "rounded-full" : "rounded-2xl");

  if (isBrokenOrEmpty) {
    return (
      <div
        onClick={onClick}
        className={`flex items-center justify-center bg-gradient-to-br from-amber-50 to-saffron-100 border border-saffron-200 text-saffron-700 flex-shrink-0 select-none overflow-hidden ${shapeClass} ${className}`}
        title={alt || fallbackName || "સભ્ય પ્રોફાઇલ"}
      >
        <User className="w-1/2 h-1/2 text-saffron-600 stroke-[2.2]" />
      </div>
    );
  }

  return (
    <img
      src={cleanSrc}
      alt={alt || fallbackName || "User"}
      onError={() => setHasError(true)}
      onClick={onClick}
      className={`object-cover flex-shrink-0 ${shapeClass} ${className}`}
    />
  );
}

