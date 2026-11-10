import React from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { resolveSignatureStampConfig } from '../utils/documentLogic';

interface SignatureStampBlockProps {
  data: DocumentPackage;
  school: SchoolIdentity;
  variant?: 'standard' | 'lampiran' | 'lampiran-cell';
  dateLine?: string;
  hideTitle?: boolean;
  forceBlank?: boolean;
}

export const SignatureStampBlock: React.FC<SignatureStampBlockProps> = ({
  data,
  school,
  variant = 'standard',
  dateLine,
  hideTitle = false,
  forceBlank = false,
}) => {
  const { showTtd, ttdImage, showStempel, stempelImage } = resolveSignatureStampConfig(data, school);
  const renderTtd = !forceBlank && showTtd && Boolean(ttdImage);
  const renderStempel = !forceBlank && showStempel && Boolean(stempelImage);
  const hasOverlay = renderTtd || renderStempel;

  if (variant === 'lampiran-cell') {
    return (
      <div className="text-left text-[9.5pt] leading-[1.3] relative">
        {!hideTitle && <p className="relative z-10">Kepala</p>}
        <div className={`relative ${hasOverlay ? 'h-[1.95cm]' : 'h-[1.25cm]'}`}>
          {renderStempel && stempelImage && (
            <img
              src={stempelImage}
              alt="Stempel SD Negeri 1 Pujiharjo"
              style={{ width: '4cm', height: '4cm', top: '-1.0cm', left: '-0.4cm' }}
              className="absolute w-[4cm] h-[4cm] max-w-none max-h-none object-contain opacity-85 pointer-events-none select-none z-20"
            />
          )}
          {renderTtd && ttdImage && (
            <img
              src={ttdImage}
              alt="Tanda Tangan Kepala Sekolah"
              style={{ width: '4cm', height: '4cm', top: '-1.0cm', left: '1.15cm' }}
              className="absolute w-[4cm] h-[4cm] max-w-none max-h-none object-contain pointer-events-none select-none z-10"
            />
          )}
        </div>
        <p className="font-bold relative z-10">({data.pejabatPemberiTugas.nama})</p>
        <p className="relative z-10">NIP. {data.pejabatPemberiTugas.nip}</p>
      </div>
    );
  }

  if (variant === 'lampiran') {
    return (
      <div className="w-72 text-center text-[10pt] relative">
        <p className="relative z-10">Kepala Sekolah</p>
        <div className={`relative my-0.5 ${hasOverlay ? 'h-[2.3cm]' : 'h-14'}`}>
          {showStempel && stempelImage && (
            <img
              src={stempelImage}
              alt="Stempel SD Negeri 1 Pujiharjo"
              style={{ width: '4cm', height: '4cm', top: '-0.85cm' }}
              className="absolute left-[0.4cm] w-[4cm] h-[4cm] max-w-none max-h-none object-contain opacity-85 pointer-events-none select-none z-20"
            />
          )}
          {showTtd && ttdImage && (
            <img
              src={ttdImage}
              alt="Tanda Tangan Kepala Sekolah"
              style={{ width: '4cm', height: '4cm', top: '-0.85cm' }}
              className="absolute left-[2.0cm] w-[4cm] h-[4cm] max-w-none max-h-none object-contain pointer-events-none select-none z-10"
            />
          )}
        </div>
        <p className="font-bold underline relative z-10">{data.pejabatPemberiTugas.nama}</p>
        <p className="relative z-10">NIP. {data.pejabatPemberiTugas.nip}</p>
      </div>
    );
  }

  return (
    <div className="w-72 text-left relative">
      {dateLine && <p className="relative z-10">{dateLine}</p>}
      <p className="relative z-10">Kepala</p>
      <p className="relative z-10">SD Negeri 1 Pujiharjo</p>

      <div className={`relative my-0.5 ${hasOverlay ? 'h-[2.5cm]' : 'h-16'}`}>
        {showStempel && stempelImage && (
          <img
            src={stempelImage}
            alt="Stempel SD Negeri 1 Pujiharjo"
            style={{ width: '4cm', height: '4cm', top: '-0.75cm' }}
            className="absolute -left-[0.6cm] w-[4cm] h-[4cm] max-w-none max-h-none object-contain opacity-85 pointer-events-none select-none z-20"
          />
        )}
        {showTtd && ttdImage && (
          <img
            src={ttdImage}
            alt="Tanda Tangan Kepala Sekolah"
            style={{ width: '4cm', height: '4cm', top: '-0.75cm' }}
            className="absolute left-[1.2cm] w-[4cm] h-[4cm] max-w-none max-h-none object-contain pointer-events-none select-none z-10"
          />
        )}
      </div>

      <p className="font-bold underline relative z-10">{data.pejabatPemberiTugas.nama}</p>
      <p className="relative z-10">NIP. {data.pejabatPemberiTugas.nip}</p>
    </div>
  );
};
