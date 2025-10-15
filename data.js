// data.js
// جمل التحميل العشوائية اللي بتظهر أثناء عملية السكرايب
const LOADER_PHRASES = [
  "تحضير الملفات...",
  "تحميل الموارد...",
  "نسخ صفحات الموقع...",
  "تجميع الصور والأنماط...",
  "تغليف الملفات في ZIP...",
  "استكمال التحميل...",
  "شوي شوي نجهز النسخة...",
  "تقوية الروابط والأصول...",
  "اقتراب الانتهاء...",
  "جاهز للتنزيل!"
];

// منع السكرايب على الموقع نفسه
const APP = {
  DISALLOW_SELF_DOMAIN: true
};

function isSelfDomain(url){
  try{
    const host = new URL(url).hostname.replace(/^www\./,'').toLowerCase();
    return ['wep-scraper.netlify.app','localhost'].some(h => host.includes(h));
  }catch(e){ return false; }
            }
