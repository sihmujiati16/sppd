import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak,
  ImageRun,
} from 'docx';
import { DocumentPackage, SchoolIdentity } from '../types';
import {
  formatTanggalIndo,
  formatPangkatJabatanSPPD,
  getSyncedAcaraMaksud,
  getTanggalTandaTangan,
  expandDocumentPerPegawai,
  resolveSignatureStampConfig,
} from './documentLogic';
import { normalizeSquarePngDataUrl } from './imageUtils';

interface PreparedDocxImage {
  data: Uint8Array;
  type: 'png' | 'jpg';
  width: number;
  height: number;
}

// 4 cm pada 96 DPI = (4 / 2.54) * 96 = 151.18 px
const DOCX_4CM_PX = 151;

async function prepareImageFromDataUrl(
  dataUrl: string | undefined,
  boxSizePx: number = DOCX_4CM_PX
): Promise<PreparedDocxImage | null> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return null;

  try {
    // Gambar ulang ke kanvas persegi transparan agar dimensi fisik tepat 4 cm x 4 cm
    // tanpa merusak rasio aspek asli tanda tangan maupun stempel.
    const squarePngDataUrl = await normalizeSquarePngDataUrl(dataUrl, 400);

    const [, base64] = squarePngDataUrl.split(',');
    if (!base64) return null;

    const binaryStr = atob(base64);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    return {
      data: bytes,
      type: 'png',
      width: boxSizePx,
      height: boxSizePx,
    };
  } catch {
    return null;
  }
}

function buildSignatureSpacerOrImages(
  stempelImg: PreparedDocxImage | null,
  ttdImg: PreparedDocxImage | null,
  alignment: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.RIGHT
): Paragraph {
  const imageRuns: (ImageRun | TextRun)[] = [];

  if (stempelImg) {
    imageRuns.push(
      new ImageRun({
        type: stempelImg.type,
        data: stempelImg.data,
        transformation: { width: stempelImg.width, height: stempelImg.height },
      })
    );
  }

  if (stempelImg && ttdImg) {
    imageRuns.push(new TextRun({ text: '  ', size: 16 }));
  }

  if (ttdImg) {
    imageRuns.push(
      new ImageRun({
        type: ttdImg.type,
        data: ttdImg.data,
        transformation: { width: ttdImg.width, height: ttdImg.height },
      })
    );
  }

  if (imageRuns.length === 0) {
    return new Paragraph({
      spacing: { after: 600 },
      children: [new TextRun({ text: '' })],
    });
  }

  return new Paragraph({
    alignment,
    spacing: { before: 40, after: 40 },
    children: imageRuns,
  });
}

async function buildPackageChildren(
  docData: DocumentPackage,
  school: SchoolIdentity,
  singlePage?: 1 | 2 | 3
): Promise<(Paragraph | Table)[]> {
  const tglIndoFormatted = formatTanggalIndo(docData.tanggalSurat);
  const displayTanggalTtd = getTanggalTandaTangan(docData);
  const syncedAcaraMaksud = getSyncedAcaraMaksud(docData);

  const sigConfig = resolveSignatureStampConfig(docData, school);
  const [ttdPrepared, stempelPrepared] = await Promise.all([
    sigConfig.showTtd ? prepareImageFromDataUrl(sigConfig.ttdImage, DOCX_4CM_PX) : Promise.resolve(null),
    sigConfig.showStempel ? prepareImageFromDataUrl(sigConfig.stempelImage, DOCX_4CM_PX) : Promise.resolve(null),
  ]);

  const createKopSurat = () => [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: school.pemda,
          size: 24,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: school.dinas,
          size: 24,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: school.namaSekolah,
          bold: true,
          size: 28,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 30 },
      children: [
        new TextRun({
          text: school.alamat,
          size: 18,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: `Telepon: ${school.telepon}, Laman: `,
          size: 17,
          font: 'Arial',
        }),
        new TextRun({
          text: school.laman,
          underline: {},
          size: 17,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      border: {
        bottom: {
          style: BorderStyle.DOUBLE,
          size: 16,
          color: '000000',
        },
      },
      children: [
        new TextRun({
          text: `Pos-el: `,
          size: 17,
          font: 'Arial',
        }),
        new TextRun({
          text: school.email,
          underline: {},
          size: 17,
          font: 'Arial',
        }),
        new TextRun({
          text: `, Kode Pos: ${school.kodePos}`,
          size: 17,
          font: 'Arial',
        }),
      ],
    }),
  ];

  // PAGE 1: SURAT TUGAS
  const page1Children: (Paragraph | Table)[] = [
    ...createKopSurat(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 100, after: 30 },
      children: [
        new TextRun({
          text: 'SURAT TUGAS',
          bold: true,
          underline: {},
          size: 24,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: `Nomor: ${docData.nomorSuratTugas}`,
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'Yang bertanda tangan di bawah ini:',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: 'Nama\t: ', size: 22, font: 'Arial' }),
        new TextRun({ text: docData.pejabatPemberiTugas.nama, bold: true, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `NIP\t: ${docData.pejabatPemberiTugas.nip}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `Pangkat/golongan\t: ${docData.pejabatPemberiTugas.pangkatGolongan}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `Unit kerja\t: ${docData.pejabatPemberiTugas.unitKerja}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `Kecamatan\t: ${docData.pejabatPemberiTugas.kecamatan}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: 'memberikan tugas kepada Saudara:',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            new TableCell({
              width: { size: 8, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'No', bold: true, size: 20, font: 'Arial' })] })],
            }),
            new TableCell({
              width: { size: 27, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Nama', bold: true, size: 20, font: 'Arial' })] })],
            }),
            new TableCell({
              width: { size: 25, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'NIP', bold: true, size: 20, font: 'Arial' })] })],
            }),
            new TableCell({
              width: { size: 22, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Jabatan', bold: true, size: 20, font: 'Arial' })] })],
            }),
            new TableCell({
              width: { size: 18, type: WidthType.PERCENTAGE },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Unit Kerja', bold: true, size: 20, font: 'Arial' })] })],
            }),
          ],
        }),
        ...docData.daftarPegawai.map((peg, idx) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${idx + 1}`, size: 20, font: 'Arial' })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: peg.nama, size: 20, font: 'Arial' })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: peg.nip || '-', size: 20, font: 'Arial' })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: peg.jabatan, size: 20, font: 'Arial' })] })],
              }),
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: peg.unitKerja, size: 20, font: 'Arial' })] })],
              }),
            ],
          })
        ),
      ],
    }),
    new Paragraph({
      spacing: { before: 140, after: 60 },
      children: [
        new TextRun({
          text: 'untuk melaksanakan tugas dinas keluar pada:',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `hari, tanggal\t: ${docData.hariTanggalPelaksanaan}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `jam\t: ${docData.jamPelaksanaan}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 40 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `tempat\t: ${docData.tempatTujuan}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 120 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: `acara\t: ${syncedAcaraMaksud}`, size: 22, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: 'Demikian surat tugas ini kami buat untuk dilaksanakan dengan sebaik-baiknya dan penuh tanggungjawab.',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 30 },
      children: [
        new TextRun({
          text: `${docData.tempatSurat}, ${displayTanggalTtd}`,
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: 'Kepala\nSD Negeri 1 Pujiharjo',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    buildSignatureSpacerOrImages(stempelPrepared, ttdPrepared, AlignmentType.RIGHT),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: docData.pejabatPemberiTugas.nama,
          bold: true,
          underline: {},
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `NIP. ${docData.pejabatPemberiTugas.nip}`,
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
  ];

  // PAGE 2: SPPD
  const primaryPeg = docData.pegawaiUtama || docData.daftarPegawai[0] || {
    nama: school.kepalaSekolah.nama,
    nip: school.kepalaSekolah.nip,
    pangkatGol: school.kepalaSekolah.pangkatGolongan,
    jabatan: school.kepalaSekolah.jabatan,
    unitKerja: school.kepalaSekolah.unitKerja,
  };
  const displayPangkatJabatan = formatPangkatJabatanSPPD(primaryPeg);

  const page2Children: (Paragraph | Table)[] = [
    ...createKopSurat(),
    new Paragraph({
      spacing: { before: 80, after: 30 },
      children: [
        new TextRun({ text: `Nomor\t: ${docData.nomorSPPD}`, size: 20, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({ text: `Lembar ke\t: ${docData.lembarKe || 'I'}`, size: 20, font: 'Arial' }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [
        new TextRun({
          text: 'SURAT PERINTAH PERJALANAN DINAS (SPPD)',
          bold: true,
          size: 24,
          font: 'Arial',
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({ width: { size: 5, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: '1.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ width: { size: 45, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: 'Pejabat yang memberikan perintah melaksanakan Perjalanan Dinas', size: 20, font: 'Arial' })] })] }),
            new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `: ${docData.pejabatPemberiTugas.jabatan} ${docData.pejabatPemberiTugas.unitKerja}`, bold: true, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '2.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama Pegawai/ Pejabat yang Melaksanakan Perjalanan Dinas', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${primaryPeg.nama}`, bold: true, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '3.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jabatan Pangkat dan Golongan Ruang, NIP dari Pegawai/ Pejabat yang Melaksanakan Perjalanan Dinas', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${displayPangkatJabatan}\n  NIP. ${primaryPeg.nip || '-'}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '4.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perjalanan Dinas Pegawai/ Pejabat yang Melaksanakan Perjalanan Dinas', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: Dari : ${docData.tempatAsal || 'SD Negeri 1 Pujiharjo'}\n  K e : ${docData.tempatTujuan}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '5.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Nama Pegawai/ Pejabat yang Mendampingi', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${docData.pengikut && docData.pengikut.length > 0 ? docData.pengikut.map(p => p.nama).join(', ') : '-'}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '6.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Jabatan, Pangkat dan Golongan Ruang NIP dari Pegawai yang Mendampingi', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${docData.pengikut && docData.pengikut.length > 0 ? docData.pengikut.map(p => p.keterangan || '').filter(Boolean).join(', ') || '-' : '-'}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '7.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perjalanan Dinas Direncanakan', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${docData.lamaPerjalanan || '1 (satu) hari'}\n  Tanggal : ${docData.tanggalBerangkat || tglIndoFormatted}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '8.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Maksud Mengadakan Perjalanan', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${syncedAcaraMaksud}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '9.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Perhitungan Biaya Perjalanan', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: Atas Beban : ${docData.bebanAnggaran || 'Anggaran BOSP-Reg SD Negeri 1 Pujiharjo'}\n  Kode Rekening : ${docData.kodeRekening || '-'}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: '10.', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Keterangan', size: 20, font: 'Arial' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `: ${docData.keteranganLain || '-'}`, size: 20, font: 'Arial' })] })] }),
          ],
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { before: 140, after: 30 },
      children: [
        new TextRun({
          text: `${docData.tempatSurat}, ${displayTanggalTtd}`,
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      spacing: { after: 20 },
      children: [
        new TextRun({
          text: 'Kepala\nSD Negeri 1 Pujiharjo',
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    buildSignatureSpacerOrImages(stempelPrepared, ttdPrepared, AlignmentType.RIGHT),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: docData.pejabatPemberiTugas.nama,
          bold: true,
          underline: {},
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({
          text: `NIP. ${docData.pejabatPemberiTugas.nip}`,
          size: 22,
          font: 'Arial',
        }),
      ],
    }),
  ];

  // PAGE 3: LAMPIRAN SPPD (Sesuai SPPD Lembar 2 Kosongan: Bagian I s.d. VII)
  const tempatKedudukan = docData.tempatAsal || school.kepalaSekolah.unitKerja || 'SD Negeri 1 Pujiharjo';
  const isiOtomatis = Boolean(docData.halaman3?.isiOtomatis);
  const tglBerangkat = docData.tanggalBerangkat || tglIndoFormatted;
  const tglKembali = docData.tanggalKembali || tglIndoFormatted;

  const p3CellMargins = { top: 70, bottom: 70, left: 100, right: 100 };

  const buildDocxTibaBerangkatRow = (
    roman: 'II.' | 'III.' | 'IV.',
    left?: { tibaDi?: string; tanggal?: string; kepala?: string; nama?: string; nip?: string },
    right?: { berangkatDari?: string; ke?: string; tanggal?: string; kepala?: string; nama?: string; nip?: string }
  ) =>
    new TableRow({
      children: [
        new TableCell({
          columnSpan: 2,
          margins: p3CellMargins,
          children: [
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `${roman}  Tiba di\t: ${left?.tibaDi || '.......................'}\n     Pada Tanggal\t: ${left?.tanggal || '.......................'}\n     Kepala\t: ${left?.kepala || '.......................'}`,
                  size: 18,
                  font: 'Arial',
                }),
              ],
            }),
            new Paragraph({
              spacing: { before: 420, after: 0 },
              indent: { left: 260 },
              children: [
                new TextRun({
                  text: `(${left?.nama || '.......................'})`,
                  bold: Boolean(left?.nama),
                  size: 18,
                  font: 'Arial',
                }),
                new TextRun({
                  text: `\n${left?.nip ? `NIP. ${left.nip}` : 'NIP'}`,
                  size: 18,
                  font: 'Arial',
                }),
              ],
            }),
          ],
        }),
        new TableCell({
          margins: p3CellMargins,
          children: [
            new Paragraph({
              spacing: { after: 30 },
              children: [
                new TextRun({
                  text: `Berangkat dari\t: ${right?.berangkatDari || '.................'}\nKe\t: ${right?.ke || '.................'}\nPada Tanggal\t: ${right?.tanggal || '.................'}\nKepala\t: ${right?.kepala || '.................'}`,
                  size: 18,
                  font: 'Arial',
                }),
              ],
            }),
            new Paragraph({
              spacing: { before: 280, after: 0 },
              children: [
                new TextRun({
                  text: `(${right?.nama || '............................'})`,
                  bold: Boolean(right?.nama),
                  size: 18,
                  font: 'Arial',
                }),
                new TextRun({
                  text: `\n${right?.nip ? `NIP. ${right.nip}` : 'NIP'}`,
                  size: 18,
                  font: 'Arial',
                }),
              ],
            }),
          ],
        }),
      ],
    });

  const rowII = isiOtomatis
    ? {
        left: {
          tibaDi: docData.tempatTujuan || '.......................',
          tanggal: tglBerangkat || '.......................',
          kepala: docData.halaman3?.pejabatTujuanJabatan || '.......................',
          nama: docData.halaman3?.pejabatTujuanNama || '',
          nip: docData.halaman3?.pejabatTujuanNip || '',
        },
        right: {
          berangkatDari: docData.tempatTujuan || '.................',
          ke: tempatKedudukan || '.................',
          tanggal: tglKembali || '.................',
          kepala: docData.halaman3?.pejabatTujuanJabatan || '.................',
          nama: docData.halaman3?.pejabatTujuanNama || '',
          nip: docData.halaman3?.pejabatTujuanNip || '',
        },
      }
    : undefined;

  const rowIII =
    isiOtomatis && docData.halaman3?.transitAktif
      ? {
          left: {
            tibaDi: docData.halaman3.transitTibaDi || '.......................',
            tanggal: docData.halaman3.transitTanggalTiba || '.......................',
            kepala: docData.halaman3.transitPejabatTiba || '.......................',
            nama: '',
            nip: docData.halaman3.transitNipTiba || '',
          },
          right: {
            berangkatDari: docData.halaman3.transitBerangkatDari || '.................',
            ke: docData.halaman3.transitKe || '.................',
            tanggal: docData.halaman3.transitTanggalBerangkat || '.................',
            kepala: docData.halaman3.transitPejabatBerangkat || '.................',
            nama: '',
            nip: docData.halaman3.transitNipBerangkat || '',
          },
        }
      : undefined;

  const page3Children: (Paragraph | Table)[] = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [550, 4250, 4800],
      rows: [
        // BAGIAN I
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              margins: p3CellMargins,
              children: [new Paragraph({ children: [new TextRun({ text: '' })] })],
            }),
            new TableCell({
              margins: p3CellMargins,
              children: [
                new Paragraph({
                  spacing: { after: 20 },
                  children: [
                    new TextRun({
                      text: `I.  Berangkat dari\t: ${tempatKedudukan}\n    (Tempat Kedudukan)\n    Ke\t: ${isiOtomatis ? docData.tempatTujuan || '.................' : '.................'}\n    Pada Tanggal\t: ${isiOtomatis ? tglBerangkat || '.................' : '.................'}\n    Kepala`,
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
                buildSignatureSpacerOrImages(stempelPrepared, ttdPrepared, AlignmentType.LEFT),
                new Paragraph({
                  spacing: { after: 0 },
                  indent: { left: 220 },
                  children: [
                    new TextRun({
                      text: `(${docData.pejabatPemberiTugas.nama})`,
                      bold: true,
                      size: 18,
                      font: 'Arial',
                    }),
                    new TextRun({
                      text: `\nNIP. ${docData.pejabatPemberiTugas.nip}`,
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // BAGIAN II, III, IV
        buildDocxTibaBerangkatRow('II.', rowII?.left, rowII?.right),
        buildDocxTibaBerangkatRow('III.', rowIII?.left, rowIII?.right),
        buildDocxTibaBerangkatRow('IV.'),
        // BAGIAN V
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              margins: p3CellMargins,
              children: [
                new Paragraph({
                  spacing: { after: 20 },
                  children: [
                    new TextRun({
                      text: `V.  Tiba di\t: ${isiOtomatis ? tempatKedudukan : '.......................'}\n     Pada Tanggal\t: ${isiOtomatis ? tglKembali || '.......................' : '.......................'}\n     Kepala\t: ${tempatKedudukan}`,
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
                buildSignatureSpacerOrImages(null, null, AlignmentType.LEFT),
                new Paragraph({
                  spacing: { after: 0 },
                  indent: { left: 260 },
                  children: [
                    new TextRun({
                      text: `(${docData.pejabatPemberiTugas.nama})`,
                      bold: true,
                      size: 18,
                      font: 'Arial',
                    }),
                    new TextRun({
                      text: `\nNIP. ${docData.pejabatPemberiTugas.nip}`,
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
            new TableCell({
              margins: p3CellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Telah diperiksa, dengan keterangan bahwa perjalanan tersebut diatas benar dilakukan atas perintahnya dan semata-mata untuk kepentingan jabatan dalam waktu yang sesingkat-singkatnya.',
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // BAGIAN VI
        new TableRow({
          children: [
            new TableCell({
              margins: p3CellMargins,
              children: [new Paragraph({ children: [new TextRun({ text: 'VI.', size: 18, font: 'Arial' })] })],
            }),
            new TableCell({
              columnSpan: 2,
              margins: p3CellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: docData.halaman3?.catatanLain
                        ? `Catatan Lain-Lain\n${docData.halaman3.catatanLain}`
                        : 'Catatan Lain-Lain',
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
        // BAGIAN VII
        new TableRow({
          children: [
            new TableCell({
              margins: p3CellMargins,
              children: [new Paragraph({ children: [new TextRun({ text: 'VII.', size: 18, font: 'Arial' })] })],
            }),
            new TableCell({
              columnSpan: 2,
              margins: p3CellMargins,
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'PERHATIAN:\nPengguna Anggaran/Kuasa Pengguna Anggaran/Pejabat Pembuat Komitmen yang menerbitkan Surat Perjalanan Dinas (SPD), pegawai yang melakukan perjalanan dinas, para pejabat yang mengesahkan tanggal berangkat/tiba, serta bendahara pengeluaran bertanggung jawab berdasarkan peraturan-peraturan Keuangan Negara apabila negara menderita rugi akibat kesalahan, kelalaian, dan kealpaannya.',
                      size: 18,
                      font: 'Arial',
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  if (singlePage === 1) return page1Children;
  if (singlePage === 2) return page2Children;
  if (singlePage === 3) return page3Children;

  return [
    ...page1Children,
    new Paragraph({ children: [new PageBreak()] }),
    ...page2Children,
    new Paragraph({ children: [new PageBreak()] }),
    ...page3Children,
  ];
}

export async function generateSinglePackageDocxBlob(
  pkgData: DocumentPackage,
  school: SchoolIdentity,
  singlePage?: 1 | 2 | 3
): Promise<Blob> {
  const children = await buildPackageChildren(pkgData, school, singlePage);
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function generateDocxBlob(
  docData: DocumentPackage,
  school: SchoolIdentity,
  singlePage?: 1 | 2 | 3
): Promise<Blob> {
  const expandedPackages = expandDocumentPerPegawai(docData);
  const allChildren: (Paragraph | Table)[] = [];

  for (let i = 0; i < expandedPackages.length; i++) {
    const pkgChildren = await buildPackageChildren(expandedPackages[i], school, singlePage);
    if (i > 0) {
      allChildren.push(new Paragraph({ children: [new PageBreak()] }));
    }
    allChildren.push(...pkgChildren);
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: allChildren,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 2000);
}
