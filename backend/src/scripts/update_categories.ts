import { prisma } from '../utils/prisma';

async function main() {
  console.log('--- Updating Categories to Sembako & Jajanan ---');

  // 1. Upsert Sembako category
  let sembako = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'sembako' },
        { slug: 'sembako-kebutuhan' },
        { name: { contains: 'Sembako' } },
      ],
    },
  });

  if (!sembako) {
    sembako = await prisma.category.create({
      data: {
        name: 'Sembako & Kebutuhan Pokok',
        slug: 'sembako',
        description: 'Beras pulen, minyak goreng, telur segar, gula, dan aneka kebutuhan pokok dapur.',
        icon: '🛒',
        order: 1,
      },
    });
  } else {
    sembako = await prisma.category.update({
      where: { id: sembako.id },
      data: {
        name: 'Sembako & Kebutuhan Pokok',
        slug: 'sembako',
        description: 'Beras pulen, minyak goreng, telur segar, gula, dan aneka kebutuhan pokok dapur.',
        icon: '🛒',
        order: 1,
      },
    });
  }

  // 2. Upsert Jajanan category
  let jajanan = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'jajanan' },
        { slug: 'jajanan-snack' },
        { name: { contains: 'Jajanan' } },
      ],
    },
  });

  if (!jajanan) {
    jajanan = await prisma.category.create({
      data: {
        name: 'Jajanan & Snack',
        slug: 'jajanan',
        description: 'Aneka camilan gurih, basreng renyah daun jeruk, keripik, dan snack nikmat.',
        icon: '🍿',
        order: 2,
      },
    });
  } else {
    jajanan = await prisma.category.update({
      where: { id: jajanan.id },
      data: {
        name: 'Jajanan & Snack',
        slug: 'jajanan',
        description: 'Aneka camilan gurih, basreng renyah daun jeruk, keripik, dan snack nikmat.',
        icon: '🍿',
        order: 2,
      },
    });
  }

  // 3. Move all products that belong to other old categories to sembako or jajanan
  const allProducts = await prisma.product.findMany();
  for (const prod of allProducts) {
    const isSembako =
      prod.name.toLowerCase().includes('beras') ||
      prod.name.toLowerCase().includes('telur') ||
      prod.name.toLowerCase().includes('minyak') ||
      prod.name.toLowerCase().includes('gula') ||
      prod.name.toLowerCase().includes('tepung') ||
      prod.categoryId === sembako.id;

    const targetCatId = isSembako ? sembako.id : jajanan.id;
    if (prod.categoryId !== targetCatId) {
      await prisma.product.update({
        where: { id: prod.id },
        data: { categoryId: targetCatId },
      });
      console.log(`Moved product "${prod.name}" -> ${isSembako ? 'Sembako' : 'Jajanan'}`);
    }
  }

  // 4. Delete old unused categories (categories not in [sembako.id, jajanan.id])
  const deletedOldCats = await prisma.category.deleteMany({
    where: {
      id: {
        notIn: [sembako.id, jajanan.id],
      },
    },
  });
  console.log(`Deleted ${deletedOldCats.count} old unused categories.`);

  const remaining = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
  });
  console.log('Categories now in DB:', remaining);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
