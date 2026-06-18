"use client";

import { motion } from "framer-motion";

export function CintasConcentricas() {
  // Colores fuertes del póster del Mundial (sin transparencias ni pasteles)
  const colors = ["#7F4EB3", "#1C68D5", "#009966", "#FCD20F", "#F3722C", "#D3202E"];
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-2] flex justify-center items-center">
       {colors.map((color, i) => (
         <motion.div
           key={color}
           className="absolute border-[60px] md:border-[80px] shadow-2xl"
           style={{
             borderColor: color,
             width: `calc(70vw + ${(i) * 15}vw)`,
             height: `calc(70vh + ${(i) * 15}vh)`,
             borderRadius: '45% 55% 65% 35% / 45% 45% 55% 55%',
             borderStyle: 'solid'
           }}
           animate={{
             rotate: i % 2 === 0 ? 360 : -360,
             borderRadius: [
               '45% 55% 65% 35% / 45% 45% 55% 55%',
               '55% 45% 35% 65% / 55% 35% 65% 45%',
               '50% 60% 40% 50% / 50% 50% 50% 50%',
               '45% 55% 65% 35% / 45% 45% 55% 55%'
             ]
           }}
           transition={{
             rotate: { duration: 40 + i * 10, repeat: Infinity, ease: "linear" },
             borderRadius: { duration: 20 + i * 5, repeat: Infinity, ease: "easeInOut" }
           }}
         />
       ))}
    </div>
  );
}
