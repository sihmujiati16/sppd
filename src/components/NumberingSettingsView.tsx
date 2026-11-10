import React, { useState } from 'react';
import { NumberingSettings, DocumentPackage } from '../types';
import { Hash, Save, AlertTriangle, CheckCircle, RotateCcw, ListFilter } from 'lucide-react';

interface NumberingSettingsViewProps {
  settings: NumberingSettings;
  documents: DocumentPackage[];
  onSaveSettings: (newSettings: NumberingSettings) => void;
}

export const NumberingSettingsView: React.FC<NumberingSettingsViewProps> = ({
  settings,
  documents,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<NumberingSettings>({ ...settings });
  const [savedAlert, setSavedAlert] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  // Extract all numbers used in existing documents
  const suratTugasNumbers = documents.map((d) => ({
    nomor: d.nomorSuratTugas,
    urut: d.nomorUrutSuratTugas,
    guru: d.daftarPegawai.map((p) => p.nama).join(', '),
    tanggal: d.tanggalSurat,
    acara: d.acara,
  }));

  const sppdNumbers = documents.map((d) => ({
    nomor: d.nomorSPPD,
    urut: d.nomorUrutSPPD,
    guru: d.pegawaiUtama?.nama || d.daftarPegawai[0]?.nama,
    tanggal: d.tanggalSurat,
    tujuan: d.tempatTujuan,
  }));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Hash className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Pengaturan Nomor Surat & SPPD
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Atur pola kode penomoran resmi dinas Kabupaten Malang serta nomor urut otomatis.
          </p>
        </div>

        {savedAlert && (
          <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" />
            Pengaturan Disimpan
          </span>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Format Surat Tugas */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Format Pola Nomor Surat Tugas
            </label>
            <input
              type="text"
              value={formData.formatSuratTugas}
              onChange={(e) => setFormData({ ...formData, formatSuratTugas: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]"
            />
            <p className="text-[11px] text-slate-500">
              Gunakan tanda <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">[NOMOR]</code> dan <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">[TAHUN]</code>
            </p>
          </div>

          {/* Format SPPD */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Format Pola Nomor SPPD
            </label>
            <input
              type="text"
              value={formData.formatSPPD}
              onChange={(e) => setFormData({ ...formData, formatSPPD: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]"
            />
            <p className="text-[11px] text-slate-500">
              Dapat disesuaikan jika dinas menggunakan kode klasifikasi berbeda
            </p>
          </div>

          {/* Nomor Urut Berikutnya Surat Tugas */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Nomor Urut Surat Tugas Berikutnya
            </label>
            <input
              type="number"
              min="1"
              value={formData.counterSuratTugas}
              onChange={(e) => setFormData({ ...formData, counterSuratTugas: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Otomatis bertambah setiap kali surat tugas baru dibuat.
            </p>
          </div>

          {/* Nomor Urut Berikutnya SPPD */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              Nomor Urut SPPD Berikutnya
            </label>
            <input
              type="number"
              min="1"
              value={formData.counterSPPD}
              onChange={(e) => setFormData({ ...formData, counterSPPD: parseInt(e.target.value, 10) || 1 })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500">
              Buku register SPPD dikelola mandiri agar nomor urut rapi.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Perubahan Nomor
          </button>
        </div>
      </form>

      {/* History of used numbers */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-blue-600" />
          Riwayat Nomor Surat Yang Telah Digunakan
        </h3>
        <p className="text-xs text-slate-500">
          Membantu verifikator menghindari duplikasi nomor surat dalam satu tahun anggaran.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Surat Tugas Numbers */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
              Daftar Nomor Surat Tugas ({suratTugasNumbers.length})
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {suratTugasNumbers.map((item, idx) => (
                <div key={idx} className="p-2.5 hover:bg-slate-50">
                  <div className="font-mono font-semibold text-slate-900">{item.nomor}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.guru} • {item.tanggal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SPPD Numbers */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <div className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
              Daftar Nomor SPPD ({sppdNumbers.length})
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
              {sppdNumbers.map((item, idx) => (
                <div key={idx} className="p-2.5 hover:bg-slate-50">
                  <div className="font-mono font-semibold text-slate-900">{item.nomor}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.guru} • {item.tujuan}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
