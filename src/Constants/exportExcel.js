import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const exportToExcelAbsensi = async (dataPresensi, monthName, year) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Rekap Absensi");

  const yearNum = parseInt(year);
  const dateObj = new Date(`${monthName} 1, ${yearNum}`);
  const monthIndex = isNaN(dateObj.getTime()) ? 0 : dateObj.getMonth();
  const daysInMonth = new Date(yearNum, monthIndex + 1, 0).getDate();

  const colDateStart = 4;
  const colDateEnd = 3 + daysInMonth;
  const colRekapStart = colDateEnd + 1;
  const colTotal = colRekapStart + 7;

  const safeMerge = (r1, c1, r2, c2) => {
    try {
      const cell = worksheet.getCell(r1, c1);
      if (!cell.isMerged) worksheet.mergeCells(r1, c1, r2, c2);
    } catch (e) { console.warn("Skip merge:", r1, c1); }
  };

  worksheet.views = [{ showGridLines: true }];

  // --- 1. JUDUL ---
  safeMerge(1, 1, 1, colTotal);
  worksheet.getCell(1, 1).value = "REKAP ABSENSI";
  worksheet.getCell(1, 1).font = { name: "Arial", size: 12, bold: true };
  worksheet.getCell(1, 1).alignment = { horizontal: "center", vertical: "middle" };

  safeMerge(2, 1, 2, colTotal);
  worksheet.getCell(2, 1).value = "KOMISI PEMILIHAN UMUM KABUPATEN SEKADAU";
  worksheet.getCell(2, 1).font = { name: "Arial", size: 12, bold: true };
  worksheet.getCell(2, 1).alignment = { horizontal: "center", vertical: "middle" };

  worksheet.addRow([]);

  // --- 2. HEADER TABEL ---
  safeMerge(4, 1, 5, 1); worksheet.getCell(4, 1).value = "No";
  safeMerge(4, 2, 5, 2); worksheet.getCell(4, 2).value = "NAMA";
  safeMerge(4, 3, 5, 3); worksheet.getCell(4, 3).value = "JABATAN";

  safeMerge(4, colDateStart, 4, colDateEnd);
  worksheet.getCell(4, colDateStart).value = `BULAN ${monthName.toUpperCase()} TAHUN ${year}`;

  for (let i = 1; i <= daysInMonth; i++) {
    worksheet.getCell(5, 3 + i).value = i;
  }

  safeMerge(4, colRekapStart, 4, colRekapStart + 6);
  worksheet.getCell(4, colRekapStart).value = "REKAP";
  ["H", "A", "C", "I", "S", "DL", "TB"].forEach((v, i) => worksheet.getCell(5, colRekapStart + i).value = v);

  safeMerge(4, colTotal, 5, colTotal); worksheet.getCell(4, colTotal).value = "TOTAL";

  const headerFill = { type: "pattern", pattern: "solid", fgColor: { argb: "B4C6E7" } };
  const borderStyle = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
  [4, 5].forEach((rowNum) => {
    worksheet.getRow(rowNum).eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = headerFill; cell.border = borderStyle;
      cell.font = { name: "Arial", size: 10, bold: true };
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });
  });

  // --- 3. DATA ---
  let currentRowNum = 6;
  dataPresensi.forEach((pegawai, index) => {
    const row = worksheet.getRow(currentRowNum);
    row.getCell(1).value = index + 1;
    row.getCell(2).value = pegawai.name.toUpperCase();
    row.getCell(3).value = pegawai.jabatan;

    const colorMap = {
        "H":  { bg: "00A86B", text: "FFFFFF" }, // Hijau
        "A":  { bg: "FF4444", text: "FFFFFF" }, // Merah
        "C":  { bg: "A855F7", text: "FFFFFF" }, // Ungu
        "I":  { bg: "FFD700", text: "000000" }, // Kuning
        "S":  { bg: "0EA5E9", text: "FFFFFF" }, // Biru Muda
        "DL": { bg: "3B82F6", text: "FFFFFF" }, // Biru
        "TB": { bg: "8B5CF6", text: "FFFFFF" }  // Ungu Muda
    };

    for (let t = 1; t <= daysInMonth; t++) {
      const cell = row.getCell(3 + t);
      const currentDate = new Date(yearNum, monthIndex, t);
      const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;

      if (isWeekend) {
        cell.value = "";
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC7CE" } };
      } else {
        const val = pegawai.harian?.[t] || "";
        cell.value = val;
        if (colorMap[val]) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: colorMap[val].bg } };
          cell.font = { color: { argb: colorMap[val].text }, bold: true };
        }
      }
    }

    row.getCell(colRekapStart).value = pegawai.rekap?.H ?? 0;
    row.getCell(colRekapStart + 1).value = pegawai.rekap?.A ?? 0;
    row.getCell(colRekapStart + 2).value = pegawai.rekap?.C ?? 0;
    row.getCell(colRekapStart + 3).value = pegawai.rekap?.I ?? 0;
    row.getCell(colRekapStart + 4).value = pegawai.rekap?.S ?? 0;
    row.getCell(colRekapStart + 5).value = pegawai.rekap?.DL ?? 0;
    row.getCell(colRekapStart + 6).value = pegawai.rekap?.TB ?? 0;
    row.getCell(colTotal).value = pegawai.total ?? 0;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = borderStyle;
      if (!cell.font || (cell.font.color?.argb !== "FFFFFF" && cell.fill?.fgColor?.argb !== "FFC7CE")) 
        cell.font = { name: "Arial", size: 9 };
      cell.alignment = (colNumber === 2 || colNumber === 3) ? { horizontal: "left" } : { horizontal: "center" };
    });
    currentRowNum++;
  });

  // --- 4. LEBAR KOLOM & UNDUH ---
  worksheet.getColumn(1).width = 5;
  worksheet.getColumn(2).width = 32;
  worksheet.getColumn(3).width = 60;
  for (let t = 4; t <= colDateEnd; t++) worksheet.getColumn(t).width = 3.3;
  worksheet.getColumn(colTotal).width = 8;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `REKAP_ABSENSI_${monthName.toUpperCase()}_${year}.xlsx`);
};