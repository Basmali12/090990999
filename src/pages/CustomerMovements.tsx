import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../data/customerRecords";
import { mockMovements, movementTypes } from "../data/customerMovements";
import {
  FinanceRows,
  FinanceModal,
  FinanceDetails,
} from "../components/FinanceViews";
import { PageHeader } from "../components/ui";
import "./financePages.css";
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const blank = {
  query: "",
  type: "",
  currency: "",
  from: "",
  to: "",
  status: "",
};
export default function CustomerMovements() {
  const customers = useCustomers();
  const all = mockMovements(customers);
  const [filters, setFilters] = useState({ ...blank });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState("");
  const badDates = !!(filters.from && filters.to && filters.from > filters.to);
  const name = (id: string) => customers.find((c) => c.id === id)?.name || id;
  const rows = all.filter(
    (m) =>
      !badDates &&
      `${name(m.customerId)} ${m.customerId}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (!filters.type || m.type === filters.type) &&
      (!filters.currency || m.currency === filters.currency) &&
      (!filters.status || m.status === filters.status) &&
      (!filters.from || m.date.slice(0, 10) >= filters.from) &&
      (!filters.to || m.date.slice(0, 10) <= filters.to),
  );
  const pages = Math.max(1, Math.ceil(rows.length / 6));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * 6, current * 6);
  const movement = all.find((m) => m.id === selected);
  function change(key: keyof typeof blank, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function total(type: string) {
    return (
      <div className="tl-currency-totals">
        {["USD", "IQD", "EUR"].map((currency) => (
          <span key={currency}>
            <b>
              {fmt(
                rows
                  .filter(
                    (m) =>
                      m.currency === currency &&
                      m.type === type &&
                      m.status === "مكتملة",
                  )
                  .reduce((s, m) => s + m.amount, 0),
              )}
            </b>
            <small>{currency}</small>
          </span>
        ))}
      </div>
    );
  }
  return (
    <div className="finance-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / العملاء / الحركات</span>
      </nav>
      <PageHeader
        title="حركة العملاء"
        description="جميع حركات العملاء التجريبية، مع بحث وتجميع محلي."
      />
      <p className="tl-disclaimer">
        اليوم التجريبي: 2026-09-05. الإحصائيات حسب الفلاتر، وإجماليات القبض
        والصرف للحركات المكتملة فقط ولكل عملة على حدة.
      </p>
      <div className="panel tl-filters">
        <div className="tl-filter-grid">
          <label className="tl-field">
            <span>بحث بالعميل</span>
            <input
              aria-label="بحث بالعميل"
              value={filters.query}
              onChange={(e) => change("query", e.target.value)}
            />
          </label>
          {(
            [
              ["type", "نوع الحركة", movementTypes],
              ["currency", "العملة", ["USD", "IQD", "EUR"]],
              ["status", "حالة الحركة", ["مكتملة", "قيد المراجعة", "ملغاة"]],
            ] as const
          ).map(([key, label, options]) => (
            <label className="tl-field" key={key}>
              <span>{label}</span>
              <select
                aria-label={label}
                value={filters[key]}
                onChange={(e) => change(key, e.target.value)}
              >
                <option value="">الكل</option>
                {options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </label>
          ))}
          {(["from", "to"] as const).map((key) => (
            <label className="tl-field" key={key}>
              <span>{key === "from" ? "من تاريخ" : "إلى تاريخ"}</span>
              <input
                aria-label={key === "from" ? "من تاريخ" : "إلى تاريخ"}
                type="date"
                value={filters[key]}
                onInput={(e) => change(key, e.currentTarget.value)}
                onChange={(e) => change(key, e.target.value)}
              />
            </label>
          ))}
        </div>
        {badDates && (
          <p role="alert" className="tl-error">
            تاريخ البداية يجب ألا يتجاوز تاريخ النهاية.
          </p>
        )}
        <div className="tl-filter-actions">
          <button
            className="tl-button"
            onClick={() => {
              setFilters({ ...blank });
              setPage(1);
            }}
          >
            مسح الفلاتر
          </button>
        </div>
      </div>
      <div className="tl-stats">
        <article className="panel">
          <small>حركات اليوم</small>
          <b className="tl-stat-number">
            {rows.filter((m) => m.date.startsWith("2026-09-05")).length}
          </b>
        </article>
        <article className="panel">
          <small>إجمالي القبض</small>
          {total("قبض")}
        </article>
        <article className="panel">
          <small>إجمالي الصرف</small>
          {total("صرف")}
        </article>
        <article className="panel">
          <small>عدد الحوالات المرتبطة بالعملاء</small>
          <b className="tl-stat-number">
            {
              new Set(
                rows
                  .filter((m) => m.type.startsWith("حوالة"))
                  .map((m) => m.reference),
              ).size
            }
          </b>
        </article>
      </div>
      <section className="panel finance-results">
        <div className="panel-heading">
          <h2>سجل حركة العملاء</h2>
          <span>{rows.length} حركة</span>
        </div>
        <FinanceRows
          headers={[
            "رقم الحركة",
            "التاريخ والوقت",
            "العميل",
            "نوع الحركة",
            "المرجع/رقم الحوالة",
            "المبلغ",
            "العملة",
            "مدين/دائن",
            "البيان",
            "الحالة",
            "عرض",
          ]}
          rows={visible.map((m) => ({
            id: m.id,
            cells: [
              m.id,
              m.date.replace("T", " · "),
              name(m.customerId),
              m.type,
              m.reference,
              fmt(m.amount),
              m.currency,
              m.debit ? "مدين" : "دائن",
              m.description,
              <span
                className={`tl-badge ${m.status === "مكتملة" ? "done" : m.status === "ملغاة" ? "cancelled" : "review"}`}
              >
                {m.status}
              </span>,
              <button className="tl-button" onClick={() => setSelected(m.id)}>
                عرض
              </button>,
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
      {movement && (
        <FinanceModal title="تفاصيل حركة العميل" close={() => setSelected("")}>
          <FinanceDetails
            items={[
              ["رقم الحركة", movement.id],
              ["العميل", name(movement.customerId)],
              ["كود العميل", movement.customerId],
              ["التاريخ والوقت", movement.date.replace("T", " · ")],
              ["نوع الحركة", movement.type],
              ["المرجع", movement.reference],
              ["المبلغ", `${fmt(movement.amount)} ${movement.currency}`],
              ["مدين", fmt(movement.debit)],
              ["دائن", fmt(movement.credit)],
              ["البيان", movement.description],
              ["الحالة", movement.status],
              ["ملاحظات", movement.notes],
            ]}
          />
        </FinanceModal>
      )}
    </div>
  );
}
