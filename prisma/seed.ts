import { PrismaClient, ProductStatus, OrderStatus, AdminRole } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.admin.deleteMany();

  // Create Categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Pria",
        slug: "pria",
        description: "Kacamata untuk pria dengan berbagai gaya modern dan klasik"
      }
    }),
    prisma.category.create({
      data: {
        name: "Wanita", 
        slug: "wanita",
        description: "Kacamata elegan untuk wanita dengan desain yang fashionable"
      }
    }),
    prisma.category.create({
      data: {
        name: "Anak",
        slug: "anak", 
        description: "Kacamata aman dan nyaman untuk anak-anak"
      }
    }),
    prisma.category.create({
      data: {
        name: "Anti Radiasi",
        slug: "anti-radiasi",
        description: "Kacamata dengan perlindungan blue light untuk kesehatan mata"
      }
    }),
    prisma.category.create({
      data: {
        name: "Sport",
        slug: "sport",
        description: "Kacamata khusus untuk aktivitas olahraga dan outdoor"
      }
    })
  ]);

  console.log("✅ Categories created");

  // Create Products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: "Kacamata Classic Retro",
        slug: "kacamata-classic-retro",
        description: "Kacamata klasik dengan gaya retro untuk pria modern. Frame berkualitas tinggi dengan desain timeless.",
        price: 299000,
        stock: 25,
        status: ProductStatus.AVAILABLE,
        badge: "Best Seller",
        categoryId: categories[0].id, // Pria
        images: JSON.stringify(["/images/classic-retro-1.jpg", "/images/classic-retro-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Sunglasses Premium Lady",
        slug: "sunglasses-premium-lady",
        description: "Kacamata hitam premium untuk wanita elegan. UV protection dengan style yang fashionable.",
        price: 450000,
        stock: 18,
        status: ProductStatus.AVAILABLE,
        badge: "New",
        categoryId: categories[1].id, // Wanita
        images: JSON.stringify(["/images/premium-lady-1.jpg", "/images/premium-lady-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Anti Radiasi Blue Light",
        slug: "anti-radiasi-blue-light",
        description: "Kacamata anti radiasi untuk melindungi mata dari blue light komputer dan gadget.",
        price: 350000,
        stock: 32,
        status: ProductStatus.AVAILABLE,
        badge: "Popular",
        categoryId: categories[3].id, // Anti Radiasi
        images: JSON.stringify(["/images/blue-light-1.jpg", "/images/blue-light-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Kids Fun Glasses",
        slug: "kids-fun-glasses",
        description: "Kacamata anak dengan desain fun dan aman. Material hypoallergenic untuk kenyamanan anak.",
        price: 180000,
        stock: 15,
        status: ProductStatus.AVAILABLE,
        badge: "",
        categoryId: categories[2].id, // Anak
        images: JSON.stringify(["/images/kids-fun-1.jpg", "/images/kids-fun-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Executive Men Style",
        slug: "executive-men-style",
        description: "Kacamata eksekutif dengan gaya profesional. Perfect untuk meeting dan acara formal.",
        price: 520000,
        stock: 12,
        status: ProductStatus.AVAILABLE,
        badge: "Premium",
        categoryId: categories[0].id, // Pria
        images: JSON.stringify(["/images/executive-1.jpg", "/images/executive-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Elegant Women Frame",
        slug: "elegant-women-frame",
        description: "Frame elegan untuk wanita karir. Desain sophisticated dengan kualitas premium.",
        price: 420000,
        stock: 20,
        status: ProductStatus.AVAILABLE,
        badge: "",
        categoryId: categories[1].id, // Wanita
        images: JSON.stringify(["/images/elegant-women-1.jpg", "/images/elegant-women-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Sports Active Glasses",
        slug: "sports-active-glasses",
        description: "Kacamata untuk aktivitas olahraga. Tahan impact dengan grip yang kuat.",
        price: 380000,
        stock: 8,
        status: ProductStatus.LOW_STOCK,
        badge: "Sport",
        categoryId: categories[4].id, // Sport
        images: JSON.stringify(["/images/sports-1.jpg", "/images/sports-2.jpg"])
      }
    }),
    prisma.product.create({
      data: {
        name: "Vintage Classic Round",
        slug: "vintage-classic-round",
        description: "Kacamata bulat vintage dengan gaya klasik. Limited edition dengan material premium.",
        price: 320000,
        stock: 0,
        status: ProductStatus.OUT_OF_STOCK,
        badge: "",
        categoryId: categories[0].id, // Pria
        images: JSON.stringify(["/images/vintage-round-1.jpg", "/images/vintage-round-2.jpg"])
      }
    })
  ]);

  console.log("✅ Products created");

  // Create Admin User
  const hashedPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      email: "admin@kacameta.com",
      password: hashedPassword,
      name: "Admin KacaMeta",
      role: AdminRole.SUPER_ADMIN
    }
  });

  // Create additional admin user
  const hashedPassword2 = await bcrypt.hash("staff123", 10);
  const admin2 = await prisma.admin.create({
    data: {
      username: "staff",
      email: "staff@kacameta.com", 
      password: hashedPassword2,
      name: "Staff KacaMeta",
      role: AdminRole.ADMIN
    }
  });

  console.log("✅ Admin users created");

  // Create Sample Customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Budi Santoso",
        email: "budi@email.com",
        phone: "081234567890",
        address: "Jl. Merdeka No. 123, Jakarta"
      }
    }),
    prisma.customer.create({
      data: {
        name: "Siti Aminah",
        email: "siti@email.com", 
        phone: "081234567891",
        address: "Jl. Sudirman No. 456, Bandung"
      }
    }),
    prisma.customer.create({
      data: {
        name: "Ahmad Rahman",
        phone: "081234567892",
        address: "Jl. Thamrin No. 789, Surabaya"
      }
    })
  ]);

  console.log("✅ Customers created");

  // Create Sample Orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: "ORD-001",
        customerId: customers[0].id,
        totalAmount: 299000,
        status: OrderStatus.DELIVERED,
        notes: "Pengiriman reguler",
        orderItems: {
          create: [
            {
              productId: products[0].id,
              quantity: 1,
              price: 299000
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: "ORD-002", 
        customerId: customers[1].id,
        totalAmount: 800000,
        status: OrderStatus.PROCESSING,
        notes: "Pesanan untuk hadiah",
        orderItems: {
          create: [
            {
              productId: products[1].id,
              quantity: 1,
              price: 450000
            },
            {
              productId: products[2].id,
              quantity: 1,
              price: 350000
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: "ORD-003",
        customerId: customers[2].id,
        totalAmount: 180000,
        status: OrderStatus.PENDING,
        notes: "Untuk anak umur 8 tahun",
        orderItems: {
          create: [
            {
              productId: products[3].id,
              quantity: 1,
              price: 180000
            }
          ]
        }
      }
    })
  ]);

  console.log("✅ Orders created");
  console.log("🎉 Database seeding completed!");
  
  console.log("\n📊 Summary:");
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Customers: ${customers.length}`);
  console.log(`- Orders: ${orders.length}`);
  console.log(`- Admin users: 2`);
  console.log("\n🔑 Admin Login:");
  console.log("Super Admin - Email: admin@kacameta.com, Password: admin123");
  console.log("Admin - Email: staff@kacameta.com, Password: staff123");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
