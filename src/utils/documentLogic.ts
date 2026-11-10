import { DocumentPackage, SchoolIdentity } from '../types';

/**
 * Pure logic helper functions for document numbering, dates, and formatting
 */

export const MONTH_NAMES_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const DAY_NAMES_ID = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

export function formatNomorSurat(
  template: string,
  nomorUrut: number | string,
  tahun: number | string
): string {
  if (!template) {
    template = '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]';
  }
  const nomorFormatted = typeof nomorUrut === 'number' ? nomorUrut.toString() : (nomorUrut || '001');
  return template
    .replace(/\[NOMOR\]/g, nomorFormatted)
    .replace(/\[TAHUN\]/g, tahun.toString());
}

export function parseNomorUrut(nomorStr: string): number {
  if (!nomorStr) return 0;
  // Match number surrounded by slashes or standalone: / 169 / or /169/
  const match = nomorStr.match(/\/(\s*[\d]+)\s*\//);
  if (match && match[1]) {
    return parseInt(match[1].trim(), 10);
  }
  const numbers = nomorStr.match(/\d+/g);
  if (numbers && numbers.length > 0) {
    // Return the second number if it has prefix like 400.3.10.8 / 169
    return parseInt(numbers[numbers.length > 1 ? 1 : 0], 10);
  }
  return 0;
}

export function getNextAvailableNomor(existingNumbers: number[]): number {
  if (!existingNumbers || existingNumbers.length === 0) return 1;
  const max = Math.max(...existingNumbers);
  return max + 1;
}

export function formatTanggalIndo(
  dateInput: string | Date,
  options?: { withDay?: boolean; numericDash?: boolean; padZero?: boolean }
): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return typeof dateInput === 'string' ? dateInput : '';

  const day = date.getDate();
  const dayPadded = day < 10 ? `0${day}` : `${day}`;
  const monthIdx = date.getMonth();
  const monthPadded = monthIdx + 1 < 10 ? `0${monthIdx + 1}` : `${monthIdx + 1}`;
  const year = date.getFullYear();

  if (options?.numericDash) {
    return `${dayPadded}-${monthPadded}-${year}`;
  }

  const dayName = DAY_NAMES_ID[date.getDay()];
  const monthName = MONTH_NAMES_ID[monthIdx];
  const dayStr = options?.padZero ? dayPadded : `${day}`;

  if (options?.withDay) {
    return `${dayName}, ${dayStr} ${monthName} ${year}`;
  }

  return `${dayStr} ${monthName} ${year}`;
}

const BILANGAN_INDONESIA = [
  'nol',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
  'sepuluh',
  'sebelas',
];

export function terbilangHari(jumlahHari: number): string {
  if (jumlahHari <= 0) return '1 (satu) hari';
  let kata = '';
  if (jumlahHari < 12) {
    kata = BILANGAN_INDONESIA[jumlahHari];
  } else if (jumlahHari < 20) {
    kata = `${BILANGAN_INDONESIA[jumlahHari - 10]} belas`;
  } else if (jumlahHari < 100) {
    const puluhan = Math.floor(jumlahHari / 10);
    const sisa = jumlahHari % 10;
    kata = `${BILANGAN_INDONESIA[puluhan]} puluh ${sisa > 0 ? BILANGAN_INDONESIA[sisa] : ''}`.trim();
  } else {
    kata = `${jumlahHari}`;
  }
  return `${jumlahHari} (${kata}) hari`;
}

export function hitungLamaHari(tglMulai: string, tglSelesai: string): string {
  if (!tglMulai || !tglSelesai) return '1 (satu) hari';
  const d1 = new Date(tglMulai);
  const d2 = new Date(tglSelesai);
  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '1 (satu) hari';

  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  const count = diffDays > 0 ? diffDays : 1;
  return terbilangHari(count);
}

/**
 * Format pangkat dan jabatan untuk output Poin 3 pada Halaman 2 (SPPD).
 * Ketentuan khusus: hilangkan "Penata muda / IX" untuk pegawai PPPK.
 */
export function formatPangkatJabatanSPPD(peg?: {
  pangkatGol?: string;
  jabatan?: string;
  statusKepegawaian?: string;
}): string {
  if (!peg) return '-';
  const isPPPK =
    peg.statusKepegawaian === 'PPPK' ||
    (peg.pangkatGol && /penata\s*muda\s*\/?\s*ix/i.test(peg.pangkatGol)) ||
    (peg.pangkatGol && /\b(ix|golongan\s*ix)\b/i.test(peg.pangkatGol));

  if (isPPPK) {
    // Hilangkan "Penata muda / IX" khusus PPPK pada output hal 2 SPPD
    return peg.jabatan || '-';
  }

  if (peg.pangkatGol && peg.jabatan) {
    return `${peg.pangkatGol} / ${peg.jabatan}`;
  }
  return peg.pangkatGol || peg.jabatan || '-';
}

/**
 * Sinkronisasi teks acara (Halaman 1) dan maksud perjalanan dinas (Halaman 2 SPPD)
 */
export function getSyncedAcaraMaksud(doc?: { acara?: string; maksudPerjalanan?: string }): string {
  if (!doc) return '';
  return doc.acara || doc.maksudPerjalanan || '';
}

/**
 * Mendapatkan teks tanggal di atas tanda tangan Kepala Sekolah yang dapat diedit bebas
 */
export function getTanggalTandaTangan(doc?: { tanggalSurat?: string; tanggalTandaTangan?: string }): string {
  if (doc?.tanggalTandaTangan && doc.tanggalTandaTangan.trim() !== '') {
    return doc.tanggalTandaTangan.trim();
  }
  return formatTanggalIndo(doc?.tanggalSurat || '', { numericDash: true });
}

/**
 * Menghasilkan nomor surat berurutan berdasarkan offset (0, 1, 2, ...) dengan mempertahankan
 * spasi dan padding nol di sekitar nomor urut pada string nomor surat.
 */
export function generateNomorByOffset(baseNomor: string, offset: number): string {
  if (!baseNomor) return '';
  if (offset === 0) return baseNomor;

  // Cari angka urut yang diapit garis miring, misal: / 169 / atau /169/ atau / 005 /
  const slashMatch = baseNomor.match(/\/(\s*)(\d+)(\s*)\//);
  if (slashMatch && slashMatch.index !== undefined) {
    const leadingSpace = slashMatch[1];
    const numStr = slashMatch[2];
    const trailingSpace = slashMatch[3];
    const baseNum = parseInt(numStr, 10);
    const nextNum = Math.max(1, baseNum + offset);
    const padded = numStr.startsWith('0') && numStr.length > 1
      ? nextNum.toString().padStart(numStr.length, '0')
      : nextNum.toString();

    const replacement = `/${leadingSpace}${padded}${trailingSpace}/`;
    return (
      baseNomor.slice(0, slashMatch.index) +
      replacement +
      baseNomor.slice(slashMatch.index + slashMatch[0].length)
    );
  }

  // Fallback jika tidak ada format /.../
  const baseUrut = parseNomorUrut(baseNomor);
  if (baseUrut > 0) {
    const nextNum = baseUrut + offset;
    return baseNomor.replace(baseUrut.toString(), nextNum.toString());
  }
  return `${baseNomor}-${offset + 1}`;
}

/**
 * Memecah satu dokumen menjadi daftar paket dokumen per pegawai:
 * - Nomor Surat Tugas == Nomor SPPD == Nomor Lampiran SPPD
 * - Jika pegawai > 1, masing-masing pegawai mendapatkan 1 set dokumen lengkap (ST, SPPD, Lampiran SPPD)
 *   dengan nomor urut berurutan (169, 170, 171, ...).
 */
export function expandDocumentPerPegawai(doc: DocumentPackage): DocumentPackage[] {
  const baseNomor = doc.nomorSuratTugas || doc.nomorSPPD || '';
  const baseUrut = doc.nomorUrutSuratTugas || parseNomorUrut(baseNomor) || 1;
  const pegawaiList = doc.daftarPegawai && doc.daftarPegawai.length > 0
    ? doc.daftarPegawai
    : doc.pegawaiUtama?.nama
    ? [doc.pegawaiUtama]
    : [];

  if (pegawaiList.length === 0) {
    return [
      {
        ...doc,
        nomorSuratTugas: baseNomor,
        nomorUrutSuratTugas: baseUrut,
        nomorSPPD: baseNomor,
        nomorUrutSPPD: baseUrut,
        lampiranSppdNomor: baseNomor,
      },
    ];
  }

  return pegawaiList.map((peg, idx) => {
    const nomorPegawai = generateNomorByOffset(baseNomor, idx);
    const urutPegawai = baseUrut + idx;
    return {
      ...doc,
      id: pegawaiList.length > 1 ? `${doc.id}-peg-${idx + 1}` : doc.id,
      nomorSuratTugas: nomorPegawai,
      nomorUrutSuratTugas: urutPegawai,
      nomorSPPD: nomorPegawai,
      nomorUrutSPPD: urutPegawai,
      lampiranSppdNomor: nomorPegawai,
      daftarPegawai: [peg],
      pegawaiUtama: peg,
      pengikut: [],
    };
  });
}

/**
 * Menentukan apakah tanda tangan Kepala Sekolah dan stempel sekolah ditempel pada dokumen.
 */
export function resolveSignatureStampConfig(
  doc: Pick<DocumentPackage, 'tempelTtd' | 'tempelStempel'>,
  school: Pick<SchoolIdentity, 'ttdImage' | 'tempelTtd' | 'stempelImage' | 'tempelStempel'>
): {
  showTtd: boolean;
  ttdImage?: string;
  showStempel: boolean;
  stempelImage?: string;
} {
  const wantTtd = doc.tempelTtd !== undefined ? doc.tempelTtd : Boolean(school.tempelTtd);
  const wantStempel = doc.tempelStempel !== undefined ? doc.tempelStempel : Boolean(school.tempelStempel);

  return {
    showTtd: wantTtd && Boolean(school.ttdImage),
    ttdImage: school.ttdImage,
    showStempel: wantStempel && Boolean(school.stempelImage),
    stempelImage: school.stempelImage,
  };
}

