import React from 'react';
import { EggColor, EggShape, EggSize } from '../types/flock';
import { EGG_COLORS } from '../data/breeds';

interface EggVisualProps {
  color: EggColor;
  shape?: EggShape;
  size?: EggSize;
  className?: string;
  showDetails?: boolean;
}

export const EggVisual: React.FC<EggVisualProps> = ({
  color,
  shape = 'classic_oval',
  size = 'large',
  className = 'w-10 h-13',
}) => {
  const colorMeta = EGG_COLORS.find(c => c.id === color) || EGG_COLORS[3];

  // Aspect ratio scaling by shape
  let shapeClass = 'rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%]'; // classic oval
  if (shape === 'round') {
    shapeClass = 'rounded-full aspect-square';
  } else if (shape === 'pointed') {
    shapeClass = 'rounded-[50%_50%_50%_50%_/_75%_75%_35%_35%]';
  } else if (shape === 'elongated') {
    shapeClass = 'rounded-[50%_50%_50%_50%_/_65%_65%_38%_38%] scale-y-110';
  } else if (shape === 'torpedo') {
    shapeClass = 'rounded-[45%_45%_45%_45%_/_55%_55%_45%_45%]';
  } else if (shape === 'ridged_textured') {
    shapeClass = 'rounded-[50%_50%_50%_50%_/_62%_62%_38%_38%] border-dashed';
  }

  // Size scale
  let sizeScale = 'scale-100';
  if (size === 'peewee') sizeScale = 'scale-75';
  else if (size === 'small') sizeScale = 'scale-85';
  else if (size === 'medium') sizeScale = 'scale-95';
  else if (size === 'extra_large') sizeScale = 'scale-105';
  else if (size === 'jumbo') sizeScale = 'scale-115';

  const isSpeckled = color === 'speckled_brown';

  return (
    <div
      className={`relative inline-flex items-center justify-center transition-transform ${sizeScale}`}
      title={`${colorMeta.label} (${shape.replace('_', ' ')})`}
    >
      <div
        className={`${className} ${shapeClass} shadow-xs transition-all relative overflow-hidden`}
        style={{
          backgroundColor: colorMeta.hex,
          border: `1.5px solid ${colorMeta.borderHex}`,
          backgroundImage: `radial-gradient(circle at 35% 25%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.18) 100%)`,
        }}
      >
        {/* Subtle highlight sheen */}
        <div className="absolute top-1 left-2 w-2 h-3 bg-white/35 rounded-full blur-[0.5px] rotate-[-20deg]" />

        {/* Freckle dots for speckled egg */}
        {isSpeckled && (
          <div className="absolute inset-0 opacity-70 pointer-events-none">
            <span className="absolute top-3 left-2 w-1 h-1 rounded-full bg-amber-950/80" />
            <span className="absolute top-5 right-2 w-1 h-1.5 rounded-full bg-amber-950/70" />
            <span className="absolute bottom-4 left-3 w-1.5 h-1 rounded-full bg-amber-950/80" />
            <span className="absolute top-2 right-3 w-0.5 h-0.5 rounded-full bg-amber-950/90" />
            <span className="absolute bottom-6 right-2 w-1 h-1 rounded-full bg-amber-950/75" />
            <span className="absolute bottom-2 left-4 w-0.5 h-0.5 rounded-full bg-amber-950/80" />
          </div>
        )}
      </div>
    </div>
  );
};
