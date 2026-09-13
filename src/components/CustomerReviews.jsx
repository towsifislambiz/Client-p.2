import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

const REVIEWS = [
  {
    id: 1,
    name: "তানজিলা আক্তার",
    location: "মিরপুর, ঢাকা",
    product: "Premium Saree Combo (Red + Maroon)",
    rating: 5,
    date: "২ দিন আগে",
    comment: "মাশাআল্লাহ! শাড়ির কাপড়, ম্যাচিং চুড়ি ও নেকলেস সেটের কোয়ালিটি দেখে আমি মুগ্ধ। অ্যানিভার্সারির গিফট হিসেবে পাওয়ার পর চোখ জুড়িয়ে গেছে। ধন্যবাদ Gift Vibes-কে!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80",
  },
  {
    id: 2,
    name: "মেহেদী হাসান",
    location: "উত্তরা, ঢাকা",
    product: "Premium Saree Combo (White + Red)",
    rating: 5,
    date: "৩ দিন আগে",
    comment: "ওয়াইফকে জন্মদিনে সারপ্রাইজ গিফট দেওয়ার জন্য নিয়েছিলাম। প্যাকেজিং আর গিফট কার্ডের লেখাটা চমৎকার ছিল। ১ দিনের মধ্যে ডেলিভারি পেয়েছি।",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
  },
  {
    id: 3,
    name: "ফারহানা সুলতানা",
    location: "চট্টগ্রাম সদর",
    product: "Premium Saree Combo (Royal Blue + White)",
    rating: 5,
    date: "৫ দিন আগে",
    comment: "১৩৫০ টাকার মধ্যে এত সুন্দর শাড়ি, চুড়ি ও জুয়েলারি কম্বো ভাবাই যায় না! বেলি ফুলের মালা আর সাটিন বো-এর ফিনিশিং প্রিমিয়াম ছিল। ১০০% রিকমেন্ডেড!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80",
  },
];

export default function CustomerReviews() {
  return (
    <section className="py-10 sm:py-16 px-3 sm:px-8 bg-slate-900 text-white border-t border-b border-slate-800 relative overflow-hidden">
      
      {/* Background Ambient Lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10 relative z-10 font-sans">
        
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[11px] sm:text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
            ⭐ সম্মানিত গ্রাহকদের মতামত
          </span>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white mt-2.5 tracking-tight">
            আমাদের কাস্টমারদের সত্য অনুভূতি ও রিভিউ
          </h2>
          <p className="text-xs text-slate-400 mt-1.5">
            হাজারো সন্তুষ্ট গ্রাহকের ভালোবাসা ও বিশ্বস্ততাই আমাদের পথচলার মূল প্রেরণা।
          </p>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-slate-800/80 border border-slate-700 p-4 sm:p-6 rounded-xl sm:rounded-2xl flex flex-col justify-between backdrop-blur-md hover:border-orange-500/50 transition-all duration-300 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 stroke-none" />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{rev.date}</span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-sans italic mb-6">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-600"
                  />
                  <div>
                    <h4 className="font-bold text-xs text-white flex items-center gap-1">
                      <span>{rev.name}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{rev.location}</span>
                  </div>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
