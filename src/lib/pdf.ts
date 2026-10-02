/**
 * Turns a rendered element into an A4 PDF download.
 *
 * The page is rasterised (html2canvas-pro understands Tailwind v4's oklch colours) so Thai
 * text keeps its exact shaping; tall content is split across as many A4 pages as needed.
 */
export async function downloadPdf(element: HTMLElement, filename: string) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas-pro'), import('jspdf')]);

  await document.fonts.ready;
  await Promise.all(
    [...element.querySelectorAll('img')].map((img) =>
      img.complete ? null : new Promise((resolve) => img.addEventListener('load', resolve, { once: true })),
    ),
  );

  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const pxPerMm = canvas.width / pageW;
  const pagePx = Math.floor(pageH * pxPerMm);

  // ignore a few px of rounding overflow so an exactly-A4 sheet doesn't spill a blank page
  for (let y = 0, page = 0; y < canvas.height - 8; y += pagePx, page++) {
    const sliceH = Math.min(pagePx, canvas.height - y);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = sliceH;
    slice.getContext('2d')!.drawImage(canvas, 0, y, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
    if (page > 0) pdf.addPage();
    pdf.addImage(slice.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, pageW, sliceH / pxPerMm);
  }

  pdf.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
