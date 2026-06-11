import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const NUTRITION = {
  servingPerPackage: 3,
  servingSize: '120g',
  servingPercent: '',
  items: [
    { name: { en: 'Energy', ms: 'Tenaga', zh: '能量' }, unit: 'kcal', perServing: '192.24', per100g: '160.2' },
    { name: { en: 'Carbohydrate', ms: 'Karbohidrat', zh: '碳水化合物' }, unit: 'g', perServing: '21', per100g: '17.5' },
    { name: { en: 'Sugar', ms: 'Gula', zh: '糖' }, unit: 'g', perServing: '0.48', per100g: '0.4' },
    { name: { en: 'Dietary Fiber', ms: 'Serabut Diet', zh: '膳食纤维' }, unit: 'g', perServing: '17.88', per100g: '14.9' },
    { name: { en: 'Protein', ms: 'Protein', zh: '蛋白质' }, unit: 'g', perServing: '28.44', per100g: '23.7' },
    { name: { en: 'Total Fat', ms: 'Jumlah Lemak', zh: '总脂肪' }, unit: 'g', perServing: '3.36', per100g: '2.8' },
    { name: { en: 'Monounsaturated Fatty Acid', ms: 'Asid Lemak Monotidaktepu', zh: '单不饱和脂肪酸' }, unit: 'g', perServing: '1.92', per100g: '1.6' },
    { name: { en: 'Polyunsaturated Fatty Acid', ms: 'Asid Lemak Politidaktepu', zh: '多不饱和脂肪酸' }, unit: 'g', perServing: '0.6', per100g: '0.5' },
    { name: { en: 'Saturated Fatty Acid', ms: 'Asid Lemak Tepu', zh: '饱和脂肪酸' }, unit: 'g', perServing: '0.84', per100g: '0.7' },
    { name: { en: 'Trans Fatty Acid', ms: 'Asid Lemak Trans', zh: '反式脂肪酸' }, unit: 'g', perServing: '0', per100g: '0' },
    { name: { en: 'Cholesterol', ms: 'Kolesterol', zh: '胆固醇' }, unit: 'mg', perServing: '0', per100g: '0' },
    { name: { en: 'Vitamin D', ms: 'Vitamin D', zh: '维生素D' }, unit: 'mcg', perServing: '0', per100g: '0' },
    { name: { en: 'Calcium', ms: 'Kalsium', zh: '钙' }, unit: 'mg', perServing: '150.72', per100g: '125.6' },
    { name: { en: 'Iron', ms: 'Zat Besi', zh: '铁' }, unit: 'mg', perServing: '1.32', per100g: '1.1' },
    { name: { en: 'Potassium', ms: 'Kalium', zh: '钾' }, unit: 'mg', perServing: '33.48', per100g: '27.9' },
    { name: { en: 'Sodium', ms: 'Natrium', zh: '钠' }, unit: 'mg', perServing: '0.36', per100g: '0.3' },
  ],
};

const langNames = { en: 'English', ms: 'Bahasa Melayu', zh: '中文' };

export default function InfoPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');

  return (
    <div style={{ minHeight: '80vh', background: '#f8f6f1', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Title + Language switcher inline */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00373e', margin: 0 }}>
            Steam Tempeh
          </h1>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {Object.entries(langNames).map(([code, name]) => (
              <button key={code} onClick={() => setLang(code)} style={{
                padding: '0.2rem 0.5rem', borderRadius: 4, border: 'none',
                background: lang === code ? '#00373e' : 'transparent',
                color: lang === code ? '#fff' : '#666',
                fontSize: '0.7rem', cursor: 'pointer', fontWeight: lang === code ? 600 : 400,
              }}>
                {name}
              </button>
            ))}
          </div>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
          {lang === 'en' ? 'Nutrition Information' : lang === 'ms' ? 'Maklumat Pemakanan' : '营养信息'}
        </p>

        {/* Serving info */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
            <span>{lang === 'en' ? 'Serving Per Package' : lang === 'ms' ? 'Hidangan Setiap Bungkusan' : '每包份数'}</span>
            <span style={{ fontWeight: 600, color: '#000' }}>{NUTRITION.servingPerPackage}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
            <span>{lang === 'en' ? 'Serving Size' : lang === 'ms' ? 'Setiap Hidangan' : '每份'}</span>
            <span style={{ fontWeight: 600, color: '#000' }}>{NUTRITION.servingSize}</span>
          </div>
        </div>

        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
          gap: '0.5rem', padding: '0.75rem 1rem',
          fontSize: '0.7rem', color: '#6b7280', fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.03em',
          borderBottom: '2px solid #00373e',
        }}>
          <span>{lang === 'en' ? 'Nutrient' : lang === 'ms' ? 'Nutrisi' : '营养素'}</span>
          <span style={{ textAlign: 'right' }}>{lang === 'en' ? 'Per Serving' : lang === 'ms' ? 'Setiap Hidangan' : '每份'}</span>
          <span style={{ textAlign: 'right' }}>{lang === 'en' ? 'Per 100g' : lang === 'ms' ? 'Setiap 100g' : '每100克'}</span>
        </div>

        {/* Nutrition rows */}
        {NUTRITION.items.map((item, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr',
            gap: '0.5rem', padding: '0.6rem 1rem',
            borderBottom: '1px solid #f0f0f0',
            fontSize: '0.85rem',
            background: i % 2 === 0 ? '#fff' : '#fafafa',
          }}>
            <span style={{ color: '#333' }}>
              {item.name[lang]}
            </span>
            <span style={{ textAlign: 'right', fontWeight: 500, color: '#000' }}>
              {item.perServing}
              <span style={{ color: '#999', fontSize: '0.7rem', marginLeft: 2 }}>{item.unit}</span>
            </span>
            <span style={{ textAlign: 'right', fontWeight: 500, color: '#000' }}>
              {item.per100g}
              <span style={{ color: '#999', fontSize: '0.7rem', marginLeft: 2 }}>{item.unit}</span>
            </span>
          </div>
        ))}

        {/* Footer */}
        <p style={{ fontSize: '0.75rem', color: '#999', textAlign: 'center', marginTop: '1.5rem' }}>
          Tem Tem Sabah &copy; {new Date().getFullYear()} &mdash; Mum Approved Snacks
        </p>
      </div>
    </div>
  );
}
