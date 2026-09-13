import React from 'react';

const CATEGORIES = [
  { id: 'All', label: 'সবগুলো কালার (১১টি)' },
  { id: 'Red & Maroon', label: 'রক্তিম লাল ও মেরুন' },
  { id: 'White & Classic', label: 'শুভ্র সাদা কালেকশন' },
  { id: 'Blue & Royal', label: 'অভিজাত রয়্যাল ব্লু' },
  { id: 'Pink & Purple', label: 'রানি পিঙ্ক ও পার্পল' },
  { id: 'Black & Vibrant', label: 'ব্ল্যাক ও ভাইব্রেন্ট' },
];

export default function CategoryBar({ activeCategory, setActiveCategory }) {
  return (
    <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
