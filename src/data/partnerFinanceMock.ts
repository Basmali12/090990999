import { partnerMock } from "./partnerRecords";
export const financePartners = partnerMock;
export const financeDate = "2026-09-05";
export function partnerBalance(id: string, currency: string) {
  const p = financePartners.find((p) => p.id === id);
  return currency === "USD" ? p?.usd || 0 : p?.iqd || 0;
}
export const partnerMovements = financePartners.flatMap((p) =>
  ["USD", "IQD"].flatMap((currency) =>
    ["حوالة صادرة", "حوالة واردة", "قبض", "صرف", "تسوية"].map((type, i) => {
      const amount =
        [100, 200, 300, 80, 40][i] * (currency === "USD" ? 1 : 1000);
      return {
        id: `PM-${p.id}-${currency}-${i + 1}`,
        partnerId: p.id,
        date: `2026-09-0${2 + Math.floor(i / 2)}T${10 + i}:00`,
        type,
        reference: `DEMO-${p.id}-${i + 1}`,
        description: `${type} · حركة تجريبية`,
        currency,
        debit: i === 0 || i === 3 ? amount : 0,
        credit: i === 0 || i === 3 ? 0 : amount,
        notes: "حركة توضيحية لا تُنفّذ عملية مالية",
      };
    }),
  ),
);
export type Settlement = {
  id: string;
  partnerId: string;
  date: string;
  currency: string;
  before: number;
  amount: number;
  type: string;
  after: number;
  status: string;
  description: string;
  notes: string;
};
export function settlementPreview(
  before: number,
  amount: number,
  type: string,
) {
  return type === "قبض"
    ? before + amount
    : type === "دفع"
      ? before - amount
      : before - Math.sign(before) * Math.min(Math.abs(before), amount);
}
export const settlementMock: Settlement[] = Array.from(
  { length: 9 },
  (_, i) => {
    const partnerId = financePartners[i % 8].id;
    const currency = i % 2 ? "IQD" : "USD";
    const before = partnerBalance(partnerId, currency);
    const type = i % 2 ? "قبض" : "دفع";
    const amount = currency === "USD" ? 100 : 50000;
    return {
      id: `SET-${3001 + i}`,
      partnerId,
      date: `2026-09-0${i < 6 ? 5 : 4}T12:${String(i * 5).padStart(2, "0")}`,
      currency,
      before,
      amount,
      type,
      after: settlementPreview(before, amount, type),
      status: ["مكتملة", "معلقة", "ملغاة"][i % 3],
      description: "تسوية رصيد تجريبية",
      notes: "لا تؤثر في أرصدة الشركاء",
    };
  },
);
