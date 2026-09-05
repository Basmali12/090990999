import { cashboxBalances, cashboxMovements } from "./cashboxMock";
export const registerDay = "2026-09-05";
export const registers = [
  {
    id: "main",
    name: "الصندوق الرئيسي",
    branch: "بغداد",
    balances: cashboxBalances,
  },
  {
    id: "erbil",
    name: "صندوق فرع أربيل",
    branch: "أربيل",
    balances: { USD: 15000, IQD: 22000000, EUR: 1800 },
  },
  {
    id: "reserve",
    name: "صندوق الاحتياطي",
    branch: "بغداد",
    balances: { USD: 30000, IQD: 45000000, EUR: 3500 },
  },
];
export const registerCurrencies = ["USD", "IQD", "EUR"];
export const registerTypes = [
  "قبض",
  "صرف",
  "حوالة",
  "تسوية",
  "تحويل بين الصناديق",
  "شراء عملة",
  "بيع عملة",
];
export type RegisterMovement = {
  id: string;
  date: string;
  box: string;
  type: string;
  party: string;
  reference: string;
  description: string;
  amount: number;
  currency: string;
  incoming: number;
  outgoing: number;
  balance: number;
  user: string;
  status: string;
};
const mainRows: RegisterMovement[] = cashboxMovements.map((m) => ({
  ...m,
  box: "main",
  type: m.type.startsWith("حوالة") ? "حوالة" : m.type,
  party: "طرف تجريبي",
  incoming: m.incoming ? m.amount : 0,
  outgoing: m.incoming ? 0 : m.amount,
  status: "مكتملة",
}));
const otherRows = registers
  .slice(1)
  .flatMap((box) =>
    Array.from({ length: 12 }, (_, i) => ({
      id: `CB-${box.id}-${5001 + i}`,
      date: `2026-09-0${i < 3 ? 4 : 5}T${String(8 + (i % 10)).padStart(2, "0")}:${String(i * 4).padStart(2, "0")}`,
      box: box.id,
      type: registerTypes[i % 7],
      party: ["عميل تجريبي", "مكتب النور", "أخرى"][i % 3],
      reference: `DEMO-${box.id}-${701 + i}`,
      description: "حركة توضيحية ضمن السجل المحلي",
      amount: (i + 1) * 100 * (i % 3 === 1 ? 1000 : 1),
      currency: registerCurrencies[i % 3],
      incoming: i % 2 === 0 ? (i + 1) * 100 * (i % 3 === 1 ? 1000 : 1) : 0,
      outgoing: i % 2 !== 0 ? (i + 1) * 100 * (i % 3 === 1 ? 1000 : 1) : 0,
      balance: 0,
      user: i % 2 ? "أحمد محمد" : "علي حسين",
      status: i === 10 ? "معلقة" : i === 11 ? "ملغاة" : "مكتملة",
    })),
  );
const sortedOthers = otherRows.sort(
  (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
);
export const registerMovements: RegisterMovement[] = [
  ...mainRows,
  ...sortedOthers.map((m, index) => ({
    ...m,
    balance:
      (registers.find((b) => b.id === m.box)!.balances[m.currency] || 0) -
      sortedOthers
        .slice(index + 1)
        .filter(
          (r) =>
            r.box === m.box &&
            r.currency === m.currency &&
            r.status === "مكتملة",
        )
        .reduce((s, r) => s + r.incoming - r.outgoing, 0),
    incoming: m.status === "مكتملة" ? m.incoming : 0,
    outgoing: m.status === "مكتملة" ? m.outgoing : 0,
  })),
].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
export const registerBalanceRows = registers.flatMap((box) =>
  registerCurrencies.map((currency) => {
    const moves = registerMovements.filter(
      (m) => m.box === box.id && m.currency === currency,
    );
    const incoming = moves.reduce((s, m) => s + m.incoming, 0);
    const outgoing = moves.reduce((s, m) => s + m.outgoing, 0);
    return {
      id: `${box.id}-${currency}`,
      box: box.id,
      name: box.name,
      branch: box.branch,
      currency,
      opening: box.balances[currency] - incoming + outgoing,
      incoming,
      outgoing,
      current: box.balances[currency],
      last: moves.at(-1)?.date || "—",
      updated: `${registerDay}T18:00`,
    };
  }),
);
export const boxName = (id: string) =>
  registers.find((b) => b.id === id)?.name || id;
