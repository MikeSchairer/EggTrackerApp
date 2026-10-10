import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Download, QrCode, CheckCircle2, ShieldCheck, Feather } from 'lucide-react';
import { Chicken, BreedInfo, Coop } from '../types/flock';
import { calculateChickenAge } from '../utils/flockCalculations';

interface ChickenQrModalProps {
  chicken: Chicken | null;
  breed?: BreedInfo;
  coop?: Coop;
  isOpen: boolean;
  onClose: () => void;
}

export const ChickenQrModal: React.FC<ChickenQrModalProps> = ({
  chicken,
  breed,
  coop,
  isOpen,
  onClose,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const badgePrintRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chicken || !isOpen) return;

    const payload = JSON.stringify({
      app: 'Cluck & Clutch',
      id: chicken.id,
      name: chicken.name,
      legBand: chicken.legBandId || 'N/A',
      breed: breed?.name || 'Heritage Chicken',
      coop: coop?.name || 'Main Flock',
      gender: chicken.gender,
      hatchDate: chicken.hatchDate,
      status: chicken.status || 'active',
      verified: true,
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#1C1917',
        light: '#FFFFFF',
      },
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Error generating chicken QR code', err));
  }, [chicken, breed, coop, isOpen]);

  if (!isOpen || !chicken) return null;

  const age = calculateChickenAge(chicken.hatchDate);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `${chicken.name.toLowerCase().replace(/\s+/g, '_')}_qr_badge.png`;
    a.click();
  };

  const handleCopyBadgeInfo = () => {
    const text = `Bird: ${chicken.name} | Leg Band: ${chicken.legBandId || 'None'} | Breed: ${breed?.name || 'Unknown'} | Coop: ${coop?.name || 'Main Coop'}`;
    navigator.clipboard?.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 rounded-xl">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                Chicken ID & Leg Band QR Badge
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Individual bird tracking and coop gate identification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Badge Content */}
        <div className="p-6 space-y-6">
          <div
            ref={badgePrintRef}
            className="p-5 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-stone-50/80 dark:bg-stone-850/80 shadow-xs relative"
          >
            <div className="flex items-center justify-between pb-3 border-b border-dashed border-stone-300 dark:border-stone-700">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 font-mono">
                  CLUCK & CLUTCH FLOCK ID
                </span>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {chicken.status ? chicken.status.toUpperCase() : 'ACTIVE'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center pt-4">
              {/* QR Image */}
              <div className="sm:col-span-5 flex flex-col items-center">
                <div className="bg-white p-2 rounded-xl shadow-xs border border-stone-200">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt={`QR Code for ${chicken.name}`} className="w-28 h-28" />
                  ) : (
                    <div className="w-28 h-28 bg-stone-100 animate-pulse rounded-lg" />
                  )}
                </div>
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono mt-1.5">
                  Scan for profile
                </span>
              </div>

              {/* Bird Profile Specs */}
              <div className="sm:col-span-7 space-y-2">
                <div>
                  <h3 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                    {chicken.name}
                  </h3>
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    {breed?.name || 'Heritage Chicken'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 dark:text-stone-300">
                  <div className="bg-white dark:bg-stone-900/60 p-1.5 rounded-md border border-stone-200/80 dark:border-stone-750">
                    <span className="text-[9px] font-bold text-stone-400 block uppercase">Leg Band</span>
                    <strong className="text-stone-900 dark:text-stone-100 font-mono">
                      {chicken.legBandId || 'None'}
                    </strong>
                  </div>

                  <div className="bg-white dark:bg-stone-900/60 p-1.5 rounded-md border border-stone-200/80 dark:border-stone-750">
                    <span className="text-[9px] font-bold text-stone-400 block uppercase">Current Age</span>
                    <strong className="text-stone-900 dark:text-stone-100">{age.text}</strong>
                  </div>

                  <div className="bg-white dark:bg-stone-900/60 p-1.5 rounded-md border border-stone-200/80 dark:border-stone-750">
                    <span className="text-[9px] font-bold text-stone-400 block uppercase">Home Coop</span>
                    <strong className="text-stone-900 dark:text-stone-100 truncate block">
                      {coop?.name || 'Meadow Haven'}
                    </strong>
                  </div>

                  <div className="bg-white dark:bg-stone-900/60 p-1.5 rounded-md border border-stone-200/80 dark:border-stone-750">
                    <span className="text-[9px] font-bold text-stone-400 block uppercase">Life Stage</span>
                    <strong className="text-stone-900 dark:text-stone-100 capitalize">
                      {chicken.lifeStage.replace(/_/g, ' ')}
                    </strong>
                  </div>
                </div>

                {chicken.notes && (
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 italic line-clamp-2">
                    "{chicken.notes}"
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick tips */}
          <div className="text-xs text-stone-500 dark:text-stone-400 bg-stone-50 dark:bg-stone-850 p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 space-y-1 leading-relaxed">
            <p className="font-semibold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
              <Feather className="w-3.5 h-3.5 text-amber-600" />
              Ways to use individual QR codes:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Print & laminate for nesting box stalls to quickly log identified layers.</li>
              <li>Attach to travel crates during transport or vet visits.</li>
              <li>Scan with any standard smartphone camera to view bird specifications.</li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleCopyBadgeInfo}
              className="px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors border border-stone-200 dark:border-stone-700 flex items-center gap-1.5"
            >
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <QrCode className="w-4 h-4" />}
              {isCopied ? 'Copied' : 'Copy Info'}
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors border border-stone-200 dark:border-stone-700 flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
