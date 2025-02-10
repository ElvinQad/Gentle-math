'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import React from 'react';

// Map pages to their vertical positions
const pagePositions: { [key: string]: number } = {
  '/dashboard': 0,
  '/dashboard/trends': 1,
  '/dashboard/predictions': 2,
  '/dashboard/profile': 3,
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  const prevPathRef = React.useRef(pathname);

  const getAnimationDirection = () => {
    const currentPos = pagePositions[pathname as keyof typeof pagePositions] ?? 0;
    const prevPos = pagePositions[prevPathRef.current as keyof typeof pagePositions] ?? 0;

    prevPathRef.current = pathname;

    // When moving down (currentPos > prevPos), new page comes from top (-1)
    // When moving up (currentPos < prevPos), new page comes from bottom (1)
    return currentPos > prevPos ? -1 : 1;
  };

  const direction = getAnimationDirection();
  const slideDistance = 500;

  return (
    <motion.div
      key={pathname}
      initial={{ y: slideDistance * direction, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: slideDistance * direction, opacity: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1],
      }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}
