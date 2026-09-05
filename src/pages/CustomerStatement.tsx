import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../data/customerRecords";
import { mockMovements, openingBalance } from "../data/customerMovements";
import { PageHeader } from "../components/ui";
import { FinanceRows, FinanceDetails } from "../components/FinanceViews";
import "./financePages.css";
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
export default function CustomerStatement() {
  const customers = useCustomers();
  const movements = mockMovements(customers);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState({
    customer: "",
    currency: "USD",
    from: "",
    to: "",
  });
  const [shown, setShown] = useState(false);
  const [error, setError] = useState("");
  const customer = customers.find((c) => c.id === filter.customer);
  const options = customers.filter((c) =>
    `${c.id} ${c.name}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const badDates = !!(filter.from && filter.to && filter.from > filter.to);
  const all = movements
    .filter(
      (m) =>
        m.customerId === filter.customer &&
        m.currency === filter.currency &&
        m.status === "مكتملة",
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const prior = customer
    ? openingBalance(customer, filter.currency, movements) +
      all
        .filter((m) => filter.from && m.date.slice(0, 10) < filter.from)
        .reduce((sum, m) => sum + m.credit - m.debit, 0)
    : 0;
  const rows = all.filter(
    (m) =>
      (!filter.from || m.date.slice(0, 10) >= filter.from) &&
      (!filter.to || m.date.slice(0, 10) <= filter.to),
  );
  const debit = rows.reduce((sum, m) => sum + m.debit, 0);
  const credit = rows.reduce((sum, m) => sum + m.credit, 0);
  const calculated = rows.map((m, index) => ({
    ...m,
    balance:
      prior +
      rows
        .slice(0, index + 1)
        .reduce((sum, item) => sum + item.credit - item.debit, 0),
  }));
  function change(key: keyof typeof filter, value: string) {
    setFilter((f) => ({ ...f, [key]: value }));
    setShown(false);
    setError("");
  }
  return (
    <div className="finance-page statement-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / العملاء / كشف حساب</span>
      </nav>
      <PageHeader
        title="كشف حساب عميل"
        description="عرض الحركات والأرصدة التجريبية لكل عميل وعملة بصورة مستقلة."
      />
      <p className="tl-disclaimer">
        محاكاة محلية فقط. الموجب رصيد للعميل؛ الرصيد بعد الحركة = السابق +
        الدائن − المدين. يشمل الكشف الحركات المكتملة فقط، دون تعديل الأرصدة
        الحالية.
      </p>
      <form
        className="panel tl-filters"
        onSubmit={(e) => {
          e.preventDefault();
          if (!customer || badDates) {
            setShown(false);
            setError(
              !customer
                ? "اختر العميل أولًا."
                : "تاريخ البداية يجب ألا يتجاوز تاريخ النهاية.",
            );
            return;
          }
          setShown(true);
          setError("");
        }}
      >
        <div className="tl-filter-grid">
          <label className="tl-field">
            <span>بحث بالاسم أو كود العميل</span>
            <input
              aria-label="بحث بالاسم أو كود العميل"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="tl-field">
            <span>اختيار العميل</span>
            <select
              aria-label="اختيار العميل"
              value={filter.customer}
              onChange={(e) => change("customer", e.target.value)}
            >
              <option value="">اختر العميل</option>
              {customer && !options.some((c) => c.id === customer.id) && (
                <option value={customer.id}>
                  {customer.name} · {customer.id}
                </option>
              )}
              {options.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name} · {c.id}
                </option>
              ))}
            </select>
            {!options.length && <small>لا يوجد عميل مطابق للبحث.</small>}
          </label>
          {(["from", "to"] as const).map((key) => (
            <label className="tl-field" key={key}>
              <span>{key === "from" ? "من تاريخ" : "إلى تاريخ"}</span>
              <input
                aria-label={key === "from" ? "من تاريخ" : "إلى تاريخ"}
                type="date"
                value={filter[key]}
                onInput={(e) => change(key, e.currentTarget.value)}
                onChange={(e) => change(key, e.target.value)}
              />
            </label>
          ))}
          <label className="tl-field">
            <span>اختيار العملة</span>
            <select
              aria-label="اختيار العملة"
              value={filter.currency}
              onChange={(e) => change("currency", e.target.value)}
            >
              {["USD", "IQD", "EUR"].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        {error && (
          <p role="alert" className="tl-error">
            {error}
          </p>
        )}
        <div className="tl-filter-actions">
          <button className="tl-button primary">عرض الكشف</button>
          <button
            className="tl-button"
            type="button"
            disabled={!shown}
            onClick={() => window.print()}
          >
            طباعة
          </button>
        </div>
      </form>
      {customer && (
        <section className="panel finance-info">
          <h2>معلومات العميل</h2>
          <FinanceDetails
            items={[
              ["كود العميل", customer.id],
              ["اسم العميل", customer.name],
              ["الهاتف", customer.phone || "—"],
              [
                "الرصيد السابق",
                shown
                  ? `${fmt(prior)} ${filter.currency}`
                  : "يظهر بعد عرض الكشف",
              ],
              [
                "الرصيد الحالي",
                shown
                  ? `${fmt(prior + credit - debit)} ${filter.currency}`
                  : "يظهر بعد عرض الكشف",
              ],
            ]}
          />
        </section>
      )}
      {shown && customer ? (
        <section className="panel finance-results">
          <div className="panel-heading">
            <div>
              <h2>كشف الحركات · {filter.currency}</h2>
              <p>
                {filter.from || "بداية السجل"} — {filter.to || "نهاية السجل"} ·
                نسخة تجريبية
              </p>
            </div>
            <span>{rows.length} حركة</span>
          </div>
          <FinanceRows
            headers={[
              "التاريخ",
              "رقم الحركة",
              "نوع الحركة",
              "البيان",
              "العملة",
              "مدين",
              "دائن",
              "الرصيد بعد الحركة",
              "ملاحظات",
            ]}
            rows={calculated.map((m) => ({
              id: m.id,
              cells: [
                m.date.replace("T", " · "),
                m.id,
                m.type,
                m.description,
                m.currency,
                fmt(m.debit),
                fmt(m.credit),
                fmt(m.balance),
                m.notes,
              ],
            }))}
          />
          <div className="finance-summary">
            {[
              ["إجمالي المدين", debit],
              ["إجمالي الدائن", credit],
              ["الرصيد النهائي", prior + credit - debit],
            ].map(([label, value]) => (
              <article key={label}>
                <small>{label}</small>
                <b dir="ltr">
                  {fmt(Number(value))} {filter.currency}
                </b>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel tl-empty">
          <h2>اختر العميل واعرض كشفه</h2>
          <p>حدد العملة والفترة، ثم اضغط عرض الكشف.</p>
        </section>
      )}
    </div>
  );
}
