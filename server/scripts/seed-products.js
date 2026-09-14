require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const COMBO_DESCRIPTION =
  'একটি প্রিমিয়াম কোয়ালিটির তাঁতে বোনা সুতির শাড়ি, ম্যাচিং চুড়ি, জমকালো গলার সেট, কানের দুল, টিকলি, সুবাসিত গাজরা, কাঠগোলাপ হেয়ারক্লিপ, সাটিন বো ক্লিপ, টিপ, ভালোবাসার কার্ড/চিরকুট এবং আকর্ষণীয় গিফ্ট বক্স—প্রিয় মানুষকে উপহার দিয়ে মুখে হাসি ফোটানোর সম্পূর্ণ ১১-ইন-১ রাজকীয় প্যাকেজ!';

const COMBO_ITEMS_SUMMARY =
  'তাঁতের শাড়ি • চুড়ি • গলার সেট • কানের দুল • টিকলি • গাজরা • কাঠগোলাপ ক্লিপ • বো ক্লিপ • টিপ • কার্ড/চিরকুট • গিফ্ট বক্স';

const PRODUCTS = [
  {
    name: 'Handloom Cotton Saree Combo - Red + Maroon',
    banglaName: 'রক্তিম লাল ও মেরুন তাঁতের শাড়ি কম্বো',
    category: 'Red & Maroon',
    color: 'Red + Maroon',
    colorCode: '#880808',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'red', 'maroon', 'শাড়ি', 'লাল', 'মেরুন', 'তাঁতের শাড়ি', 'সুতি শাড়ি'],
    stock: 12,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Black + Orange',
    banglaName: 'অভিজাত ব্ল্যাক ও কপার অরেঞ্জ তাঁতের শাড়ি কম্বো',
    category: 'Black & Vibrant',
    color: 'Black + Orange',
    colorCode: '#1C1917',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'black', 'orange', 'কালো', 'কমলা', 'শাড়ি', 'তাঁতের শাড়ি'],
    stock: 8,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - White + Red',
    banglaName: 'শুভ্র সাদা ও রক্তিম লাল তাঁতের শাড়ি কম্বো',
    category: 'White Classics',
    color: 'White + Red',
    colorCode: '#cc0000',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'white', 'red', 'সাদা', 'লাল', 'পূজা', 'উৎসব', 'শাড়ি'],
    stock: 15,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Royal Blue + Red',
    banglaName: 'রয়্যাল ব্লু ও রুবি রেড তাঁতের শাড়ি কম্বো',
    category: 'Blue Elegance',
    color: 'Royal Blue + Red',
    colorCode: '#1E40AF',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'royal blue', 'blue', 'red', 'নীল', 'লাল', 'শাড়ি'],
    stock: 10,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Pink + Purple',
    banglaName: 'রানি পিঙ্ক ও পার্পল তাঁতের শাড়ি কম্বো',
    category: 'Pastel & Pink',
    color: 'Pink + Purple',
    colorCode: '#DB2777',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'pink', 'purple', 'গোলাপি', 'বেগুনি', 'শাড়ি'],
    stock: 14,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Royal Blue + White',
    banglaName: 'রয়্যাল ব্লু ও সিলভার হোয়াইট তাঁতের শাড়ি কম্বো',
    category: 'Blue Elegance',
    color: 'Royal Blue + White',
    colorCode: '#2563EB',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'blue', 'white', 'নীল', 'সাদা', 'শাড়ি'],
    stock: 9,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Pink + White',
    banglaName: 'সুইট বেবি পিঙ্ক ও হোয়াইট তাঁতের শাড়ি কম্বো',
    category: 'Pastel & Pink',
    color: 'Pink + White',
    colorCode: '#F472B6',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'pink', 'white', 'গোলাপি', 'সাদা', 'শাড়ি'],
    stock: 11,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - White + Pink',
    banglaName: 'শুভ্র হোয়াইট ও রানি পিঙ্ক তাঁতের শাড়ি কম্বো',
    category: 'White Classics',
    color: 'White + Pink',
    colorCode: '#FCE7F3',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'white', 'pink', 'সাদা', 'গোলাপি', 'শাড়ি'],
    stock: 7,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - White + Blue',
    banglaName: 'শুভ্র হোয়াইট ও স্কাই ব্লু তাঁতের শাড়ি কম্বো',
    category: 'White Classics',
    color: 'White + Blue',
    colorCode: '#E0F2FE',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'white', 'blue', 'সাদা', 'নীল', 'শাড়ি'],
    stock: 6,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Cream + Purple',
    banglaName: 'এলিগেন্ট ক্রিম ও ডিপ পার্পল তাঁতের শাড়ি কম্বো',
    category: 'Pastel & Pink',
    color: 'Cream + Purple',
    colorCode: '#FEF3C7',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'cream', 'purple', 'ক্রিম', 'বেগুনি', 'শাড়ি'],
    stock: 8,
    inStock: true,
  },
  {
    name: 'Handloom Cotton Saree Combo - Yellow + Purple',
    banglaName: 'বাসন্তী হলুদ ও বেগুনি তাঁতের শাড়ি কম্বো',
    category: 'Black & Vibrant',
    color: 'Yellow + Purple',
    colorCode: '#FACC15',
    price: 1350,
    originalPrice: 1650,
    image: '/images/products/.webp',
    description: COMBO_DESCRIPTION,
    itemsList: COMBO_ITEMS_SUMMARY,
    tags: ['saree', 'combo', 'gift', 'yellow', 'purple', 'হলুদ', 'বেগুনি', 'ফাল্গুন', 'শাড়ি'],
    stock: 10,
    inStock: true,
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'giftvibes' });
    console.log('✅ Connected to MongoDB');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`ℹ️  Database already has ${count} products. Skipping product seeding.`);
      process.exit(0);
    }

    await Product.insertMany(PRODUCTS);
    console.log(`✅ Successfully seeded ${PRODUCTS.length} initial products into MongoDB.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to seed products:', err.message);
    process.exit(1);
  }
};

seedProducts();
