import React from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { formatTanggalIndo } from '../utils/documentLogic';
import { SignatureStampBlock } from './SignatureStampBlock';

interface LampiranSPPDPageProps {
  data: DocumentPackage;
  school: SchoolIdentity;
}

export const LampiranSPPDPage: React.FC<LampiranSPPDPageProps> = ({ data, school }) => {
  const tglIndo = formatTanggalIndo(data.tanggalSurat);
  const tglBerangkat = data.tanggalBerangkat || tglIndo;
  const tglKembali = data.tanggalKembali || tglIndo;
  const tempatKedudukan = data.tempatAsal || school.kepalaSekolah.unitKerja || 'SD Negeri 1 Pujiharjo';
  const isiOtomatis = Boolean(data.halaman3?.isiOtomatis);

  const renderTibaBerangkatRow = (
    roman: 'II.' | 'III.' | 'IV.',
    leftValues?: {
      tibaDi?: string;
      tanggal?: string;
      kepala?: string;
      nama?: string;
      nip?: string;
    },
    rightValues?: {
      berangkatDari?: string;
      ke?: string;
      tanggal?: string;
      kepala?: string;
      nama?: string;
      nip?: string;
    }
  ) => (
    <tr className="border-b border-black">
      {/* Kolom Kiri: Tiba di */}
      <td colSpan={2} className="w-1/2 border-r border-black px-2 py-1.5 align-top">
        <div className="flex items-start">
          <span className="w-[22px] shrink-0">{roman}</span>
          <div className="flex-1 flex flex-col justify-between min-h-[3.55cm]">
            <div className="space-y-0.5">
              <div className="flex">
                <span className="w-[86px] shrink-0">Tiba di</span>
                <span className="w-3 shrink-0">:</span>
                <span className="flex-1 break-words">{leftValues?.tibaDi || '.......................'}</span>
              </div>
              <div className="flex">
                <span className="w-[86px] shrink-0">Pada Tanggal</span>
                <span className="w-3 shrink-0">:</span>
                <span className="flex-1">{leftValues?.tanggal || '.......................'}</span>
              </div>
              <div className="flex">
                <span className="w-[86px] shrink-0">Kepala</span>
                <span className="w-3 shrink-0">:</span>
                <span className="flex-1 break-words">{leftValues?.kepala || '.......................'}</span>
              </div>
            </div>

            <div className="pt-[1.05cm]">
              <p className={leftValues?.nama ? 'font-bold' : ''}>
                ({leftValues?.nama || '.......................'})
              </p>
              <p>{leftValues?.nip ? `NIP. ${leftValues.nip}` : 'NIP'}</p>
            </div>
          </div>
        </div>
      </td>

      {/* Kolom Kanan: Berangkat dari */}
      <td className="w-1/2 px-2 py-1.5 align-top">
        <div className="flex flex-col justify-between min-h-[3.55cm]">
          <div className="space-y-0.5">
            <div className="flex">
              <span className="w-[88px] shrink-0">Berangkat dari</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1 break-words">{rightValues?.berangkatDari || '.................'}</span>
            </div>
            <div className="flex">
              <span className="w-[88px] shrink-0">Ke</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1 break-words">{rightValues?.ke || '.................'}</span>
            </div>
            <div className="flex">
              <span className="w-[88px] shrink-0">Pada Tanggal</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1">{rightValues?.tanggal || '.................'}</span>
            </div>
            <div className="flex">
              <span className="w-[88px] shrink-0">Kepala</span>
              <span className="w-3 shrink-0">:</span>
              <span className="flex-1 break-words">{rightValues?.kepala || '.................'}</span>
            </div>
          </div>

          <div className="pt-[0.8cm]">
            <p className={rightValues?.nama ? 'font-bold' : ''}>
              ({rightValues?.nama || '............................'})
            </p>
            <p>{rightValues?.nip ? `NIP. ${rightValues.nip}` : 'NIP'}</p>
          </div>
        </div>
      </td>
    </tr>
  );

  const rowIIValues = isiOtomatis
    ? {
        left: {
          tibaDi: data.tempatTujuan || '.......................',
          tanggal: tglBerangkat || '.......................',
          kepala: data.halaman3?.pejabatTujuanJabatan || '.......................',
          nama: data.halaman3?.pejabatTujuanNama || '',
          nip: data.halaman3?.pejabatTujuanNip || '',
        },
        right: {
          berangkatDari: data.tempatTujuan || '.................',
          ke: tempatKedudukan || '.................',
          tanggal: tglKembali || '.................',
          kepala: data.halaman3?.pejabatTujuanJabatan || '.................',
          nama: data.halaman3?.pejabatTujuanNama || '',
          nip: data.halaman3?.pejabatTujuanNip || '',
        },
      }
    : undefined;

  const rowIIIValues =
    isiOtomatis && data.halaman3?.transitAktif
      ? {
          left: {
            tibaDi: data.halaman3.transitTibaDi || '.......................',
            tanggal: data.halaman3.transitTanggalTiba || '.......................',
            kepala: data.halaman3.transitPejabatTiba || '.......................',
            nama: '',
            nip: data.halaman3.transitNipTiba || '',
          },
          right: {
            berangkatDari: data.halaman3.transitBerangkatDari || '.................',
            ke: data.halaman3.transitKe || '.................',
            tanggal: data.halaman3.transitTanggalBerangkat || '.................',
            kepala: data.halaman3.transitPejabatBerangkat || '.................',
            nama: '',
            nip: data.halaman3.transitNipBerangkat || '',
          },
        }
      : undefined;

  return (
    <div className="a4-sheet bg-white text-black font-['Arial',sans-serif] text-[9.5pt] leading-[1.3] p-[12mm_14mm_12mm_15mm] mx-auto shadow-md print:shadow-none print:p-0 relative box-border">
      <table className="w-full border-collapse border border-black text-[9.5pt]">
        <colgroup>
          <col style={{ width: '30px' }} />
          <col style={{ width: 'calc(50% - 30px)' }} />
          <col style={{ width: '50%' }} />
        </colgroup>
        <tbody>
          {/* BAGIAN I */}
          <tr className="border-b border-black">
            <td colSpan={2} className="w-1/2 border-r border-black px-2 py-1.5 align-top">
              &nbsp;
            </td>
            <td className="w-1/2 px-2 py-1.5 align-top">
              <div className="flex items-start">
                <span className="w-[18px] shrink-0">I.</span>
                <div className="flex-1">
                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="w-[104px] shrink-0">Berangkat dari</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1">{tempatKedudukan}</span>
                    </div>
                    <div>(Tempat Kedudukan)</div>
                    <div className="flex">
                      <span className="w-[104px] shrink-0">Ke</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1 break-words">
                        {isiOtomatis ? data.tempatTujuan || '.................' : '.................'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-[104px] shrink-0">Pada Tanggal</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1">
                        {isiOtomatis ? tglBerangkat || '.................' : '.................'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-0.5">
                    <SignatureStampBlock data={data} school={school} variant="lampiran-cell" />
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* BAGIAN II */}
          {renderTibaBerangkatRow('II.', rowIIValues?.left, rowIIValues?.right)}

          {/* BAGIAN III */}
          {renderTibaBerangkatRow('III.', rowIIIValues?.left, rowIIIValues?.right)}

          {/* BAGIAN IV */}
          {renderTibaBerangkatRow('IV.')}

          {/* BAGIAN V */}
          <tr className="border-b border-black">
            <td colSpan={2} className="w-1/2 border-r border-black px-2 py-1.5 align-top">
              <div className="flex items-start">
                <span className="w-[22px] shrink-0">V.</span>
                <div className="flex-1">
                  <div className="space-y-0.5">
                    <div className="flex">
                      <span className="w-[86px] shrink-0">Tiba di</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1">
                        {isiOtomatis ? tempatKedudukan : '.......................'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-[86px] shrink-0">Pada Tanggal</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1">
                        {isiOtomatis ? tglKembali || '.......................' : '.......................'}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="w-[86px] shrink-0">Kepala</span>
                      <span className="w-3 shrink-0">:</span>
                      <span className="flex-1">{tempatKedudukan}</span>
                    </div>
                  </div>
                  <div className="mt-0.5">
                    <SignatureStampBlock
                      data={data}
                      school={school}
                      variant="lampiran-cell"
                      hideTitle
                      forceBlank
                    />
                  </div>
                </div>
              </div>
            </td>
            <td className="w-1/2 px-2 py-1.5 align-top">
              <p className="leading-[1.35] text-left">
                Telah diperiksa, dengan keterangan bahwa perjalanan tersebut diatas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.
              </p>
            </td>
          </tr>

          {/* BAGIAN VI */}
          <tr className="border-b border-black">
            <td className="w-[30px] border-r border-black px-1.5 py-1 align-top">VI.</td>
            <td colSpan={2} className="px-2 py-1 align-top">
              <div>Catatan Lain-Lain</div>
              {data.halaman3?.catatanLain && (
                <p className="mt-1 whitespace-pre-line">{data.halaman3.catatanLain}</p>
              )}
            </td>
          </tr>

          {/* BAGIAN VII */}
          <tr>
            <td className="w-[30px] border-r border-black px-1.5 py-1 align-top">VII.</td>
            <td colSpan={2} className="px-2 py-1 align-top">
              <div>PERHATIAN:</div>
              <p className="leading-[1.32] text-left">
                Pengguna Anggaran/Kuasa Pengguna Anggaran/Pejabat Pembuat Komitmen yang menerbitkan Surat Perjalanan Dinas (SPD), pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila negara menderita rugi akibat kesalahan, kelalaian, dan kealpaannya.
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
