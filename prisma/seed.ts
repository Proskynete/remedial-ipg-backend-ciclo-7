/**
 * Database Seed Script
 * Creates test data: users and products
 *
 * Run with: node prisma/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Clear existing data (optional - comment out if you don't want to clean)
  console.log('🗑️  Cleaning existing data...');
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Data cleaned\n');

  // Create users
  console.log('👥 Creating users...');

  const passwordHash = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@ejemplo.com',
      password: passwordHash,
      firstName: 'Admin',
      lastName: 'Sistema',
      role: 'ADMIN'
    }
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'juan@ejemplo.com',
      password: passwordHash,
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'USER'
    }
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'maria@ejemplo.com',
      password: passwordHash,
      firstName: 'María',
      lastName: 'García',
      role: 'MODERATOR'
    }
  });

  console.log('✅ Users created:');
  console.log(`   - ${admin.email} (ADMIN)`);
  console.log(`   - ${user1.email} (USER)`);
  console.log(`   - ${user2.email} (MODERATOR)`);
  console.log(`   - Password for all: password123\n`);

  // Create products
  console.log('📦 Creating products...');

  const products = [
    {
      name: 'Laptop Dell XPS 15',
      description: 'High-performance laptop with 4K display, Intel i7 processor and 16GB RAM',
      price: 1899.99,
      stock: 10,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45',
      userId: admin.id
    },
    {
      name: 'iPhone 15 Pro',
      description: 'Premium smartphone with A17 Pro chip and 48MP camera',
      price: 1199.99,
      stock: 25,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1592286927505-4423a7d2b7f6',
      userId: user1.id
    },
    {
      name: 'Sony WH-1000XM5 Headphones',
      description: 'Wireless headphones with noise cancellation',
      price: 399.99,
      stock: 15,
      category: 'audio',
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb',
      userId: user1.id
    },
    {
      name: 'LG UltraWide 34" Monitor',
      description: '34-inch ultra-wide monitor, 3440x1440 resolution',
      price: 649.99,
      stock: 8,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
      userId: user2.id
    },
    {
      name: 'Keychron K2 Mechanical Keyboard',
      description: 'Wireless mechanical keyboard with Gateron switches',
      price: 89.99,
      stock: 30,
      category: 'accessories',
      image: 'https://images.unsplash.com/photo-1595225476474-87563907a212',
      userId: user2.id
    },
    {
      name: 'Logitech MX Master 3 Mouse',
      description: 'Ergonomic wireless mouse for productivity',
      price: 99.99,
      stock: 20,
      category: 'accessories',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db',
      userId: admin.id
    },
    {
      name: 'Logitech C920 Webcam',
      description: 'Full HD 1080p webcam for video conferencing',
      price: 79.99,
      stock: 12,
      category: 'accessories',
      image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da',
      userId: user1.id
    },
    {
      name: 'Samsung 980 PRO 1TB SSD',
      description: 'High-speed NVMe solid-state drive',
      price: 149.99,
      stock: 40,
      category: 'storage',
      image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b',
      userId: admin.id
    },
    {
      name: 'iPad Air Tablet',
      description: '10.9-inch tablet with M1 chip and Liquid Retina display',
      price: 599.99,
      stock: 18,
      category: 'electronics',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0',
      userId: user2.id
    },
    {
      name: 'Anker PowerPort Charger',
      description: '6-port USB charger with PowerIQ technology',
      price: 29.99,
      stock: 50,
      category: 'accessories',
      image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0',
      userId: user1.id
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ ${products.length} products created\n`);

  // Show summary
  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();

  console.log('📊 Summary:');
  console.log(`   - Total users: ${totalUsers}`);
  console.log(`   - Total products: ${totalProducts}`);
  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Test credentials:');
  console.log('   Email: admin@ejemplo.com | Password: password123');
  console.log('   Email: juan@ejemplo.com | Password: password123');
  console.log('   Email: maria@ejemplo.com | Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error running seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
