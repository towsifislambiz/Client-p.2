const mongoose = require('mongoose');

const heroContentSchema = new mongoose.Schema(
  {
    // Main headline / badge text
    badgeText: { type: String, default: '✨ সম্পূর্ণ ১১-ইন-১ লাক্সারি গিফট কম্বো' },
    headlineMain: { type: String, default: 'তাঁতে বোনা সুতির শাড়ি' },
    headlineSub: { type: String, default: 'কম্বো গিফট সেট' },
    subHeadline: { type: String, default: 'প্রিয়জনকে সেরা উপহার দিন' },
    description: {
      type: String,
      default: 'হাতে বোনা খাঁটি তাঁতের শাড়ি সহ ১১টি লাক্সারি আইটেমের পূর্ণ কম্বো সেট।',
    },
    ctaText: { type: String, default: 'অর্ডার করতে চাই' },
    ctaSubText: { type: String, default: 'কালার সিলেক্ট করে সরাসরি অর্ডার করুন' },
    // Hero background / desktop image
    desktopImage: { type: String, default: '' },
    // Active flag (only one hero record needed)
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('HeroContent', heroContentSchema);
