import React, { useState } from 'react';
import { DocumentPackage, PTKEmployee, SchoolIdentity } from '../types';
import { expandDocumentPerPegawai, formatTanggalIndo } from '../utils/documentLogic';
import { generateDocxBlob, downloadBlob } from '../utils/docxGenerator';
import {
  FileText,
  FileCheck2,
  Calendar,
  Users,
  PlusCircle,
  Eye,
  Printer,
  FileDown,
  ArrowRight,
  School,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  CheckCircle,
  Loader2,
} from 'lucide-react';

interface DashboardOverviewProps {
  documents: DocumentPackage[];
  ptkList: PTKEmployee[];
  school: SchoolIdentity;
  onCreateNew: () => void;
  onViewDoc: (doc: DocumentPackage) => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  documents,
  ptkList,
  school,
  onCreateNew,
  onViewDoc,
  onNavigateTab,
}) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthDocs = documents.filter((d) => {
    const dDate = new Date(d.tanggalSurat);
    return dDate.getMonth() === currentMonth && dDate.getFullYear() === currentYear;
  });

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownloadDocx = async (doc: DocumentPackage) => {
    try {
      setDownloadingId(doc.id);
      const blob = await generateDocxBlob(doc, school);
      const cleanNomor = doc.nomorSuratTugas.replace(/[^a-zA-Z0-9]/g, '_');
      downloadBlob(blob, `SDN1_Pujiharjo_${cleanNomor}_Paket_Lengkap.docx`);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  };

  const recentDocs = [...documents].slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 md:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 text-xs font-semibold backdrop-blur-xs">
              <School className="w-3.5 h-3.5" />
              <span>Dinas Pendidikan Kab. Malang • Kec. Tirtoyudo</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              SISTEM ADMINISTRASI SURAT TUGAS & SPPD
            </h1>
            <p className="text-blue-100/90 text-sm leading-relaxed">
              Selamat datang di sistem administrasi kedinasan resmi SD Negeri 1 Pujiharjo.
              Buat, kelola, cetak, dan unduh dokumen Surat Tugas & SPPD 3 Halaman A4 sesuai format baku.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={onCreateNew}
              className="px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <PlusCircle className="w-5 h-5 text-blue-600" />
              + Buat Surat Baru
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Surat Tugas
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {documents.length}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              Terdokumentasi
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total SPPD Diterbitkan
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {documents.length}
            </p>
            <p className="text-[11px] text-blue-600 font-medium mt-1">
              Paket 3 Halaman A4
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileCheck2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Surat Bulan Ini
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {thisMonthDocs.length}
            </p>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              Tahun Anggaran {currentYear}
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Guru & Tenaga Tendik
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-1">
              {ptkList.length} PTK
            </p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Database Lampiran 3 Aktif
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Recent Documents Table & Template Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Riwayat Surat Tugas & SPPD Terbaru
              </h2>
              <p className="text-xs text-slate-500">
                Dokumen terkini yang siap dicetak atau diunduh
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('arsip')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition"
            >
              Lihat Semua Arsip
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDocs.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">
                Belum ada dokumen yang dibuat. Klik tombol "+ Buat Surat Baru" di atas.
              </div>
            ) : (
              recentDocs.map((doc) => {
                const expanded = expandDocumentPerPegawai(doc);
                return (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-slate-50 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {expanded[0]?.nomorSuratTugas || doc.nomorSuratTugas}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                        {expanded.length > 1
                          ? `${expanded.length} Pegawai • ${expanded.length * 3} Hal`
                          : `ST = SPPD = Lampiran`}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {doc.daftarPegawai.map((p) => p.nama).join(', ')}
                    </p>
                    <p className="text-xs text-slate-600 line-clamp-1">
                      {doc.acara} • <span className="text-blue-600 font-medium">{doc.tempatTujuan}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Tanggal: {formatTanggalIndo(doc.tanggalSurat)} ({doc.lamaPerjalanan})
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDownloadDocx(doc)}
                      disabled={downloadingId === doc.id}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                      title="Unduh DOCX Word Lengkap"
                    >
                      {downloadingId === doc.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <FileDown className="w-3.5 h-3.5" />
                      )}
                      <span>Unduh DOCX</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onViewDoc(doc)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview A4
                    </button>
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Standard Document Structure & Fast Shortcuts */}
        <div className="space-y-4">
          {/* Structure Overview */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              Paket Resmi 3 Halaman A4
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Sesuai dengan dokumen referensi asli SDN 1 Pujiharjo:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">
                  Halaman 1: Surat Tugas
                </span>
                <span className="text-slate-500 text-[11px]">
                  Kop surat resmi, identitas pemberi tugas, tabel pegawai bertugas, rincian waktu, tempat, acara, dan TTD Kepala Sekolah.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">
                  Halaman 2: SPPD
                </span>
                <span className="text-slate-500 text-[11px]">
                  Kop surat resmi, struktur 10 poin baku dinas, pegawai utama, pendamping, maksud perjalanan, anggaran BOSP-Reg, dan TTD.
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80">
                <span className="font-bold text-slate-900 block">
                  Halaman 3: Lampiran SPPD
                </span>
                <span className="text-slate-500 text-[11px]">
                  Nomor SPPD & Lampiran II, bagian berangkat, tabel pengesahan tiba/kembali, tanda tangan pejabat tujuan, dan catatan lain-lain.
                </span>
              </div>
            </div>
          </div>

          {/* School Contact Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-xs space-y-1.5">
            <span className="font-bold text-slate-800 block text-xs">
              Kepala Sekolah Aktif:
            </span>
            <p className="font-semibold text-slate-900">{school.kepalaSekolah.nama}</p>
            <p className="text-slate-600 font-mono text-[11px]">NIP: {school.kepalaSekolah.nip}</p>
            <p className="text-slate-500 text-[11px]">{school.kepalaSekolah.pangkatGolongan}</p>
            <button
              onClick={() => onNavigateTab('identitas')}
              className="text-blue-600 hover:underline text-[11px] font-medium pt-1 block"
            >
              Ubah Identitas Sekolah &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
