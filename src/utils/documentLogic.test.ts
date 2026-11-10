import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatNomorSurat,
  parseNomorUrut,
  getNextAvailableNomor,
  formatTanggalIndo,
  terbilangHari,
  hitungLamaHari,
  formatPangkatJabatanSPPD,
  getSyncedAcaraMaksud,
  getTanggalTandaTangan,
  generateNomorByOffset,
  expandDocumentPerPegawai,
  resolveSignatureStampConfig,
} from './documentLogic';
import { INITIAL_DOCUMENTS, INITIAL_PTK_LIST, INITIAL_SCHOOL_IDENTITY } from '../data/initialPTK';

test('formatNomorSurat replaces [NOMOR] and [TAHUN] correctly', () => {
  const template = '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]';
  const result = formatNomorSurat(template, ' 169 ', 2026);
  assert.equal(result, '400.3.10.8/ 169 /35.07.301.30.28/2026');

  const resultNum = formatNomorSurat(template, 170, 2026);
  assert.equal(resultNum, '400.3.10.8/170/35.07.301.30.28/2026');
});

test('parseNomorUrut extracts number from official document pattern', () => {
  assert.equal(parseNomorUrut('400.3.10.8/ 169 /35.07.301.30.28/2026'), 169);
  assert.equal(parseNomorUrut('400.3.10.8/167/35.07.301.30.28/2026'), 167);
  assert.equal(parseNomorUrut('400.3.10.8/ 005 /35.07.301.30.28/2026'), 5);
});

test('getNextAvailableNomor computes max + 1', () => {
  assert.equal(getNextAvailableNomor([167, 168, 169]), 170);
  assert.equal(getNextAvailableNomor([]), 1);
});

test('formatTanggalIndo formats dates in standard Indonesian kedinasan form', () => {
  // Test numeric format
  const dateStr = '2026-11-05T00:00:00';
  assert.equal(formatTanggalIndo(dateStr, { numericDash: true }), '05-11-2026');

  // Test full format with day
  const withDay = formatTanggalIndo(dateStr, { withDay: true });
  assert.ok(withDay.includes('November 2026'));
  assert.ok(withDay.includes('Kamis'));

  // Test standard format
  const standard = formatTanggalIndo(dateStr);
  assert.equal(standard, '5 November 2026');
});

test('terbilangHari produces correct Indonesian phrasing', () => {
  assert.equal(terbilangHari(1), '1 (satu) hari');
  assert.equal(terbilangHari(2), '2 (dua) hari');
  assert.equal(terbilangHari(3), '3 (tiga) hari');
  assert.equal(terbilangHari(14), '14 (empat belas) hari');
});

test('hitungLamaHari computes duration between dates', () => {
  assert.equal(hitungLamaHari('2026-11-05', '2026-11-05'), '1 (satu) hari');
  assert.equal(hitungLamaHari('2026-11-05', '2026-11-07'), '3 (tiga) hari');
});

test('formatPangkatJabatanSPPD removes Penata Muda / IX specifically for PPPK', () => {
  // Test PPPK with explicit status
  const pppk1 = {
    pangkatGol: 'Penata Muda / IX',
    jabatan: 'Ahli Pertama / Guru Kelas',
    statusKepegawaian: 'PPPK',
  };
  assert.equal(formatPangkatJabatanSPPD(pppk1), 'Ahli Pertama / Guru Kelas');

  // Test PPPK with Penata Muda / IX in pangkat
  const pppk2 = {
    pangkatGol: 'Penata Muda / IX',
    jabatan: 'Ahli Pertama / Guru Penjasorkes',
  };
  assert.equal(formatPangkatJabatanSPPD(pppk2), 'Ahli Pertama / Guru Penjasorkes');

  // Test PNS retains full Pangkat / Golongan / Jabatan
  const pns = {
    pangkatGol: 'Penata / IIIc',
    jabatan: 'Kepala Sekolah',
    statusKepegawaian: 'PNS',
  };
  assert.equal(formatPangkatJabatanSPPD(pns), 'Penata / IIIc / Kepala Sekolah');
});

test('getSyncedAcaraMaksud synchronizes acara (Hal 1) and maksud (Hal 2)', () => {
  const doc1 = { acara: 'Sosialisasi Upaya Pencegahan Korupsi', maksudPerjalanan: '' };
  assert.equal(getSyncedAcaraMaksud(doc1), 'Sosialisasi Upaya Pencegahan Korupsi');

  const doc2 = { acara: '', maksudPerjalanan: 'Bimtek Kurikulum Merdeka' };
  assert.equal(getSyncedAcaraMaksud(doc2), 'Bimtek Kurikulum Merdeka');
});

test('getTanggalTandaTangan returns editable signature date or fallback', () => {
  const docCustom = {
    tanggalSurat: '2026-11-05',
    tanggalTandaTangan: 'Kamis, 5 November 2026',
  };
  assert.equal(getTanggalTandaTangan(docCustom), 'Kamis, 5 November 2026');

  const docFallback = {
    tanggalSurat: '2026-11-05',
  };
  assert.equal(getTanggalTandaTangan(docFallback), '05-11-2026');
});

test('generateNomorByOffset increments sequential numbers while keeping spacing and padding', () => {
  assert.equal(
    generateNomorByOffset('400.3.10.8/ 169 /35.07.301.30.28/2026', 0),
    '400.3.10.8/ 169 /35.07.301.30.28/2026'
  );
  assert.equal(
    generateNomorByOffset('400.3.10.8/ 169 /35.07.301.30.28/2026', 1),
    '400.3.10.8/ 170 /35.07.301.30.28/2026'
  );
  assert.equal(
    generateNomorByOffset('400.3.10.8/005/35.07.301.30.28/2026', 2),
    '400.3.10.8/007/35.07.301.30.28/2026'
  );
});

test('expandDocumentPerPegawai matches ST/SPPD/Lampiran numbers and splits multi-employee packages sequentially', () => {
  const baseDoc = {
    ...INITIAL_DOCUMENTS[0],
    nomorSuratTugas: '400.3.10.8/ 170 /35.07.301.30.28/2026',
    nomorUrutSuratTugas: 170,
    daftarPegawai: [
      {
        id: 'p1',
        nama: INITIAL_PTK_LIST[0].nama,
        nip: INITIAL_PTK_LIST[0].nip,
        pangkatGol: INITIAL_PTK_LIST[0].pangkatGol,
        jabatan: INITIAL_PTK_LIST[0].jabatan,
        unitKerja: INITIAL_PTK_LIST[0].unitKerja,
        statusKepegawaian: INITIAL_PTK_LIST[0].statusKepegawaian,
      },
      {
        id: 'p2',
        nama: INITIAL_PTK_LIST[1].nama,
        nip: INITIAL_PTK_LIST[1].nip,
        pangkatGol: INITIAL_PTK_LIST[1].pangkatGol,
        jabatan: INITIAL_PTK_LIST[1].jabatan,
        unitKerja: INITIAL_PTK_LIST[1].unitKerja,
        statusKepegawaian: INITIAL_PTK_LIST[1].statusKepegawaian,
      },
      {
        id: 'p3',
        nama: INITIAL_PTK_LIST[2].nama,
        nip: INITIAL_PTK_LIST[2].nip,
        pangkatGol: INITIAL_PTK_LIST[2].pangkatGol,
        jabatan: INITIAL_PTK_LIST[2].jabatan,
        unitKerja: INITIAL_PTK_LIST[2].unitKerja,
        statusKepegawaian: INITIAL_PTK_LIST[2].statusKepegawaian,
      },
    ],
  };

  const expanded = expandDocumentPerPegawai(baseDoc);
  assert.equal(expanded.length, 3);

  assert.equal(expanded[0].nomorSuratTugas, '400.3.10.8/ 170 /35.07.301.30.28/2026');
  assert.equal(expanded[0].nomorSPPD, '400.3.10.8/ 170 /35.07.301.30.28/2026');
  assert.equal(expanded[0].lampiranSppdNomor, '400.3.10.8/ 170 /35.07.301.30.28/2026');
  assert.equal(expanded[0].daftarPegawai.length, 1);
  assert.equal(expanded[0].pegawaiUtama.nama, INITIAL_PTK_LIST[0].nama);

  assert.equal(expanded[1].nomorSuratTugas, '400.3.10.8/ 171 /35.07.301.30.28/2026');
  assert.equal(expanded[1].nomorSPPD, '400.3.10.8/ 171 /35.07.301.30.28/2026');
  assert.equal(expanded[1].lampiranSppdNomor, '400.3.10.8/ 171 /35.07.301.30.28/2026');
  assert.equal(expanded[1].pegawaiUtama.nama, INITIAL_PTK_LIST[1].nama);

  assert.equal(expanded[2].nomorSuratTugas, '400.3.10.8/ 172 /35.07.301.30.28/2026');
  assert.equal(expanded[2].nomorSPPD, '400.3.10.8/ 172 /35.07.301.30.28/2026');
  assert.equal(expanded[2].lampiranSppdNomor, '400.3.10.8/ 172 /35.07.301.30.28/2026');
  assert.equal(expanded[2].pegawaiUtama.nama, INITIAL_PTK_LIST[2].nama);
});

test('resolveSignatureStampConfig respects school settings and per-document overrides', () => {
  const schoolWithImages = {
    ...INITIAL_SCHOOL_IDENTITY,
    ttdImage: 'data:image/png;base64,AAA',
    tempelTtd: true,
    stempelImage: 'data:image/png;base64,BBB',
    tempelStempel: false,
  };

  const inherited = resolveSignatureStampConfig({}, schoolWithImages);
  assert.equal(inherited.showTtd, true);
  assert.equal(inherited.showStempel, false);

  const overridden = resolveSignatureStampConfig(
    { tempelTtd: false, tempelStempel: true },
    schoolWithImages
  );
  assert.equal(overridden.showTtd, false);
  assert.equal(overridden.showStempel, true);
});


