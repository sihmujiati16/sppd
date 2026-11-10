import React from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { KopSuratView } from './KopSuratView';
import { SignatureStampBlock } from './SignatureStampBlock';
import { getSyncedAcaraMaksud, getTanggalTandaTangan } from '../utils/documentLogic';

interface SuratTugasPageProps {
  data: DocumentPackage;
  school: SchoolIdentity;
  isEditable?: boolean;
  onUpdateField?: (field: keyof DocumentPackage, value: any) => void;
}

export const SuratTugasPage: React.FC<SuratTugasPageProps> = ({
  data,
  school,
}) => {
  const syncedAcara = getSyncedAcaraMaksud(data);
  const displayTanggalTtd = getTanggalTandaTangan(data);

  return (
    <div className="a4-sheet bg-white text-black font-['Arial',sans-serif] text-[11pt] leading-normal p-[20mm_18mm_20mm_20mm] mx-auto shadow-md print:shadow-none print:p-0 relative box-border">
      {/* KOP SURAT */}
      <KopSuratView school={school} />

      {/* JUDUL */}
      <div className="text-center mt-3 mb-4">
        <h2 className="text-[12pt] font-bold underline tracking-wider uppercase m-0">
          SURAT TUGAS
        </h2>
        <p className="text-[11pt] mt-0.5 font-normal">
          Nomor: {data.nomorSuratTugas}
        </p>
      </div>

      {/* YANG BERTANDA TANGAN */}
      <div className="mb-3 text-[11pt]">
        <p className="mb-1">Yang bertanda tangan di bawah ini:</p>
        <div className="pl-6 space-y-0.5">
          <div className="flex">
            <span className="w-40 shrink-0">Nama</span>
            <span className="w-4">:</span>
            <span className="font-bold">{data.pejabatPemberiTugas.nama}</span>
          </div>
          <div className="flex">
            <span className="w-40 shrink-0">NIP</span>
            <span className="w-4">:</span>
            <span>{data.pejabatPemberiTugas.nip}</span>
          </div>
          <div className="flex">
            <span className="w-40 shrink-0">Pangkat/golongan</span>
            <span className="w-4">:</span>
            <span>{data.pejabatPemberiTugas.pangkatGolongan}</span>
          </div>
          <div className="flex">
            <span className="w-40 shrink-0">Unit kerja</span>
            <span className="w-4">:</span>
            <span>{data.pejabatPemberiTugas.unitKerja}</span>
          </div>
          <div className="flex">
            <span className="w-40 shrink-0">Kecamatan</span>
            <span className="w-4">:</span>
            <span>{data.pejabatPemberiTugas.kecamatan}</span>
          </div>
        </div>
      </div>

      {/* MEMBERIKAN TUGAS KEPADA */}
      <div className="mb-3 text-[11pt]">
        <p className="mb-1.5">memberikan tugas kepada Saudara:</p>
        <table className="w-full border-collapse border border-black text-[10.5pt]">
          <thead>
            <tr className="bg-gray-50/50 print:bg-transparent font-bold">
              <th className="border border-black px-2 py-1.5 text-center w-10">No</th>
              <th className="border border-black px-2 py-1.5 text-center w-40">Nama</th>
              <th className="border border-black px-2 py-1.5 text-center w-44">NIP</th>
              <th className="border border-black px-2 py-1.5 text-center">Jabatan</th>
              <th className="border border-black px-2 py-1.5 text-center w-36">Unit Kerja</th>
            </tr>
          </thead>
          <tbody>
            {data.daftarPegawai && data.daftarPegawai.length > 0 ? (
              data.daftarPegawai.map((peg, index) => (
                <tr key={peg.id || index}>
                  <td className="border border-black px-2 py-1 text-center align-top">
                    {index + 1}
                  </td>
                  <td className="border border-black px-2 py-1 align-top font-medium">
                    {peg.nama}
                  </td>
                  <td className="border border-black px-2 py-1 align-top text-center">
                    {peg.nip || '-'}
                  </td>
                  <td className="border border-black px-2 py-1 align-top text-center">
                    {peg.jabatan}
                  </td>
                  <td className="border border-black px-2 py-1 align-top text-center">
                    {peg.unitKerja}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="border border-black px-2 py-2 text-center text-gray-500 italic">
                  Belum ada pegawai yang dipilih
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RINCIAN TUGAS */}
      <div className="mb-4 text-[11pt]">
        <p className="mb-1">untuk melaksanakan tugas dinas keluar pada:</p>
        <div className="pl-6 space-y-0.5">
          <div className="flex">
            <span className="w-36 shrink-0">hari, tanggal</span>
            <span className="w-4">:</span>
            <span>{data.hariTanggalPelaksanaan}</span>
          </div>
          <div className="flex">
            <span className="w-36 shrink-0">jam</span>
            <span className="w-4">:</span>
            <span>{data.jamPelaksanaan}</span>
          </div>
          <div className="flex">
            <span className="w-36 shrink-0">tempat</span>
            <span className="w-4">:</span>
            <span>{data.tempatTujuan}</span>
          </div>
          <div className="flex items-start">
            <span className="w-36 shrink-0">acara</span>
            <span className="w-4">:</span>
            <span className="flex-1 text-justify">{syncedAcara}</span>
          </div>
        </div>
      </div>

      {/* KALIMAT PENUTUP */}
      <p className="text-[11pt] text-justify leading-relaxed mb-6">
        Demikian surat tugas ini kami buat untuk dilaksanakan dengan sebaik-baiknya dan penuh tanggungjawab.
      </p>

      {/* TANDA TANGAN */}
      <div className="flex justify-end text-[11pt] mt-6">
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
