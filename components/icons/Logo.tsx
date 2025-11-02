import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 180 60"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Tailora Logo"
  >
    <defs>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600&display=swap');
      `}</style>
      <linearGradient id="tailoraGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#F7D060' }} />
        <stop offset="100%" style={{ stopColor: '#D4AF37' }} />
      </linearGradient>
    </defs>
    
    <text 
      x="5"
      y="45" 
      fontFamily="'Cormorant Garamond', serif" 
      fontSize="50" 
      fontWeight="600"
      fill="url(#tailoraGold)"
    >
      Tailora
    </text>
  </svg>
);
