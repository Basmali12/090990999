export type Partner = {
  id: string;
  name: string;
  manager: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
  active: boolean;
  kind: string;
  usd: number;
  iqd: number;
  lastActivity: string;
};
export const partnerMock: Partner[] = Array.from({ length: 8 }, (_, i) => ({
  id: `P-${2001 + i}`,
  name: [
    "مكتب النور",
    "مكتب الرافدين",
    "مكتب الأمان",
    "شركة المدى",
    "مكتب السلام",
    "شريك الأفق",
    "مكتب دجلة",
    "مكتب الفرات",
  ][i],
  manager: ["أحمد محمد", "علي حسين", "مصطفى خالد"][i % 3],
  phone: `0780000020${i}`,
  address: "الشارع الرئيسي · عنوان تجريبي",
  city: ["بغداد", "أربيل", "البصرة"][i % 3],
  notes: "بيانات شريك تجريبية",
  active: i !== 3,
  kind: i === 3 || i === 5 ? "شريك" : "مكتب",
  usd: i % 3 === 0 ? 0 : (i % 2 ? -1 : 1) * (2000 + i * 100),
  iqd: i % 3 === 0 ? 0 : (i % 2 ? -1 : 1) * (1500000 + i * 10000),
  lastActivity: "2026-09-04",
}));
