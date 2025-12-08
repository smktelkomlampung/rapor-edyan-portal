export interface Siswa {
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  programKeahlian: string;
  konsentrasiKeahlian: string;
}

export interface TempatPKL {
  id: string;
  nama: string;
}

export interface InstrukturPKL {
  id: string;
  nama: string;
}

export interface PembimbingSekolah {
  id: string;
  nama: string;
}

export interface TujuanPembelajaran {
  id: string;
  nama: string;
}

export interface NilaiPKL {
  id: string;
  siswaId: string;
  skor: number;
  deskripsi: string;
  catatan: string;
}

export interface AbsensiPKL {
  id: string;
  siswaId: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
}

export interface Settings {
  namaSekolah: string;
  tanggalMulaiPKL: string;
  tanggalAkhirPKL: string;
  tahunPelajaran: string;
  namaKepalaSekolah: string;
}
