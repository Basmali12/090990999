import {useSyncExternalStore} from 'react';
import type {Customer} from './customerRecords';
import type {TransferRecord} from './transferRecords';
import type {LocalRate} from './currencyStore';
import type {CashPosting} from './cashLedger';
export type ExchangeEntry={id:string;date:string;type:string;party:string;currency:string;amount:number;rate:number;counter:string;counterpart:number;commission:number;box:string;user:string;status:string;description:string;notes:string};
export type LocalData={schema:1;wallets?:{id:string;name:string;balance:number}[];customers:Customer[];transfers:TransferRecord[];rates:LocalRate[];rateLog?:LocalRate[];cash:CashPosting[];exchange:ExchangeEntry[]};
const key='almustaqbal-business-data-v1';
const empty=():LocalData=>({schema:1,customers:[],transfers:[],rates:[],cash:[],exchange:[]});
function valid(d:LocalData){
 const strings=(r:object,keys:string[])=>keys.every(k=>typeof (r as Record<string,unknown>)[k]==='string');
 const numbers=(r:object,keys:string[])=>keys.every(k=>Number.isFinite((r as Record<string,unknown>)[k]));
 const unique=(rows:{id:string}[])=>new Set(rows.map(r=>r.id)).size===rows.length;
 return [d.customers,d.cash,d.exchange,d.transfers,d.rates].every(rows=>rows.every(r=>r&&typeof r==='object')&&unique(rows))
 &&d.customers.every(r=>strings(r,['id','name','phone','address','notes','created','updated','lastActivity'])&&r.balances&&Object.values(r.balances).every(Number.isFinite))
 &&d.cash.every(r=>strings(r,['id','date','party','currency','type','partyType','reason','reference','description','notes'])&&numbers(r,['amount']))
 &&d.transfers.every(r=>strings(r,['id','date','sender','recipient','currency','status','direction','office','senderPhone','recipientPhone','senderAddress','recipientAddress','notes','reason','voucher','deliveredAt'])&&numbers(r,['amount','commission']))
 &&d.exchange.every(r=>strings(r,['id','date','party','currency','counter','type','status','box','user','description','notes'])&&numbers(r,['amount','rate','commission','counterpart']))
 &&d.rates.every(r=>strings(r,['id','base','counter','name','user','updated','notes'])&&numbers(r,['buy','sell']))
 &&(!d.wallets||Array.isArray(d.wallets)&&d.wallets.every(r=>r&&strings(r,['id','name'])&&numbers(r,['balance'])));
}
let failure='';
function read():LocalData{try{
 const text=localStorage.getItem(key);
 if(!text){const initial=empty();const legacy=localStorage.getItem('dashboard-wallets-v1');if(legacy){const wallets=JSON.parse(legacy);if(!Array.isArray(wallets)||!wallets.every(w=>w&&typeof w.id==='string'&&typeof w.name==='string'&&Number.isFinite(w.balance)))throw Error('invalid wallets');initial.wallets=wallets;}return initial;}
 const value=JSON.parse(text);if(!value||value.schema!==1||!['customers','transfers','rates','cash','exchange'].every(k=>Array.isArray(value[k]))||!valid(value))throw Error('Invalid data');return value;
 }catch{failure='تعذر قراءة البيانات المحلية. لم تُحذف البيانات؛ الحفظ متوقف لحمايتها.';return empty();}}
let data=read();const listeners=new Set<()=>void>();
export function subscribeLocal(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function getLocalData(){return data;}
export function useLocalData(){return useSyncExternalStore(subscribeLocal,getLocalData);}
export function localError(){return failure;}
export function updateLocal(update:(current:LocalData)=>LocalData){
 if(failure){window.alert(failure);return false;}
 try{const latest=read();if(failure)throw Error(failure);const next=update(latest);if(!valid(next))throw Error('Invalid data');localStorage.setItem(key,JSON.stringify(next));data=next;listeners.forEach(l=>l());return true;}
 catch{window.alert('لم يتم الحفظ: تعذر الوصول إلى التخزين المحلي أو امتلأت المساحة. بياناتك السابقة محفوظة.');return false;}
}
window.addEventListener('storage',e=>{if(e.key===key){data=read();listeners.forEach(l=>l());}});
export function localDate(){const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,19);}
