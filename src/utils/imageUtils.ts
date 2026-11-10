/**
 * Mengonversi Data URL gambar apa pun ke kanvas PNG persegi transparan (1:1)
 * dengan menjaga rasio aspek asli agar ukuran 4 cm x 4 cm tidak terpotong atau gepeng
 * saat dirender ke HTML, html2canvas PDF, maupun DOCX.
 */
export async function normalizeSquarePngDataUrl(
  dataUrl: string | undefined,
  canvasSize: number = 400
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) return dataUrl || '';

  return await new Promise<string>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const nw = img.naturalWidth || canvasSize;
      const nh = img.naturalHeight || canvasSize;
      // Jika sudah PNG persegi dengan ukuran wajar, langsung kembalikan
      if (nw === nh && nw <= 600 && dataUrl.startsWith('data:image/png')) {
        resolve(dataUrl);
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.clearRect(0, 0, canvasSize, canvasSize);
      const ratio = Math.min(canvasSize / nw, canvasSize / nh);
      const drawW = nw * ratio;
      const drawH = nh * ratio;
      const offsetX = (canvasSize - drawW) / 2;
      const offsetY = (canvasSize - drawH) / 2;
      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
