// site.js
(function(){
  const startBtn = document.getElementById('start-btn');
  const input = document.getElementById('site-input');
  const phrasesEl = document.getElementById('loader-phrases');
  const downloadBtn = document.getElementById('download-zip');

  // index.html behavior
  if(startBtn){
    startBtn.addEventListener('click', function(){
      const url = input.value.trim();
      if(!url){
        alert('الرجاء إدخال رابط الموقع');
        return;
      }
      if(APP.DISALLOW_SELF_DOMAIN && isSelfDomain(url)){
        alert('لا يمكنك عمل سكراب للموقع نفسه');
        return;
      }
      sessionStorage.setItem('wep_url', url);
      window.location.href = 'loading.html';
    });
  }

  // loading.html behavior
  if(document.location.pathname.endsWith('loading.html')){
    const url = sessionStorage.getItem('wep_url');
    if(!url){ window.location.href = 'index.html'; return; }

    let i=0;
    if(phrasesEl) phrasesEl.textContent = LOADER_PHRASES[0];
    const interval = setInterval(()=>{
      i++;
      if(phrasesEl) phrasesEl.textContent = LOADER_PHRASES[i % LOADER_PHRASES.length];
    }, 1800);

    (async function(){
      try {
        // استدعاء دالة Netlify
        const resp = await fetch('/.netlify/functions/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        if(!resp.ok){
          const txt = await resp.text().catch(()=>resp.statusText);
          alert('فشل إنشاء الملف: ' + txt);
          window.location.href = 'index.html';
          return;
        }

        // الحصول على ZIP
        const blob = await resp.blob();

        // حفظ البيانات في sessionStorage للواجهة النهائية
        const shotUrl = 'https://image.thum.io/get/width/1200/crop/800/' + encodeURIComponent(url);
        sessionStorage.setItem('wep_result_screenshot', shotUrl);
        try {
          sessionStorage.setItem('wep_result_name', (new URL(url)).hostname.replace('www.',''));
        } catch(e) {
          sessionStorage.setItem('wep_result_name', 'site');
        }
        sessionStorage.setItem('wep_result_zip_blob', URL.createObjectURL(blob));

        // تحويل المستخدم للواجهة النهائية
        window.location.href = 'result.html';
      } catch(err) {
        console.error(err);
        alert('حدث خطأ أثناء إنشاء الملف: ' + (err && err.message));
        window.location.href = 'index.html';
      } finally {
        clearInterval(interval);
      }
    })();
  }

  // result.html behavior
  if(document.location.pathname.endsWith('result.html')){
    const shot = sessionStorage.getItem('wep_result_screenshot');
    const name = sessionStorage.getItem('wep_result_name') || 'site';
    const url = sessionStorage.getItem('wep_url') || '';
    const zipBlobUrl = sessionStorage.getItem('wep_result_zip_blob');

    if(!zipBlobUrl){
      window.location.href = 'index.html';
      return;
    }

    document.getElementById('screenshot-img').src = shot || '';
    document.getElementById('site-name').textContent = 'اسم الموقع: ' + name;
    document.getElementById('site-url').textContent = 'الرابط: ' + url;

    const dl = document.getElementById('download-zip');
    dl.href = zipBlobUrl;
    dl.download = name + '.zip';
    dl.addEventListener('click', function(){
      setTimeout(()=> {
        URL.revokeObjectURL(zipBlobUrl);
        sessionStorage.removeItem('wep_result_zip_blob');
      }, 5000);
    });
  }

  // ديمو زر
  const demoBtn = document.getElementById('demo-btn');
  if(demoBtn){
    demoBtn.addEventListener('click', function(){
      sessionStorage.setItem('wep_url','https://example.com');
      sessionStorage.setItem('wep_result_screenshot','https://image.thum.io/get/width/1200/crop/800/https://example.com');
      sessionStorage.setItem('wep_result_name','example.com');
    });
  }
})();
