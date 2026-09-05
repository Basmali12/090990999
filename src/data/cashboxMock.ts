export const cashboxBalances: Record<string, number> = {
  USD: 84250,
  IQD: 126450000,
  EUR: 4250,
};
export const cashboxDay = "2026-09-05";
const fixtures = Array.from({ length: 9 }, (_, i) => ({
  id: `CB-${4101 + i}`,
  date: `${i < 2 ? "2026-09-04" : cashboxDay}T${String(9 + i).padStart(2, "0")}:15`,
  type: [
    "قبض",
    "صرف",
    "حوالة صادرة",
    "حوالة واردة",
    "تسوية",
    "شراء عملة",
    "بيع عملة",
    "قبض",
    "صرف",
  ][i],
  reference: `DEMO-REF-${501 + i}`,
  description: "حركة صندوق توضيحية · بيانات محلية",
  amount: [500, 150000, 250, 1200, 100, 300, 50000, 200, 100][i],
  currency: ["USD", "IQD", "USD", "USD", "EUR", "EUR", "IQD", "USD", "EUR"][i],
  incoming: [true, false, false, true, true, true, false, true, false][i],
  user: "أحمد محمد · مستخدم تجريبي",
}));
export const cashboxMovements = fixtures.map((row, index) => ({
  ...row,
  balance:
    cashboxBalances[row.currency] -
    fixtures
      .slice(index + 1)
      .filter((r) => r.currency === row.currency)
      .reduce((sum, r) => sum + (r.incoming ? r.amount : -r.amount), 0),
}));
export const cashboxActions = [
  { title: "قبض", path: "/cashbox/receipt", icon: "down" },
  { title: "صرف", path: "/cashbox/payment", icon: "up" },
  { title: "تحويل بين الصناديق", path: "/cashbox/transfer", icon: "transfer" },
  { title: "كشف رصيد الصندوق", path: "/cashbox/balance", icon: "wallet" },
  { title: "حركة الصندوق", path: "/cashbox/activity", icon: "chart" },
  { title: "إغلاق اليوم", path: "/cashbox/close-day", icon: "clock" },
];
