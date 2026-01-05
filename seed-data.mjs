import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const db = drizzle(DATABASE_URL);

// Helper function to generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to get random item from array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

async function seedData() {
  console.log('🌱 Starting to seed data...');

  try {
    const connection = await mysql.createConnection(DATABASE_URL);
    
    // Get merchant ID (assuming merchant@sari.sa exists)
    const [merchants] = await connection.execute('SELECT id FROM merchants LIMIT 1');
    if (merchants.length === 0) {
      console.error('No merchant found. Please create a merchant first.');
      process.exit(1);
    }
    const merchantId = merchants[0].id;
    console.log(`✓ Using merchant ID: ${merchantId}`);

    // 1. Seed Products
    console.log('\n📦 Seeding products...');
    const products = [
      { name: 'ساعة ذكية برو', price: 1299, description: 'ساعة ذكية بمميزات متقدمة', category: 'إلكترونيات', stock: 50, imageUrl: 'https://picsum.photos/seed/watch1/400/400' },
      { name: 'سماعات لاسلكية', price: 499, description: 'سماعات بلوتوث عالية الجودة', category: 'إلكترونيات', stock: 100, imageUrl: 'https://picsum.photos/seed/headphones/400/400' },
      { name: 'حقيبة جلدية فاخرة', price: 899, description: 'حقيبة جلد طبيعي', category: 'إكسسوارات', stock: 30, imageUrl: 'https://picsum.photos/seed/bag1/400/400' },
      { name: 'عطر رجالي فاخر', price: 650, description: 'عطر فرنسي أصلي', category: 'عطور', stock: 75, imageUrl: 'https://picsum.photos/seed/perfume1/400/400' },
      { name: 'محفظة جلدية', price: 299, description: 'محفظة أنيقة للرجال', category: 'إكسسوارات', stock: 120, imageUrl: 'https://picsum.photos/seed/wallet/400/400' },
      { name: 'نظارة شمسية', price: 450, description: 'نظارة بحماية UV', category: 'إكسسوارات', stock: 60, imageUrl: 'https://picsum.photos/seed/sunglasses/400/400' },
      { name: 'شاحن لاسلكي سريع', price: 199, description: 'شاحن 15W سريع', category: 'إلكترونيات', stock: 150, imageUrl: 'https://picsum.photos/seed/charger/400/400' },
      { name: 'كاميرا رقمية', price: 2499, description: 'كاميرا احترافية 24MP', category: 'إلكترونيات', stock: 20, imageUrl: 'https://picsum.photos/seed/camera/400/400' },
      { name: 'حذاء رياضي', price: 599, description: 'حذاء مريح للرياضة', category: 'أحذية', stock: 80, imageUrl: 'https://picsum.photos/seed/shoes1/400/400' },
      { name: 'قميص قطني', price: 249, description: 'قميص قطن 100%', category: 'ملابس', stock: 200, imageUrl: 'https://picsum.photos/seed/shirt1/400/400' },
      { name: 'بنطال جينز', price: 399, description: 'جينز عصري', category: 'ملابس', stock: 90, imageUrl: 'https://picsum.photos/seed/jeans/400/400' },
      { name: 'حقيبة ظهر', price: 349, description: 'حقيبة عملية للسفر', category: 'حقائب', stock: 110, imageUrl: 'https://picsum.photos/seed/backpack/400/400' },
      { name: 'ميدالية ذهبية', price: 1899, description: 'ميدالية ذهب عيار 21', category: 'مجوهرات', stock: 15, imageUrl: 'https://picsum.photos/seed/necklace/400/400' },
      { name: 'ساعة حائط ديجيتال', price: 179, description: 'ساعة LED حديثة', category: 'ديكور', stock: 45, imageUrl: 'https://picsum.photos/seed/clock/400/400' },
      { name: 'لوحة فنية', price: 799, description: 'لوحة كانفس مطبوعة', category: 'ديكور', stock: 25, imageUrl: 'https://picsum.photos/seed/painting/400/400' },
    ];

    const productIds = [];
    for (const product of products) {
      const [result] = await connection.execute(
        `INSERT INTO products (merchantId, name, description, price, stock, category, imageUrl, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [merchantId, product.name, product.description, product.price, product.stock, product.category, product.imageUrl]
      );
      productIds.push(result.insertId);
    }
    console.log(`✓ Added ${products.length} products`);

    // 2. Seed Orders
    console.log('\n📋 Seeding orders...');
    const statuses = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'];
    const cities = ['الرياض', 'جدة', 'الدمام', 'مكة', 'المدينة', 'الطائف', 'تبوك', 'أبها'];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    for (let i = 0; i < 50; i++) {
      const orderDate = randomDate(sixtyDaysAgo, now);
      const status = randomItem(statuses);
      const customerPhone = `05${Math.floor(10000000 + Math.random() * 90000000)}`;
      const customerName = randomItem(['أحمد محمد', 'فاطمة علي', 'خالد سعيد', 'نورة عبدالله', 'عمر حسن', 'سارة إبراهيم', 'يوسف أحمد', 'مريم خالد']);
      const city = randomItem(cities);
      
      // Random 1-3 items per order
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const orderItems = [];
      let totalAmount = 0;
      
      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        orderItems.push({
          name: product.name,
          quantity: quantity,
          price: product.price
        });
        totalAmount += product.price * quantity;
      }

      await connection.execute(
        `INSERT INTO orders (merchantId, orderNumber, customerPhone, customerName, address, city, items, totalAmount, status, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          merchantId,
          `ORD-${String(i + 1).padStart(5, '0')}`,
          customerPhone,
          customerName,
          `${city} - حي النموذجي - شارع ${Math.floor(Math.random() * 50) + 1}`,
          city,
          JSON.stringify(orderItems),
          totalAmount,
          status,
          orderDate,
          orderDate
        ]
      );
    }
    console.log('✓ Added 50 orders');

    // 3. Seed Conversations & Messages
    console.log('\n💬 Seeding conversations and messages...');
    const conversationTopics = [
      'استفسار عن المنتج',
      'طلب جديد',
      'شكوى',
      'استفسار عن التوصيل',
      'طلب إلغاء',
      'استفسار عن الأسعار'
    ];

    for (let i = 0; i < 15; i++) {
      const customerPhone = `05${Math.floor(10000000 + Math.random() * 90000000)}`;
      const customerName = randomItem(['أحمد محمد', 'فاطمة علي', 'خالد سعيد', 'نورة عبدالله', 'عمر حسن', 'سارة إبراهيم']);
      const status = randomItem(['active', 'closed']);
      const lastMessageAt = randomDate(thirtyDaysAgo, now);

      const [convResult] = await connection.execute(
        `INSERT INTO conversations (merchantId, customerPhone, customerName, status, lastMessageAt, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [merchantId, customerPhone, customerName, status, lastMessageAt, lastMessageAt, lastMessageAt]
      );
      
      const conversationId = convResult.insertId;

      // Add 2-4 messages per conversation
      const messageCount = Math.floor(Math.random() * 3) + 2;
      for (let j = 0; j < messageCount; j++) {
        const isFromCustomer = j % 2 === 0;
        const messageDate = new Date(lastMessageAt.getTime() - (messageCount - j) * 60 * 60 * 1000);
        
        const customerMessages = [
          'السلام عليكم، أريد الاستفسار عن هذا المنتج',
          'هل المنتج متوفر؟',
          'كم سعر التوصيل؟',
          'متى يصل الطلب؟',
          'شكراً لكم',
          'أريد إلغاء الطلب',
          'هل يوجد خصم؟'
        ];
        
        const botMessages = [
          'وعليكم السلام، كيف يمكنني مساعدتك؟',
          'نعم المنتج متوفر',
          'التوصيل مجاني للطلبات فوق 200 ريال',
          'يصل خلال 2-3 أيام عمل',
          'العفو، نحن في خدمتك',
          'تم إلغاء الطلب بنجاح',
          'نعم يوجد خصم 10% على الطلبات الأولى'
        ];

        const content = isFromCustomer 
          ? randomItem(customerMessages)
          : randomItem(botMessages);

        await connection.execute(
          `INSERT INTO messages (conversationId, content, direction, messageType, isProcessed, createdAt) 
           VALUES (?, ?, ?, 'text', ?, ?)`,
          [conversationId, content, isFromCustomer ? 'incoming' : 'outgoing', !isFromCustomer, messageDate]
        );
      }
    }
    console.log('✓ Added 30 conversations with messages');

    // 4. Seed Campaigns
    console.log('\n📢 Seeding campaigns...');
    const campaignNames = [
      'عرض الصيف الكبير',
      'تخفيضات نهاية الموسم',
      'عرض العودة للمدارس',
      'عرض رمضان الكريم',
      'تخفيضات اليوم الوطني',
      'عرض الجمعة البيضاء',
      'عرض نهاية السنة',
      'عرض المنتجات الجديدة'
    ];

    for (let i = 0; i < 8; i++) {
      const campaignDate = randomDate(thirtyDaysAgo, now);
      const status = randomItem(['draft', 'scheduled', 'sending', 'completed', 'failed']);
      
      await connection.execute(
        `INSERT INTO campaigns (merchantId, name, message, targetAudience, status, scheduledAt, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          merchantId,
          campaignNames[i],
          `🎉 ${campaignNames[i]}! خصم يصل إلى 50% على جميع المنتجات. لا تفوت الفرصة!`,
          'all',
          status,
          status === 'scheduled' ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : campaignDate,
          campaignDate,
          campaignDate
        ]
      );
    }
    console.log('✓ Added 8 campaigns');

    // 5. Seed Discount Codes
    console.log('\n🎫 Seeding discount codes...');
    const discountCodes = [
      { code: 'SUMMER2024', discount: 20, type: 'percentage', maxUses: 100 },
      { code: 'WELCOME10', discount: 10, type: 'percentage', maxUses: 1000 },
      { code: 'SAVE50', discount: 50, type: 'fixed', maxUses: 50 },
      { code: 'FIRST25', discount: 25, type: 'percentage', maxUses: 200 },
      { code: 'VIP30', discount: 30, type: 'percentage', maxUses: 30 }
    ];

    for (const dc of discountCodes) {
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      await connection.execute(
        `INSERT IGNORE INTO discount_codes (merchantId, code, type, value, maxUses, usedCount, expiresAt, isActive, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
        [merchantId, dc.code, dc.type, dc.discount, dc.maxUses, Math.floor(Math.random() * dc.maxUses * 0.3), expiresAt]
      );
    }
    console.log('✓ Added 5 discount codes');

    // 6. Seed Abandoned Carts
    console.log('\n🛒 Seeding abandoned carts...');
    for (let i = 0; i < 15; i++) {
      const customerPhone = `05${Math.floor(10000000 + Math.random() * 90000000)}`;
      const product = products[Math.floor(Math.random() * products.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const cartDate = randomDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), now);
      
      await connection.execute(
        `INSERT INTO abandoned_carts (merchantId, customerPhone, customerName, items, totalAmount, reminderSent, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          merchantId,
          customerPhone,
          randomItem(['أحمد محمد', 'فاطمة علي', 'خالد سعيد']),
          JSON.stringify([{ name: product.name, quantity: quantity, price: product.price }]),
          product.price * quantity,
          Math.random() > 0.5,
          cartDate,
          cartDate
        ]
      );
    }
    console.log('✓ Added 15 abandoned carts');

    await connection.end();
    console.log('\n✅ Seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();
