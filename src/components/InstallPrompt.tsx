import { useEffect, useRef, useState } from 'react';
import './installPrompt.css';

interface InstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}
const skipKey = 'exchange-install-skipped';
function standalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true;
}
function shouldShow() {
  if (standalone()) return false;
  try { return sessionStorage.getItem(skipKey) !== 'yes'; } catch { return true; }
}

export default function InstallPrompt() {
  const [visible, setVisible] = useState(shouldShow);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  function dismiss() {
    try { sessionStorage.setItem(skipKey, 'yes'); } catch { /* Browsing stays available without storage. */ }
    setVisible(false);
  }
  useEffect(() => {
    const capture = (event: Event) => { event.preventDefault(); setInstallEvent(event as InstallEvent); };
    const installed = () => { setInstallEvent(null); dismiss(); };
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', installed);
    return () => {
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', installed);
    };
  }, []);
  useEffect(() => {
    if (!visible) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, [visible]);
  async function install() {
    if (!installEvent) { setHelp(true); return; }
    setBusy(true);
    try {
      await installEvent.prompt();
      const result = await installEvent.userChoice;
      if (result.outcome === 'accepted') dismiss();
      else setHelp(true);
    } catch { setHelp(true); }
    finally { setInstallEvent(null); setBusy(false); }
  }
  if (!visible) return null;
  return <dialog ref={dialog} className="install-prompt" aria-labelledby="install-title" aria-describedby="install-description" onCancel={event => { event.preventDefault(); dismiss(); }}>
    <button className="install-close" onClick={dismiss} aria-label="إغلاق وتخطي">×</button>
    <img className="install-art" src={`${import.meta.env.BASE_URL}install-art.jpg`} alt="شعار أعمال المستقبل" width="768" height="768" />
    <div className="install-content">
      <span className="install-eyebrow">مساحة عملك… أقرب إليك</span>
      <h2 id="install-title">أعمال المستقبل، بلمسة واحدة</h2>
      <p id="install-description">أضف أعمال المستقبل إلى جهازك، وافتحه بسهولة من الشاشة الرئيسية.</p>
      <div className="install-features"><span>وصول سريع</span><span>نافذة مستقلة</span><span>تثبيت اختياري</span></div>
      {help && <div className="install-help" role="status">
        <strong>طريقة التثبيت من المتصفح</strong>
        <p>على iPhone أو iPad: افتح الرابط في Safari، ثم «مشاركة» ← «إضافة إلى الشاشة الرئيسية».</p>
        <p>على Android أو الكمبيوتر: من قائمة Chrome أو Edge اختر «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية» إن كان الخيار متاحًا.</p>
        <p>إذا لم يظهر الخيار، يمكنك متابعة استخدام الموقع مباشرة.</p>
      </div>}
      <div className="install-actions">
        <button className="install-primary" onClick={install} disabled={busy}>{busy ? 'جارٍ فتح نافذة التثبيت…' : help && !installEvent ? 'عرض طريقة التثبيت' : 'تثبيت التطبيق على جهازك'}</button>
        <button className="install-skip" onClick={dismiss}>تخطي، والمتابعة إلى الموقع</button>
      </div>
      <small>يمكنك استخدام جميع الواجهات دون تثبيت · بيانات تجريبية</small>
    </div>
  </dialog>;
}
