import React from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { KopSuratView } from './KopSuratView';
import { SignatureStampBlock } from './SignatureStampBlock';
import {
  formatTanggalIndo,
  formatPangkatJabatanSPPD,
  getSyncedAcaraMaksud,
  getTanggalTandaTangan,
} from '../utils/documentLogic';

interface SPPDPageProps {
  data: DocumentPackage;
  school: SchoolIdentity;
}

export const SPPDPage: React.FC<SPPDPageProps> = ({
  data,
  school,
}) => {
  const tglIndo = formatTanggalIndo(data.tanggalSurat);
  const displayTanggalTtd = getTanggalTandaTangan(data);
  const syncedMaksud = getSyncedAcaraMaksud(data);

  const primaryPeg = data.pegawaiUtama || data.daftarPegawai[0] || {
    nama: school.kepalaSekolah.nama,
    nip: school.kepalaSekolah.nip,
    pangkatGol: school.kepalaSekolah.pangkatGolongan,
    jabatan: school.kepalaSekolah.jabatan,
    unitKerja: school.kepalaSekolah.unitKerja,
  };

  const displayPangkatJabatan = formatPangkatJabatanSPPD(primaryPeg);

  return (
    <div className="a4-sheet bg-white text-black font-['Arial',sans-serif] text-[10.5pt] leading-normal p-[14mm_18mm_14mm_20mm] mx-auto shadow-md print:shadow-none print:p-0 relative box-border">
      {/* KOP SURAT */}
      <KopSuratView school={school} />

      {/* NOMOR & LEMBAR KE */}
      <div className="text-[10pt] mb-1.5 leading-tight">
        <div className="flex">
          <span className="w-24">Nomor</span>
          <span className="w-4">:</span>
          <span>{data.nomorSPPD}</span>
        </div>
        <div className="flex">
          <span className="w-24">Lembar ke</span>
          <span className="w-4">:</span>
          <span>{data.lembarKe || 'I'}</span>
        </div>
      </div>

      {/* JUDUL */}
      <div className="text-center my-2">
        <h2 className="text-[12pt] font-bold tracking-wider uppercase m-0">
          SURAT PERINTAH PERJALANAN DINAS (SPPD)
        </h2>
      </div>

      {/* TABEL 10 POIN */}
      <table className="w-full border-collapse border border-black text-[10pt] mb-2">
        <tbody>
          {/* 1 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center w-8">1.</td>
            <td className="border-r border-black p-1.5 align-top w-[42%]">
              Pejabat yang memberikan perintah melaksanakan Perjalanan Dinas
            </td>
            <td className="p-1.5 align-top">
              <div className="flex">
                <span className="w-4">:</span>
                <span className="font-semibold">{data.pejabatPemberiTugas.jabatan} {data.pejabatPemberiTugas.unitKerja}</span>
              </div>
            </td>
          </tr>

          {/* 2 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">2.</td>
            <td className="border-r border-black p-1.5 align-top">
              Nama Pegawai/ Pejabat yang Melaksanakan Perjalanan Dinas
            </td>
            <td className="p-1.5 align-top">
              <div className="flex">
                <span className="w-4">:</span>
                <span className="font-bold">{primaryPeg.nama}</span>
              </div>
            </td>
          </tr>

          {/* 3 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">3.</td>
            <td className="border-r border-black p-1.5 align-top">
              Jabatan Pangkat dan Golongan Ruang, NIP dari Pegawai/ Pejabat yang Melaksanakan Perjalanan Dinas
            </td>
            <td className="p-1.5 align-top">
              <div className="flex items-start">
                <span className="w-4">:</span>
                <div>
                  <p>{displayPangkatJabatan}</p>
                  <p>NIP. {primaryPeg.nip || '-'}</p>
                </div>
              </div>
            </td>
          </tr>

          {/* 4 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">4.</td>
            <td className="border-r border-black p-1.5 align-top">
              Perjalanan Dinas Pegawai/ Pejabat yang Melaksanakan Perjalanan Dinas
            </td>
            <td className="p-1.5 align-top">
              <div className="flex items-start">
                <span className="w-4">:</span>
                <div className="space-y-0.5">
                  <div className="flex">
                    <span className="w-12">Dari</span>
                    <span className="w-4">:</span>
                    <span>{data.tempatAsal || 'SD Negeri 1 Pujiharjo'}</span>
                  </div>
                  <div className="flex">
                    <span className="w-12">K e</span>
                    <span className="w-4">:</span>
                    <span>{data.tempatTujuan}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* 5 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">5.</td>
            <td className="border-r border-black p-1.5 align-top">
              Nama Pegawai/ Pejabat yang Mendampingi
            </td>
            <td className="p-1.5 align-top">
              <div className="flex">
                <span className="w-4">:</span>
                <span>{data.pengikut && data.pengikut.length > 0 ? data.pengikut.map(p => p.nama).join(', ') : '-'}</span>
              </div>
            </td>
          </tr>

          {/* 6 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">6.</td>
            <td className="border-r border-black p-1.5 align-top">
              Jabatan, Pangkat dan Golongan Ruang NIP dari Pegawai yang Mendampingi
            </td>
            <td className="p-1.5 align-top">
              <div className="flex">
                <span className="w-4">:</span>
                <span>{data.pengikut && data.pengikut.length > 0 ? data.pengikut.map(p => p.keterangan || '').filter(Boolean).join(', ') || '-' : '-'}</span>
              </div>
            </td>
          </tr>

          {/* 7 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">7.</td>
            <td className="border-r border-black p-1.5 align-top">
              Perjalanan Dinas Direncanakan
            </td>
            <td className="p-1.5 align-top">
              <div className="flex items-start">
                <span className="w-4">:</span>
                <div>
                  <p>{data.lamaPerjalanan || '1 (satu) hari'}</p>
                  <div className="flex mt-1">
                    <span className="w-20">Tanggal</span>
                    <span className="w-4">:</span>
                    <span className="font-semibold">{data.tanggalBerangkat || tglIndo}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* 8 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">8.</td>
            <td className="border-r border-black p-1.5 align-top">
              Maksud Mengadakan Perjalanan
            </td>
            <td className="p-1.5 align-top">
              <div className="flex items-start">
                <span className="w-4">:</span>
                <span className="text-justify leading-relaxed">{syncedMaksud}</span>
              </div>
            </td>
          </tr>

          {/* 9 */}
          <tr className="border-b border-black">
            <td className="border-r border-black p-1.5 align-top text-center">9.</td>
            <td className="border-r border-black p-1.5 align-top">
              Perhitungan Biaya Perjalanan
            </td>
            <td className="p-1.5 align-top">
              <div className="flex items-start">
                <span className="w-4">:</span>
                <div className="space-y-1 w-full">
                  <div className="flex items-start">
                    <span className="w-24 shrink-0">Atas Beban</span>
                    <span className="w-4">:</span>
                    <span className="flex-1 font-semibold">{data.bebanAnggaran || 'Anggaran BOSP-Reg SD Negeri 1 Pujiharjo'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-24 shrink-0">Kode Rekening</span>
                    <span className="w-4">:</span>
                    <span>{data.kodeRekening || '-'}</span>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          {/* 10 */}
          <tr>
            <td className="border-r border-black p-1.5 align-top text-center">10.</td>
            <td className="border-r border-black p-1.5 align-top">
              Keterangan
            </td>
            <td className="p-1.5 align-top">
              <div className="flex">
                <span className="w-4">:</span>
                <span>{data.keteranganLain || '-'}</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* TANDA TANGAN */}
      <div className="flex justify-end text-[10.5pt] mt-2">
        <SignatureStampBlock
          data={data}
          school={school}
          variant="standard"
          dateLine={`${data.tempatSurat}, ${displayTanggalTtd}`}
        />
      </div>
    </div>
  );
};
