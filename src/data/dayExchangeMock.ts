import { registerCurrencies, registerDay, registerMovements, registers } from './cashRegistersMock';
export const exchangeRates: Record<string, {buy:number;sell:number}> = {
 'USD/IQD':{buy:1480,sell:1490}, 'EUR/IQD':{buy:1600,sell:1620},
 'EUR/USD':{buy:1.08,sell:1.09}, 'USD/EUR':{buy:0.9174,sell:0.9259},
 'IQD/USD':{buy:1/1490,sell:1/1480}, 'IQD/EUR':{buy:1/1620,sell:1/1600},
};
export const closingLabels = ['إجمالي القبض','إجمالي الصرف','الحوالات الداخلة','الحوالات الخارجة','التسويات','شراء العملة','بيع العملة','التحويلات بين الصناديق'];
export function closingSummary(boxId:string) {
 const box=registers.find(b=>b.id===boxId)!;
 return registerCurrencies.map(currency=>{
 const moves=registerMovements.filter(m=>m.box===boxId&&m.currency===currency&&m.date.startsWith(registerDay)&&m.status==='مكتملة');
 const sum=(type:string,side?:'incoming'|'outgoing')=>moves.filter(m=>m.type===type).reduce((s,m)=>s+(side?m[side]:m.incoming-m.outgoing),0);
 const net=moves.reduce((s,m)=>s+m.incoming-m.outgoing,0);
 return {currency,opening:box.balances[currency]-net,expected:box.balances[currency],values:[sum('قبض','incoming'),sum('صرف','outgoing'),sum('حوالة','incoming'),sum('حوالة','outgoing'),sum('تسوية'),sum('شراء عملة'),sum('بيع عملة'),sum('تحويل بين الصناديق')]};
 });
}
