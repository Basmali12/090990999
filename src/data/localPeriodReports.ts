import type {LocalData} from './localStore';
import {buildCashLedger} from './cashLedger';

export const periodBranches = ['الصندوق الرئيسي'];
export type PeriodRow = {date:string;branch:string;currency:string;outgoing:number;incoming:number;pending:number;delivered:number;transfers:number;commission:number;receipt:number;payment:number;buy:number;sell:number;net:number;inside:number;outside:number;opening:number;closing:number;exchangeCommission:number;entityCount:number;debit:number;credit:number;operations:number;volume:number};
export type ReportActivity={id:string;date:string;type:string;currency:string;amount:number;party:string};
const round=(n:number)=>Math.round(n*1e6)/1e6;
export function reportActivities(data:LocalData):ReportActivity[]{return [...data.cash.map(r=>({id:r.id,date:r.date,type:r.type,currency:r.currency,amount:r.amount,party:r.party})),...data.transfers.filter(r=>r.status!=='ملغاة').map(r=>({id:r.id,date:r.date,type:r.direction==='outgoing'?'حوالة صادرة':'حوالة واردة',currency:r.currency,amount:r.amount,party:r.sender})),...data.exchange.filter(r=>r.status==='مكتملة').map(r=>({id:r.id,date:r.date,type:`${r.type} عملة`,currency:r.currency,amount:r.amount,party:r.party}))].sort((a,b)=>b.date.localeCompare(a.date));}
export function reportCurrencies(data:LocalData){return [...new Set([...data.rates.flatMap(r=>[r.base,r.counter]),...data.cash.map(r=>r.currency),...data.transfers.map(r=>r.currency),...data.exchange.flatMap(r=>[r.currency,r.counter])])].filter(Boolean);}
export function periodData(data:LocalData,start:string,end:string,currencies:string[]):PeriodRow[]{
 const dates:string[]=[];const date=new Date(`${start}T12:00:00`);while(date.getTime()<=new Date(`${end}T12:00:00`).getTime()){dates.push(`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`);date.setDate(date.getDate()+1);}
 const rows:PeriodRow[]=[];
 const legs=buildCashLedger(data).registerMovements.map(r=>({date:r.date.slice(0,10),currency:r.currency,delta:r.signed}));
 for(const c of currencies){let balance=round(legs.filter(r=>r.currency===c&&r.date<start).reduce((n,r)=>n+r.delta,0));for(const day of dates){
  const cash=data.cash.filter(r=>r.currency===c&&r.date.slice(0,10)===day),tr=data.transfers.filter(r=>r.currency===c&&r.date.slice(0,10)===day&&r.status!=='ملغاة'),ex=data.exchange.filter(r=>r.currency===c&&r.date.slice(0,10)===day&&r.status==='مكتملة');
  const dayLegs=legs.filter(r=>r.currency===c&&r.date===day),inside=round(dayLegs.reduce((n,r)=>n+Math.max(0,r.delta),0)),outside=round(dayLegs.reduce((n,r)=>n+Math.max(0,-r.delta),0)),net=round(inside-outside),opening=balance;balance=round(balance+net);
  const exchangeCommission=data.exchange.filter(r=>r.counter===c&&r.date.slice(0,10)===day&&r.status==='مكتملة').reduce((n,r)=>n+r.commission,0);
  const receipt=cash.filter(r=>r.type==='قبض').reduce((n,r)=>n+r.amount,0),payment=cash.filter(r=>r.type==='صرف').reduce((n,r)=>n+r.amount,0),entities=cash.filter(r=>r.partyType==='عميل'||r.partyType==='شريك');
  rows.push({date:day,branch:periodBranches[0],currency:c,outgoing:tr.filter(r=>r.direction==='outgoing').length,incoming:tr.filter(r=>r.direction==='incoming').length,pending:tr.filter(r=>r.status!=='مسلمة').length,delivered:tr.filter(r=>r.status==='مسلمة').length,transfers:tr.reduce((n,r)=>n+r.amount,0),commission:tr.reduce((n,r)=>n+r.commission,0)+exchangeCommission,receipt,payment,buy:ex.filter(r=>r.type==='شراء').reduce((n,r)=>n+r.amount,0),sell:ex.filter(r=>r.type==='بيع').reduce((n,r)=>n+r.amount,0),net,inside,outside,opening,closing:balance,exchangeCommission,entityCount:entities.length,debit:entities.filter(r=>r.type==='صرف').reduce((n,r)=>n+r.amount,0),credit:entities.filter(r=>r.type==='قبض').reduce((n,r)=>n+r.amount,0),operations:cash.length+tr.length+ex.length,volume:inside+outside});
 }}return rows;
}
