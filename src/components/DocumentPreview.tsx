import React, { useState } from 'react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { SuratTugasPage } from './SuratTugasPage';
import { SPPDPage } from './SPPDPage';
import { LampiranSPPDPage } from './LampiranSPPDPage';
import { generateDocxBlob, downloadBlob } from '../utils/docxGenerator';
import { generatePdfBlob } from '../utils/pdfGenerator';
import { generateDocumentZipBlob } from '../utils/zipGenerator';
import { expandDocumentPerPegawai } from '../utils/documentLogic';
import {
  Printer,
  FileDown,
  Edit,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  X,
  FileText,
  FileCheck2,
  Layers,
  FolderArchive,
  Loader2,
  PenTool,
  Stamp,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface DocumentPreviewProps {
  document: DocumentPackage;
  school: SchoolIdentity;
  onEdit?: () => void;
  onClose?: () => void;
  onUpdateDocOptions?: (docId: string, patch: Partial<DocumentPackage>) => void;
  onPrint?: (doc: DocumentPackage, singlePage?: 1 | 2 | 3) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document: doc,
  school,
  onEdit,
  onClose,
  onUpdateDocOptions,
  onPrint,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'p1' | 'p2' | 'p3'>('all');
  const [zoom, setZoom] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'docx' | 'pdf' | 'zip'>('idle');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [localTempelTtd, setLocalTempelTtd] = useState<boolean>(
    doc.tempelTtd !== undefined ? doc.tempelTtd : Boolean(school.tempelTtd)
  );
  const [localTempelStempel, setLocalTempelStempel] = useState<boolean>(
    doc.tempelStempel !== undefined ? doc.tempelStempel : Boolean(school.tempelStempel)
  );

  const effectiveDoc: DocumentPackage = {
    ...doc,
    tempelTtd: localTempelTtd,
    tempelStempel: localTempelStempel,
  };

  const expandedDocs = expandDocumentPerPegawai(effectiveDoc);
  const totalPagesPerPeg = activeTab === 'all' ? 3 : 1;
  const totalPages = expandedDocs.length * totalPagesPerPeg;

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggleTtd = () => {
    const next = !localTempelTtd;
    setLocalTempelTtd(next);
    if (onUpdateDocOptions) {
      onUpdateDocOptions(doc.id, { tempelTtd: next });
    }
  };

  const handleToggleStempel = () => {
    const next = !localTempelStempel;
    setLocalTempelStempel(next);
    if (onUpdateDocOptions) {
      onUpdateDocOptions(doc.id, { tempelStempel: next });
    }
  };

  const singlePageFilter: 1 | 2 | 3 | undefined =
    activeTab === 'all' ? undefined : activeTab === 'p1' ? 1 : activeTab === 'p2' ? 2 : 3;

  const cleanNomor = (effectiveDoc.nomorSuratTugas || 'Dokumen').replace(/[^a-zA-Z0-9]+/g, '_');

  const handleDownloadPdf = async () => {
    try {
      setExportStatus('pdf');
      const blob = await generatePdfBlob(effectiveDoc, school, singlePageFilter);
      const suffix =
        singlePageFilter === 1
          ? '_Surat_Tugas'
          : singlePageFilter === 2
          ? '_SPPD'
          : singlePageFilter === 3
          ? '_Lampiran_SPPD'
          : '_Lengkap';
      const filename = `SDN1_Pujiharjo_${cleanNomor}${suffix}.pdf`;
      downloadBlob(blob, filename);
      showToast('success', `PDF berhasil dibuat & diunduh (${totalPages} halaman A4).`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      showToast('error', 'Gagal membuat file PDF. Silakan coba lagi.');
    } finally {
      setExportStatus('idle');
    }
  };

  const handleBrowserPrint = () => {
    if (onPrint) {
      onPrint(effectiveDoc, singlePageFilter);
      return;
    }
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
      showToast('error', 'Dialog print browser diblokir. Gunakan tombol Cetak / PDF.');
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setExportStatus('docx');
      const blob = await generateDocxBlob(effectiveDoc, school, singlePageFilter);
      const suffix =
        singlePageFilter === 1
          ? '-Surat-Tugas'
          : singlePageFilter === 2
          ? '-SPPD'
          : singlePageFilter === 3
          ? '-Lampiran-SPPD'
          : '-Paket-Lengkap';
      const filename = `SDN1_Pujiharjo_${cleanNomor}${suffix}.docx`;
      downloadBlob(blob, filename);
      showToast('success', `Berhasil mengunduh ${filename}`);
    } catch (err) {
      console.error('Failed to generate DOCX:', err);
      showToast('error', 'Gagal membuat file DOCX Word.');
    } finally {
      setExportStatus('idle');
    }
  };

  const handleDownloadZip = async () => {
    try {
      setExportStatus('zip');
      const zipBlob = await generateDocumentZipBlob(effectiveDoc, school, { includePdf: true });
      const filename = `SDN1_Pujiharjo_${cleanNomor}_Arsip_Lengkap.zip`;
      downloadBlob(zipBlob, filename);
      showToast(
        'success',
        `Paket ZIP (${expandedDocs.length} pegawai: DOCX + PDF) berhasil diunduh.`
      );
    } catch (err) {
      console.error('Failed to generate ZIP:', err);
      showToast('error', 'Gagal mengemas file ZIP.');
    } finally {
      setExportStatus('idle');
    }
  };

  const handleCopySummary = async () => {
    const lines = expandedDocs.map(
      (item, i) =>
        `${i + 1}. ${item.pegawaiUtama.nama} (${item.pegawaiUtama.jabatan}) — No: ${item.nomorSuratTugas}`
    );
    const text = `*SURAT TUGAS & SPPD SD NEGERI 1 PUJIHARJO*
Jumlah Pegawai: ${expandedDocs.length} (${expandedDocs.length * 3} Halaman)
${lines.join('\n')}
Acara: ${effectiveDoc.acara}
Tempat: ${effectiveDoc.tempatTujuan}
Waktu: ${effectiveDoc.hariTanggalPelaksanaan}, ${effectiveDoc.jamPelaksanaan}
Kepala Sekolah: ${school.kepalaSekolah.nama}`;

    let ok = false;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }

    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }

    if (ok) {
      setCopied(true);
      showToast('success', 'Ringkasan surat berhasil disalin ke papan klip.');
      setTimeout(() => setCopied(false), 2000);
    } else {
      showToast('error', 'Gagal menyalin teks ke papan klip.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`no-print fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs md:text-sm ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-emerald-500/40'
              : 'bg-red-950 text-red-100 border-red-500/40'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white cursor-pointer"
            aria-label="Tutup notifikasi"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOOLBAR (no-print) */}
      <div className="no-print bg-slate-800 border-b border-slate-700 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md relative z-30 shrink-0">
        {/* Left: Title & Page Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="p-1.5 bg-blue-600 rounded-md text-white">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-white leading-tight">
                Preview Dokumen A4 ({expandedDocs.length} Pegawai • {totalPages} Hal)
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                {expandedDocs.length > 1
                  ? `${expandedDocs[0].nomorSuratTugas} s.d. Urut ${expandedDocs[expandedDocs.length - 1].nomorUrutSuratTugas}`
                  : expandedDocs[0].nomorSuratTugas}
              </p>
            </div>
          </div>

          {/* Page Tabs */}
          <div className="bg-slate-900/80 p-0.5 rounded-lg border border-slate-700 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Semua ({expandedDocs.length * 3} Hal)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('p1')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'p1'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Hal 1: Surat Tugas
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('p2')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'p2'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Hal 2: SPPD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('p3')}
              className={`px-3 py-1.5 rounded-md font-medium transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'p3'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Hal 3: Lampiran SPPD
            </button>
          </div>
        </div>

        {/* Center: Zoom & Quick Signature/Stamp Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(50, z - 10))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Perkecil"
              aria-label="Perkecil Tampilan"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="w-12 text-center font-mono text-slate-200">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(150, z + 10))}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white cursor-pointer"
              title="Perbesar"
              aria-label="Perbesar Tampilan"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white ml-1 cursor-pointer"
              title="Reset Ukuran"
              aria-label="Reset Ukuran Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Toggle TTD & Stempel langsung di preview */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 px-2 py-1 rounded-lg border border-slate-700 text-xs">
            <button
              type="button"
              onClick={handleToggleTtd}
              disabled={!school.ttdImage}
              title={school.ttdImage ? 'Aktif/Nonaktifkan Tanda Tangan KS' : 'Upload TTD di menu Tanda Tangan & Stempel'}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                localTempelTtd && school.ttdImage
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <PenTool className="w-3 h-3" />
              TTD
            </button>
            <button
              type="button"
              onClick={handleToggleStempel}
              disabled={!school.stempelImage}
              title={school.stempelImage ? 'Aktif/Nonaktifkan Stempel Sekolah' : 'Upload Stempel di menu Tanda Tangan & Stempel'}
              className={`px-2 py-1 rounded font-medium flex items-center gap-1 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                localTempelStempel && school.stempelImage
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Stamp className="w-3 h-3" />
              Stempel
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopySummary}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            title="Salin ringkasan ke papan klip"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Tersalin' : 'Salin Info'}
          </button>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Surat
            </button>
          )}

          {/* Download DOCX */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={exportStatus !== 'idle'}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-600 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
            title="Unduh file Microsoft Word (.docx) asli yang dapat diedit"
          >
            {exportStatus === 'docx' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            {exportStatus === 'docx' ? 'Memproses...' : 'Unduh DOCX'}
          </button>

          {/* Unduh ZIP Otomatis */}
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={exportStatus !== 'idle'}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
            title="Unduh otomatis seluruh dokumen (DOCX & PDF untuk semua pegawai) dalam format .ZIP"
          >
            {exportStatus === 'zip' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FolderArchive className="w-3.5 h-3.5" />
            )}
            {exportStatus === 'zip' ? 'Mengemas ZIP...' : 'Unduh ZIP'}
          </button>

          {/* Cetak / PDF Button (Direct Multi-Page A4 PDF Download) */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={exportStatus !== 'idle'}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow cursor-pointer"
            title="Unduh langsung sebagai file PDF A4 siap cetak"
          >
            {exportStatus === 'pdf' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <FileDown className="w-3.5 h-3.5" />
            )}
            {exportStatus === 'pdf' ? 'Membuat PDF...' : 'Cetak / PDF'}
          </button>

          {/* Print via Printer Dialog */}
          <button
            type="button"
            onClick={handleBrowserPrint}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            title="Kirim langsung ke Printer sistem"
          >
            <Printer className="w-3.5 h-3.5" />
            Print
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
              title="Tutup Preview"
              aria-label="Tutup Preview"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center bg-slate-950/60">
        <div
          className="transition-transform duration-150 origin-top flex flex-col items-center gap-10"
          style={{ transform: `scale(${zoom / 100})` }}
        >
          {expandedDocs.map((pkg, pkgIndex) => (
            <React.Fragment key={pkg.id || pkgIndex}>
              {expandedDocs.length > 1 && (
                <div className="no-print w-full max-w-[210mm] bg-blue-900/70 border border-blue-700 text-blue-100 px-4 py-2 rounded-lg flex items-center justify-between text-xs font-semibold">
                  <span>
                    Pegawai {pkgIndex + 1} dari {expandedDocs.length}: {pkg.pegawaiUtama.nama}
                  </span>
                  <span className="font-mono text-blue-200">
                    No: {pkg.nomorSuratTugas}
                  </span>
                </div>
              )}

              {/* PAGE 1: SURAT TUGAS */}
              {(activeTab === 'all' || activeTab === 'p1') && (
                <div className="flex flex-col items-center">
                  <div className="no-print text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                    <span>
                      {expandedDocs.length > 1 ? `[${pkgIndex + 1}] ` : ''}
                      Halaman 1 – Surat Tugas Resmi
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Nomor: {pkg.nomorSuratTugas}</span>
                  </div>
                  <SuratTugasPage data={pkg} school={school} />
                </div>
              )}

              {/* PAGE 2: SPPD */}
              {(activeTab === 'all' || activeTab === 'p2') && (
                <div className="flex flex-col items-center">
                  <div className="no-print text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                    <span>
                      {expandedDocs.length > 1 ? `[${pkgIndex + 1}] ` : ''}
                      Halaman 2 – Surat Perintah Perjalanan Dinas (SPPD)
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>Nomor: {pkg.nomorSPPD}</span>
                  </div>
                  <SPPDPage data={pkg} school={school} />
                </div>
              )}

              {/* PAGE 3: LAMPIRAN SPPD */}
              {(activeTab === 'all' || activeTab === 'p3') && (
                <div className="flex flex-col items-center">
                  <div className="no-print text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                    <span>
                      {expandedDocs.length > 1 ? `[${pkgIndex + 1}] ` : ''}
                      Halaman 3 – Lampiran SPPD (Lembar Pengesahan)
                    </span>
                    <span className="text-slate-600">•</span>
                    <span>SPPD No: {pkg.lampiranSppdNomor}</span>
                  </div>
                  <LampiranSPPDPage data={pkg} school={school} />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
