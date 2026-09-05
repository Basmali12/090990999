import {useState} from 'react';
import {motion,useReducedMotion} from 'motion/react';
import {AnimatedModal,PremiumButton} from '../components/premium/MotionUI';
import Icon from '../components/Icon';
import {currentVersion,reloadLatest} from './versionService';
import {useAppUpdate} from './useAppUpdate';
import './updates.css';
export default function UpdateNotification(){
 const release=useAppUpdate();const [open,setOpen]=useState(false);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const reduced=useReducedMotion();
 if(!release)return null;
 return <><motion.aside className="app-update-banner" aria-label="تحديث النظام" initial={reduced?false:{opacity:0,y:-6}} animate={{opacity:1,y:0}}><span className="app-update-icon"><Icon name="exchange"/><i/></span><div><strong>يتوفر تحديث جديد للنظام</strong><small>الإصدار <b dir="ltr">{release.version}</b> جاهز</small></div><PremiumButton onClick={()=>setOpen(true)}>تحديث النظام</PremiumButton></motion.aside>{open&&<AnimatedModal title="تحديث جديد متوفر" close={()=>setOpen(false)}><div className="app-update-details"><h3>{release.title}</h3><dl><div><dt>الإصدار الحالي</dt><dd dir="ltr">{currentVersion}</dd></div><div><dt>الإصدار الجديد</dt><dd dir="ltr">{release.version}</dd></div></dl>{release.publishedAt&&!Number.isNaN(Date.parse(release.publishedAt))&&<p>تاريخ التحديث: {new Date(release.publishedAt).toLocaleString('ar-IQ')}</p>}{release.notes.length>0&&<ul>{release.notes.map((note,i)=><li key={i}>{note}</li>)}</ul>}<p>تبقى بيانات المتصفح المحلية محفوظة. احفظ العمل الجاري قبل إعادة التحميل؛ المدخلات غير المحفوظة وبيانات الجلسة الموجودة في ذاكرة الصفحة قد تُفقد.</p>{error&&<p role="alert">{error}</p>}<div className="app-update-actions"><PremiumButton variant="primary" loading={busy} onClick={async()=>{setBusy(true);setError('');try{await reloadLatest();}catch{setBusy(false);setError('تعذّر تحميل التحديث الآن. تحقق من الاتصال وحاول مجددًا.');}}}>{busy?'جاري تحديث النظام...':'تحديث النظام الآن'}</PremiumButton><PremiumButton disabled={busy} onClick={()=>setOpen(false)}>لاحقًا</PremiumButton></div></div></AnimatedModal>}</>;
}

