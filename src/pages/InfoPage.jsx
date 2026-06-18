import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import T from '../data/translations';

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

const nutrLang = (code) => code === 'zh-CN' || code === 'zh-TW' ? 'zh' : code;

export default function InfoPage() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();

  const nLang = nutrLang(lang);

  return (
    <div style={{ minHeight: '80vh', background: '#f8f6f1', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Back + Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00373e', margin: 0 }}>
            {t(T.info_page.title)}
          </h1>
        </div>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem' }}>
          {t(T.info_page.nutrition)}
        </p>

        {/* Serving info */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem' }}>
            <span>{t({en:'Serving Per Package',ms:'Hidangan Setiap Bungkusan','zh-CN':'每包份数','zh-TW':'每包份數'})}</span>
            <span style={{ fontWeight: 600, color: '#000' }}>{NUTRITION.servingPerPackage}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
            <span>{t(T.info_page.serving_size)}</span>
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
          <span>{t({en:'Nutrient',ms:'Nutrisi','zh-CN':'营养素','zh-TW':'營養素'})}</span>
          <span style={{ textAlign: 'right' }}>{t(T.info_page.per_serving)}</span>
          <span style={{ textAlign: 'right' }}>{t(T.info_page.per_100g)}</span>
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
              {item.name[nLang] || item.name.en}
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
          {t({en:'Tem Tem Sabah © {year} — Mum Approved Snacks',ms:'Tem Tem Sabah © {year} — Makanan Ringan Sah Ibu','zh-CN':'Tem Tem Sabah © {year} — 妈妈认可的小吃','zh-TW':'Tem Tem Sabah © {year} — 媽媽認可的小吃'}).replace('{year}', String(new Date().getFullYear()))}
        </p>

        {/* Back button */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.6rem 1.5rem', borderRadius: 8,
            border: '1px solid #d1d5db', background: '#fff',
            color: '#00373e', fontSize: '0.85rem', cursor: 'pointer',
          }}>
            <ArrowLeft size={14} /> {t(T.info_page.back)}
          </button>
        </div>
      </div>
    </div>
  );
}
