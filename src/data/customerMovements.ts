import {getLocalData} from './localStore';
import type {LocalData} from './localStore';
import type { Customer } from "./customerRecords";
export const movementTypes = [
  "حوالة صادرة",
  "حوالة واردة",
  "قبض",
  "صرف",
  "تسوية",
  "تعديل رصيد تجريبي",
];
export type Movement = {
  id: string;
  customerId: string;
  date: string;
  type: string;
  reference: string;
  amount: number;
  currency: string;
  debit: number;
  credit: number;
  description: string;
  status: string;
  notes: string;
};
export function mockMovements(customers: Customer[], data:LocalData=getLocalData()): Movement[] {
 const ids=new Set(customers.map(c=>c.id));
 return data.cash.filter(p=>p.partyType==='عميل'&&p.customerId&&ids.has(p.customerId)).map(p=>({
  id:p.id,customerId:p.customerId!,date:p.date,type:p.type,reference:p.reference||p.id,amount:p.amount,currency:p.currency,
  debit:p.type==='صرف'?p.amount:0,credit:p.type==='قبض'?p.amount:0,description:p.description||p.reason,status:'مكتملة',notes:p.notes,
 })).sort((a,b)=>a.date.localeCompare(b.date)||a.id.localeCompare(b.id));
}
export function openingBalance(
  customer: Customer,
  currency: string,
  movements: Movement[],
) {
  return (
    (customer.balances[currency] || 0) -
    movements
      .filter(
        (m) =>
          m.customerId === customer.id &&
          m.currency === currency &&
          m.status === "مكتملة",
      )
      .reduce((sum, m) => sum + m.credit - m.debit, 0)
  );
}
