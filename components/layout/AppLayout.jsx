import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import BottomNav from './BottomNav';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.35, 
      ease: [0.22, 1, 0.36, 1] // custom cubic-bezier for smooth easing
    } 
  },
  exit: { 
    opacity: 0, 
    y: -12, 
    transition: { 
      duration: 0.2, 
      ease: [0.36, 0, 0.66, -0.56]
    } 
  },
};

export default function AppLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <main className="pb-20 max-w-lg mx-auto overflow-x-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}