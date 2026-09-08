import {useSyncExternalStore} from 'react';
import {rateSeeds,currencyNames} from './exchangeReportsMock';
import type {RateEntry} from './exchangeReportsMock';
export type LocalRate = RateEntry & {name:string};
let rates:LocalRate[]=rateSeeds.map(r=>({...r,name:currencyNames[r.base]||r.base}));
const defaults={...currencyNames,IRT:'التومان (IRT)'};
function catalogue(){const names:Record<string,string>={...defaults};for(const rate of rates){names[rate.base]=rate.name;if(!names[rate.counter])names[rate.counter]=rate.counter;}return Object.entries(names).map(([code,label])=>({code,label}));}
let currencies=catalogue();
const listeners=new Set<()=>void>();
function subscribe(listener:()=>void){listeners.add(listener);return()=>{listeners.delete(listener);};}
export function useLocalRates(){return useSyncExternalStore(subscribe,()=>rates);}
export function useCurrencies(){return useSyncExternalStore(subscribe,()=>currencies);}
export function setLocalRates(update:(old:LocalRate[])=>LocalRate[]){rates=update(rates);currencies=catalogue();listeners.forEach(listener=>listener());}
