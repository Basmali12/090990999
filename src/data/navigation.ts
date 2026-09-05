export const groups = [
  {
    label: "الحوالات",
    icon: "transfer",
    items: [
      ["إرسال حوالة", "/transfers/new"],
      ["الحوالات الصادرة", "/transfers/outgoing"],
      ["الحوالات الواردة", "/transfers/incoming"],
      ["الحوالات غير المسلمة", "/transfers/pending"],
      ["البحث عن حوالة", "/transfers/search"],
      ["تسوية الحوالات", "/transfers/settlement"],
      ["الحوالات الملغاة", "/transfers/cancelled"],
    ],
  },
  {
    label: "الصيرفة",
    icon: "exchange",
    items: [
      ["شراء عملة", "/exchange/buy"],
      ["بيع عملة", "/exchange/sell"],
      ["أسعار الصرف", "/exchange/rates"],
      ["سجل عمليات الصرف", "/exchange/history"],
    ],
  },
  {
    label: "العملاء",
    icon: "users",
    items: [
      ["قائمة العملاء", "/customers"],
      ["إضافة عميل", "/customers/new"],
      ["أرصدة العملاء", "/customers/balances"],
      ["كشف حساب عميل", "/customers/statement"],
    ],
  },
  {
    label: "الشركاء والمكاتب",
    icon: "building",
    items: [
      ["التجار والمشتركون", "/partners/merchants"],
      ["الشركاء والمكاتب", "/partners"],
      ["أرصدة الشركاء", "/partners/balances"],
      ["كشف حساب شريك", "/partners/statement"],
      ["التسويات", "/partners/settlements"],
    ],
  },
  {
    label: "الصندوق",
    icon: "wallet",
    items: [
      ["الصناديق", "/cashbox"],
      ["قبض", "/cashbox/receipt"],
      ["صرف", "/cashbox/payment"],
      ["تحويل بين الصناديق", "/cashbox/transfer"],
      ["كشف رصيد الصندوق", "/cashbox/balances"],
      ["حركة الصندوق", "/cashbox/movements"],
      ["إغلاق اليوم", "/cashbox/close-day"],
    ],
  },
  {
    label: "التقارير",
    icon: "chart",
    items: [
      ["تقرير الحوالات", "/reports"],
      ["تقرير العملاء", "/reports/customers"],
      ["تقرير الشركاء", "/reports/partners"],
      ["تقرير الصندوق", "/reports/cashbox"],
      ["تقرير الصيرفة", "/reports/exchange"],
      ["تقرير العمولات", "/reports/commissions"],
      ["التقرير اليومي", "/reports/daily"],
      ["التقرير الشهري", "/reports/monthly"],
      ["التقرير السنوي", "/reports/yearly"],
    ],
  },
  {
    label: "الإدارة",
    icon: "settings",
    items: [
      ["المستخدمون", "/admin/users"],
      ["الصلاحيات", "/admin/permissions"],
      ["الفروع", "/admin/branches"],
      ["العملات", "/admin/currencies"],
      ["إعدادات النظام", "/settings"],
      ["إعدادات الطباعة", "/settings/printing"],
    ],
  },
  {
    label: "الحساب",
    icon: "user",
    items: [
      ["معلومات الحساب", "/account"],
      ["معلومات الاشتراك", "/account/subscription"],
      ["الأجهزة", "/account/devices"],
    ],
  },
];
export const pages = groups.flatMap((group) =>
  group.items.map(([title, path]) => ({
    title,
    path,
    group: group.label,
    icon: group.icon,
    description: `واجهة ${title} ضمن قسم ${group.label}، لمتابعة وتنظيم أعمال المكتب.`,
  })),
);

