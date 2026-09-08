import { useSyncExternalStore } from "react";
export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  active: boolean;
  created: string;
  updated: string;
  lastActivity: string;
  balances: Record<string, number>;
};
const names = [
  "أحمد محمد علي",
  "مصطفى خالد حسن",
  "علي حسين كريم",
  "عمر فاضل عباس",
  "حسن إبراهيم سالم",
  "محمد سعد جابر",
  "سارة أحمد حسن",
  "نور خالد علي",
];
let customers: Customer[] = names.map((name, i) => ({
  id: `C-${1001 + i}`,
  name,
  phone: `07700000${101 + i}`,
  address: ["بغداد، المنصور", "أربيل، المركز", "البصرة، العشار"][i % 3],
  notes: "عميل تجريبي محلي",
  active: i !== 3,
  created: i < 4 ? "2026-09-02" : "2026-08-15",
  updated: "2026-09-05",
  lastActivity: "2026-09-04",
  balances: {
    USD: i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : -1) * (1000 + i * 50),
    IQD: i % 3 === 0 ? 0 : (i % 3 === 1 ? 1 : -1) * (750000 + i * 10000),
    ...(i === 4 ? { EUR: 200 } : {}),
  },
}));
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useCustomers() {
  return useSyncExternalStore(subscribe, () => customers);
}
export function saveCustomer(
  id: string | null,
  details: Pick<Customer, "name" | "phone" | "address" | "notes"> & Partial<Pick<Customer, "balances" | "active">>,
) {
  const date = "2026-09-05";
  if (id) {
    customers = customers.map((c) =>
      c.id === id ? { ...c, ...details, updated: date } : c,
    );
  } else {
    const next =
      Math.max(1000, ...customers.map((c) => Number(c.id.slice(2)))) + 1;
    customers = [
      {
        ...details,
        id: `C-${next}`,
        active: true,
        created: date,
        updated: date,
        lastActivity: "—",
        balances: { USD: 0, IQD: 0 },
      },
      ...customers,
    ];
  }
  listeners.forEach((l) => l());
}
export function toggleCustomer(id: string) {
  customers = customers.map((c) =>
    c.id === id ? { ...c, active: !c.active, updated: "2026-09-05" } : c,
  );
  listeners.forEach((l) => l());
}
