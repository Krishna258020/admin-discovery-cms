
import React from 'react';
import { BadgeStyling } from '../types';

interface BadgePreviewProps {
  name: string;
  styling: BadgeStyling | null | undefined; // Allow styling to be null or undefined
  className?: string;
}

const hexToRgba = (hex: string | undefined, opacity: number) => {
  if (!hex || !hex.startsWith('#') || hex.length < 7) {
    return `rgba(156, 163, 175, ${opacity})`; // Default gray color
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const BadgePreview: React.FC<BadgePreviewProps> = ({ name, styling, className = "" }) => {
  // If no styling provided, return a simple badge with default colors
  if (!styling) {
    return (
      <div className={`px-4 py-2.5 rounded-full bg-gray-200 text-gray-700 font-bold text-sm inline-block ${className}`}>
        {name || 'BADGE TITLE'}
      </div>
    );
  }

  // Define default styling values for when styling exists but has missing fields
  const defaultStyling: BadgeStyling = {
    bgColor1: styling.bgColor1 || '#f3f4f6',
    bgColor1Opacity: styling.bgColor1Opacity ?? 1,
    bgColor2: styling.bgColor2 || '#e5e7eb',
    bgColor2Opacity: styling.bgColor2Opacity ?? 1,
    textColor: styling.textColor || '#1f2937',
    bgType: styling.bgType || 'gradient',
    gradientDirection: styling.gradientDirection || 'to right',
    bgOpacity: styling.bgOpacity ?? 1,
    fontFamily: styling.fontFamily || 'Inter',
    fontSize: styling.fontSize || 14,
    fontWeight: styling.fontWeight || 700,
    letterSpacing: styling.letterSpacing || 'tracking-[0.15em]',
    containerAnimation: styling.containerAnimation || '',
    textAnimation: styling.textAnimation || '',
    bgPattern: styling.bgPattern || 'none',
    patternOpacity: styling.patternOpacity ?? 0.2,
  };

  // Use merged styling
  const currentStyling = defaultStyling;

  const c1 = hexToRgba(currentStyling.bgColor1, currentStyling.bgColor1Opacity);
  const c2 = currentStyling.bgColor2 ? hexToRgba(currentStyling.bgColor2, currentStyling.bgColor2Opacity || 1) : c1;

  const bgStyle = currentStyling.bgType === 'gradient'
    ? `linear-gradient(${currentStyling.gradientDirection || 'to right'}, ${c1}, ${c2})`
    : c1;

  const styleObj: React.CSSProperties = {
    background: bgStyle,
    opacity: currentStyling.bgOpacity,
    color: currentStyling.textColor,
    fontFamily: currentStyling.fontFamily,
    fontSize: `${currentStyling.fontSize}px`,
    fontWeight: currentStyling.fontWeight,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden'
  };

  const getPatternStyles = () => {
    const opacity = currentStyling.patternOpacity || 0.2;
    if (currentStyling.bgPattern === 'dots') return {
      backgroundImage: `radial-gradient(circle, ${currentStyling.textColor} 1px, transparent 1px)`,
      backgroundSize: '8px 8px',
      opacity: opacity
    };
    if (currentStyling.bgPattern === 'stripes') return {
      backgroundImage: `linear-gradient(45deg, ${currentStyling.textColor} 25%, transparent 25%, transparent 50%, ${currentStyling.textColor} 50%, ${currentStyling.textColor} 75%, transparent 75%, transparent)`,
      backgroundSize: '10px 10px',
      opacity: opacity
    };
    if (currentStyling.bgPattern === 'glass') return {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(4px)',
      opacity: 1
    };
    return {};
  };

  return (
    <div
      className={`relative rounded-full px-4 py-2.5 text-center shadow-lg inline-block border border-white/30 ${currentStyling.containerAnimation} ${className}`}
      style={styleObj}
    >
      {/* Pattern Overlay */}
      {currentStyling.bgPattern && currentStyling.bgPattern !== 'none' && (
        <div className="absolute inset-0 pointer-events-none" style={getPatternStyles()} />
      )}

      <span className={`uppercase block font-black ${currentStyling.letterSpacing || 'tracking-[0.15em]'} ${currentStyling.textAnimation}`} style={{ fontWeight: currentStyling.fontWeight }}>
        {name || 'BADGE TITLE'}
      </span>
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none rounded-full"></div>
    </div>
  );
};

export default BadgePreview;
