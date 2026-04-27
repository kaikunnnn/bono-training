"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { urlFor } from "@/lib/sanity";

interface LessonSidebarProps {
  lesson: {
    title: string;
    iconImage?: { asset?: { _ref?: string } };
    iconImageUrl?: string;
  };
}

export function LessonSidebar({ lesson }: LessonSidebarProps) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const getImageUrl = () => {
    if (lesson.iconImageUrl) {
      return lesson.iconImageUrl;
    }
    if (lesson.iconImage?.asset?._ref) {
      return urlFor(lesson.iconImage).width(556).height(841).url();
    }
    return null;
  };

  const imageUrl = getImageUrl();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const normalizedX = (e.clientX - centerX) / (rect.width / 2);
    const normalizedY = (e.clientY - centerY) / (rect.height / 2);

    const maxRotation = 15;

    setRotateX(-normalizedY * maxRotation);
    setRotateY(normalizedX * maxRotation);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleClick = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => setIsSpinning(false), 600);
  };

  if (!imageUrl) {
    return null;
  }

  const getTransform = () => {
    if (!isVisible) {
      return "translateY(20px)";
    }
    if (isSpinning) {
      return "rotateY(360deg)";
    }
    return "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
  };

  const getTransition = () => {
    if (!isVisible) {
      return "none";
    }
    if (isSpinning) {
      return "transform 0.6s ease-out";
    }
    if (isHovering) {
      return "transform 0.1s ease-out";
    }
    return "opacity 0.4s ease-out, transform 0.5s ease-out";
  };

  return (
    <div className="flex flex-col items-start" style={{ perspective: "1000px" }}>
      <div className="flex items-center">
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className="relative w-[200px] h-[302px] md:w-[278.255px] md:h-[420.407px] rounded-tr-[16px] rounded-br-[16px] overflow-hidden cursor-pointer"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: getTransform(),
            transition: getTransition(),
            transformStyle: "preserve-3d",
            boxShadow: isHovering
              ? "0px 4px 45px rgba(0,0,0,0.28)"
              : "0px 2px 40px rgba(0,0,0,0.24)",
          }}
        >
          <Image
            src={imageUrl}
            alt={lesson.title}
            fill
            className="object-cover"
            style={{
              transform: "translateZ(0)",
            }}
            unoptimized
          />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isHovering
                ? "linear-gradient(" + (105 + rotateY * 2) + "deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 55%, rgba(255,255,255,0) 100%)"
                : "none",
              opacity: isHovering ? 1 : 0,
              transition: "opacity 0.3s ease-out",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default LessonSidebar;
