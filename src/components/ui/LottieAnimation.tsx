"use client";

import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";

interface LottieAnimationProps {
  animationData: any;
  loop?: boolean;
  className?: string;
  autoplay?: boolean;
}

export function LottieAnimation({ animationData, loop = true, className, autoplay = true }: LottieAnimationProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className={className} />;

  return (
    <div className={className}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} />
    </div>
  );
}
