import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 260 60"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Tailora Logo"
  >
    <defs>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap');
      `}</style>
    </defs>
    <g fill="#D4AF37">
      {/* "Tailora" Logotype */}
      <text 
        x="0" 
        y="45" 
        fontFamily="'Cormorant Garamond', serif" 
        fontSize="50" 
        fontWeight="600"
      >
        Tailora
      </text>
    </g>
  </svg>
);