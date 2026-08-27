import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database Warung Jajanan Lenira...');

  // Clear existing records
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.consignmentMaker.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  const adminPassword = await bcrypt.hash('leniherlina123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Ibu Leni Herlina (Pemilik Warung)',
      email: 'leniherlina123@gmail.com',
      phone: '081234567890',
      passwordHash: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Rian Pratama',
      email: 'rian@gmail.com',
      phone: '085712345678',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      addresses: {
        create: {
          recipientName: 'Rian Pratama',
          phone: '085712345678',
          street: 'Jl. Melati No. 14, RT 03 / RW 05',
          village: 'Sukamaju',
          district: 'Cilodong',
          city: 'Depok',
          postalCode: '16415',
          notes: 'Pagar hitam samping pos satpam',
          isPrimary: true,
        },
      },
    },
  });

  console.log('✅ Admin & Customer created');

  // 2. Create Consignment Makers (Mitra Titipan)
  const maker1 = await prisma.consignmentMaker.create({
    data: {
      name: 'Bu Siti (Kue Basah & Gorengan)',
      phone: '081298765432',
      address: 'RT 02 RW 04, Gg. Kenanga',
      bio: 'Spesialis risoles ragout lumer dan lemper ayam bakar pulen resep turun-temurun.',
    },
  });

  const maker2 = await prisma.consignmentMaker.create({
    data: {
      name: 'Mbak Rini (Donat & Bakery Rumahan)',
      phone: '085611223344',
      address: 'Perum Griya Asri Blok C2',
      bio: 'Membuat donat kentang empuk kampung dan bolu kukus mekar setiap subuh.',
    },
  });

  const maker3 = await prisma.consignmentMaker.create({
    data: {
      name: 'Pak Joko (Keripik Singkong Renyah)',
      phone: '081377889900',
      address: 'Desa Krajan No. 88',
      bio: 'Pengrajin keripik singkong gurih bawang dan pedas manis khas pedesaan.',
    },
  });

  console.log('✅ Mitra Titipan created');

  // 3. Create Categories
  const catSembako = await prisma.category.create({
    data: {
      name: 'Sembako & Kebutuhan Pokok',
      slug: 'sembako',
      description: 'Beras pulen, minyak goreng, telur segar, gula, dan aneka kebutuhan pokok dapur.',
      icon: '🛒',
      order: 1,
    },
  });

  const catJajanan = await prisma.category.create({
    data: {
      name: 'Jajanan & Snack',
      slug: 'jajanan',
      description: 'Aneka camilan gurih, basreng renyah daun jeruk, keripik, dan snack nikmat.',
      icon: '🍿',
      order: 2,
    },
  });

  console.log('✅ Categories created (Sembako & Jajanan)');

  // 4. Create Products (>20 authentic warung products)
  const productsData = [
    {
      name: 'Basreng Pedas Daun Jeruk 200g',
      slug: 'basreng-pedas-daun-jeruk-200g',
      description: 'Baso goreng stik renyah dibalut bumbu cabai asli dan aroma daun jeruk segar yang wangi. Tingkat kepedasan pas dan tidak keras saat digigit.',
      price: 15000,
      stock: 45,
      soldCount: 182,
      rating: 4.9,
      reviewCount: 34,
      image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600&auto=format&fit=crop&q=80',
      unit: 'bungkus',
      categoryId: catJajanan.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Makaroni Renyah Balado Daun Jeruk 150g',
      slug: 'makaroni-renyah-balado-daun-jeruk-150g',
      description: 'Makaroni spiral gurih bumbu balado gurih manis dan sedikit pedas. Renyah dan cocok untuk teman nonton atau belajar.',
      price: 12000,
      stock: 60,
      soldCount: 140,
      rating: 4.8,
      reviewCount: 22,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      unit: 'bungkus',
      categoryId: catJajanan.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Keripik Singkong Balado Khas Warung 250g',
      slug: 'keripik-singkong-balado-khas-warung-250g',
      description: 'Keripik singkong pilihan diiris tipis renyah dengan baluran saus karamel balado pedas manis yang lengket dan nagih.',
      price: 18000,
      stock: 30,
      soldCount: 95,
      rating: 4.9,
      reviewCount: 19,
      image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=600&auto=format&fit=crop&q=80',
      unit: 'bungkus',
      categoryId: catJajanan.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Risoles Ragout Ayam Spesial (Isi 3)',
      slug: 'risoles-ragout-ayam-spesial-isi-3',
      description: 'Produk titipan segar Bu Siti. Kulit risoles lembut dibalut tepung roti renyah, dengan isian ayam suwir melimpah, wortel, dan saus susu keju yang lumer.',
      price: 15000,
      stock: 20,
      soldCount: 68,
      rating: 5.0,
      reviewCount: 16,
      image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
      unit: 'porsi',
      categoryId: catJajanan.id,
      isConsignment: true,
      consignmentMakerId: maker1.id,
      isBestSeller: true,
      isNewArrival: true,
    },
    {
      name: 'Lemper Ayam Bakar Pulen (Isi 3)',
      slug: 'lemper-ayam-bakar-pulen-isi-3',
      description: 'Ketan pulen dibakar harum di atas daun pisang, dengan isian daging ayam bumbu gurih ketumbar manis yang melimpah.',
      price: 12000,
      stock: 15,
      soldCount: 52,
      rating: 4.9,
      reviewCount: 11,
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      unit: 'mika',
      categoryId: catJajanan.id,
      isConsignment: true,
      consignmentMakerId: maker1.id,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'Donat Kentang Kampung Gula Halus (Isi 4)',
      slug: 'donat-kentang-kampung-gula-halus-isi-4',
      description: 'Donat olahan kentang asli dari Mbak Rini. Tekstur sangat lembut dan empuk tahan seharian, dilengkapi taburan gula salju manis dingin.',
      price: 14000,
      stock: 18,
      soldCount: 88,
      rating: 4.9,
      reviewCount: 20,
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
      unit: 'box',
      categoryId: catJajanan.id,
      isConsignment: true,
      consignmentMakerId: maker2.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Keripik Tempe Sagu Gurih Renyah 200g',
      slug: 'keripik-tempe-sagu-gurih-renyah-200g',
      description: 'Irisan tempe murni dengan baluran tepung sagu bumbu ketumbar dan bawang putih. Sangat renyah dan gurih.',
      price: 16000,
      stock: 25,
      soldCount: 42,
      rating: 4.7,
      reviewCount: 8,
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&auto=format&fit=crop&q=80',
      unit: 'bungkus',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'Pilus Keju Gurih Lumer 180g',
      slug: 'pilus-keju-gurih-lumer-180g',
      description: 'Bola-bola tepung sagu rasa keju cheddar gurih renyah yang langsung renyah gurih di mulut. Camilan favorit anak-anak dan dewasa.',
      price: 13000,
      stock: 35,
      soldCount: 75,
      rating: 4.8,
      reviewCount: 14,
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
      unit: 'bungkus',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Es Kopi Susu Gula Aren Lenira 250ml',
      slug: 'es-kopi-susu-gula-aren-lenira-250ml',
      description: 'Kopi susu racikan khas Ibu Lenira menggunakan biji kopi robusta berkualitas dipadu susu segar creamy dan gula aren murni organik.',
      price: 15000,
      stock: 20,
      soldCount: 110,
      rating: 5.0,
      reviewCount: 28,
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
      unit: 'botol',
      categoryId: catJajanan.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Es Cincau Susu Segar Gula Jawa',
      slug: 'es-cincau-susu-segar-gula-jawa',
      description: 'Cincau hitam alami kenyal dipadukan dengan kuah susu santan gurih dan sirup gula kelapa wangi pandan. Sangat menyegarkan.',
      price: 10000,
      stock: 25,
      soldCount: 84,
      rating: 4.8,
      reviewCount: 15,
      image: 'https://images.unsplash.com/photo-1556881286-fc6915169721?w=600&auto=format&fit=crop&q=80',
      unit: 'cup',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'Teh Pucuk Harum Dingin 350ml',
      slug: 'teh-pucuk-harum-dingin-350ml',
      description: 'Teh melati dalam botol yang disajikan dingin dari kulkas showcase warung. Rasa manis pas dan segar.',
      price: 5000,
      stock: 100,
      soldCount: 320,
      rating: 4.9,
      reviewCount: 45,
      image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&auto=format&fit=crop&q=80',
      unit: 'botol',
      categoryId: catJajanan.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Air Mineral Le Minerale Dingin 600ml',
      slug: 'air-mineral-le-minerale-dingin-600ml',
      description: 'Air mineral pegunungan alami dengan perpaduan mineral alami yang menyegarkan tubuh seketika.',
      price: 4000,
      stock: 120,
      soldCount: 450,
      rating: 5.0,
      reviewCount: 50,
      image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=600&auto=format&fit=crop&q=80',
      unit: 'botol',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Kue Lapis Pepe Pelangi (Isi 2 Potong)',
      slug: 'kue-lapis-pepe-pelangi-isi-2',
      description: 'Kue lapis sagu Betawi kenyal berlapis warna-warni ceria dengan wangi santan dan daun pandan suji alami.',
      price: 8000,
      stock: 15,
      soldCount: 40,
      rating: 4.8,
      reviewCount: 9,
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
      unit: 'mika',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'Kue Pastel Isi Sayur Telur (Isi 3)',
      slug: 'kue-pastel-isi-sayur-telur-isi-3',
      description: 'Pastel goreng kulit renyah berlapis dengan isian bihun wortel gurih dan potongan telur rebus. Disertai cabai rawit hijau.',
      price: 12000,
      stock: 20,
      soldCount: 65,
      rating: 4.9,
      reviewCount: 13,
      image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=600&auto=format&fit=crop&q=80',
      unit: 'porsi',
      categoryId: catJajanan.id,
      isConsignment: true,
      consignmentMakerId: maker1.id,
      isBestSeller: false,
      isNewArrival: true,
    },
    {
      name: 'Cokelat SilverQueen Chunky Bar 95g',
      slug: 'cokelat-silverqueen-chunky-bar-95g',
      description: 'Cokelat batangan tebal legendaris dengan butiran kacang mete panggang renyah berlimpah di setiap gigitan.',
      price: 24000,
      stock: 35,
      soldCount: 88,
      rating: 4.9,
      reviewCount: 18,
      image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&auto=format&fit=crop&q=80',
      unit: 'pcs',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Biskuit Khong Guan Mini Assorted 300g',
      slug: 'biskuit-khong-guan-mini-assorted-300g',
      description: 'Kaleng biskuit aneka rasa legendaris cocok untuk suguhan tamu atau camilan keluarga di rumah.',
      price: 35000,
      stock: 14,
      soldCount: 29,
      rating: 4.8,
      reviewCount: 6,
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600&auto=format&fit=crop&q=80',
      unit: 'kaleng',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Indomie Goreng Spesial 1 Dus (40 Pcs)',
      slug: 'indomie-goreng-spesial-1-dus-40-pcs',
      description: 'Mie instan goreng favorit Indonesia dalam kemasan dus isi 40 bungkus. Harga grosir hemat untuk stok rumahan.',
      price: 128000,
      stock: 10,
      soldCount: 45,
      rating: 5.0,
      reviewCount: 12,
      image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=600&auto=format&fit=crop&q=80',
      unit: 'dus',
      categoryId: catSembako.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Minyak Goreng Tropical Pouch 2 Liter',
      slug: 'minyak-goreng-tropical-pouch-2-liter',
      description: 'Minyak goreng kelapa sawit 2x penyaringan berkualitas tinggi, jernih dan hemat untuk masakan gorengan garing.',
      price: 38000,
      stock: 25,
      soldCount: 78,
      rating: 4.9,
      reviewCount: 15,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&auto=format&fit=crop&q=80',
      unit: 'pouch',
      categoryId: catSembako.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Beras Pandan Wangi Premium 5 Kg',
      slug: 'beras-pandan-wangi-premium-5-kg',
      description: 'Beras putih pulen alami dengan wangi pandan alami tanpa pemutih atau pewangi buatan. Nasi pulen dan sedap.',
      price: 74000,
      stock: 18,
      soldCount: 50,
      rating: 4.9,
      reviewCount: 10,
      image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
      unit: 'karung',
      categoryId: catSembako.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Telur Ayam Negeri Segar 1 Kg',
      slug: 'telur-ayam-negeri-segar-1-kg',
      description: 'Telur ayam negeri segar dari peternakan lokal, cangkang tebal bersih dan kuning telur oranye pekat bernutrisi.',
      price: 29000,
      stock: 40,
      soldCount: 130,
      rating: 4.9,
      reviewCount: 25,
      image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600&auto=format&fit=crop&q=80',
      unit: 'kg',
      categoryId: catSembako.id,
      isBestSeller: true,
      isNewArrival: false,
    },
    {
      name: 'Wafer Tango Cokelat Kaleng 300g',
      slug: 'wafer-tango-cokelat-kaleng-300g',
      description: 'Wafer lapis cokelat tebal dengan kelezatan cokelat otentik yang renyah dan nikmat.',
      price: 32000,
      stock: 0, // Testing stock habis badge
      soldCount: 30,
      rating: 4.8,
      reviewCount: 5,
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600&auto=format&fit=crop&q=80',
      unit: 'kaleng',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: false,
    },
    {
      name: 'Kerupuk Ikan Tenggiri Kancing 150g',
      slug: 'kerupuk-ikan-tenggiri-kancing-150g',
      description: 'Kerupuk kancing mini rasa ikan tenggiri asli yang gurih, garing, dan cocok untuk pendamping makan nasi atau soto.',
      price: 16000,
      stock: 22,
      soldCount: 38,
      rating: 4.7,
      reviewCount: 7,
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
      unit: 'bungkus',
      categoryId: catJajanan.id,
      isBestSeller: false,
      isNewArrival: true,
    }
  ];

  for (const p of productsData) {
    const product = await prisma.product.create({
      data: p,
    });

    // Add some sample reviews
    await prisma.review.create({
      data: {
        productId: product.id,
        userName: 'Siti Rahma',
        rating: 5,
        comment: 'Rasa mantap banget, pesanan sampai cepat dan masih hangat/renyah! Langganan di Lenira terus.',
      },
    });
  }

  console.log('✅ 22 Products seeded');

  // 5. Create Coupons
  await prisma.coupon.create({
    data: {
      code: 'LENIRAHEMAT',
      description: 'Potongan Rp 5.000 untuk pembelian minimal Rp 30.000',
      discountType: 'FIXED',
      discountValue: 5000,
      minOrder: 30000,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'JAJANENAK',
      description: 'Diskon 10% untuk jajan santai',
      discountType: 'PERCENT',
      discountValue: 10,
      minOrder: 25000,
      maxDiscount: 15000,
      isActive: true,
    },
  });

  console.log('✅ Coupons created');

  console.log('🎉 Seed database Warung Jajanan Lenira berhasil selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
