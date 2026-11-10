import React from 'react';
import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { DocumentPackage, SchoolIdentity } from '../types';
import { expandDocumentPerPegawai } from './documentLogic';
import { normalizeSquarePngDataUrl } from './imageUtils';
import { SuratTugasPage } from '../components/SuratTugasPage';
import { SPPDPage } from '../components/SPPDPage';
import { LampiranSPPDPage } from '../components/LampiranSPPDPage';

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener('load', done, { once: true });
          img.addEventListener('error', done, { once: true });
          // Fallback timeout agar tidak menggantung jika aset eksternal gagal
          setTimeout(done, 2500);
        })
    )
  );
}

/**
 * Menghasilkan file PDF ukuran A4 multi-halaman secara langsung (tanpa bergantung pada dialog window.print())
 * Mendukung ekspansi otomatis per pegawai dengan nomor surat berurutan serta tanda tangan & stempel.
 */
export async function generatePdfBlob(
  docData: DocumentPackage,
  school: SchoolIdentity,
  singlePage?: 1 | 2 | 3
): Promise<Blob> {
  const [normalizedTtd, normalizedStempel] = await Promise.all([
    normalizeSquarePngDataUrl(school.ttdImage, 400),
    normalizeSquarePngDataUrl(school.stempelImage, 400),
  ]);
  const normalizedSchool: SchoolIdentity = {
    ...school,
    ttdImage: normalizedTtd || school.ttdImage,
    stempelImage: normalizedStempel || school.stempelImage,
  };

  const expandedPackages = expandDocumentPerPegawai(docData);

  const host = document.createElement('div');
  host.style.position = 'fixed';
  host.style.left = '-100000px';
  host.style.top = '0';
  host.style.width = '210mm';
  host.style.backgroundColor = '#ffffff';
  host.style.zIndex = '-9999';
  host.style.pointerEvents = 'none';
  document.body.appendChild(host);

  const root = createRoot(host);

  try {
    root.render(
      React.createElement(
        'div',
        { className: 'bg-white' },
        expandedPackages.map((pkg, idx) =>
          React.createElement(
            React.Fragment,
            { key: pkg.id || idx },
            (!singlePage || singlePage === 1) &&
              React.createElement(SuratTugasPage, { data: pkg, school: normalizedSchool }),
            (!singlePage || singlePage === 2) &&
              React.createElement(SPPDPage, { data: pkg, school: normalizedSchool }),
            (!singlePage || singlePage === 3) &&
              React.createElement(LampiranSPPDPage, { data: pkg, school: normalizedSchool })
          )
        )
      )
    );

    // Tunggu React selesai commit ke DOM & gambar selesai dimuat
    await new Promise((resolve) => setTimeout(resolve, 120));
    await waitForImages(host);
    await new Promise((resolve) => setTimeout(resolve, 60));

    const sheets = Array.from(host.querySelectorAll('.a4-sheet')) as HTMLElement[];
    if (sheets.length === 0) {
      throw new Error('Tidak ada halaman dokumen A4 yang dapat dirender ke PDF.');
    }

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidthMm = 210;
    const pageHeightMm = 297;

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];
      // Pastikan tanpa bayangan saat capture PDF
      const prevShadow = sheet.style.boxShadow;
      sheet.style.boxShadow = 'none';

      const captureW = Math.ceil(sheet.offsetWidth || sheet.scrollWidth);
      const captureH = Math.ceil(sheet.offsetHeight || sheet.scrollHeight);

      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: captureW,
        height: captureH,
        windowWidth: captureW,
        scrollX: 0,
        scrollY: 0,
      });

      sheet.style.boxShadow = prevShadow;

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      if (i > 0) {
        pdf.addPage('a4', 'portrait');
      }

      const ratio = canvas.height / canvas.width;
      let renderWidth = pageWidthMm;
      let renderHeight = renderWidth * ratio;

      if (renderHeight > pageHeightMm) {
        renderHeight = pageHeightMm;
        renderWidth = renderHeight / ratio;
      }

      const offsetX = (pageWidthMm - renderWidth) / 2;
      pdf.addImage(imgData, 'JPEG', offsetX, 0, renderWidth, renderHeight);
    }

    return pdf.output('blob');
  } finally {
    root.unmount();
    if (host.parentNode) {
      host.parentNode.removeChild(host);
    }
  }
}
