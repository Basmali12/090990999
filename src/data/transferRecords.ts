import { useSyncExternalStore } from "react";
export type TransferRecord = {
  id: string;
  direction: "outgoing" | "incoming";
  date: string;
  sender: string;
  recipient: string;
  senderPhone: string;
  recipientPhone: string;
  senderAddress: string;
  recipientAddress: string;
  amount: number;
  currency: string;
  commission: number;
  office: string;
  status: string;
  notes: string;
  reason: string;
  voucher: string;
  deliveredAt: string;
};
export const demoDay = "2026-09-05";
export const outgoingStatuses = ["مسلمة", "معلقة", "قيد المعالجة", "ملغاة"];
export const incomingStatuses = [
  "بانتظار التسليم",
  "مسلمة",
  "قيد المراجعة",
  "ملغاة",
];
export const offices = [
  "مكتب النور · بغداد",
  "مكتب الرافدين · أربيل",
  "مكتب الأمان · البصرة",
];
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
const initialRecords: TransferRecord[] = Array.from({ length: 24 }, (_, i) => {
  const index = i % 12;
  const outgoing = i < 12;
  return {
    id: `${outgoing ? "OUT" : "IN"}-${10285 - index}`,
    direction: outgoing ? "outgoing" : "incoming",
    date: `2026-09-${index < 8 ? "05" : "04"}T${String(10 + (index % 3)).padStart(2, "0")}:${String(index * 4).padStart(2, "0")}`,
    sender: names[index % names.length],
    recipient: names[(index + 3) % names.length],
    senderPhone: `07700000${String(index + 101)}`,
    recipientPhone: `07800000${String(index + 101)}`,
    senderAddress: "بغداد، المنصور · عنوان تجريبي",
    recipientAddress: "أربيل، المركز · عنوان تجريبي",
    amount:
      index % 3 === 0
        ? 1500 + index * 100
        : index % 3 === 1
          ? 750000 + index * 10000
          : 20000000 + index * 100000,
    currency: ["USD", "IQD", "IRT"][index % 3],
    commission: [15, 5000, 100000][index % 3],
    office: offices[index % 3],
    status: (outgoing ? outgoingStatuses : incomingStatuses)[index % 4],
    notes: index % 2 ? "التواصل مع المستفيد قبل التسليم · تجريبي" : "",
    reason: "مصاريف عائلية · تجريبي",
    voucher: `V-${500 + i}`,
    deliveredAt:
      (outgoing ? outgoingStatuses : incomingStatuses)[index % 4] === "مسلمة"
        ? "2026-09-05T12:00"
        : "",
  };
});
let records = initialRecords;
const listeners = new Set<() => void>();
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function useTransferRecords() {
  return useSyncExternalStore(subscribe, () => records);
}
export function updateTransfer(
  id: string,
  patch: Partial<
    Pick<
      TransferRecord,
      | "sender"
      | "recipient"
      | "amount"
      | "commission"
      | "notes"
      | "status"
      | "deliveredAt"
    >
  >,
) {
  records = records.map((row) => (row.id === id ? { ...row, ...patch } : row));
  listeners.forEach((listener) => listener());
}
