import React, { useState } from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { generateDocxBlob, downloadBlob } from '../utils/docxGenerator';
import { generatePdfBlob } from '../utils/pdfGenerator';
import { generateDocumentZipBlob, generateArchiveZipBlob } from '../utils/zipGenerator';
import { expandDocumentPerPegawai, formatTanggalIndo } from '../utils/documentLogic';
import {
  Archive,
  Search,
  Eye,
  Edit3,
  Trash2,
  Copy,
  Printer,
  FileDown,
  MapPin,
  CheckCircle,
  FileText,
  AlertTriangle,
  X,
  Loader2,
  DownloadCloud,
  FolderArchive,
} from 'lucide-react';

interface ArchiveListProps {
  documents: DocumentPackage[];
  school: SchoolIdentity;
  onPreview: (doc: DocumentPackage) => void;
  onEdit: (doc: DocumentPackage) => void;
  onDuplicate: (doc: DocumentPackage) => void;
  onDelete: (id: string) => void;
  onCreateNew: () => void;
  onPrint?: (doc: DocumentPackage) => void;
}

export const ArchiveList: React.FC<ArchiveListProps> = ({
  documents,
  school,
  onPreview,
  onEdit,
  onDuplicate,
  onDelete,
  onCreateNew,
  onPrint,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');

  // Modal States
  const [docToDelete, setDocToDelete] = useState<DocumentPackage | null>(null);
  const [docToDownload, setDocToDownload] = useState<DocumentPackage | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isZippingArchive, setIsZippingArchive] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Available years in documents
  const availableYears = Array.from(
    new Set(documents.map((d) => d.tahun || new Date(d.tanggalSurat).getFullYear()))
  ).sort((a, b) => b - a);

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    const docYear = doc.tahun || new Date(doc.tanggalSurat).getFullYear();
    const matchesYear = selectedYear === 'ALL' || docYear.toString() === selectedYear;

    const matchesSearch =
      doc.nomorSuratTugas.toLowerCase().includes(q) ||
      doc.nomorSPPD.toLowerCase().includes(q) ||
      doc.acara.toLowerCase().includes(q) ||
      doc.tempatTujuan.toLowerCase().includes(q) ||
      doc.daftarPegawai.some((p) => p.nama.toLowerCase().includes(q)) ||
      (doc.pegawaiUtama?.nama || '').toLowerCase().includes(q);

    return matchesYear && matchesSearch;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Perform Download DOCX
  const handleExecuteDownload = async (doc: DocumentPackage, pageOption?: 1 | 2 | 3) => {
    try {
      setDownloadingId(doc.id);
      const blob = await generateDocxBlob(doc, school, pageOption);
      const suffix =
        pageOption === 1
          ? '_Surat_Tugas'
          : pageOption === 2
          ? '_SPPD'
          : pageOption === 3
          ? '_Lampiran_SPPD'
          : '_Paket_Lengkap_3Hal';
      const cleanNomor = doc.nomorSuratTugas.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `SDN1_Pujiharjo_${cleanNomor}${suffix}.docx`;

      downloadBlob(blob, filename);
      showToast(`Berhasil mengunduh ${filename}`);
      setDocToDownload(null);
    } catch (e) {
      console.error('Download error:', e);
      showToast('Gagal memproses unduhan dokumen DOCX.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Perform Download PDF
  const handleExecuteDownloadPdf = async (doc: DocumentPackage) => {
    try {
      setDownloadingId(doc.id);
      const blob = await generatePdfBlob(doc, school);
      const cleanNomor = doc.nomorSuratTugas.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `SDN1_Pujiharjo_${cleanNomor}_Lengkap.pdf`;
      downloadBlob(blob, filename);
      showToast(`Berhasil mengunduh PDF ${filename}`);
      setDocToDownload(null);
    } catch (e) {
      console.error('PDF error:', e);
      showToast('Gagal membuat file PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Perform Download ZIP for 1 document package
  const handleExecuteDownloadZip = async (doc: DocumentPackage) => {
    try {
      setDownloadingId(doc.id);
      const blob = await generateDocumentZipBlob(doc, school, { includePdf: true });
      const cleanNomor = doc.nomorSuratTugas.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `SDN1_Pujiharjo_${cleanNomor}_Arsip_Lengkap.zip`;
      downloadBlob(blob, filename);
      showToast(`Berhasil mengunduh arsip ZIP ${filename}`);
      setDocToDownload(null);
    } catch (e) {
      console.error('ZIP error:', e);
      showToast('Gagal mengemas file ZIP.');
    } finally {
      setDownloadingId(null);
    }
  };

  // Download ALL filtered/archived documents as a single ZIP
  const handleDownloadAllArchiveZip = async () => {
    if (filteredDocs.length === 0) return;
    try {
      setIsZippingArchive(true);
      const blob = await generateArchiveZipBlob(filteredDocs, school);
      const filename = `Arsip_Surat_SDN1_Pujiharjo_${new Date().toISOString().slice(0, 10)}.zip`;
      downloadBlob(blob, filename);
      showToast(`Berhasil mengunduh ${filteredDocs.length} paket surat dalam format ZIP.`);
    } catch (e) {
      console.error('Archive ZIP error:', e);
      showToast('Gagal mengemas seluruh arsip ZIP.');
    } finally {
      setIsZippingArchive(false);
    }
  };

  // Confirm and Execute Delete
  const handleConfirmDelete = () => {
    if (!docToDelete) return;
    const docNomor = docToDelete.nomorSuratTugas;
    onDelete(docToDelete.id);
    setDocToDelete(null);
    showToast(`Dokumen ${docNomor} berhasil dihapus dari arsip.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs md:text-sm animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Archive className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Arsip Surat Tugas & SPPD
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Riwayat lengkap surat tugas dan surat perintah perjalanan dinas. Dokumen dapat ditinjau, diedit, diunduh dalam format Word (.docx), atau dihapus.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filteredDocs.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAllArchiveZip}
              disabled={isZippingArchive}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
              title="Unduh semua dokumen pada daftar arsip dalam satu file ZIP"
            >
              {isZippingArchive ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FolderArchive className="w-4 h-4" />
              )}
              <span>{isZippingArchive ? 'Mengemas ZIP...' : `Unduh Semua Arsip (${filteredDocs.length}) ZIP`}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onCreateNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
          >
            + Buat Surat Baru
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama guru, nomor surat, kegiatan, atau tujuan..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Tahun:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Tahun</option>
            {availableYears.map((yr) => (
              <option key={yr} value={yr.toString()}>
                {yr}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Archive Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Archive className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-700">Tidak ada dokumen yang sesuai kriteria pencarian.</p>
            <p className="text-xs text-slate-400 mt-1">Coba ubah kata kunci pencarian atau buat surat tugas baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-3 py-3 text-center w-10">No</th>
                  <th className="px-3 py-3">Nomor Dokumen</th>
                  <th className="px-3 py-3">Pegawai Ditugaskan</th>
                  <th className="px-3 py-3">Kegiatan & Tujuan</th>
                  <th className="px-3 py-3">Pelaksanaan</th>
                  <th className="px-3 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((doc, idx) => {
                  const expanded = expandDocumentPerPegawai(doc);
                  const firstNomor = expanded[0]?.nomorSuratTugas || doc.nomorSuratTugas;
                  const lastUrut = expanded[expanded.length - 1]?.nomorUrutSuratTugas;
                  return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-3 py-3 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3 max-w-[205px]">
                      <div className="font-semibold text-slate-900 font-mono text-[11px] break-all">
                        {firstNomor}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {expanded.length > 1
                          ? `${expanded.length} Pegawai • Urut s.d. ${lastUrut} (${expanded.length * 3} Hal)`
                          : `ST = SPPD = Lampiran`}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[190px]">
                      <div className="font-semibold text-slate-900 text-xs leading-snug line-clamp-2" title={doc.daftarPegawai.map((p) => p.nama).join(', ')}>
                        {doc.daftarPegawai.map((p) => p.nama).join(', ')}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {expanded.length > 1
                          ? `${expanded.length} Paket Dokumen`
                          : `Utama: ${doc.pegawaiUtama?.nama || '-'}`}
                      </div>
                    </td>
                    <td className="px-3 py-3 max-w-[190px]">
                      <div className="font-medium text-slate-800 text-xs truncate" title={doc.acara}>
                        {doc.acara}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.tempatTujuan}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-slate-800 font-medium text-xs">
                        {formatTanggalIndo(doc.tanggalSurat, { numericDash: true })}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {doc.lamaPerjalanan || '1 hari'}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        {/* Preview A4 Button */}
                        <button
                          type="button"
                          onClick={() => onPreview(doc)}
                          className="px-2 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Preview Dokumen A4"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        {/* Download ZIP Button */}
                        <button
                          type="button"
                          onClick={() => handleExecuteDownloadZip(doc)}
                          disabled={downloadingId === doc.id}
                          className="px-2 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          title="Unduh Arsip Otomatis Format .ZIP (DOCX + PDF)"
                        >
                          {downloadingId === doc.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <FolderArchive className="w-3.5 h-3.5" />
                          )}
                          <span>ZIP</span>
                        </button>

                        {/* More Download / Print Options */}
                        <button
                          type="button"
                          onClick={() => setDocToDownload(doc)}
                          className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Opsi Unduh DOCX, PDF, ZIP & Cetak"
                        >
                          <DownloadCloud className="w-4 h-4" />
                        </button>

                        {/* Quick Print Button */}
                        {onPrint && (
                          <button
                            type="button"
                            onClick={() => onPrint(doc)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Cetak Dokumen"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => onEdit(doc)}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Edit Dokumen"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Duplicate Button */}
                        <button
                          type="button"
                          onClick={() => onDuplicate(doc)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                          title="Duplikasi Dokumen"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        {/* Delete Button (Opens In-App Confirmation Modal) */}
                        <button
                          type="button"
                          onClick={() => setDocToDelete(doc)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Hapus Dokumen Dari Arsip"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: DELETE CONFIRMATION (IN-APP DIALOG) */}
      {docToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setDocToDelete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Hapus Dokumen Arsip?
                </h3>
                <p className="text-xs text-slate-500">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 mb-5">
              <div className="flex">
                <span className="w-28 text-slate-500 shrink-0">No. Surat Tugas:</span>
                <span className="font-mono font-semibold text-slate-900">{docToDelete.nomorSuratTugas}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 shrink-0">No. SPPD:</span>
                <span className="font-mono text-slate-800">{docToDelete.nomorSPPD}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 shrink-0">Pegawai:</span>
                <span className="font-medium text-slate-800">{docToDelete.daftarPegawai.map(p => p.nama).join(', ')}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-500 shrink-0">Acara:</span>
                <span className="text-slate-700 truncate">{docToDelete.acara}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDocToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: DOWNLOAD & PRINT OPTIONS */}
      {docToDownload && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setDocToDownload(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              aria-label="Tutup dialog unduh"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileDown className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Unduh Dokumen Surat & SPPD
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {docToDownload.nomorSuratTugas}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Pilih format unduhan file yang Anda butuhkan. Dokumen Word (.docx) dapat diedit kembali dengan Microsoft Office.
            </p>

            <div className="space-y-2.5 mb-6 text-xs md:text-sm">
              {/* Option 0: Automatic ZIP Bundle */}
              <button
                type="button"
                onClick={() => handleExecuteDownloadZip(docToDownload)}
                disabled={downloadingId === docToDownload.id}
                className="w-full p-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 rounded-xl border border-indigo-200 text-left flex items-center justify-between group transition cursor-pointer"
              >
                <div>
                  <span className="font-bold block">1. Unduh Otomatis Format ZIP (Semua Dokumen)</span>
                  <span className="text-slate-600 text-xs">
                    Berisi DOCX Lengkap, DOCX Per Halaman & File PDF A4 untuk seluruh pegawai
                  </span>
                </div>
                {downloadingId === docToDownload.id ? (
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                ) : (
                  <FolderArchive className="w-5 h-5 text-indigo-600" />
                )}
              </button>

              {/* Option 1: Direct PDF A4 Download */}
              <button
                type="button"
                onClick={() => handleExecuteDownloadPdf(docToDownload)}
                disabled={downloadingId === docToDownload.id}
                className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 rounded-xl border border-emerald-200 text-left flex items-center justify-between transition cursor-pointer"
              >
                <div>
                  <span className="font-bold block">2. Unduh File PDF A4 Siap Cetak</span>
                  <span className="text-emerald-700 text-xs">
                    Langsung terunduh dalam format .pdf ukuran A4
                  </span>
                </div>
                {downloadingId === docToDownload.id ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5 text-emerald-600" />
                )}
              </button>

              {/* Option 2: Full 3 Pages DOCX */}
              <button
                type="button"
                onClick={() => handleExecuteDownload(docToDownload)}
                disabled={downloadingId === docToDownload.id}
                className="w-full p-3.5 bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-xl border border-blue-200 text-left flex items-center justify-between group transition cursor-pointer"
              >
                <div>
                  <span className="font-bold block">3. Unduh DOCX Word Lengkap</span>
                  <span className="text-slate-500 text-xs">
                    Halaman 1 (Surat Tugas) + Halaman 2 (SPPD) + Halaman 3 (Lampiran II)
                  </span>
                </div>
                {downloadingId === docToDownload.id ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <FileDown className="w-5 h-5 text-blue-600 group-hover:translate-y-0.5 transition" />
                )}
              </button>

              {/* Option 3: Page 1, 2, 3 Individual */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleExecuteDownload(docToDownload, 1)}
                  disabled={downloadingId === docToDownload.id}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-center transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <span className="font-semibold block text-xs">DOCX Hal 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteDownload(docToDownload, 2)}
                  disabled={downloadingId === docToDownload.id}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-center transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <span className="font-semibold block text-xs">DOCX Hal 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExecuteDownload(docToDownload, 3)}
                  disabled={downloadingId === docToDownload.id}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 text-center transition cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                  <span className="font-semibold block text-xs">DOCX Hal 3</span>
                </button>
              </div>

              {/* Option 4: Cetak Printer */}
              {onPrint && (
                <button
                  type="button"
                  onClick={() => {
                    setDocToDownload(null);
                    onPrint(docToDownload);
                  }}
                  className="w-full p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl border border-slate-300 text-left flex items-center justify-between transition cursor-pointer"
                >
                  <div>
                    <span className="font-semibold block">4. Cetak Langsung ke Printer</span>
                    <span className="text-slate-600 text-xs">Buka dialog cetak browser dengan layout A4</span>
                  </div>
                  <Printer className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setDocToDownload(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
