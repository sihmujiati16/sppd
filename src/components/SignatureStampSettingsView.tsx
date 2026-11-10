import React, { useState } from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { SignatureStampBlock } from './SignatureStampBlock';
import { normalizeSquarePngDataUrl } from '../utils/imageUtils';
import {
  PenTool,
  Stamp,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  ShieldCheck,
} from 'lucide-react';

interface SignatureStampSettingsViewProps {
  school: SchoolIdentity;
  onSaveSchool: (newSchool: SchoolIdentity) => void;
}

/**
 * Mengonversi file gambar apa pun (PNG/JPG/WebP/SVG) menjadi PNG Data URL persegi (1:1)
 * agar ringan di localStorage & kompatibel tepat 4 cm x 4 cm di HTML/PDF/DOCX.
 */
async function convertFileToPngDataUrl(file: File): Promise<string> {
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.readAsDataURL(file);
  });

  // Validasi format gambar terlebih dahulu
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Format gambar tidak valid atau rusak.'));
    img.src = rawDataUrl;
  });

  return await normalizeSquarePngDataUrl(rawDataUrl, 400);
}

export const SignatureStampSettingsView: React.FC<SignatureStampSettingsViewProps> = ({
  school,
  onSaveSchool,
}) => {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showStatus = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
  };

  const handleUploadTtd = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showStatus('error', 'Harap pilih file gambar (PNG, JPG, WebP, atau SVG).');
      return;
    }
    try {
      const pngDataUrl = await convertFileToPngDataUrl(file);
      onSaveSchool({
        ...school,
        ttdImage: pngDataUrl,
        tempelTtd: true,
      });
      showStatus('success', 'Gambar Tanda Tangan Kepala Sekolah berhasil diunggah dan diaktifkan.');
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : 'Gagal memproses gambar tanda tangan.');
    } finally {
      e.target.value = '';
    }
  };

  const handleUploadStempel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showStatus('error', 'Harap pilih file gambar (PNG, JPG, WebP, atau SVG).');
      return;
    }
    try {
      const pngDataUrl = await convertFileToPngDataUrl(file);
      onSaveSchool({
        ...school,
        stempelImage: pngDataUrl,
        tempelStempel: true,
      });
      showStatus('success', 'Gambar Stempel Sekolah berhasil diunggah dan diaktifkan.');
    } catch (err) {
      showStatus('error', err instanceof Error ? err.message : 'Gagal memproses gambar stempel.');
    } finally {
      e.target.value = '';
    }
  };

  const handleToggleTtd = (value: boolean) => {
    onSaveSchool({
      ...school,
      tempelTtd: value,
    });
    showStatus(
      'success',
      value
        ? 'Tanda Tangan Kepala Sekolah akan ditempel otomatis pada dokumen.'
        : 'Tanda Tangan Kepala Sekolah dinonaktifkan (kosong untuk TTD basah).'
    );
  };

  const handleToggleStempel = (value: boolean) => {
    onSaveSchool({
      ...school,
      tempelStempel: value,
    });
    showStatus(
      'success',
      value
        ? 'Stempel Sekolah akan ditempel otomatis pada dokumen.'
        : 'Stempel Sekolah dinonaktifkan (kosong untuk cap basah).'
    );
  };

  const handleRemoveTtd = () => {
    onSaveSchool({
      ...school,
      ttdImage: '',
      tempelTtd: false,
    });
    showStatus('success', 'Gambar Tanda Tangan Kepala Sekolah telah dihapus.');
  };

  const handleRemoveStempel = () => {
    onSaveSchool({
      ...school,
      stempelImage: '',
      tempelStempel: false,
    });
    showStatus('success', 'Gambar Stempel Sekolah telah dihapus.');
  };

  const previewDoc: DocumentPackage = {
    id: 'preview-ttd',
    createdAt: '',
    updatedAt: '',
    tahun: 2026,
    nomorSuratTugas: '400.3.10.8/ 170 /35.07.301.30.28/2026',
    nomorUrutSuratTugas: 170,
    nomorSPPD: '400.3.10.8/ 170 /35.07.301.30.28/2026',
    nomorUrutSPPD: 170,
    lembarKe: 'I',
    lampiranSppdNomor: '400.3.10.8/ 170 /35.07.301.30.28/2026',
    lampiranKe: 'II',
    tanggalSurat: '2026-11-05',
    tempatSurat: school.kabupaten || 'Kab. Malang',
    tanggalTandaTangan: '05-11-2026',
    pejabatPemberiTugas: school.kepalaSekolah,
    daftarPegawai: [],
    hariTanggalPelaksanaan: 'Kamis, 5 November 2026',
    jamPelaksanaan: '08.00 s.d. Selesai',
    tempatTujuan: 'SMP Negeri 1 Tirtoyudo',
    acara: 'Contoh Kegiatan',
    pegawaiUtama: {
      id: 'preview-ks',
      nama: school.kepalaSekolah.nama,
      nip: school.kepalaSekolah.nip,
      pangkatGol: school.kepalaSekolah.pangkatGolongan,
      jabatan: school.kepalaSekolah.jabatan,
      unitKerja: school.namaSekolah,
    },
    pengikut: [],
    tempatAsal: school.namaSekolah,
    lamaPerjalanan: '1 (satu) hari',
    tanggalBerangkat: '5 November 2026',
    tanggalKembali: '5 November 2026',
    maksudPerjalanan: 'Contoh Kegiatan',
    bebanAnggaran: 'Anggaran BOSP-Reg SD Negeri 1 Pujiharjo',
    kodeRekening: '',
    keteranganLain: '-',
    halaman3: {
      pejabatTujuanJabatan: '',
      pejabatTujuanNama: '',
      pejabatTujuanNip: '',
      catatanLain: '',
      transitAktif: false,
      transitTibaDi: '',
      transitTanggalTiba: '',
      transitPejabatTiba: '',
      transitNipTiba: '',
      transitBerangkatDari: '',
      transitKe: '',
      transitTanggalBerangkat: '',
      transitPejabatBerangkat: '',
      transitNipBerangkat: '',
      pemeriksaNama: school.kepalaSekolah.nama,
      pemeriksaNip: school.kepalaSekolah.nip,
    },
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Stamp className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Tanda Tangan Kepala Sekolah & Stempel Sekolah
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Unggah gambar Tanda Tangan Kepala Sekolah dan Stempel Sekolah (disarankan PNG latar transparan), lalu pilih apakah ingin ditempel otomatis pada Surat Tugas, SPPD, Lampiran II, PDF, dan DOCX.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
          <ShieldCheck className="w-4 h-4" />
          Tersimpan Otomatis di Browser
        </div>
      </div>

      {/* Status Notification */}
      {statusMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs md:text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Two Column Upload & Toggle Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: TANDA TANGAN KEPALA SEKOLAH */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <PenTool className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Tanda Tangan Kepala Sekolah
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {school.kepalaSekolah.nama}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  school.tempelTtd && school.ttdImage
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {school.tempelTtd && school.ttdImage ? 'Aktif Ditempel' : 'Tidak Ditempel'}
              </span>
            </div>

            {/* Preview Box TTD */}
            <div className="h-36 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
              {school.ttdImage ? (
                <img
                  src={school.ttdImage}
                  alt="Preview Tanda Tangan Kepala Sekolah"
                  className="max-h-28 max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs space-y-1">
                  <PenTool className="w-7 h-7 mx-auto text-slate-300" />
                  <p className="font-medium">Belum ada file tanda tangan diunggah</p>
                  <p className="text-[11px]">Format PNG transparan / JPG</p>
                </div>
              )}
            </div>

            {/* Upload & Delete Buttons */}
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs">
                <Upload className="w-4 h-4" />
                <span>{school.ttdImage ? 'Ganti Gambar TTD' : 'Upload Tanda Tangan'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadTtd}
                  className="hidden"
                  aria-label="Upload Tanda Tangan Kepala Sekolah"
                />
              </label>

              {school.ttdImage && (
                <button
                  type="button"
                  onClick={handleRemoveTtd}
                  className="px-3 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  aria-label="Hapus Tanda Tangan"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Pilihan Tempel TTD atau Tidak */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-2">
              Pilihan Penempelan Tanda Tangan di Dokumen:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleTtd(true)}
                disabled={!school.ttdImage}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  school.tempelTtd && school.ttdImage
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Tempel Tanda Tangan
              </button>
              <button
                type="button"
                onClick={() => handleToggleTtd(false)}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  !school.tempelTtd
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Tidak Ditempel (Basah)
              </button>
            </div>
            {!school.ttdImage && (
              <p className="text-[11px] text-amber-700 mt-2">
                Unggah gambar tanda tangan terlebih dahulu untuk mengaktifkan opsi penempelan.
              </p>
            )}
          </div>
        </section>

        {/* CARD 2: STEMPEL SEKOLAH */}
        <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Stamp className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Stempel Resmi Sekolah
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {school.namaSekolah}
                  </p>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                  school.tempelStempel && school.stempelImage
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {school.tempelStempel && school.stempelImage ? 'Aktif Ditempel' : 'Tidak Ditempel'}
              </span>
            </div>

            {/* Preview Box Stempel */}
            <div className="h-36 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center p-4 overflow-hidden">
              {school.stempelImage ? (
                <img
                  src={school.stempelImage}
                  alt="Preview Stempel Sekolah"
                  className="max-h-28 max-w-full object-contain"
                />
              ) : (
                <div className="text-center text-slate-400 text-xs space-y-1">
                  <Stamp className="w-7 h-7 mx-auto text-slate-300" />
                  <p className="font-medium">Belum ada file stempel diunggah</p>
                  <p className="text-[11px]">Format PNG transparan sangat disarankan</p>
                </div>
              )}
            </div>

            {/* Upload & Delete Buttons */}
            <div className="flex items-center gap-2">
              <label className="flex-1 cursor-pointer px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition shadow-xs">
                <Upload className="w-4 h-4" />
                <span>{school.stempelImage ? 'Ganti Gambar Stempel' : 'Upload Stempel Sekolah'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadStempel}
                  className="hidden"
                  aria-label="Upload Stempel Sekolah"
                />
              </label>

              {school.stempelImage && (
                <button
                  type="button"
                  onClick={handleRemoveStempel}
                  className="px-3 py-2.5 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                  aria-label="Hapus Stempel"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              )}
            </div>
          </div>

          {/* Pilihan Tempel Stempel atau Tidak */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-2">
              Pilihan Penempelan Stempel Sekolah di Dokumen:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleStempel(true)}
                disabled={!school.stempelImage}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  school.tempelStempel && school.stempelImage
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Tempel Stempel
              </button>
              <button
                type="button"
                onClick={() => handleToggleStempel(false)}
                className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition flex items-center justify-center gap-1.5 ${
                  !school.tempelStempel
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                Tidak Ditempel (Basah)
              </button>
            </div>
            {!school.stempelImage && (
              <p className="text-[11px] text-amber-700 mt-2">
                Unggah gambar stempel terlebih dahulu untuk mengaktifkan opsi penempelan.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Live Output Preview on Document Signature Area */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Simulasi Tampilan Pada Dokumen Surat Tugas & SPPD
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">
            Ukuran output dokumen: <strong>4 cm × 4 cm</strong> pada Hal 1, Hal 2, dan Hal 3 (Bagian I &amp; IV)
          </span>
        </div>

        <div className="bg-slate-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-around gap-8 border border-slate-200">
          {/* Format Surat Tugas & SPPD */}
          <div className="bg-white p-6 rounded-lg shadow-xs border border-slate-200 font-['Arial',sans-serif] text-[11pt] text-black">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-3">
              Format Hal 1 & Hal 2 (Surat Tugas / SPPD)
            </p>
            <SignatureStampBlock
              data={previewDoc}
              school={school}
              variant="standard"
              dateLine={`${school.kabupaten || 'Kab. Malang'}, 05-11-2026`}
            />
          </div>

          {/* Format Lampiran II */}
          <div className="bg-white p-6 rounded-lg shadow-xs border border-slate-200 font-['Arial',sans-serif] text-[10pt] text-black">
            <p className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
              Format Hal 3 (Lampiran II SPPD)
            </p>
            <SignatureStampBlock
              data={previewDoc}
              school={school}
              variant="lampiran"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
