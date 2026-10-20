import React, { useState } from 'react';
import { Chicken } from '../types/flock';

interface ChickenAvatarProps {
  chicken: Chicken;
  className?: string;
  alt?: string;
}

// High-quality breed portrait fallbacks for chickens without custom photo uploads
const BREED_PORTRAIT_MAP: Record<string, string> = {
  // Barred / Speckled / Laced patterns
  'plymouth-barred-rock': '/src/assets/images/chicken_barred_rock_1792461678300.jpg',
  'black-copper-marans': '/src/assets/images/chicken_barred_rock_1792461678300.jpg',
  'speckled-sussex': '/src/assets/images/chicken_barred_rock_1792461678300.jpg',
  'silver-laced-wyandotte': '/src/assets/images/chicken_barred_rock_1792461678300.jpg',
  'columbian-wyandotte': '/src/assets/images/chicken_barred_rock_1792461678300.jpg',

  // Fluffy cheek muffs / Easter & Olive eggers / Silkies
  'ameraucana': '/src/assets/images/chicken_ameraucana_1792461677524.jpg',
  'easter-egger': '/src/assets/images/chicken_ameraucana_1792461677524.jpg',
  'olive-egger': '/src/assets/images/chicken_ameraucana_1792461677524.jpg',
  'silkie': '/src/assets/images/chicken_ameraucana_1792461677524.jpg',
  'light-brahma': '/src/assets/images/chicken_ameraucana_1792461677524.jpg',

  // Fancy Crested Polish varieties
  'white-crested-black-polish': '/src/assets/images/chicken_polish_buff_1792461678616.jpg',
  'silver-laced-polish': '/src/assets/images/chicken_polish_buff_1792461678616.jpg',
  'buff-laced-polish': '/src/assets/images/chicken_polish_buff_1792461678616.jpg',
  'golden-laced-polish': '/src/assets/images/chicken_polish_buff_1792461678616.jpg',

  // Classic Heritage reds, buffs, and dual-purpose
  'rhode-island-red': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
  'buff-orpington': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
  'welsummer': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
  'australorp': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
  'white-leghorn': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
  'golden-laced-wyandotte': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
  'blue-laced-red-wyandotte': '/src/assets/images/chicken_rhode_red_1792461676694.jpg',
};

export function getChickenProfilePicture(chicken: Chicken): string {
  if (chicken.photoUrl && chicken.photoUrl.trim().length > 0) {
    return chicken.photoUrl;
  }
  if (chicken.breedId && BREED_PORTRAIT_MAP[chicken.breedId]) {
    return BREED_PORTRAIT_MAP[chicken.breedId];
  }
  // Default natural hen portrait
  return '/src/assets/images/chicken_rhode_red_1792461676694.jpg';
}

export const ChickenAvatar: React.FC<ChickenAvatarProps> = ({
  chicken,
  className = 'w-10 h-10 rounded-xl',
  alt,
}) => {
  const [imageError, setImageError] = useState(false);
  const photoSrc = getChickenProfilePicture(chicken);

  return (
    <div
      className={`relative overflow-hidden shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/20 bg-stone-100 dark:bg-stone-800 flex items-center justify-center ${className}`}
    >
      {!imageError ? (
        <img
          src={photoSrc}
          alt={alt || `${chicken.name} profile`}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover select-none"
        />
      ) : (
        /* Stylized SVG Hen Portrait Fallback instead of text initial */
        <svg
          viewBox="0 0 40 40"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="40" fill={chicken.avatarColor || '#B45309'} opacity="0.9" />
          {/* Hen body & neck silhouette */}
          <path
            d="M8 40C8 30 14 24 20 23C26 22 34 26 36 40H8Z"
            fill="white"
            fillOpacity="0.25"
          />
          {/* Hen head */}
          <circle cx="21" cy="18" r="9" fill="white" fillOpacity="0.3" />
          {/* Red comb on top */}
          <path
            d="M17 11C16 8 18 7 19 8C20 6 22 6 23 8C24 6 26 7 25 11Z"
            fill="#EF4444"
          />
          {/* Eye */}
          <circle cx="24" cy="17" r="1.5" fill="#1C1917" />
          <circle cx="24.5" cy="16.5" r="0.5" fill="white" />
          {/* Beak */}
          <polygon points="28,17 34,19 28,21" fill="#F59E0B" />
          {/* Wattle */}
          <path
            d="M26 21C26 24 24 25 23 23C22 22 24 20 26 21Z"
            fill="#DC2626"
          />
        </svg>
      )}
    </div>
  );
};
