export interface PTKEmployee {
  id: string;
  nama: string;
  nuptk: string;
  jk: 'L' | 'P';
  tempatLahir: string;
  tanggalLahir: string;
  nip: string;
  statusKepegawaian: 'PNS' | 'PPPK' | 'GTT' | 'PTT';
  pangkatGol: string;
  gelarDepan?: string;
  gelarBelakang?: string;
  jenjang?: string;
  jurusan?: string;
  sertifikasi?: string;
  jabatan: string;
  nik?: string;
  unitKerja: string;
  tugasTambahan?: string;
  mengajar?: string;
}

export interface PejabatPemberiTugas {
  nama: string;
  nip: string;
  pangkatGolongan: string;
  jabatan: string;
  unitKerja: string;
  kecamatan: string;
}

export interface SchoolIdentity {
  pemda: string;
  dinas: string;
  namaSekolah: string;
  alamat: string;
  telepon: string;
  laman: string;
  email: string;
  kodePos: string;
  kabupaten: string;
  kepalaSekolah: PejabatPemberiTugas;
  ttdImage?: string; // Data URL PNG/JPG tanda tangan Kepala Sekolah
  tempelTtd?: boolean; // Pilihan tempel tanda tangan atau tidak
  stempelImage?: string; // Data URL PNG/JPG stempel sekolah
  tempelStempel?: boolean; // Pilihan tempel stempel sekolah atau tidak
}

export interface SuratTugasPegawai {
  id: string;
  nama: string;
  nip: string;
  pangkatGol: string;
  jabatan: string;
  unitKerja: string;
  statusKepegawaian?: 'PNS' | 'PPPK' | 'GTT' | 'PTT';
}

export interface Halaman3Data {
  isiOtomatis?: boolean;
  pejabatTujuanNama: string;
  pejabatTujuanNip: string;
  pejabatTujuanJabatan: string;
  catatanLain: string;
  transitAktif: boolean;
  transitTibaDi: string;
  transitTanggalTiba: string;
  transitPejabatTiba: string;
  transitNipTiba: string;
  transitBerangkatDari: string;
  transitKe: string;
  transitTanggalBerangkat: string;
  transitPejabatBerangkat: string;
  transitNipBerangkat: string;
  pemeriksaNama: string;
  pemeriksaNip: string;
}

export interface DocumentPackage {
  id: string;
  createdAt: string;
  updatedAt: string;
  tahun: number;
  
  // Nomor surat
  nomorSuratTugas: string;
  nomorUrutSuratTugas: number;
  nomorSPPD: string;
  nomorUrutSPPD: number;
  lembarKe: string;
  lampiranSppdNomor: string;
  lampiranKe: string;
  
  // Tanggal & Tempat
  tanggalSurat: string; // YYYY-MM-DD
  tempatSurat: string;
  tanggalTandaTangan?: string; // Tanggal di atas tanda tangan Kepala Sekolah yang dapat diedit bebas
  
  // Pejabat
  pejabatPemberiTugas: PejabatPemberiTugas;
  
  // Pegawai yang ditugaskan (Surat Tugas)
  daftarPegawai: SuratTugasPegawai[];
  
  // Kegiatan
  hariTanggalPelaksanaan: string;
  jamPelaksanaan: string;
  tempatTujuan: string;
  alamatTujuan?: string;
  acara: string;
  
  // SPPD spesifik
  pegawaiUtama: SuratTugasPegawai;
  pengikut: { nama: string; keterangan?: string }[];
  tempatAsal: string;
  lamaPerjalanan: string;
  tanggalBerangkat: string;
  tanggalKembali: string;
  maksudPerjalanan: string;
  bebanAnggaran: string;
  kodeRekening: string;
  keteranganLain: string;

  // Opsi Tanda Tangan & Stempel per dokumen (opsional, mewarisi pengaturan sekolah jika undefined)
  tempelTtd?: boolean;
  tempelStempel?: boolean;
  
  // Halaman 3 Lampiran SPPD
  halaman3: Halaman3Data;
}

export interface NumberingSettings {
  formatSuratTugas: string;
  formatSPPD: string;
  counterSuratTugas: number;
  counterSPPD: number;
  tahun: number;
}
