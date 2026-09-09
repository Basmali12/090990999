import {useMemo} from 'react';
import {useLocalData,updateLocal} from './localStore';
import type {RateEntry} from './exchangeReportsMock';
export type LocalRate=RateEntry & {name:string};
export function useLocalRates(){return useLocalData().rates;}
export function useCurrencies(){const data=useLocalData();return useMemo(()=>{const names:Record<string,string>={USD:'الدولار الأمريكي',IQD:'الدينار العراقي'};for(const r of data.rates){names[r.base]=r.name;names[r.counter]??=r.counter;}for(const r of [...data.cash,...data.transfers,...data.exchange])names[r.currency]??=r.currency;for(const r of data.exchange)names[r.counter]??=r.counter;return Object.entries(names).map(([code,label])=>({code,label}));},[data]);}
export function setLocalRates(update:(old:LocalRate[])=>LocalRate[]){return updateLocal(data=>({...data,rates:update(data.rates)}));}
