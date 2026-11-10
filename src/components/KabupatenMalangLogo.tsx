import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const KabupatenMalangLogo: React.FC<LogoProps> = ({
  className = 'w-20 h-auto object-contain',
  width = 75,
  height = 92,
}) => {
  return (
    <img
      src="/assets/aistudio/Logo_Kabupaten_Malang_-_Seal_of_Malang_Regency.svg__1__c03f8bbc.png"
      alt="Lambang Kabupaten Malang"
      width={width}
      height={height}
      className={`object-contain inline-block drop-shadow-xs ${className}`}
      loading="eager"
      onError={(e) => {
        // Fallback to secondary path if needed
        const target = e.currentTarget;
        if (!target.src.endsWith('/logo-kabupaten-malang.png')) {
          target.src = '/logo-kabupaten-malang.png';
        }
      }}
    />
  );
};
