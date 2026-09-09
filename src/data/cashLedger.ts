import {useSyncExternalStore} from 'react';
import {cashboxBalances as openingBalances, cashboxMovements as seedCashMovements} from './cashboxMock';
import {registerMovements as seedRegisterMovements, registerBalanceRows as seedBalanceRows} from './cashRegistersMock';
import type {RegisterMovement} from './cashRegistersMock';
export type CashPosting = {
  id:string; date:string; party:string; partyType:string; currency:string;
  amount:number; type:'قبض'|'صرف'; reason:string; reference:string; description:string; notes:string;
};
const round=(value:number)=>Number(value.toFixed(6));
let postings:CashPosting[]=[];
function buildSnapshot(){
  let balances:Record<string,number>={...openingBalances};
  const added=postings.map(posting=>{
    const incoming=posting.type==='قبض';
    const previous=Object.hasOwn(balances,posting.currency)?balances[posting.currency]:0;
    const balance=round(previous+(incoming?posting.amount:-posting.amount));
    balances={...balances,[posting.currency]:balance};
    return {...posting,reference:posting.reference||posting.id,description:posting.description||posting.reason||`${posting.type} من/إلى ${posting.party}`,incoming,balance,user:'أحمد محمد · مستخدم تجريبي'};
  });
  const cashboxMovements=[...seedCashMovements.map(m=>({...m,party:'طرف تجريبي',partyType:'أخرى',reason:'',notes:''})),...added];
  const registerMovements:RegisterMovement[]=[...seedRegisterMovements,...added.map(m=>({...m,box:'main',incoming:m.incoming?m.amount:0,outgoing:m.incoming?0:m.amount,status:'مكتملة'}))];
  const mainRows=Object.entries(balances).map(([currency,current])=>{
    const baseline=seedBalanceRows.find(r=>r.box==='main'&&r.currency===currency);
    const moves=registerMovements.filter(m=>m.box==='main'&&m.currency===currency);
    return {id:`main-${currency}`,box:'main',name:'الصندوق الرئيسي',branch:'بغداد',currency,
      opening:baseline?.opening??0,incoming:round(moves.reduce((sum,m)=>sum+m.incoming,0)),outgoing:round(moves.reduce((sum,m)=>sum+m.outgoing,0)),current,
      last:moves.at(-1)?.date||'—',updated:added.filter(m=>m.currency===currency).at(-1)?.date||baseline?.updated||'—'};
  });
  return {cashboxBalances:balances,cashboxMovements,registerMovements,registerBalanceRows:[...mainRows,...seedBalanceRows.filter(r=>r.box!=='main')]};
}
let snapshot=buildSnapshot();
const listeners=new Set<()=>void>();
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function useCashLedger(){return useSyncExternalStore(subscribe,()=>snapshot);}
export function postCashVoucher(posting:CashPosting){
  if(!posting.id||!posting.party.trim()||!posting.currency||!Number.isFinite(posting.amount)||posting.amount<=0||posting.amount>1e12||!Number.isFinite(Date.parse(posting.date)))throw new Error('بيانات السند غير صالحة للحفظ.');
  const existing=postings.find(p=>p.id===posting.id);
  const next={...posting,date:existing?.date||posting.date};
  if(existing&&JSON.stringify(existing)===JSON.stringify(next))return;
  postings=existing?postings.map(p=>p.id===next.id?next:p):[...postings,next];
  snapshot=buildSnapshot();
  listeners.forEach(listener=>listener());
}
