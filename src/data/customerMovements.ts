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
export function mockMovements(customers: Customer[]): Movement[] {
  return customers
    .filter((c) => Number(c.id.slice(2)) <= 1008)
    .flatMap((c) =>
      Object.keys(c.balances).flatMap((currency) =>
        movementTypes.map((type, i) => {
          const amount =
            [100, 250, 300, 50, 40, 20][i] * (currency === "IQD" ? 1000 : 1);
          const debit = i === 0 || i === 3 || i === 5 ? amount : 0;
          return {
            id: `MV-${c.id.slice(2)}-${currency}-${i + 1}`,
            customerId: c.id,
            date: `2026-09-0${2 + Math.floor(i / 2)}T${10 + i}:00`,
            type,
            reference:
              i < 2
                ? `DEMO-${i === 0 ? "OUT" : "IN"}-${c.id.slice(2)}`
                : `DOC-${c.id.slice(2)}-${i}`,
            amount,
            currency,
            debit,
            credit: debit ? 0 : amount,
            description: `${type} للعميل · محاكاة محلية`,
            status:
              i === 5 && Number(c.id.slice(2)) % 2 === 0
                ? "ملغاة"
                : i === 4 && Number(c.id.slice(2)) % 2 === 0
                  ? "قيد المراجعة"
                  : "مكتملة",
            notes: "حركة توضيحية، لا تمثل عملية مالية فعلية",
          };
        }),
      ),
    );
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
