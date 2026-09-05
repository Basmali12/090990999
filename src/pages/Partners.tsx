import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  FinanceRows,
  FinanceModal,
  FinanceDetails,
} from "../components/FinanceViews";
import { PageHeader } from "../components/ui";
import { partnerMock } from "../data/partnerRecords";
import type { Partner } from "../data/partnerRecords";
import "./financePages.css";
type Action = "view" | "edit" | "add" | "statement" | "balance" | "disable";
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
function PartnerModal({
  row,
  action,
  close,
  save,
  toggle,
}: {
  row?: Partner;
  action: Action;
  close: () => void;
  save: (
    draft: Pick<
      Partner,
      "name" | "manager" | "phone" | "address" | "city" | "notes"
    >,
  ) => void;
  toggle: () => void;
}) {
  const [draft, setDraft] = useState({
    name: row?.name || "",
    manager: row?.manager || "",
    phone: row?.phone || "",
    address: row?.address || "",
    city: row?.city || "",
    notes: row?.notes || "",
  });
  const [error, setError] = useState("");
  const title = {
    view: "تفاصيل الشريك",
    edit: "تعديل الشريك",
    add: "إضافة شريك/مكتب",
    statement: "كشف حساب الشريك",
    balance: "أرصدة الشريك",
    disable: row?.active ? "تعطيل الشريك تجريبيًا" : "تفعيل الشريك تجريبيًا",
  }[action];
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!draft.name.trim() || !draft.manager.trim() || !draft.city.trim()) {
      setError("اسم الشريك والمسؤول والمدينة مطلوبة.");
      return;
    }
    if (draft.phone.trim() && !/^[+\d\s()-]{7,20}$/.test(draft.phone)) {
      setError("أدخل هاتفًا صالحًا من 7 إلى 20 حرفًا أو اتركه فارغًا.");
      return;
    }
    save({
      ...draft,
      name: draft.name.trim(),
      manager: draft.manager.trim(),
      city: draft.city.trim(),
    });
  }
  return (
    <FinanceModal title={title} close={close}>
      <p className="tl-disclaimer">
        بيانات محلية مؤقتة فقط؛ لا ينفذ الحفظ حركة مالية.
      </p>
      {action === "add" || action === "edit" ? (
        <form noValidate onSubmit={submit}>
          <div className="tl-edit-grid">
            {(
              [
                ["name", "اسم المكتب/الشريك"],
                ["manager", "اسم المسؤول"],
                ["phone", "الهاتف"],
                ["address", "العنوان"],
                ["city", "المدينة"],
                ["notes", "ملاحظات"],
              ] as const
            ).map(([key, label]) => (
              <label className="tl-field" key={key}>
                <span>{label}</span>
                {key === "notes" ? (
                  <textarea
                    aria-label={label}
                    rows={3}
                    maxLength={1000}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                  />
                ) : (
                  <input
                    aria-label={label}
                    type={key === "phone" ? "tel" : "text"}
                    required={
                      key === "name" || key === "manager" || key === "city"
                    }
                    maxLength={key === "phone" ? 20 : 160}
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                  />
                )}
              </label>
            ))}
          </div>
          {error && (
            <p className="tl-error" role="alert">
              {error}
            </p>
          )}
          <div className="tl-modal-actions">
            <button className="tl-button primary">حفظ الشريك</button>
            <button className="tl-button" type="button" onClick={close}>
              إلغاء
            </button>
          </div>
        </form>
      ) : (
        row && (
          <>
            {action === "disable" ? (
              <>
                <p>
                  تأكيد {row.active ? "تعطيل" : "تفعيل"} «{row.name}»؟ ستبقى
                  البيانات والأرصدة كما هي.
                </p>
                <div className="tl-modal-actions">
                  <button className="tl-button primary" onClick={toggle}>
                    تأكيد {row.active ? "التعطيل" : "التفعيل"}
                  </button>
                  <button className="tl-button" onClick={close}>
                    رجوع
                  </button>
                </div>
              </>
            ) : (
              <>
                <FinanceDetails
                  items={[
                    ["كود الشريك", row.id],
                    ["الاسم", row.name],
                    ["المسؤول", row.manager],
                    ["الهاتف", row.phone || "—"],
                    ["المدينة", row.city],
                    ["العنوان", row.address || "—"],
                    ["النوع", row.kind],
                    ["الحالة", row.active ? "نشط" : "معطل"],
                    ["آخر حركة", row.lastActivity],
                    ["ملاحظات", row.notes || "—"],
                  ]}
                />
                {action === "statement" && (
                  <p className="tl-disclaimer">
                    كشف افتتاحي تجريبي: لا توجد حركات إضافية؛ الرصيد الختامي
                    يساوي الرصيد الافتتاحي لكل عملة.
                  </p>
                )}
                <div className="finance-summary">
                  <article>
                    <small>
                      {action === "statement"
                        ? "افتتاحي / ختامي بالدولار"
                        : "رصيد الدولار"}
                    </small>
                    <b dir="ltr">{fmt(row.usd)} USD</b>
                  </article>
                  <article>
                    <small>
                      {action === "statement"
                        ? "افتتاحي / ختامي بالدينار"
                        : "رصيد الدينار"}
                    </small>
                    <b dir="ltr">{fmt(row.iqd)} IQD</b>
                  </article>
                </div>
              </>
            )}
          </>
        )
      )}
    </FinanceModal>
  );
}
export default function Partners() {
  const [rows, setRows] = useState(() => partnerMock.map((p) => ({ ...p })));
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    code: "",
    city: "",
    status: "",
  });
  const [selected, setSelected] = useState<{
    id?: string;
    action: Action;
  } | null>(null);
  const [page, setPage] = useState(1);
  const visibleRows = rows.filter(
    (p) =>
      p.name.includes(filters.name.trim()) &&
      p.phone.includes(filters.phone.trim()) &&
      p.id.toLowerCase().includes(filters.code.trim().toLowerCase()) &&
      p.city.includes(filters.city.trim()) &&
      (!filters.status || (filters.status === "active") === p.active),
  );
  const pages = Math.max(1, Math.ceil(visibleRows.length / 5));
  const current = Math.min(page, pages);
  const visible = visibleRows.slice((current - 1) * 5, current * 5);
  const row = rows.find((p) => p.id === selected?.id);
  function change(key: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function save(
    draft: Pick<
      Partner,
      "name" | "manager" | "phone" | "address" | "city" | "notes"
    >,
  ) {
    if (row) {
      setRows((v) => v.map((p) => (p.id === row.id ? { ...p, ...draft } : p)));
    } else {
      setRows((v) => [
        {
          ...draft,
          id: `P-${Math.max(...v.map((p) => Number(p.id.slice(2)))) + 1}`,
          kind: "مكتب",
          active: true,
          usd: 0,
          iqd: 0,
          lastActivity: "—",
        },
        ...v,
      ]);
      setPage(1);
    }
    setSelected(null);
  }
  function actions(p: Partner) {
    return (
      <div className="tl-row-actions">
        {(
          [
            ["view", "عرض"],
            ["edit", "تعديل"],
            ["statement", "كشف حساب"],
            ["balance", "عرض الرصيد"],
            ["disable", p.active ? "تعطيل تجريبي" : "تفعيل تجريبي"],
          ] as const
        ).map(([action, title]) => (
          <button
            key={action}
            onClick={() => setSelected({ id: p.id, action })}
          >
            {title}
          </button>
        ))}
      </div>
    );
  }
  return (
    <div className="finance-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / الشركاء والمكاتب</span>
      </nav>
      <PageHeader
        title="الشركاء والمكاتب"
        description="إدارة بيانات مكاتب الصيرفة والحوالات والشركاء."
      >
        <button
          className="tl-button primary"
          onClick={() => setSelected({ action: "add" })}
        >
          إضافة شريك/مكتب
        </button>
      </PageHeader>
      <p className="tl-disclaimer">
        بيانات Mock فقط. الإضافات والتعديلات محفوظة مؤقتًا داخل الصفحة؛ لا يتم
        تغيير أي بيانات أو أرصدة خارجية. الشريك الجديد يُضاف كمكتب تجريبي برصيد
        صفر.
      </p>
      <div className="panel tl-filters">
        <div className="tl-filter-grid">
          {(
            [
              ["name", "بحث باسم الشريك أو المكتب"],
              ["phone", "رقم الهاتف"],
              ["code", "كود الشريك"],
              ["city", "المدينة/المنطقة"],
            ] as const
          ).map(([key, label]) => (
            <label className="tl-field" key={key}>
              <span>{label}</span>
              <input
                aria-label={label}
                value={filters[key]}
                onChange={(e) => change(key, e.target.value)}
              />
            </label>
          ))}
          <label className="tl-field">
            <span>الحالة</span>
            <select
              aria-label="الحالة"
              value={filters.status}
              onChange={(e) => change("status", e.target.value)}
            >
              <option value="">الكل</option>
              <option value="active">نشط</option>
              <option value="disabled">معطل</option>
            </select>
          </label>
        </div>
        <div className="tl-filter-actions">
          <button
            className="tl-button"
            onClick={() => {
              setFilters({
                name: "",
                phone: "",
                code: "",
                city: "",
                status: "",
              });
              setPage(1);
            }}
          >
            مسح الفلاتر
          </button>
        </div>
      </div>
      <div className="tl-stats">
        {[
          ["إجمالي الشركاء", visibleRows.length],
          ["الشركاء النشطون", visibleRows.filter((p) => p.active).length],
          [
            "الشركاء الذين لديهم رصيد",
            visibleRows.filter((p) => p.usd !== 0 || p.iqd !== 0).length,
          ],
          ["عدد المكاتب", visibleRows.filter((p) => p.kind === "مكتب").length],
        ].map(([label, value]) => (
          <article className="panel" key={label}>
            <small>{label}</small>
            <b className="tl-stat-number">{value}</b>
          </article>
        ))}
      </div>
      <section className="panel finance-results">
        <div className="panel-heading">
          <h2>دليل الشركاء</h2>
          <span>{visibleRows.length} نتيجة حسب الفلاتر</span>
        </div>
        <FinanceRows
          headers={[
            "كود الشريك",
            "اسم الشريك/المكتب",
            "المسؤول",
            "الهاتف",
            "المدينة/العنوان",
            "رصيد الدولار",
            "رصيد الدينار",
            "آخر حركة",
            "الحالة",
            "الإجراءات",
          ]}
          rows={visible.map((p) => ({
            id: p.id,
            cells: [
              p.id,
              p.name,
              p.manager,
              p.phone || "—",
              `${p.city} · ${p.address}`,
              `${fmt(p.usd)} USD`,
              `${fmt(p.iqd)} IQD`,
              p.lastActivity,
              <span className={`tl-badge ${p.active ? "done" : "cancelled"}`}>
                {p.active ? "نشط" : "معطل"}
              </span>,
              actions(p),
            ],
          }))}
        />
        <nav className="tl-pagination">
          <button
            className="tl-button"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            السابق
          </button>
          <span>
            صفحة {current} من {pages}
          </span>
          <button
            className="tl-button"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            التالي
          </button>
        </nav>
      </section>
      {selected && (
        <PartnerModal
          key={`${selected.id}-${selected.action}`}
          row={row}
          action={selected.action}
          close={() => setSelected(null)}
          save={save}
          toggle={() => {
            if (row)
              setRows((v) =>
                v.map((p) =>
                  p.id === row.id ? { ...p, active: !p.active } : p,
                ),
              );
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
