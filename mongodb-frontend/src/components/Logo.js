// src/components/Logo.js
import React from "react";

const Logo = ({ width = 40, height = 40, className = "" }) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Barangay shield outline */}
      <path
        d="M50 5 L90 25 L90 65 L50 95 L10 65 L10 25 Z"
        fill="#1a73e8"
        stroke="#fff"
        strokeWidth="2"
      />

      {/* Barangay symbol - a stylized "B" */}
      <path
        d="M35 30 L65 30 Q75 35 75 45 Q75 55 65 60 Q75 65 75 75 Q75 85 65 90 L35 90 Z"
        fill="#fff"
        stroke="#fff"
        strokeWidth="1"
      />

      {/* Inner lines */}
      <path
        d="M40 40 L60 40 Q65 45 65 50 Q65 55 60 60 L40 60 Z"
        fill="#1a73e8"
      />
      <path
        d="M40 70 L60 70 Q65 75 65 80 Q65 85 60 90 L40 90 Z"
        fill="#1a73e8"
      />
    </svg>
  );
};

export default Logo;
