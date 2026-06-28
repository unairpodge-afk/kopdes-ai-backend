/**
 * Data Lokasi Kopdes Merah Putih Seluruh Indonesia
 * + Utilitas kalkulasi jarak Haversine
 */

export const kopdesLocations = [
  // === JAWA BARAT ===
  { id: 1, name: 'Kopdes Merah Putih Sumedang', province: 'Jawa Barat', district: 'Kab. Sumedang', lat: -6.8383, lng: 107.9233, members: 342, status: 'Aktif', established: '2023-03-15', description: 'Fokus kopi arabika & olahan susu sapi' },
  { id: 2, name: 'Kopdes Merah Putih Garut', province: 'Jawa Barat', district: 'Kab. Garut', lat: -7.2175, lng: 107.9089, members: 287, status: 'Aktif', established: '2023-06-20', description: 'Pusat olahan dodol & kerupuk kulit' },
  { id: 3, name: 'Kopdes Merah Putih Cianjur', province: 'Jawa Barat', district: 'Kab. Cianjur', lat: -6.8204, lng: 107.1377, members: 198, status: 'Aktif', established: '2024-01-10', description: 'Beras organik premium Cianjur' },
  
  // === JAWA TENGAH ===
  { id: 4, name: 'Kopdes Merah Putih Wonosobo', province: 'Jawa Tengah', district: 'Kab. Wonosobo', lat: -7.3624, lng: 109.8974, members: 415, status: 'Aktif', established: '2022-08-17', description: 'Pusat sayuran dataran tinggi Dieng' },
  { id: 5, name: 'Kopdes Merah Putih Magelang', province: 'Jawa Tengah', district: 'Kab. Magelang', lat: -7.4707, lng: 110.2188, members: 523, status: 'Aktif', established: '2022-05-01', description: 'Kopi Borobudur & kerajinan anyaman' },
  { id: 6, name: 'Kopdes Merah Putih Klaten', province: 'Jawa Tengah', district: 'Kab. Klaten', lat: -7.7056, lng: 110.6059, members: 267, status: 'Aktif', established: '2023-11-08', description: 'Batik tulis & olahan jamur tiram' },
  
  // === JAWA TIMUR ===
  { id: 7, name: 'Kopdes Merah Putih Malang', province: 'Jawa Timur', district: 'Kab. Malang', lat: -8.1713, lng: 112.6810, members: 389, status: 'Aktif', established: '2022-10-28', description: 'Apel Batu & olahan keripik buah' },
  { id: 8, name: 'Kopdes Merah Putih Banyuwangi', province: 'Jawa Timur', district: 'Kab. Banyuwangi', lat: -8.2193, lng: 114.3528, members: 456, status: 'Aktif', established: '2022-04-21', description: 'Kopi Osing & ekowisata pantai' },
  { id: 9, name: 'Kopdes Merah Putih Jember', province: 'Jawa Timur', district: 'Kab. Jember', lat: -8.1724, lng: 113.7004, members: 312, status: 'Aktif', established: '2023-07-14', description: 'Tembakau Na-Oogst & kakao fermentasi' },
  
  // === SUMATERA ===
  { id: 10, name: 'Kopdes Merah Putih Aceh Tengah', province: 'Aceh', district: 'Kab. Aceh Tengah', lat: 4.6241, lng: 96.8437, members: 678, status: 'Aktif', established: '2022-01-17', description: 'Kopi Gayo premium ekspor internasional' },
  { id: 11, name: 'Kopdes Merah Putih Karo', province: 'Sumatera Utara', district: 'Kab. Karo', lat: 3.0987, lng: 98.3935, members: 345, status: 'Aktif', established: '2023-02-05', description: 'Jeruk Berastagi & sayuran organik' },
  { id: 12, name: 'Kopdes Merah Putih Agam', province: 'Sumatera Barat', district: 'Kab. Agam', lat: -0.3088, lng: 100.3698, members: 298, status: 'Aktif', established: '2023-04-22', description: 'Rendang kemasan & kerajinan perak Koto Gadang' },
  { id: 13, name: 'Kopdes Merah Putih Lampung Barat', province: 'Lampung', district: 'Kab. Lampung Barat', lat: -5.1861, lng: 104.2585, members: 432, status: 'Aktif', established: '2022-09-12', description: 'Kopi robusta Lampung & lada hitam' },
  { id: 14, name: 'Kopdes Merah Putih Musi Rawas', province: 'Sumatera Selatan', district: 'Kab. Musi Rawas', lat: -3.1352, lng: 103.0406, members: 187, status: 'Aktif', established: '2024-03-01', description: 'Kelapa sawit rakyat & karet alam' },
  
  // === KALIMANTAN ===
  { id: 15, name: 'Kopdes Merah Putih Banjar', province: 'Kalimantan Selatan', district: 'Kab. Banjar', lat: -3.3281, lng: 114.9862, members: 234, status: 'Aktif', established: '2023-05-17', description: 'Beras Siam Unus & kerajinan sasirangan' },
  { id: 16, name: 'Kopdes Merah Putih Kutai Kartanegara', province: 'Kalimantan Timur', district: 'Kab. Kutai Kartanegara', lat: -0.4115, lng: 117.0017, members: 189, status: 'Aktif', established: '2023-08-10', description: 'Madu hutan Kalimantan & ikan air tawar' },
  { id: 17, name: 'Kopdes Merah Putih Sambas', province: 'Kalimantan Barat', district: 'Kab. Sambas', lat: 1.3652, lng: 109.3043, members: 276, status: 'Aktif', established: '2023-01-25', description: 'Jeruk Sambas & budidaya udang' },
  { id: 18, name: 'Kopdes Merah Putih Kapuas', province: 'Kalimantan Tengah', district: 'Kab. Kapuas', lat: -2.9970, lng: 114.3879, members: 203, status: 'Aktif', established: '2024-02-14', description: 'Rotan alam & ikan patin budidaya' },
  
  // === SULAWESI ===
  { id: 19, name: 'Kopdes Merah Putih Toraja Utara', province: 'Sulawesi Selatan', district: 'Kab. Toraja Utara', lat: -2.9589, lng: 119.8502, members: 567, status: 'Aktif', established: '2022-03-08', description: 'Kopi Toraja premium & kerajinan ukir' },
  { id: 20, name: 'Kopdes Merah Putih Bone', province: 'Sulawesi Selatan', district: 'Kab. Bone', lat: -4.5388, lng: 120.3271, members: 398, status: 'Aktif', established: '2022-07-23', description: 'Sutra Bone & beras lokal unggulan' },
  { id: 21, name: 'Kopdes Merah Putih Gorontalo', province: 'Gorontalo', district: 'Kab. Gorontalo', lat: 0.5441, lng: 123.0568, members: 245, status: 'Aktif', established: '2023-09-30', description: 'Jagung & ikan cakalang fufu' },
  { id: 22, name: 'Kopdes Merah Putih Minahasa', province: 'Sulawesi Utara', district: 'Kab. Minahasa', lat: 1.2432, lng: 124.8562, members: 312, status: 'Aktif', established: '2023-06-11', description: 'Cengkeh & kopi Minahasa specialty' },
  
  // === BALI & NUSA TENGGARA ===
  { id: 23, name: 'Kopdes Merah Putih Bangli', province: 'Bali', district: 'Kab. Bangli', lat: -8.4543, lng: 115.3537, members: 478, status: 'Aktif', established: '2022-02-14', description: 'Kopi Kintamani & kerajinan bambu' },
  { id: 24, name: 'Kopdes Merah Putih Lombok Tengah', province: 'NTB', district: 'Kab. Lombok Tengah', lat: -8.7161, lng: 116.2798, members: 334, status: 'Aktif', established: '2022-12-05', description: 'Madu trigona & tenun songket Sasak' },
  { id: 25, name: 'Kopdes Merah Putih Manggarai', province: 'NTT', district: 'Kab. Manggarai', lat: -8.6571, lng: 120.4622, members: 256, status: 'Aktif', established: '2023-03-28', description: 'Kopi Flores Bajawa & tenun ikat' },
  { id: 26, name: 'Kopdes Merah Putih Sumba Barat', province: 'NTT', district: 'Kab. Sumba Barat', lat: -9.6527, lng: 119.3948, members: 178, status: 'Aktif', established: '2024-01-20', description: 'Tenun Sumba & kuda Sandalwood' },
  
  // === MALUKU & PAPUA ===
  { id: 27, name: 'Kopdes Merah Putih Maluku Tengah', province: 'Maluku', district: 'Kab. Maluku Tengah', lat: -3.3585, lng: 128.1743, members: 156, status: 'Aktif', established: '2024-02-28', description: 'Pala Banda & cengkeh Ambon' },
  { id: 28, name: 'Kopdes Merah Putih Jayapura', province: 'Papua', district: 'Kab. Jayapura', lat: -2.6040, lng: 140.6699, members: 134, status: 'Aktif', established: '2024-04-17', description: 'Kopi Wamena & noken Papua' },
  { id: 29, name: 'Kopdes Merah Putih Manokwari', province: 'Papua Barat', district: 'Kab. Manokwari', lat: -0.8615, lng: 134.0752, members: 112, status: 'Aktif', established: '2024-05-10', description: 'Coklat Papua & sagu' },
  
  // === TAMBAHAN ===
  { id: 30, name: 'Kopdes Merah Putih Sleman', province: 'DI Yogyakarta', district: 'Kab. Sleman', lat: -7.7156, lng: 110.3553, members: 445, status: 'Aktif', established: '2022-06-01', description: 'Salak pondoh & kerajinan gerabah Kasongan' },
  { id: 31, name: 'Kopdes Merah Putih Tabanan', province: 'Bali', district: 'Kab. Tabanan', lat: -8.5410, lng: 115.1257, members: 367, status: 'Aktif', established: '2022-11-17', description: 'Beras merah organik & minyak kelapa murni' },
  { id: 32, name: 'Kopdes Merah Putih Enrekang', province: 'Sulawesi Selatan', district: 'Kab. Enrekang', lat: -3.5670, lng: 119.7850, members: 289, status: 'Aktif', established: '2023-10-15', description: 'Bawang goreng Enrekang & kopi robusta' },
  { id: 33, name: 'Kopdes Merah Putih Solok', province: 'Sumatera Barat', district: 'Kab. Solok', lat: -0.7901, lng: 100.6561, members: 356, status: 'Aktif', established: '2022-12-20', description: 'Padi Solok & ikan bilih Danau Singkarak' },
  { id: 34, name: 'Kopdes Merah Putih Karangasem', province: 'Bali', district: 'Kab. Karangasem', lat: -8.4497, lng: 115.6027, members: 234, status: 'Aktif', established: '2023-07-05', description: 'Garam tradisional Kusamba & anggur Bali' },
  { id: 35, name: 'Kopdes Merah Putih Siak', province: 'Riau', district: 'Kab. Siak', lat: 1.1045, lng: 102.1468, members: 298, status: 'Aktif', established: '2023-08-22', description: 'Kelapa sawit rakyat & madu Sialang' },
];

/**
 * Haversine formula — menghitung jarak antara dua titik koordinat di permukaan bumi
 * @returns jarak dalam kilometer
 */
export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Menemukan N kopdes terdekat dari posisi pengguna
 * @param {number} userLat - Latitude pengguna
 * @param {number} userLng - Longitude pengguna
 * @param {Array} kopdesList - Array lokasi Kopdes
 * @param {number} limit - Jumlah maksimal hasil (default 5)
 * @returns Array kopdes terdekat dengan properti `distance` (km)
 */
export function findNearestKopdes(userLat, userLng, kopdesList, limit = 5) {
  return kopdesList
    .map((k) => ({
      ...k,
      distance: haversineDistance(userLat, userLng, k.lat, k.lng)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}

/**
 * Statistik ringkasan
 */
export function getKopdesStats(kopdesList) {
  const totalMembers = kopdesList.reduce((sum, k) => sum + k.members, 0);
  const provinces = [...new Set(kopdesList.map(k => k.province))];
  return {
    totalKopdes: kopdesList.length,
    totalMembers,
    totalProvinces: provinces.length,
    provinces
  };
}
