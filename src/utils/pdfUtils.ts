import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RaporData {
  namaSiswa: string;
  nisn: string;
  kelas: string;
  programKeahlian: string;
  konsentrasiKeahlian: string;
  tempatPKL: string;
  instrukturPKL: string;
  pembimbingSekolah: string;
  tanggalMulai: string;
  tanggalAkhir: string;
  nilaiSkor: number;
  nilaiDeskripsi: string;
  nilaiCatatan: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
  namaSekolah: string;
  tahunPelajaran: string;
  namaKepalaSekolah: string;
  tujuanPembelajaran: string[];
}

export const generateRaporPDF = (data: RaporData) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(data.namaSekolah, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text('LAPORAN PRAKTIK KERJA INDUSTRI (PKL)', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Tahun Pelajaran: ${data.tahunPelajaran}`, pageWidth / 2, 38, { align: 'center' });
  
  // Line separator
  doc.setLineWidth(0.5);
  doc.line(20, 42, pageWidth - 20, 42);
  
  // Student Info
  let yPos = 52;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DATA SISWA', 20, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const studentInfo = [
    ['Nama Peserta Didik', data.namaSiswa],
    ['NISN', data.nisn],
    ['Kelas', data.kelas],
    ['Program Keahlian', data.programKeahlian],
    ['Konsentrasi Keahlian', data.konsentrasiKeahlian],
  ];
  
  studentInfo.forEach(([label, value]) => {
    doc.text(`${label}`, 20, yPos);
    doc.text(`: ${value}`, 70, yPos);
    yPos += 6;
  });
  
  // PKL Info
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PKL', 20, yPos);
  yPos += 8;
  
  doc.setFont('helvetica', 'normal');
  const pklInfo = [
    ['Tempat PKL', data.tempatPKL],
    ['Instruktur PKL', data.instrukturPKL],
    ['Pembimbing Sekolah', data.pembimbingSekolah],
    ['Periode PKL', `${data.tanggalMulai} s/d ${data.tanggalAkhir}`],
  ];
  
  pklInfo.forEach(([label, value]) => {
    doc.text(`${label}`, 20, yPos);
    doc.text(`: ${value}`, 70, yPos);
    yPos += 6;
  });
  
  // Learning Objectives
  if (data.tujuanPembelajaran.length > 0) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('TUJUAN PEMBELAJARAN', 20, yPos);
    yPos += 8;
    
    doc.setFont('helvetica', 'normal');
    data.tujuanPembelajaran.forEach((tp, index) => {
      doc.text(`${index + 1}. ${tp}`, 20, yPos);
      yPos += 6;
    });
  }
  
  // Grades
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('PENILAIAN', 20, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Skor', 'Deskripsi', 'Catatan']],
    body: [[data.nilaiSkor.toString(), data.nilaiDeskripsi, data.nilaiCatatan]],
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  // Attendance
  doc.setFont('helvetica', 'bold');
  doc.text('KEHADIRAN', 20, yPos);
  yPos += 8;
  
  autoTable(doc, {
    startY: yPos,
    head: [['Sakit', 'Izin', 'Tanpa Keterangan', 'Total Ketidakhadiran']],
    body: [[
      data.sakit.toString(),
      data.izin.toString(),
      data.tanpaKeterangan.toString(),
      (data.sakit + data.izin + data.tanpaKeterangan).toString()
    ]],
    margin: { left: 20, right: 20 },
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  yPos = (doc as any).lastAutoTable.finalY + 20;
  
  // Signature
  const signatureY = yPos + 10;
  doc.setFont('helvetica', 'normal');
  doc.text('Mengetahui,', pageWidth - 60, signatureY);
  doc.text('Kepala Sekolah', pageWidth - 60, signatureY + 6);
  doc.text(data.namaKepalaSekolah, pageWidth - 60, signatureY + 30);
  
  return doc;
};

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
