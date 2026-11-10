import React from 'react';
import { SchoolIdentity } from '../types';
import { KabupatenMalangLogo } from './KabupatenMalangLogo';

interface KopSuratViewProps {
  school: SchoolIdentity;
}

export const KopSuratView: React.FC<KopSuratViewProps> = ({ school }) => {
  return (
    <div className="relative border-b-4 border-black pb-1 mb-4 select-text">
      {/* Secondary thin border for standard kedinasan double line */}
      <div className="flex items-center justify-between gap-4 pb-2">
        {/* Logo left */}
        <div className="shrink-0 w-20 flex justify-center items-center">
          <KabupatenMalangLogo width={74} height={92} />
        </div>

        {/* Text Kop */}
        <div className="flex-1 text-center font-['Arial',sans-serif] text-black">
          <h3 className="text-[14pt] leading-tight font-normal uppercase tracking-wider">
            {school.pemda}
          </h3>
          <h2 className="text-[14pt] leading-tight font-normal uppercase tracking-wider">
            {school.dinas}
          </h2>
          <h1 className="text-[17pt] leading-tight font-bold uppercase tracking-wide my-0.5">
            {school.namaSekolah}
          </h1>
          <p className="text-[9.5pt] leading-tight font-normal">
            {school.alamat}
          </p>
          <p className="text-[9pt] leading-tight font-normal mt-0.5 whitespace-nowrap">
            Telepon: {school.telepon}, Laman: <span className="underline">{school.laman}</span>
          </p>
          <p className="text-[9pt] leading-tight font-normal">
            Pos-el: <span className="underline">{school.email}</span>, Kode Pos: {school.kodePos}
          </p>
        </div>

        {/* Placeholder right to balance the logo alignment in center */}
        <div className="shrink-0 w-20 invisible"></div>
      </div>
      {/* Fine secondary line 1px below 4px line */}
      <div className="border-b border-black -mb-[1px]"></div>
    </div>
  );
};
