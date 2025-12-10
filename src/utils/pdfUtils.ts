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

  // --- 1. HEADER (Dibuat lebih naik ke atas biar hemat tempat) ---
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.settings.sekolah.toUpperCase(), 105, 15, { align: 'center' }); // Y=15
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tahun Ajaran ${data.settings.tahunAjaran}`, 105, 21, { align: 'center' }); // Y=21

  // --- 2. BIODATA (Compact Spacing) ---
  const startY = 30; // Mulai lebih atas
  const col1 = 15;
  const col2 = 55;
  
  doc.setFontSize(9); // Font sedikit diperkecil biar muat
  
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
    // Handle text wrapping jika nama/jurusan kepanjangan
    const splitValue = doc.splitTextToSize(value, 140);
    doc.text(splitValue, col2, currentY);
    currentY += (splitValue.length * 5); // Spasi antar baris lebih rapat (5)
  });

  // --- 3. TABEL NILAI (AutoTable) ---
  const tableData = data.nilai.map(n => [
    n.tp,
    n.skor,
    n.deskripsi
  ]);

  autoTable(doc, {
    startY: currentY + 2,
    head: [['Tujuan Pembelajaran', 'Skor', 'Deskripsi']],
    body: tableData,
    theme: 'grid', // Ada garis border
    headStyles: {
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      halign: 'center',
      valign: 'middle',
      fontStyle: 'bold',
      fontSize: 9, // Font header kecil
      cellPadding: 2
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      valign: 'top',
      fontSize: 9, // Font isi kecil
      cellPadding: 2
    },
    columnStyles: {
      0: { cellWidth: 60 }, 
      1: { cellWidth: 15, halign: 'center', fontStyle: 'bold' }, 
      2: { cellWidth: 'auto' }, 
    },
  });

  // --- 4. CATATAN (Sekarang pakai Tabel biar ada Border) ---
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 5;

  // Kita gunakan autoTable untuk catatan agar otomatis punya border rapi
  autoTable(doc, {
    startY: finalY,
    head: [['Catatan']],
    body: [[data.catatan || "-"]],
    theme: 'grid',
    headStyles: {
        fillColor: [240, 240, 240], // Abu-abu muda biar beda
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 2
    },
    bodyStyles: {
        textColor: [0, 0, 0],
        lineWidth: 0.1,
        lineColor: [0, 0, 0],
        fontSize: 9,
        fontStyle: 'italic',
        cellPadding: 3
    }
  });

  // --- 5. TABEL ABSENSI (Sekarang pakai Grid Border) ---
  // @ts-ignore
  finalY = doc.lastAutoTable.finalY + 5;
  
  autoTable(doc, {
    startY: finalY,
    head: [['Ketidakhadiran', 'Jumlah (Hari)']], // Tambah header biar jelas
    body: [
      ['Sakit', `${data.absensi.sakit}`],
      ['Izin', `${data.absensi.izin}`],
      ['Tanpa Keterangan', `${data.absensi.alpha}`],
    ],
    theme: 'grid', // UBAH KE GRID (Ada Border)
    styles: { 
        fontSize: 9, 
        cellPadding: 2,
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
    },
    headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: 'left'
    },
    columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 30, halign: 'center' }
    },
    margin: { left: 15 } // Rata kiri
  });

  // --- 6. TANDA TANGAN (Posisi Statis di Bawah atau Dinamis) ---
  // @ts-ignore
  let signY = doc.lastAutoTable.finalY + 15;

  // Cek sisa halaman, kalau mepet banget (misal < 40mm sisa), baru add page.
  // Tapi target kita 1 halaman, jadi kita usahakan muat.
  if (signY > 260) {
      doc.addPage();
      signY = 30;
  }

  const leftX = 20;
  const rightX = 140;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Tanggal & Tempat
  doc.text(`${data.settings.kota}, ${data.settings.tanggalCetak}`, rightX, signY);
  signY += 6;

  // Jabatan
  doc.text("Wali Kelas", leftX, signY);
  doc.text("Kepala Sekolah", rightX, signY);

  signY += 25; // Ruang tanda tangan

  // Nama Pejabat
  doc.setFont('helvetica', 'bold');
  doc.text(data.settings.waliKelas, leftX, signY);
  doc.text(data.settings.kepalaSekolah, rightX, signY);
  
  signY += 5;
  
  // NIP
  doc.setFont('helvetica', 'normal');
  doc.text("NIP. -", leftX, signY); 
  doc.text(`NIP. ${data.settings.nipKepala}`, rightX, signY);

  // Footer Halus
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Dicetak melalui Sistem Rapor-Edyan | ${data.nama}`, 15, 290);

  return doc;
};

// --- BAGIAN 2: EXPORT TABEL BIASA (Ini yang hilang tadi) ---
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