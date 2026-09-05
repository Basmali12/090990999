export const periodCurrencies=['USD','IQD','EUR'];
export const periodBranches=['بغداد','أربيل','البصرة'];
export function periodDay(date:string,branch:string,currency:string){
 const [y,m,d]=date.split('-').map(Number);const seed=(y*3+m*7+d*11+periodBranches.indexOf(branch)*13+periodCurrencies.indexOf(currency)*5)%31+5;const scale=currency==='IQD'?1000:1;
 const outgoing=seed,incoming=Math.floor(seed*.7),pending=Math.floor(seed*.2),delivered=outgoing+incoming-pending;
 const transfers=(outgoing+incoming)*120*scale,commission=(outgoing+incoming)*2*scale,receipt=seed*90*scale,payment=seed*60*scale,buy=seed*40*scale,sell=seed*30*scale;
 const inside=receipt+buy,inOutside=payment+sell,net=inside-inOutside,opening=(50000+(m*100+d*20))*scale;
 return {date,branch,currency,outgoing,incoming,pending,delivered,transfers,commission,receipt,payment,buy,sell,net,inside,outside:inOutside,opening,closing:opening+net,exchangeCommission:seed*scale,spread:seed*.5*scale,entityCount:seed*2,debit:seed*80*scale,credit:seed*100*scale,operations:outgoing+incoming+seed*4,volume:inside+inOutside};
}
export type PeriodRow=ReturnType<typeof periodDay>;
export function periodData(year:number,month:number|undefined,branch:string,currency:string){return Array.from({length:month?1:12},(_,i)=>month||i+1).flatMap(m=>Array.from({length:new Date(year,m,0).getDate()},(_,i)=>`${year}-${String(m).padStart(2,'0')}-${String(i+1).padStart(2,'0')}`).flatMap(date=>(branch?[branch]:periodBranches).flatMap(b=>(currency?[currency]:periodCurrencies).map(c=>periodDay(date,b,c)))));}
