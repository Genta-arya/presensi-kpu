import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToPdfAbsensi = (dataPresensi, monthName, year) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const yearNum = parseInt(year);
  const monthIndex = new Date(`${monthName} 1, ${yearNum}`).getMonth();
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();

  // 1. HEADER
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(12);
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.text('REKAP ABSENSI', pageWidth / 2, 10, { align: 'center' });
  doc.text('KOMISI PEMILIHAN UMUM KABUPATEN SEKADAU', pageWidth / 2, 16, { align: 'center' });

  // 2. STRUKTUR HEADER
  const headerRow1 = [
    { content: 'No', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
    { content: 'NAMA', rowSpan: 2, styles: { valign: 'middle', halign: 'left' } },
    { content: 'JABATAN', rowSpan: 2, styles: { valign: 'middle', halign: 'left' } },
    { content: `BULAN ${monthName.toUpperCase()} ${year}`, colSpan: daysInMonth, styles: { halign: 'center' } },
    { content: 'REKAP', colSpan: 7, styles: { halign: 'center' } },
    { content: 'TOTAL', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } }
  ];

  const headerRow2 = [];
  for (let i = 1; i <= daysInMonth; i++) headerRow2.push(String(i));
  ['H', 'A', 'C', 'I', 'S', 'DL', 'TB'].forEach(l => headerRow2.push(l));

  // 3. PEMBENTUKAN DATA
  const tableBody = dataPresensi.map((pegawai, index) => {
    const rowData = [index + 1, pegawai.name.toUpperCase(), pegawai.jabatan];
    for (let t = 1; t <= daysInMonth; t++) {
      const dateCheck = new Date(yearNum, monthIndex, t);
      const isWeekend = dateCheck.getDay() === 0 || dateCheck.getDay() === 6;
      rowData.push(isWeekend ? '' : (pegawai.harian?.[t] || ''));
    }
    rowData.push(
      pegawai.rekap?.H ?? 0, pegawai.rekap?.A ?? 0, pegawai.rekap?.C ?? 0, 
      pegawai.rekap?.I ?? 0, pegawai.rekap?.S ?? 0, pegawai.rekap?.DL ?? 0, pegawai.rekap?.TB ?? 0,
      pegawai.total ?? 0
    );
    return rowData;
  });

  // 4. RENDER AUTO-TABLE
  autoTable(doc, {
    startY: 22,
    head: [headerRow1, headerRow2],
    body: tableBody,
    theme: 'grid',
    styles: { fontSize: 6, cellPadding: 0.7, lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: [180, 198, 231], textColor: [0, 0, 0], halign: 'center' },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index >= 3 && data.column.index < 3 + daysInMonth) {
        const val = data.cell.raw;
        const dateCheck = new Date(yearNum, monthIndex, data.column.index - 2);
        const isWeekend = dateCheck.getDay() === 0 || dateCheck.getDay() === 6;

        // Semua teks di area presensi ditaruh di tengah
        data.cell.styles.halign = 'center';

        if (isWeekend) {
          data.cell.styles.fillColor = [255, 199, 206]; // Merah Weekend
          data.cell.content = ''; 
        } else if (val) {
          const styles = {
            'H':  { fill: [0, 168, 107], text: [255, 255, 255] }, // Hijau
            'A':  { fill: [255, 68, 68], text: [255, 255, 255] },  // Merah
            'C':  { fill: [168, 85, 247], text: [255, 255, 255] }, // Ungu
            'I':  { fill: [255, 215, 0], text: [0, 0, 0] },       // Kuning
            'S':  { fill: [14, 165, 233], text: [255, 255, 255] }, // Biru Muda
            'DL': { fill: [59, 130, 246], text: [255, 255, 255] }, // Biru
            'TB': { fill: [139, 92, 246], text: [255, 255, 255] }  // Ungu Muda
          };
          
          if (styles[val]) {
            data.cell.styles.fillColor = styles[val].fill;
            data.cell.styles.textColor = styles[val].text;
          }
        }
      }
    }
  });

  doc.save(`REKAP_ABSENSI_${monthName.toUpperCase()}_${year}.pdf`);
};