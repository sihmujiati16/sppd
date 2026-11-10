import React, { useState } from 'react';
import { SchoolIdentity } from '../types';
import { Building2, Save, CheckCircle, RotateCcw, AlertTriangle, X } from 'lucide-react';
import { KopSuratView } from './KopSuratView';
import { INITIAL_SCHOOL_IDENTITY } from '../data/initialPTK';

interface SchoolSettingsViewProps {
  school: SchoolIdentity;
  onSaveSchool: (newSchool: SchoolIdentity) => void;
}

export const SchoolSettingsView: React.FC<SchoolSettingsViewProps> = ({
  school,
  onSaveSchool,
}) => {
  const [formData, setFormData] = useState<SchoolIdentity>({ ...school });
  const [savedAlert, setSavedAlert] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSchool(formData);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const handleConfirmReset = () => {
    const resetData = {
      ...INITIAL_SCHOOL_IDENTITY,
      ttdImage: formData.ttdImage,
      tempelTtd: formData.tempelTtd,
      stempelImage: formData.stempelImage,
      tempelStempel: formData.tempelStempel,
    };
    setFormData(resetData);
    onSaveSchool(resetData);
    setShowResetConfirm(false);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Pengaturan Identitas Sekolah & Kepala Sekolah
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Data identitas ini digunakan secara otomatis pada Kop Surat dan bagian tanda tangan di semua dokumen.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedAlert && (
            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" />
              Tersimpan
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Default
          </button>
        </div>
      </div>

      {/* Live Preview of Kop Surat */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Tinjauan Kop Surat Otomatis
        </h3>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto">
          <div className="min-w-[650px] bg-white p-4 shadow-xs">
            <KopSuratView school={formData} />
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b">
            Identitas Sekolah & Alamat
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pemerintah Daerah
              </label>
              <input
                type="text"
                value={formData.pemda}
                onChange={(e) => setFormData({ ...formData, pemda: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Dinas Terkait
              </label>
              <input
                type="text"
                value={formData.dinas}
                onChange={(e) => setFormData({ ...formData, dinas: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Sekolah (Tampil Tegas & Menonjol)
              </label>
              <input
                type="text"
                value={formData.namaSekolah}
                onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={formData.telepon}
                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                value={formData.kodePos}
                onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Laman / Website Sekolah
              </label>
              <input
                type="text"
                value={formData.laman}
                onChange={(e) => setFormData({ ...formData, laman: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pos-el / Email Sekolah
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Kepala Sekolah Details */}
        <div className="pt-4 border-t border-slate-200">
          <h2 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b">
            Data Pejabat Kepala Sekolah (Penanda Tangan Resmi)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Kepala Sekolah (beserta gelar)
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah.nama}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kepalaSekolah: { ...formData.kepalaSekolah, nama: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                NIP Kepala Sekolah
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah.nip}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kepalaSekolah: { ...formData.kepalaSekolah, nip: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Pangkat / Golongan
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah.pangkatGolongan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kepalaSekolah: { ...formData.kepalaSekolah, pangkatGolongan: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Kecamatan
              </label>
              <input
                type="text"
                value={formData.kepalaSekolah.kecamatan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kepalaSekolah: { ...formData.kepalaSekolah, kecamatan: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Simpan Identitas Sekolah
          </button>
        </div>
      </form>

      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowResetConfirm(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reset Identitas Sekolah?</h3>
                <p className="text-xs text-slate-500">
                  Kembalikan identitas sekolah & kepala sekolah ke data bawaan SD Negeri 1 Pujiharjo?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
              >
                Ya, Reset Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
