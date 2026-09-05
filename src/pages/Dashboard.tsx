import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { operations, stats } from '../data/mockData';
import { PageHeader, QuickActionCard, StatCard, StatusBadge } from '../components/ui';
import { AnimatedCard, AnimatedModal, AnimatedNumber, PremiumButton } from '../components/premium/MotionUI';
import Icon from '../components/Icon';
import '../pages/transferList.css';
import './dashboard.css';

type Wallet = { id: string; name: string; balance: number };
const initialWallets: Wallet[] = [{ id: 'zain', name: 'Zain Cash', balance: 2450000 }, { id: 'qi', name: 'SuperQi', balance: 3800000 }];
const storageKey = 'dashboard-wallets-v1';
function readWallets(): Wallet[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(storageKey) || 'null');
    if (Array.isArray(value) && value.every(w => w && typeof w.id === 'string' && typeof w.name === 'string' && w.name.trim() && typeof w.balance === 'number' && Number.isFinite(w.balance) && w.balance >= 0) && new Set(value.map(w => w.id)).size === value.length) return value;
  } catch { /* Use mock wallets when storage is unavailable. */ }
  return initialWallets;
}
const actions = [
  { title: 'قبض', path: '/cashbox/receipt', icon: 'down' },
  { title: 'صرف', path: '/cashbox/payment', icon: 'up' },
  { title: 'إضافة عميل', path: '/customers/new', icon: 'user' },
  { title: 'سعر شراء', path: '/exchange/buy', icon: 'exchange' },
  { title: 'سعر بيع', path: '/exchange/sell', icon: 'exchange' },
];
export default function Dashboard() {
  const [wallets, setWallets] = useState(readWallets);
  const [editor, setEditor] = useState<Wallet | null>(null);
  const [deleting, setDeleting] = useState<Wallet | null>(null);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showOperations, setShowOperations] = useState(false);
  const reduced = useReducedMotion();
  function saveWallets(next: Wallet[]) {
    setWallets(next);
    try { localStorage.setItem(storageKey, JSON.stringify(next)); setNotice('تم تحديث المحافظ محليًا'); }
    catch { setNotice('تم التحديث لهذه الجلسة فقط؛ التخزين المحلي غير متاح'); }
  }
  function edit(wallet?: Wallet) {
    setEditor(wallet || { id: '', name: '', balance: 0 });
    setName(wallet?.name || ''); setBalance(wallet ? String(wallet.balance) : ''); setError('');
  }
  return <div className="dashboard-simple">
    <PageHeader title="أرصدتك، بنظرة واحدة" description="أهلًا أحمد، مساحة مختصرة لإدارة يومك.">
      <PremiumButton onClick={() => setShowOperations(true)} aria-haspopup="dialog" aria-expanded={showOperations} aria-label={`آخر العمليات، ${operations.length} عمليات أخيرة`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></svg>
        آخر العمليات <span className="count-badge">{operations.length}</span>
      </PremiumButton>
    </PageHeader>
    <section className="stats-grid" aria-label="ملخص الأرصدة">
      {stats.filter(s => ['رصيد الدولار', 'رصيد الدينار'].includes(s.title)).map(s => <StatCard key={s.title} stat={s} />)}
      <StatCard stat={{ title: 'أرصدة المحافظ', value: wallets.reduce((sum, w) => sum + w.balance, 0).toLocaleString('en-US', { maximumFractionDigits: 2 }), unit: 'IQD', icon: 'wallet', note: `${wallets.length} محافظ · بيانات محلية`, tone: 'purple' }} />
    </section>
    <section className="quick-section">
      <div className="section-heading"><h2>إجراءات سريعة</h2></div>
      <div className="quick-grid">{actions.map(a => <QuickActionCard key={a.title} {...a} />)}</div>
    </section>
    <section className="panel dashboard-wallets">
      <div className="panel-heading"><div><h2>المحافظ الإلكترونية</h2><p>أرصدة تجريبية بالدينار العراقي · محفوظة على هذا المتصفح</p></div><PremiumButton variant="primary" onClick={() => edit()}>+ إضافة محفظة</PremiumButton></div>
      {notice && <p className="dashboard-notice" role="status">{notice}</p>}
      <div className="dashboard-wallet-grid">
        {wallets.map(w => <AnimatedCard key={w.id} className="dashboard-wallet">
          <div className="dashboard-wallet-heading"><span className="icon-tile teal"><Icon name="wallet" /></span><h3 dir="auto">{w.name}</h3><span className="sample-label">محلي</span></div>
          <p>الرصيد المتاح</p><div className="dashboard-wallet-amount"><b dir="ltr"><AnimatedNumber value={w.balance.toLocaleString('en-US', { maximumFractionDigits: 2 })} /></b><span>IQD</span></div>
          <div className="dashboard-wallet-actions"><PremiumButton onClick={() => edit(w)} aria-label={`تعديل ${w.name}`}>تعديل</PremiumButton><PremiumButton variant="ghost" onClick={() => setDeleting(w)} aria-label={`حذف ${w.name}`}>حذف</PremiumButton></div>
        </AnimatedCard>)}
      </div>
      {!wallets.length && <p className="dashboard-empty">لا توجد محافظ حاليًا. أضف محفظتك الأولى للبدء.</p>}
    </section>
    <footer className="content-footer"><span>أعمال المستقبل</span><span>أرصدة تجريبية · لا تُنفّذ حركات مالية فعلية</span></footer>
    {editor && <AnimatedModal title={editor.id ? 'تعديل محفظة' : 'إضافة محفظة'} close={() => setEditor(null)}>
      <form className="dashboard-wallet-form" onSubmit={event => {
        event.preventDefault(); const amount = Number(balance);
        if (!name.trim() || !balance.trim() || !Number.isFinite(amount) || amount < 0 || amount > 1e12) { setError('أدخل اسم المحفظة ورصيدًا صالحًا من صفر إلى تريليون دينار.'); return; }
        if (wallets.some(w => w.id !== editor.id && w.name.trim().toLowerCase() === name.trim().toLowerCase())) { setError('توجد محفظة بهذا الاسم بالفعل.'); return; }
        const next = { id: editor.id || crypto.randomUUID(), name: name.trim(), balance: amount };
        saveWallets(editor.id ? wallets.map(w => w.id === editor.id ? next : w) : [...wallets, next]); setEditor(null);
      }}>
        <label>اسم المحفظة<input required maxLength={60} value={name} onChange={e => setName(e.target.value)} /></label>
        <label>الرصيد بالدينار العراقي<input required type="number" inputMode="decimal" min="0" max="1000000000000" step="0.01" value={balance} onChange={e => setBalance(e.target.value)} /></label>
        {error && <p role="alert">{error}</p>}
        <div className="dashboard-wallet-actions"><PremiumButton type="submit" variant="primary">حفظ محلي</PremiumButton><PremiumButton type="button" onClick={() => setEditor(null)}>إلغاء</PremiumButton></div>
      </form>
    </AnimatedModal>}
    {deleting && <AnimatedModal title="حذف محفظة" close={() => setDeleting(null)}><p>حذف محفظة «{deleting.name}» ورصيدها التجريبي من هذا المتصفح؟</p><div className="dashboard-wallet-actions"><PremiumButton variant="danger" onClick={() => { saveWallets(wallets.filter(w => w.id !== deleting.id)); setDeleting(null); }}>تأكيد الحذف</PremiumButton><PremiumButton onClick={() => setDeleting(null)}>إلغاء</PremiumButton></div></AnimatedModal>}
    {showOperations && <AnimatedModal title="آخر العمليات" close={() => setShowOperations(false)}>
      <motion.div className="dashboard-operation-list" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .18 }}>
        <p>آخر {operations.length} عمليات تجريبية</p>
        {operations.map(op => <article className="dashboard-operation" key={op.id}><div><b>{op.type}</b><StatusBadge status={op.status} /></div><p>{op.customer}</p><div><strong dir="ltr">{op.amount} {op.currency}</strong><time>{op.time}</time></div><small dir="ltr">{op.id}</small></article>)}
      </motion.div>
    </AnimatedModal>}
  </div>;
}
