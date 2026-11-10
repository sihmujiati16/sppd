import React, { useState, useRef } from 'react';
import { PTKEmployee, SchoolIdentity } from '../types';
import * as XLSX from 'xlsx';
import {
  Users,
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  Upload,
  Edit2,
  Trash2,
  CheckCircle,
  GraduationCap,
  Briefcase,
  IdCard,
  X,
  Eye,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

interface PTKManagementProps {
  ptkList: PTKEmployee[];
  school: SchoolIdentity;
  onUpdatePTKList: (newList: PTKEmployee[]) => void;
  onSelectForSurat?: (ptk: PTKEmployee) => void;
}

export const PTKManagement: React.FC<PTKManagementProps> = ({
  ptkList,
  school,
  onUpdatePTKList,
  onSelectForSurat,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PNS' | 'PPPK'>('ALL');
  const [selectedPTK, setSelectedPTK] = useState<PTKEmployee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [ptkToDelete, setPtkToDelete] = useState<{ id: string; nama: string } | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<PTKEmployee>>({});

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = ptkList.filter((p) => {
    const matchesSearch =
      p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nip.includes(searchQuery) ||
      p.nuptk.includes(searchQuery) ||
      p.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ? true : p.statusKepegawaian === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenEdit = (ptk: PTKEmployee) => {
    setFormData({ ...ptk });
    setIsEditing(true);
    setIsAddingNew(false);
  };

  const handleOpenAdd = () => {
    setFormData({
      id: `ptk-${Date.now()}`,
      nama: '',
      nuptk: '',
      jk: 'L',
      tempatLahir: 'Malang',
      tanggalLahir: '1990-01-01',
      nip: '',
      statusKepegawaian: 'PPPK',
      pangkatGol: 'Penata Muda / IX',
      jabatan: 'Ahli Pertama / Guru Kelas',
      unitKerja: school.namaSekolah,
    });
    setIsAddingNew(true);
    setIsEditing(true);
  };

  const handleSavePTK = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.nama.trim()) {
      showToast('error', 'Nama pegawai wajib diisi.');
      return;
    }

    if (isAddingNew) {
      const newRecord = {
        ...formData,
        id: `ptk-${Date.now()}`,
        unitKerja: formData.unitKerja || school.namaSekolah,
      } as PTKEmployee;
      onUpdatePTKList([...ptkList, newRecord]);
      showToast('success', `Data pegawai ${newRecord.nama} berhasil ditambahkan.`);
    } else {
      const updated = ptkList.map((p) =>
        p.id === formData.id ? ({ ...p, ...formData } as PTKEmployee) : p
      );
      onUpdatePTKList(updated);
      showToast('success', `Data pegawai ${formData.nama} berhasil diperbarui.`);
    }

    setIsEditing(false);
    setIsAddingNew(false);
    setSelectedPTK(null);
  };

  const handleConfirmDeletePTK = () => {
    if (!ptkToDelete) return;
    onUpdatePTKList(ptkList.filter((p) => p.id !== ptkToDelete.id));
    if (selectedPTK?.id === ptkToDelete.id) setSelectedPTK(null);
    showToast('success', `${ptkToDelete.nama} berhasil dihapus dari daftar PTK.`);
    setPtkToDelete(null);
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json<any>(ws);

        if (!data || data.length === 0) {
          showToast('error', 'File Excel kosong atau tidak terbaca.');
          return;
        }

        const newImported: PTKEmployee[] = data.map((row, idx) => ({
          id: `ptk-imp-${Date.now()}-${idx}`,
          nama: row['Nama'] || row['NAMA'] || row['nama'] || `Pegawai ${idx + 1}`,
          nuptk: String(row['NUPTK'] || row['nuptk'] || ''),
          jk: (row['JK'] || 'L') as 'L' | 'P',
          tempatLahir: row['Tempat Lahir'] || row['tempat_lahir'] || 'Malang',
          tanggalLahir: row['Tanggal Lahir'] || '1990-01-01',
          nip: String(row['NIP'] || row['nip'] || ''),
          statusKepegawaian: (row['Status Kepegawaian'] || 'PPPK') as any,
          pangkatGol: row['Pangkat/Gol'] || row['Pangkat'] || 'Penata Muda / IX',
          jabatan: row['Jabatan PTK'] || row['Jabatan'] || 'Guru Kelas',
          unitKerja: school.namaSekolah,
          nik: String(row['NIK'] || ''),
        }));

        onUpdatePTKList([...ptkList, ...newImported]);
        showToast('success', `Berhasil mengimpor ${newImported.length} data pegawai dari Excel.`);
      } catch (err) {
        console.error('Import error:', err);
        showToast('error', 'Gagal membaca file Excel. Pastikan format file .xlsx valid.');
      }
    };
    reader.readAsBinaryString(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      ptkList.map((p, idx) => ({
        No: idx + 1,
        Nama: p.nama,
        NIP: p.nip,
        NUPTK: p.nuptk,
        'Status Kepegawaian': p.statusKepegawaian,
        'Pangkat/Gol': p.pangkatGol,
        Jabatan: p.jabatan,
        'Unit Kerja': p.unitKerja,
        'Tugas Tambahan': p.tugasTambahan || '-',
        Mengajar: p.mengajar || '-',
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Daftar PTK');
    XLSX.writeFile(wb, 'Daftar_PTK_SDN1_Pujiharjo.xlsx');
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs md:text-sm ${
            toast.type === 'success'
              ? 'bg-slate-900 text-white border-slate-700'
              : 'bg-red-950 text-red-100 border-red-700'
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
      {/* Top Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Data Guru dan Tenaga Kependidikan
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Database resmi Pendidik & Tenaga Kependidikan (PTK) SD Negeri 1 Pujiharjo (Lampiran 3).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".xlsx, .xls"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="Import data PTK dari file Excel (.xlsx)"
          >
            <Upload className="w-3.5 h-3.5" />
            Import Excel
          </button>
          <button
            onClick={handleExportExcel}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="Export data ke Excel"
          >
            <Download className="w-3.5 h-3.5" />
            Export Excel
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + Tambah Guru / PTK
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama, NIP, NUPTK, atau jabatan..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === 'ALL' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600'
            }`}
          >
            Semua ({ptkList.length})
          </button>
          <button
            onClick={() => setStatusFilter('PNS')}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === 'PNS' ? 'bg-white shadow-xs text-purple-700 font-bold' : 'text-slate-600'
            }`}
          >
            PNS ({ptkList.filter((p) => p.statusKepegawaian === 'PNS').length})
          </button>
          <button
            onClick={() => setStatusFilter('PPPK')}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === 'PPPK' ? 'bg-white shadow-xs text-emerald-700 font-bold' : 'text-slate-600'
            }`}
          >
            PPPK ({ptkList.filter((p) => p.statusKepegawaian === 'PPPK').length})
          </button>
        </div>
      </div>

      {/* PTK Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-bold">
              <tr>
                <th className="px-4 py-3 text-center w-12">No</th>
                <th className="px-4 py-3">Nama Lengkap & Gelar</th>
                <th className="px-4 py-3">NIP / NUPTK</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Pangkat / Golongan</th>
                <th className="px-4 py-3">Jabatan & Tugas</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((ptk, index) => (
                <tr key={ptk.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3 text-center font-medium text-slate-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{ptk.nama}</div>
                    <div className="text-[11px] text-slate-500">
                      TTL: {ptk.tempatLahir}, {ptk.tanggalLahir}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono">
                    <div className="text-slate-800 font-medium">NIP: {ptk.nip || '-'}</div>
                    <div className="text-[11px] text-slate-500">NUPTK: {ptk.nuptk || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ptk.statusKepegawaian === 'PNS'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ptk.statusKepegawaian}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {ptk.pangkatGol}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{ptk.jabatan}</div>
                    {ptk.tugasTambahan && (
                      <div className="text-[11px] text-slate-500 truncate max-w-xs" title={ptk.tugasTambahan}>
                        {ptk.tugasTambahan}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedPTK(ptk)}
                        className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Lihat Detail Lengkap"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(ptk)}
                        className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Edit Data PTK"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPtkToDelete({ id: ptk.id, nama: ptk.nama })}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Hapus Pegawai"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedPTK && !isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative animate-in fade-in duration-150">
            <button
              onClick={() => setSelectedPTK(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                {selectedPTK.nama.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedPTK.nama}</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                  {selectedPTK.statusKepegawaian} • {selectedPTK.jabatan}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs md:text-sm border-t pt-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">NIP</span>
                <span className="col-span-2 font-mono font-medium">{selectedPTK.nip || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">NUPTK</span>
                <span className="col-span-2 font-mono">{selectedPTK.nuptk || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Pangkat / Golongan</span>
                <span className="col-span-2 font-medium">{selectedPTK.pangkatGol}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Tempat, Tgl Lahir</span>
                <span className="col-span-2">
                  {selectedPTK.tempatLahir}, {selectedPTK.tanggalLahir}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Pendidikan & Jurusan</span>
                <span className="col-span-2">
                  {selectedPTK.jenjang || 'S1'} {selectedPTK.jurusan}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Sertifikasi</span>
                <span className="col-span-2">{selectedPTK.sertifikasi || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Unit Kerja</span>
                <span className="col-span-2">{selectedPTK.unitKerja}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Tugas Tambahan</span>
                <span className="col-span-2 text-slate-700">{selectedPTK.tugasTambahan || '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-slate-500">Mengajar</span>
                <span className="col-span-2 text-slate-700">{selectedPTK.mengajar || '-'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t pt-4">
              <button
                onClick={() => handleOpenEdit(selectedPTK)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition"
              >
                Edit Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / ADD MODAL */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsEditing(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b">
              {isAddingNew ? 'Tambah Pegawai Baru' : 'Edit Data Pegawai'}
            </h3>

            <form onSubmit={handleSavePTK} className="space-y-4 text-xs md:text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap (beserta Gelar) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nama || ''}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Contoh: Halimatus Sa'diyah, S.Pd."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={formData.nip || ''}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    placeholder="199004122023212046"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NUPTK</label>
                  <input
                    type="text"
                    value={formData.nuptk || ''}
                    onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    placeholder="2744768668220002"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Kepegawaian</label>
                  <select
                    value={formData.statusKepegawaian || 'PPPK'}
                    onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="PNS">PNS</option>
                    <option value="PPPK">PPPK</option>
                    <option value="GTT">GTT</option>
                    <option value="PTT">PTT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pangkat / Golongan</label>
                  <input
                    type="text"
                    value={formData.pangkatGol || ''}
                    onChange={(e) => setFormData({ ...formData, pangkatGol: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Penata Muda / IX atau Penata / IIIc"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    value={formData.jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ahli Pertama / Guru Kelas"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Kerja</label>
                  <input
                    type="text"
                    value={formData.unitKerja || school.namaSekolah}
                    onChange={(e) => setFormData({ ...formData, unitKerja: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={formData.tempatLahir || ''}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={formData.tanggalLahir || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSavePTK}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-500 transition shadow-sm cursor-pointer"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PTK CONFIRMATION MODAL */}
      {ptkToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPtkToDelete(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              aria-label="Tutup dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Hapus Data Pegawai?</h3>
                <p className="text-xs text-slate-500">
                  Yakin ingin menghapus <strong>{ptkToDelete.nama}</strong> dari daftar PTK?
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPtkToDelete(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeletePTK}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Ya, Hapus Pegawai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
