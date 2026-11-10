import React, { useEffect, useState } from 'react';
import { Printer, FileDown, X, Loader2, AlertCircle, FileText } from 'lucide-react';
import { DocumentPackage, SchoolIdentity } from '../types';
import { expandDocumentPerPegawai } from '../utils/documentLogic';
import { generatePdfBlob } from '../utils/pdfGenerator';
import { generateDocxBlob, downloadBlob } from '../utils/docxGenerator';
import { SuratTugasPage } from './SuratTugasPage';
import { SPPDPage } from './SPPDPage';
import { LampiranSPPDPage } from './LampiranSPPDPage';

interface PrintFallbackModalProps {
  doc: DocumentPackage;
  school: SchoolIdentity;
  singlePage?: 1 | 2 | 3;
  onClose: () => void;
}

export const PrintFallbackModal: React.FC<PrintFallbackModalProps> = ({
  doc,
  school,
  singlePage,
  onClose,
}) => {
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(true);
  const [downloadingDocx, setDownloadingDocx] = useState(false);
  const [notice, setNotice] = useState<string>(
    'Browser/jendela pratinjau membatasi dialog cetak langsung. Gunakan tombol Unduh PDF Siap Cetak di kanan atas untuk mencetak langsung dari perangkat Anda.'
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoadingPdf(true);
        const blob = await generatePdfBlob(doc, school, singlePage);
        if (active) setPdfBlob(blob);
      } catch (err) {
        console.error('Print PDF preparation error:', err);
        if (active) {
          setNotice('Gagal menyiapkan PDF otomatis. Silakan gunakan tombol Unduh Word (.docx) atau coba lagi.');
        }
      } finally {
        if (active) setLoadingPdf(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [doc, school, singlePage]);

  const cleanNomor = (doc.nomorSuratTugas || 'Dokumen').replace(/[^a-zA-Z0-9]+/g, '_');
  const suffix =
    singlePage === 1
      ? '_Surat_Tugas'
      : singlePage === 2
      ? '_SPPD'
      : singlePage === 3
      ? '_Lampiran_SPPD'
      : '_Lengkap';

  const handleDownloadPdf = async () => {
    try {
      setLoadingPdf(true);
      const blob = pdfBlob || (await generatePdfBlob(doc, school, singlePage));
      downloadBlob(blob, `SDN1_Pujiharjo_${cleanNomor}${suffix}.pdf`);
      setNotice('File PDF A4 siap cetak berhasil diunduh. Silakan buka file PDF tersebut lalu tekan Ctrl+P / Print.');
    } catch (err) {
      console.error('Download PDF error:', err);
      setNotice('Gagal mengunduh file PDF.');
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      setDownloadingDocx(true);
      const blob = await generateDocxBlob(doc, school, singlePage);
      downloadBlob(blob, `SDN1_Pujiharjo_${cleanNomor}${suffix}.docx`);
      setNotice('File Microsoft Word (.docx) berhasil diunduh.');
    } catch (err) {
      console.error('Download DOCX error:', err);
      setNotice('Gagal membuat file Word (.docx).');
    } finally {
      setDownloadingDocx(false);
    }
  };

  const handleRetryNativePrint = () => {
    let dialogOpened = false;
    const onBeforePrint = () => {
      dialogOpened = true;
    };
    window.addEventListener('beforeprint', onBeforePrint, { once: true });
    try {
      window.print();
    } catch {
      dialogOpened = false;
    }
    setTimeout(() => {
      window.removeEventListener('beforeprint', onBeforePrint);
      if (!dialogOpened) {
        setNotice(
          'Dialog cetak browser diblokir oleh sandbox pratinjau (iframe). Silakan klik "Unduh PDF Siap Cetak" untuk mencetak dari perangkat Anda.'
        );
      }
    }, 300);
  };

  const expandedDocs = expandDocumentPerPegawai(doc);

  return (
    <div className="no-print fixed inset-0 z-[70] bg-slate-900/75 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-800 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-blue-600 rounded-lg">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                Mode Cetak Dokumen A4
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                {doc.nomorSuratTugas} • {expandedDocs.length} Pegawai
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRetryNativePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak Browser
            </button>
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={downloadingDocx}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {downloadingDocx ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              Unduh Word (.docx)
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={loadingPdf}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              {loadingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5" />
              )}
              {loadingPdf ? 'Menyiapkan PDF...' : 'Unduh PDF Siap Cetak'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition cursor-pointer"
              aria-label="Tutup dialog cetak"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-5 py-2.5 bg-blue-50 border-b border-blue-200 text-xs text-blue-900 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{notice}</span>
        </div>

        {/* Scrollable Visual A4 Print Preview */}
        <div className="flex-1 bg-slate-200 overflow-auto p-6 flex flex-col items-center gap-6">
          {expandedDocs.map((pkg, idx) => (
            <React.Fragment key={pkg.id || idx}>
              {(!singlePage || singlePage === 1) && (
                <div className="shadow-lg">
                  <SuratTugasPage data={pkg} school={school} />
                </div>
              )}
              {(!singlePage || singlePage === 2) && (
                <div className="shadow-lg">
                  <SPPDPage data={pkg} school={school} />
                </div>
              )}
              {(!singlePage || singlePage === 3) && (
                <div className="shadow-lg">
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
