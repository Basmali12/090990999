import {useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {PageHeader} from '../components/ui';
import CustomerForm from '../components/CustomerForm';
import {PremiumToast} from '../components/premium/MotionUI';
import './customers.css';
import './transferList.css';
export default function NewCustomer(){const navigate=useNavigate();const [success,setSuccess]=useState(false);return <div className="customers-page"><nav className="breadcrumb"><Link to="/customers">العملاء</Link><span> / إضافة عميل</span></nav><PageHeader title="إضافة عميل" description="بيانات مختصرة تحفظ محليًا خلال الجلسة فقط."/><section className="panel" style={{padding:24}}><CustomerForm onSaved={()=>setSuccess(true)} onCancel={()=>navigate('/customers')}/></section>{success&&<PremiumToast title="تم حفظ العميل" description="أُضيف العميل إلى القائمة المحلية بنجاح." close={()=>setSuccess(false)}/>}</div>;}
