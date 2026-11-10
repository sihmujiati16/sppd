import JSZip from 'jszip';
import { DocumentPackage, SchoolIdentity } from '../types';
import { expandDocumentPerPegawai } from './documentLogic';
import { generateDocxBlob, generateSinglePackageDocxBlob } from './docxGenerator';
import { generatePdfBlob } from './pdfGenerator';

function sanitizeFileSegment(input: string): string {
  return (input || 'Dokumen')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60) || 'Dokumen';
}

/**
 * Mengemas satu surat tugas (termasuk ekspansi multi-pegawai dengan nomor berurutan)
 * ke dalam satu file arsip .ZIP berisi file DOCX lengkap, DOCX per halaman, dan PDF A4.
 */
export async function generateDocumentZipBlob(
  docData: DocumentPackage,
  school: SchoolIdentity,
  options?: { includePdf?: boolean }
): Promise<Blob> {
  const includePdf = options?.includePdf !== false;
  const zip = new JSZip();
  const expanded = expandDocumentPerPegawai(docData);
  const cleanBaseNomor = sanitizeFileSegment(docData.nomorSuratTugas);

  for (let i = 0; i < expanded.length; i++) {
    const pkg = expanded[i];
    const indexStr = String(i + 1).padStart(2, '0');
    const pegName = sanitizeFileSegment(pkg.pegawaiUtama?.nama || `Pegawai_${i + 1}`);
    const urutStr = pkg.nomorUrutSuratTugas ? `No_${pkg.nomorUrutSuratTugas}` : `Urut_${i + 1}`;
    const prefix = `${indexStr}_${pegName}_${urutStr}`;

    const [fullDocx, p1Docx, p2Docx, p3Docx] = await Promise.all([
      generateSinglePackageDocxBlob(pkg, school),
      generateSinglePackageDocxBlob(pkg, school, 1),
      generateSinglePackageDocxBlob(pkg, school, 2),
      generateSinglePackageDocxBlob(pkg, school, 3),
    ]);

    zip.file(`${prefix}_Paket_Lengkap_3Hal.docx`, fullDocx);
    zip.file(`Per_Halaman/${prefix}/01_Surat_Tugas_${urutStr}.docx`, p1Docx);
    zip.file(`Per_Halaman/${prefix}/02_SPPD_${urutStr}.docx`, p2Docx);
    zip.file(`Per_Halaman/${prefix}/03_Lampiran_SPPD_${urutStr}.docx`, p3Docx);

    if (includePdf && expanded.length > 1) {
      const pegPdf = await generatePdfBlob(pkg, school);
      zip.file(`PDF_Per_Pegawai/${prefix}.pdf`, pegPdf);
    }
  }

  if (expanded.length > 1) {
    const combinedDocx = await generateDocxBlob(docData, school);
    zip.file(`00_Gabungan_Semua_Pegawai_${cleanBaseNomor}.docx`, combinedDocx);
  }

  if (includePdf) {
    const combinedPdf = await generatePdfBlob(docData, school);
    zip.file(`00_Cetak_PDF_Semua_Dokumen_${cleanBaseNomor}.pdf`, combinedPdf);
  }

  return await zip.generateAsync({ type: 'blob' });
}

/**
 * Mengemas seluruh arsip surat menjadi satu file .ZIP terstruktur per dokumen dan per pegawai.
 */
export async function generateArchiveZipBlob(
  documents: DocumentPackage[],
  school: SchoolIdentity
): Promise<Blob> {
  const zip = new JSZip();

  for (let dIdx = 0; dIdx < documents.length; dIdx++) {
    const docData = documents[dIdx];
    const docPrefix = `${String(dIdx + 1).padStart(2, '0')}_${sanitizeFileSegment(docData.nomorSuratTugas)}`;
    const folder = zip.folder(docPrefix);
    if (!folder) continue;

    const expanded = expandDocumentPerPegawai(docData);
    for (let pIdx = 0; pIdx < expanded.length; pIdx++) {
      const pkg = expanded[pIdx];
      const pegName = sanitizeFileSegment(pkg.pegawaiUtama?.nama || `Pegawai_${pIdx + 1}`);
      const urutStr = pkg.nomorUrutSuratTugas ? `No_${pkg.nomorUrutSuratTugas}` : `Urut_${pIdx + 1}`;
      const pkgDocx = await generateSinglePackageDocxBlob(pkg, school);
      folder.file(`${String(pIdx + 1).padStart(2, '0')}_${pegName}_${urutStr}.docx`, pkgDocx);
    }

    if (expanded.length > 1) {
      const combinedDocx = await generateDocxBlob(docData, school);
      folder.file(`Gabungan_Semua_Pegawai.docx`, combinedDocx);
    }

    const pdfBlob = await generatePdfBlob(docData, school);
    folder.file(`Dokumen_Cetak_A4_${sanitizeFileSegment(docData.nomorSuratTugas)}.pdf`, pdfBlob);
  }

  return await zip.generateAsync({ type: 'blob' });
}
