import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- BAGIAN 1: CETAK RAPOR PDF ---
interface RaporData {
  nama: string;
  nisn: string;
  kelas: string;
  programKeahlian: string;
  konsentrasiKeahlian: string;
  tempatPKL: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  instruktur: string;
  pembimbing: string;
  nilai: {
    tp: string;
    skor: number;
    deskripsi: string;
  }[];
  catatan: string;
  absensi: {
    sakit: number;
    izin: number;
    alpha: number;
  };
  settings: {
    sekolah: string;
    tahunAjaran: string;
    kepalaSekolah: string;
    nipKepala: string;
    waliKelas: string;
    tanggalCetak: string;
    kota: string;
  }
}

export const generateRaporPDF = (data: RaporData) => {
  const doc = new jsPDF();

  // --- 1. HEADER ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.settings.sekolah.toUpperCase(), 105, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tahun Ajaran ${data.settings.tahunAjaran}`, 105, 21, { align: 'center' });

  // --- 2. BIODATA ---
  const startY = 30;
  const col1 = 15;
  const col2 = 55;
  
  doc.setFontSize(9);
  
  const biodata = [
    ['Nama Peserta Didik', `: ${data.nama}`],
    ['NISN', `: ${data.nisn}`],
    ['Kelas', `: ${data.kelas}`],
    ['Program Keahlian', `: ${data.programKeahlian}`],
    ['Konsentrasi Keahlian', `: ${data.konsentrasiKeahlian}`],
    ['Tempat PKL', `: ${data.tempatPKL}`],
    ['Tanggal PKL', `: ${data.tanggalMulai} s.d. ${data.tanggalAkhir}`],
    ['Nama Instruktur', `: ${data.instruktur}`],
    ['Nama Pembimbing', `: ${data.pembimbing}`],
  ];

  let currentY = startY;
  biodata.forEach(([label, value]) => {
    doc.text(label, col1, currentY);
    const splitValue = doc.splitTextToSize(value, 140);
    doc.text(splitValue, col2, currentY);
    currentY += (splitValue.length * 5); 
  });

  // --- 3. TABEL NILAI ---
  const tableData = data.nilai.map(n => [
    n.tp,
    n.skor,
    n.deskripsi
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Tujuan Pembelajaran', 'Skor', 'Deskripsi']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [230, 230, 230], // Abu-abu muda
      textColor: [0, 0, 0],       // Hitam
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: 'center',
      valign: 'middle',
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 3
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      valign: 'top',
      fontSize: 9,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 70 }, 
      1: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }, 
      2: { cellWidth: 'auto' }, 
    },
    margin: { left: 15, right: 15 }
  });

  // --- 4. TABEL CATATAN (Dengan Jarak) ---
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 5; // BERI JARAK 10 BIAR TIDAK NEMPEL

  autoTable(doc, {
    startY: finalY,
    head: [['Catatan']],
    body: [[data.catatan || "-"]],
    theme: 'grid',
    headStyles: {
        fillColor: [230, 230, 230], // Abu-abu muda
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 2,
        halign: 'left'
    },
    bodyStyles: {
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'italic',
        cellPadding: 3
    },
    margin: { left: 15, right: 15 } // Full Width sejajar atas
  });

  // --- 5. TABEL ABSENSI (Compact, Sejajar Kiri, Teks Hitam) ---
  // @ts-ignore
  finalY = doc.lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: finalY,
    // Header Colspan dengan warna teks HITAM
    head: [[
        { content: 'Ketidakhadiran', colSpan: 2, styles: { halign: 'left', fillColor: [230, 230, 230], textColor: [0, 0, 0] } }
    ]],
    body: [
      ['Sakit', `: ${data.absensi.sakit} Hari`],
      ['Izin', `: ${data.absensi.izin} Hari`],
      ['Tanpa Keterangan', `: ${data.absensi.alpha} Hari`],
    ],
    theme: 'grid',
    styles: { 
        fontSize: 9, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        textColor: [0, 0, 0] // Pastikan isi tabel hitam
    },
    headStyles: {
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
    },
    columnStyles: {
        0: { cellWidth: 40 }, // Lebar label
        1: { cellWidth: 40 }  // Lebar isi (total lebar tabel 80, jadi tidak full page)
    },
    // Margin kiri 15 agar lurus dengan tabel atas, tapi TIDAK ADA margin kanan (biar compact)
    margin: { left: 15 } 
  });

  // --- 6. TANDA TANGAN ---
  // @ts-ignore
  let signY = doc.lastAutoTable.finalY + 15;

  if (signY > 260) {
      doc.addPage();
      signY = 30;
  }

  const leftX = 20;
  const rightX = 140;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Tanggal
  doc.text(`${data.settings.kota}, ${data.settings.tanggalCetak}`, rightX, signY);
  signY += 6;

  // Jabatan
  doc.text("Wali Kelas", leftX, signY);
  doc.text("Kepala Sekolah", rightX, signY);

  signY += 25; // Space TTD

  // Nama Pejabat
  doc.setFont('helvetica', 'bold');
  doc.text(data.settings.waliKelas, leftX, signY);
  doc.text(data.settings.kepalaSekolah, rightX, signY);
  
  signY += 5;
  
  // NIP
  doc.setFont('helvetica', 'normal');
  doc.text("NIP. -", leftX, signY); 
  doc.text(`NIP. ${data.settings.nipKepala}`, rightX, signY);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Dicetak melalui e-Rapor SMK Telkom Lampung | ${data.nama} | ${data.kelas}`, 15, 290);

  return doc;
};

// --- BAGIAN 2: EXPORT TABEL BIASA (Export Excel/PDF Data Table) ---
export const exportTableToPDF = <T extends object>(
  data: T[],
  columns: { key: keyof T; header: string }[],
  title: string,
  fileName: string
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
  const headers = columns.map(col => col.header);
  const body = data.map((item, index) => [
    (index + 1).toString(),
    ...columns.map(col => String(item[col.key] ?? ''))
  ]);
  
  autoTable(doc, {
    startY: 30,
    head: [['No', ...headers]],
    body: body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`${fileName}.pdf`);
};