import React, { useState } from 'react';
import { SchoolIdentity } from '../types';
import { FileCode, Save, CheckCircle, Info, FileText } from 'lucide-react';

interface TemplateSettingsViewProps {
  school: SchoolIdentity;
}

const STORAGE_KEY = 'sdn1_pujiharjo_template_defaults';

export const TemplateSettingsView: React.FC<TemplateSettingsViewProps> = ({
  school,
}) => {
  const [savedDefaults] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [defaultTempatAsal, setDefaultTempatAsal] = useState(
    savedDefaults.defaultTempatAsal || school.namaSekolah || 'SD Negeri 1 Pujiharjo'
  );
  const [defaultBebanAnggaran, setDefaultBebanAnggaran] = useState(
    savedDefaults.defaultBebanAnggaran || 'Anggaran BOSP-Reg SD Negeri 1 Pujiharjo'
  );
  const [defaultPenutup, setDefaultPenutup] = useState(
    savedDefaults.defaultPenutup ||
      'Demikian surat tugas ini kami buat untuk dilaksanakan dengan sebaik-baiknya dan penuh tanggungjawab.'
  );
  const [defaultKeterangan, setDefaultKeterangan] = useState(savedDefaults.defaultKeterangan || '-');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          defaultTempatAsal,
          defaultBebanAnggaran,
          defaultPenutup,
          defaultKeterangan,
        })
      );
    } catch (err) {
      console.error(err);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <FileCode className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Pengaturan Template & Teks Dokumen
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi template standar Surat Tugas, SPPD (10 Poin), dan Lampiran SPPD.
          </p>
        </div>

        {saved && (
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Template Diperbarui
          </span>
        )}
      </div>

      {/* Info Card on Reference Documents */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-2">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Info className="w-4 h-4 text-blue-600" />
          Sumber Template Resmi Terpasang
        </div>
        <ul className="list-disc pl-5 space-y-1 text-slate-700">
          <li><strong>Lampiran 1:</strong> File <code className="text-blue-800">spp bu halimah bahasa inggris.docx</code> (Surat Tugas Hal 1 & SPPD Hal 2)</li>
          <li><strong>Lampiran 2:</strong> File <code className="text-blue-800">LAMPIRAN SPPD KOMBEL bu sih.docx</code> (Lampiran SPPD Hal 3)</li>
          <li><strong>Lampiran 3:</strong> File <code className="text-blue-800">daftar ptk.xlsx</code> (Database 9 Pendidik & Tenaga Kependidikan)</li>
        </ul>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b">
          Teks Bawaan (Default Values)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Tempat Asal Keberangkatan Bawaan
            </label>
            <input
              type="text"
              value={defaultTempatAsal}
              onChange={(e) => setDefaultTempatAsal(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Beban Anggaran Standar (Poin 9 SPPD)
            </label>
            <input
              type="text"
              value={defaultBebanAnggaran}
              onChange={(e) => setDefaultBebanAnggaran(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Kalimat Penutup Surat Tugas (Halaman 1)
            </label>
            <textarea
              rows={2}
              value={defaultPenutup}
              onChange={(e) => setDefaultPenutup(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Keterangan Standar (Poin 10 SPPD)
            </label>
            <input
              type="text"
              value={defaultKeterangan}
              onChange={(e) => setDefaultKeterangan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Nilai Bawaan
          </button>
        </div>
      </form>
    </div>
  );
};
