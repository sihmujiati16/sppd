import React, { useState } from 'react';
import {
  DocumentPackage,
  NumberingSettings,
  PTKEmployee,
  SchoolIdentity,
  SuratTugasPegawai,
} from '../types';
import {
  expandDocumentPerPegawai,
  formatNomorSurat,
  formatTanggalIndo,
  parseNomorUrut,
} from '../utils/documentLogic';
import {
  UserCheck,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Save,
  Eye,
  ArrowLeft,
  Search,
  CheckCircle2,
  Building,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface DocumentEditorFormProps {
  initialData?: DocumentPackage | null;
  ptkList: PTKEmployee[];
  school: SchoolIdentity;
  numbering?: NumberingSettings;
  onSave: (doc: DocumentPackage, shouldPreview?: boolean) => void;
  onCancel: () => void;
}

export const DocumentEditorForm: React.FC<DocumentEditorFormProps> = ({
  initialData,
  ptkList,
  school,
  numbering,
  onSave,
  onCancel,
}) => {
  const currentYear = new Date().getFullYear();
  const defaultToday = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<DocumentPackage>(() => {
    if (initialData) {
      const syncedNomor = initialData.nomorSuratTugas || initialData.nomorSPPD;
      return {
        ...initialData,
        nomorSuratTugas: syncedNomor,
        nomorSPPD: syncedNomor,
        lampiranSppdNomor: syncedNomor,
      };
    }

    const defaultPegawai: SuratTugasPegawai = {
      id: 'peg-1',
      nama: ptkList[2]?.nama || "Halimatus Sa'diyah, S.Pd.",
      nip: ptkList[2]?.nip || '199004122023212046',
      pangkatGol: ptkList[2]?.pangkatGol || 'Penata Muda / IX',
      jabatan: ptkList[2]?.jabatan || 'Ahli Pertama / Guru Kelas',
      unitKerja: school.namaSekolah,
      statusKepegawaian: ptkList[2]?.statusKepegawaian || 'PPPK',
    };

    const nextUrut = numbering?.counterSuratTugas || 170;
    const formatTemplate = numbering?.formatSuratTugas || '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]';
    const tahunSurat = numbering?.tahun || currentYear;
    const generatedNomor = formatNomorSurat(formatTemplate, ` ${nextUrut} `, tahunSurat);

    const initialDate = defaultToday;
    const formattedDate = formatTanggalIndo(initialDate, { withDay: true });
    const formattedIndo = formatTanggalIndo(initialDate);
    const formattedDash = formatTanggalIndo(initialDate, { numericDash: true });

    return {
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tahun: tahunSurat,
      nomorSuratTugas: generatedNomor,
      nomorUrutSuratTugas: nextUrut,
      nomorSPPD: generatedNomor,
      nomorUrutSPPD: nextUrut,
      lembarKe: 'I',
      lampiranSppdNomor: generatedNomor,
      lampiranKe: 'II',
      tanggalSurat: initialDate,
      tempatSurat: school.kabupaten || 'Kab. Malang',
      tanggalTandaTangan: formattedDash,
      tempelTtd: school.tempelTtd,
      tempelStempel: school.tempelStempel,
      pejabatPemberiTugas: { ...school.kepalaSekolah },
      daftarPegawai: [defaultPegawai],
      hariTanggalPelaksanaan: formattedDate,
      jamPelaksanaan: '08.00 s.d. Selesai',
      tempatTujuan: 'SMP Negeri 1 Tirtoyudo',
      alamatTujuan: 'Kecamatan Tirtoyudo, Kab. Malang',
      acara: 'Sosialisasi Upaya Pencegahan Tindak Pidana Korupsi dan Pungutan Liar.',
      pegawaiUtama: { ...defaultPegawai },
      pengikut: [],
      ...(() => {
        try {
          const raw = localStorage.getItem('sdn1_pujiharjo_template_defaults');
          const parsed = raw ? JSON.parse(raw) : {};
          return {
            tempatAsal: parsed.defaultTempatAsal || school.namaSekolah,
            bebanAnggaran: parsed.defaultBebanAnggaran || 'Anggaran BOSP-Reg SD Negeri 1 Pujiharjo',
            keteranganLain: parsed.defaultKeterangan || '-',
          };
        } catch {
          return {
            tempatAsal: school.namaSekolah,
            bebanAnggaran: 'Anggaran BOSP-Reg SD Negeri 1 Pujiharjo',
            keteranganLain: '-',
          };
        }
      })(),
      lamaPerjalanan: '1 (satu) hari',
      tanggalBerangkat: formattedIndo,
      tanggalKembali: formattedIndo,
      maksudPerjalanan: 'Sosialisasi Upaya Pencegahan Tindak Pidana Korupsi dan Pungutan Liar',
      kodeRekening: '',
      halaman3: {
        pejabatTujuanNama: '',
        pejabatTujuanNip: '',
        pejabatTujuanJabatan: 'Kepala SMP Negeri 1 Tirtoyudo',
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
  });

  const [activeTab, setActiveTab] = useState<'surat' | 'pegawai' | 'kegiatan' | 'sppd' | 'halaman3'>('surat');
  const [selectedPtkToAdd, setSelectedPtkToAdd] = useState<string>('');
  const [ptkSearchQuery, setPtkSearchQuery] = useState('');
  const [formWarning, setFormWarning] = useState<string | null>(null);

  const showWarning = (msg: string) => {
    setFormWarning(msg);
    setTimeout(() => setFormWarning(null), 4000);
  };

  // Handle updates to basic fields
  const updateField = (field: keyof DocumentPackage, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Handle date change and update derived string dates
  const handleDateChange = (newDate: string) => {
    const formattedWithDay = formatTanggalIndo(newDate, { withDay: true });
    const formattedIndo = formatTanggalIndo(newDate);

    setFormData((prev) => ({
      ...prev,
      tanggalSurat: newDate,
      hariTanggalPelaksanaan: formattedWithDay,
      tanggalBerangkat: formattedIndo,
      tanggalKembali: formattedIndo,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Add teacher to assignment list
  const handleAddPegawaiFromPTK = (ptkId: string) => {
    const ptk = ptkList.find((p) => p.id === ptkId);
    if (!ptk) return;

    // Check if already added
    if (formData.daftarPegawai.some((p) => (p.nip && p.nip === ptk.nip) || p.nama === ptk.nama)) {
      showWarning(`Pegawai ${ptk.nama} sudah ada di dalam daftar tugas.`);
      return;
    }

    const newPegawai: SuratTugasPegawai = {
      id: `peg-${Date.now()}`,
      nama: ptk.nama,
      nip: ptk.nip,
      pangkatGol: ptk.pangkatGol,
      jabatan: ptk.jabatan,
      unitKerja: ptk.unitKerja || school.namaSekolah,
      statusKepegawaian: ptk.statusKepegawaian,
    };

    setFormData((prev) => {
      const updated = [...prev.daftarPegawai, newPegawai];
      return {
        ...prev,
        daftarPegawai: updated,
        pegawaiUtama: prev.pegawaiUtama.nama ? prev.pegawaiUtama : newPegawai,
      };
    });
    setSelectedPtkToAdd('');
  };

  // Remove teacher
  const handleRemovePegawai = (index: number) => {
    if (formData.daftarPegawai.length <= 1) {
      showWarning('Minimal harus ada 1 pegawai yang ditugaskan.');
      return;
    }
    const updated = formData.daftarPegawai.filter((_, i) => i !== index);
    setFormData((prev) => ({
      ...prev,
      daftarPegawai: updated,
      pegawaiUtama: updated[0] || prev.pegawaiUtama,
    }));
  };

  // Select primary employee for SPPD
  const handleSelectPrimaryPegawai = (index: number) => {
    const selected = formData.daftarPegawai[index];
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        pegawaiUtama: { ...selected },
      }));
    }
  };

  // Filtered PTK list
  const filteredPTK = ptkList.filter(
    (p) =>
      p.nama.toLowerCase().includes(ptkSearchQuery.toLowerCase()) ||
      p.nip.includes(ptkSearchQuery) ||
      p.jabatan.toLowerCase().includes(ptkSearchQuery.toLowerCase())
  );

  const expandedPreviewList = expandDocumentPerPegawai(formData);
  const effectiveTtd = formData.tempelTtd !== undefined ? formData.tempelTtd : Boolean(school.tempelTtd);
  const effectiveStempel = formData.tempelStempel !== undefined ? formData.tempelStempel : Boolean(school.tempelStempel);

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {formWarning && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl flex items-center gap-2 text-xs font-medium shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{formWarning}</span>
        </div>
      )}
      {/* Top Banner & Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {initialData ? 'Edit Surat Tugas & SPPD' : 'Buat Surat Tugas & SPPD Baru'}
              </h1>
              <p className="text-xs text-slate-500">
                SD Negeri 1 Pujiharjo, Kec. Tirtoyudo, Kab. Malang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSave(formData, false)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition shadow-sm"
            >
              <Save className="w-4 h-4" />
              Simpan Dokumen
            </button>
            <button
              onClick={() => onSave(formData, true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition shadow-sm"
            >
              <Eye className="w-4 h-4" />
              Simpan & Preview
            </button>
          </div>
        </div>

        {/* Wizard Form Tabs */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-1 text-xs md:text-sm font-medium">
          <button
            onClick={() => setActiveTab('surat')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 shrink-0 transition ${
              activeTab === 'surat'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            1. Nomor & Tanggal
          </button>
          <button
            onClick={() => setActiveTab('pegawai')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 shrink-0 transition ${
              activeTab === 'pegawai'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            2. Pegawai Bertugas ({formData.daftarPegawai.length})
          </button>
          <button
            onClick={() => setActiveTab('kegiatan')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 shrink-0 transition ${
              activeTab === 'kegiatan'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            3. Rincian Kegiatan
          </button>
          <button
            onClick={() => setActiveTab('sppd')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 shrink-0 transition ${
              activeTab === 'sppd'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            4. Detail SPPD & Anggaran
          </button>
          <button
            onClick={() => setActiveTab('halaman3')}
            className={`px-3 py-2 rounded-lg flex items-center gap-2 shrink-0 transition ${
              activeTab === 'halaman3'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building className="w-4 h-4" />
            5. Halaman 3 (Pengesahan)
          </button>
        </div>
      </div>

      {/* FORM BODY */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        {/* TAB 1: DATA SURAT & NOMOR */}
        {activeTab === 'surat' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Penomoran Surat dan Tanggal Pembuatan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nomor Surat Tugas (Induk) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Sama di ST, SPPD & Lampiran
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.nomorSuratTugas}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsedUrut = parseNomorUrut(val);
                    setFormData((prev) => ({
                      ...prev,
                      nomorSuratTugas: val,
                      nomorSPPD: val,
                      lampiranSppdNomor: val,
                      nomorUrutSuratTugas: parsedUrut || prev.nomorUrutSuratTugas,
                      nomorUrutSPPD: parsedUrut || prev.nomorUrutSPPD,
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="400.3.10.8/ 170 /35.07.301.30.28/2026"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Nomor SPPD & Lampiran otomatis mengikuti Nomor Surat Tugas. Jika pegawai &gt; 1, nomor otomatis berurutan untuk setiap pegawai.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor SPPD (Halaman 2) — Tersinkronisasi
                </label>
                <input
                  type="text"
                  value={formData.nomorSPPD}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsedUrut = parseNomorUrut(val);
                    setFormData((prev) => ({
                      ...prev,
                      nomorSuratTugas: val,
                      nomorSPPD: val,
                      lampiranSppdNomor: val,
                      nomorUrutSuratTugas: parsedUrut || prev.nomorUrutSuratTugas,
                      nomorUrutSPPD: parsedUrut || prev.nomorUrutSPPD,
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 bg-slate-50 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="400.3.10.8/ 170 /35.07.301.30.28/2026"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Otomatis disamakan dengan Nomor Surat Tugas & Nomor Lampiran SPPD
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lembar Ke (SPPD)
                </label>
                <input
                  type="text"
                  value={formData.lembarKe}
                  onChange={(e) => updateField('lembarKe', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="I"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nomor SPPD pada Halaman 3 (Lampiran) — Tersinkronisasi
                </label>
                <input
                  type="text"
                  value={formData.lampiranSppdNomor}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsedUrut = parseNomorUrut(val);
                    setFormData((prev) => ({
                      ...prev,
                      nomorSuratTugas: val,
                      nomorSPPD: val,
                      lampiranSppdNomor: val,
                      nomorUrutSuratTugas: parsedUrut || prev.nomorUrutSuratTugas,
                      nomorUrutSPPD: parsedUrut || prev.nomorUrutSPPD,
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 bg-slate-50 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="400.3.10.8/ 170 /35.07.301.30.28/2026"
                />
              </div>

              {/* Pratinjau Penomoran Berurutan Multi-Pegawai */}
              {expandedPreviewList.length > 1 && (
                <div className="md:col-span-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-xs">
                  <p className="font-bold text-indigo-900 mb-2">
                    Penomoran Otomatis Berurutan ({expandedPreviewList.length} Pegawai = {expandedPreviewList.length * 3} Halaman A4 Output):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {expandedPreviewList.map((item, idx) => (
                      <div key={item.id} className="bg-white border border-indigo-100 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800 truncate">
                          {idx + 1}. {item.pegawaiUtama.nama}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-indigo-700 shrink-0">
                          {item.nomorSuratTugas}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Surat <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.tanggalSurat}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Pembuatan Surat
                </label>
                <input
                  type="text"
                  value={formData.tempatSurat}
                  onChange={(e) => updateField('tempatSurat', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Kab. Malang"
                />
              </div>

              {/* Tanggal di Atas Tanda Tangan Kepala Sekolah (Dapat Diedit Bebas Sesuai Pelaksanaan) */}
              <div className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-xl border border-blue-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div>
                    <label className="block text-xs font-bold text-blue-900">
                      Tanggal di Atas Tanda Tangan Kepala Sekolah (Halaman 1 & 2) <span className="text-red-500">*</span>
                    </label>
                    <p className="text-[11px] text-blue-700">
                      Tampil persis di atas teks "Kepala SD Negeri 1 Pujiharjo" (misal: Pujiharjo, [Tanggal])
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateField('tanggalTandaTangan', formData.hariTanggalPelaksanaan);
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-md transition shadow-xs flex items-center gap-1 cursor-pointer"
                      title="Salin hari dan tanggal pelaksanaan"
                    >
                      ⚡ Samakan Hari & Tanggal Pelaksanaan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('tanggalTandaTangan', formatTanggalIndo(formData.tanggalSurat, { numericDash: true }));
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md transition cursor-pointer"
                      title="Format: D-M-YYYY"
                    >
                      Format D-M-YYYY
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        updateField('tanggalTandaTangan', formatTanggalIndo(formData.tanggalSurat));
                      }}
                      className="px-2.5 py-1 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-md transition cursor-pointer"
                      title="Format: 5 November 2026"
                    >
                      Format Teks Lengkap
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={formData.tanggalTandaTangan ?? formatTanggalIndo(formData.tanggalSurat, { numericDash: true })}
                  onChange={(e) => updateField('tanggalTandaTangan', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Contoh: 5 November 2026 atau Kamis, 5 November 2026 atau 05-11-2026"
                />
                <p className="text-[11px] text-slate-600 mt-1.5 flex items-center gap-1">
                  Preview tanda tangan: <span className="font-semibold text-blue-900">{formData.tempatSurat}, {formData.tanggalTandaTangan || formatTanggalIndo(formData.tanggalSurat, { numericDash: true })}</span>
                </p>
              </div>
            </div>

            {/* Pejabat Pemberi Tugas (Kepala Sekolah) */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mt-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
                <span>Pejabat Pemberi Tugas (Yang Bertanda Tangan)</span>
                <span className="text-xs font-normal text-slate-500">Default: Kepala Sekolah SDN 1 Pujiharjo</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <label className="text-xs text-slate-600 block mb-0.5">Nama Pejabat</label>
                  <input
                    type="text"
                    value={formData.pejabatPemberiTugas.nama}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pejabatPemberiTugas: { ...prev.pejabatPemberiTugas, nama: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-0.5">NIP Pejabat</label>
                  <input
                    type="text"
                    value={formData.pejabatPemberiTugas.nip}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pejabatPemberiTugas: { ...prev.pejabatPemberiTugas, nip: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-0.5">Pangkat / Golongan</label>
                  <input
                    type="text"
                    value={formData.pejabatPemberiTugas.pangkatGolongan}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pejabatPemberiTugas: { ...prev.pejabatPemberiTugas, pangkatGolongan: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600 block mb-0.5">Jabatan & Unit Kerja</label>
                  <input
                    type="text"
                    value={`${formData.pejabatPemberiTugas.jabatan} - ${formData.pejabatPemberiTugas.unitKerja}`}
                    disabled
                    className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600"
                  />
                </div>
              </div>
            </div>

            {/* Pilihan Tempel Tanda Tangan & Stempel Sekolah untuk Surat Ini */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 mb-3">
                Penempelan Tanda Tangan Kepala Sekolah & Stempel Sekolah (Khusus Dokumen Ini)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={effectiveTtd}
                    disabled={!school.ttdImage}
                    onChange={(e) => updateField('tempelTtd', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Tempel Tanda Tangan Kepala Sekolah
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {school.ttdImage
                        ? effectiveTtd
                          ? 'Aktif: TTD akan tampil otomatis pada Hal 1, 2, dan 3.'
                          : 'Nonaktif: Kosongkan area TTD untuk tanda tangan basah.'
                        : 'Gambar TTD belum diunggah (unggah di menu Tanda Tangan & Stempel).'}
                    </span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={effectiveStempel}
                    disabled={!school.stempelImage}
                    onChange={(e) => updateField('tempelStempel', e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Tempel Stempel Sekolah
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {school.stempelImage
                        ? effectiveStempel
                          ? 'Aktif: Stempel sekolah akan tampil otomatis pada dokumen.'
                          : 'Nonaktif: Kosongkan stempel untuk cap basah.'
                        : 'Gambar stempel belum diunggah (unggah di menu Tanda Tangan & Stempel).'}
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DATA PEGAWAI DITUGASKAN */}
        {activeTab === 'pegawai' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-blue-600" />
                  Daftar Pegawai Yang Diberikan Tugas
                </h2>
                <p className="text-xs text-slate-500">
                  Data diambil dari database Pendidik & Tenaga Kependidikan (Lampiran 3).
                </p>
              </div>

              {/* Selector to add teacher from PTK */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedPtkToAdd}
                  onChange={(e) => {
                    setSelectedPtkToAdd(e.target.value);
                    if (e.target.value) handleAddPegawaiFromPTK(e.target.value);
                  }}
                  className="px-3 py-2 border border-blue-300 bg-blue-50/50 rounded-lg text-sm font-medium text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">+ Pilih Guru / Tenaga Kependidikan...</option>
                  {ptkList.map((ptk) => (
                    <option key={ptk.id} value={ptk.id}>
                      {ptk.nama} ({ptk.jabatan})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* List of currently assigned teachers */}
            <div className="space-y-3">
              {formData.daftarPegawai.map((peg, idx) => (
                <div
                  key={peg.id || idx}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-300 transition shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {peg.nama}
                        {formData.pegawaiUtama?.nama === peg.nama && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Utama di SPPD
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500">
                        NIP: <span className="font-mono text-slate-700">{peg.nip || '-'}</span> | {peg.pangkatGol} | {peg.jabatan}
                      </p>
                      <p className="text-xs text-slate-400">Unit: {peg.unitKerja}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    {formData.pegawaiUtama?.nama !== peg.nama && (
                      <button
                        onClick={() => handleSelectPrimaryPegawai(idx)}
                        className="px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-md border border-blue-200 transition"
                      >
                        Jadikan Utama SPPD
                      </button>
                    )}
                    <button
                      onClick={() => handleRemovePegawai(idx)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition"
                      title="Hapus dari daftar tugas"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick PTK Explorer Drawer / Table */}
            <div className="mt-8 pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Cari Pegawai Dari Database Sekolah (9 PTK Tersedia)
                </h3>
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={ptkSearchQuery}
                    onChange={(e) => setPtkSearchQuery(e.target.value)}
                    placeholder="Cari nama atau NIP..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-semibold uppercase">
                    <tr>
                      <th className="px-3 py-2">Nama</th>
                      <th className="px-3 py-2">NIP</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Jabatan</th>
                      <th className="px-3 py-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPTK.map((ptk) => (
                      <tr key={ptk.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{ptk.nama}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{ptk.nip || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${ptk.statusKepegawaian === 'PNS' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {ptk.statusKepegawaian}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">{ptk.jabatan}</td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => handleAddPegawaiFromPTK(ptk.id)}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-medium transition"
                          >
                            + Tugaskan
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RINCIAN KEGIATAN */}
        {activeTab === 'kegiatan' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Waktu, Lokasi, dan Acara Pelaksanaan
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Hari dan Tanggal Pelaksanaan <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      updateField('tanggalTandaTangan', formData.hariTanggalPelaksanaan);
                    }}
                    className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
                    title="Jadikan juga sebagai tanggal di atas tanda tangan Kepala Sekolah"
                  >
                    ⚡ Pasang ke Tanda Tangan KS
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.hariTanggalPelaksanaan}
                  onChange={(e) => {
                    const val = e.target.value;
                    updateField('hariTanggalPelaksanaan', val);
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  placeholder="Kamis, 5 November 2026"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tampil pada bagian "melaksanakan tugas dinas keluar pada: hari, tanggal"
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jam Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.jamPelaksanaan}
                  onChange={(e) => updateField('jamPelaksanaan', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="08.00 s.d. Selesai"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Tujuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tempatTujuan}
                  onChange={(e) => updateField('tempatTujuan', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                  placeholder="SMP Negeri 1 Tirtoyudo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alamat / Wilayah Tujuan
                </label>
                <input
                  type="text"
                  value={formData.alamatTujuan || ''}
                  onChange={(e) => updateField('alamatTujuan', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Kecamatan Tirtoyudo, Kab. Malang"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Nama Acara / Maksud Perjalanan Dinas (Halaman 1 & Halaman 2) <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                    ✓ Otomatis Sama di Hal 1 & Hal 2
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={formData.acara}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      acara: val,
                      maksudPerjalanan: val,
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
                  placeholder="Sosialisasi Upaya Pencegahan Tindak Pidana Korupsi dan Pungutan Liar."
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Teks ini otomatis digunakan pada baris <strong>acara</strong> (Surat Tugas Hal 1) dan Poin 8 <strong>Maksud Mengadakan Perjalanan</strong> (SPPD Hal 2) agar selalu sama persis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: DETAIL SPPD & BEBAN ANGGARAN */}
        {activeTab === 'sppd' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Detail Surat Perintah Perjalanan Dinas (SPPD)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pegawai Utama SPPD (Poin 2)
                </label>
                <select
                  value={formData.pegawaiUtama?.nama}
                  onChange={(e) => {
                    const peg = formData.daftarPegawai.find((p) => p.nama === e.target.value);
                    if (peg) updateField('pegawaiUtama', { ...peg });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {formData.daftarPegawai.map((peg, i) => (
                    <option key={i} value={peg.nama}>
                      {peg.nama} ({peg.jabatan})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  Pegawai yang tercantum pada kolom utama SPPD
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tempat Asal Keberangkatan (Poin 4)
                </label>
                <input
                  type="text"
                  value={formData.tempatAsal}
                  onChange={(e) => updateField('tempatAsal', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="SD Negeri 1 Pujiharjo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lama Perjalanan Dinas (Poin 7)
                </label>
                <input
                  type="text"
                  value={formData.lamaPerjalanan}
                  onChange={(e) => updateField('lamaPerjalanan', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="1 (satu) hari"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tanggal Berangkat (Poin 7)
                </label>
                <input
                  type="text"
                  value={formData.tanggalBerangkat}
                  onChange={(e) => updateField('tanggalBerangkat', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="05 November 2026"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Maksud Mengadakan Perjalanan (Poin 8 SPPD & Acara Surat Tugas Hal 1)
                  </label>
                  <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                    ✓ Tersinkronisasi dengan Hal 1
                  </span>
                </div>
                <input
                  type="text"
                  value={formData.maksudPerjalanan || formData.acara}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      acara: val,
                      maksudPerjalanan: val,
                      updatedAt: new Date().toISOString(),
                    }));
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Sosialisasi Upaya Pencegahan Tindak Pidana Korupsi dan Pungutan Liar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Beban Anggaran (Poin 9)
                </label>
                <input
                  type="text"
                  value={formData.bebanAnggaran}
                  onChange={(e) => updateField('bebanAnggaran', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Anggaran BOSP-Reg SD Negeri 1 Pujiharjo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kode Rekening (Poin 9)
                </label>
                <input
                  type="text"
                  value={formData.kodeRekening}
                  onChange={(e) => updateField('kodeRekening', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="5.1.02.04.01.0001 (atau kosongkan)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan Lain (Poin 10)
                </label>
                <input
                  type="text"
                  value={formData.keteranganLain}
                  onChange={(e) => updateField('keteranganLain', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="-"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: HALAMAN 3 (LAMPIRAN SPPD & PENGESAHAN) */}
        {activeTab === 'halaman3' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Pengesahan Halaman 3 (Lampiran SPPD Lembar ke-2)
            </h2>

            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.halaman3?.isiOtomatis)}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      halaman3: { ...prev.halaman3, isiOtomatis: e.target.checked },
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">
                    Isi otomatis tujuan &amp; tanggal pada Halaman 3
                  </span>
                  <span className="text-xs text-slate-600 block mt-0.5">
                    Jika <strong>tidak dicentang (Default)</strong>, Halaman 3 dicetak dalam format template resmi kosongan (titik-titik pada kolom Ke, Tanggal, Bagian II–IV, dan V Tiba di, dengan nama Kepala Sekolah terisi di Bagian I &amp; V). Centang bila ingin mengisi otomatis lokasi tujuan dan tanggal perjalanan.
                  </span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jabatan Pejabat di Lokasi Tujuan (Bagian II — bila Isi Otomatis aktif)
                </label>
                <input
                  type="text"
                  value={formData.halaman3?.pejabatTujuanJabatan || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      halaman3: { ...prev.halaman3, pejabatTujuanJabatan: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Kepala SMP Negeri 1 Tirtoyudo"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pejabat di Tempat Tujuan (Boleh dikosongkan untuk TTD basah)
                </label>
                <input
                  type="text"
                  value={formData.halaman3?.pejabatTujuanNama || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      halaman3: { ...prev.halaman3, pejabatTujuanNama: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Bila dikosongkan akan tampil titik-titik tanda tangan (...)"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Lain-Lain (Bagian VI)
                </label>
                <textarea
                  rows={3}
                  value={formData.halaman3?.catatanLain || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      halaman3: { ...prev.halaman3, catatanLain: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Opsional. Biarkan kosong jika ingin tampil baris Catatan Lain-Lain standar."
                />
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM ACTION BUTTONS */}
        <div className="flex items-center justify-between border-t border-slate-200 mt-8 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 font-medium"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSave(formData, false)}
              className="px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg shadow-xs transition"
            >
              Simpan Dokumen
            </button>
            <button
              type="button"
              onClick={() => onSave(formData, true)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              Simpan & Preview Dokumen A4
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
