import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  financePartners,
  partnerBalance,
  partnerMovements,
} from "../data/partnerFinanceMock";
import { PageHeader } from "../components/ui";
import { FinanceDetails, FinanceRows } from "../components/FinanceViews";
import "./financePages.css";
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
export default function PartnerStatement() {
  const [params] = useSearchParams();
  const [filters, setFilters] = useState({
    partner: params.get("partner") || "",
    currency: "USD",
    from: "",
    to: "",
  });
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(false);
  const [error, setError] = useState("");
  const partner = financePartners.find((p) => p.id === filters.partner);
  const options = financePartners.filter((p) =>
    `${p.id} ${p.name}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const all = partnerMovements
    .filter(
      (m) => m.partnerId === filters.partner && m.currency === filters.currency,
    )
    .sort((a, b) => a.date.localeCompare(b.date));
  const opening =
    partnerBalance(filters.partner, filters.currency) -
    all.reduce((s, m) => s + m.credit - m.debit, 0);
  const previous =
    opening +
    all
      .filter((m) => filters.from && m.date.slice(0, 10) < filters.from)
      .reduce((s, m) => s + m.credit - m.debit, 0);
  const rows = all.filter(
    (m) =>
      (!filters.from || m.date.slice(0, 10) >= filters.from) &&
      (!filters.to || m.date.slice(0, 10) <= filters.to),
  );
  const debit = rows.reduce((s, m) => s + m.debit, 0);
  const credit = rows.reduce((s, m) => s + m.credit, 0);
  function change(key: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setShown(false);
    setError("");
  }
  return (
    <div className="finance-page statement-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / الشركاء / كشف الحساب</span>
      </nav>
      <PageHeader
        title="كشف حساب شريك"
        description="تفاصيل حركة المكتب والرصيد المتدرج لكل عملة."
      />
      <p className="tl-disclaimer">
        كشف تجريبي محلي. الرصيد = السابق + الدائن − المدين؛ الموجب للشريك
        والسالب عليه. لا تُطبّق التسويات المحلية على هذا السجل.
      </p>
      <form
        className="panel tl-filters"
        onSubmit={(e) => {
          e.preventDefault();
          if (!partner) {
            setError("اختر الشريك أولًا.");
            return;
          }
          if (filters.from && filters.to && filters.from > filters.to) {
            setError("تاريخ البداية يجب ألا يتجاوز تاريخ النهاية.");
            return;
          }
          setShown(true);
          setError("");
        }}
      >
        <div className="tl-filter-grid">
          <label className="tl-field">
            <span>بحث بالاسم أو الكود</span>
            <input
              aria-label="بحث بالاسم أو الكود"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <label className="tl-field">
            <span>اختيار الشريك</span>
            <select
              aria-label="اختيار الشريك"
              value={filters.partner}
              onChange={(e) => change("partner", e.target.value)}
            >
              <option value="">اختر الشريك</option>
              {partner && !options.includes(partner) && (
                <option value={partner.id}>
                  {partner.name} · {partner.id}
                </option>
              )}
              {options.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name} · {p.id}
                </option>
              ))}
            </select>
            {!options.length && <small>لا يوجد شريك مطابق.</small>}
          </label>
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
          <label className="tl-field">
            <span>اختيار العملة</span>
            <select
              aria-label="اختيار العملة"
              value={filters.currency}
              onChange={(e) => change("currency", e.target.value)}
            >
              <option>USD</option>
              <option>IQD</option>
            </select>
          </label>
        </div>
        {error && (
          <p role="alert" className="tl-error">
            {error}
          </p>
        )}
        <div className="tl-filter-actions">
          <button className="tl-button primary">عرض</button>
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
      {partner && (
        <section className="panel finance-info">
          <h2>معلومات الشريك</h2>
          <FinanceDetails
            items={[
              ["اسم المكتب/الشريك", partner.name],
              ["المسؤول", partner.manager],
              ["الهاتف", partner.phone],
              [
                "الرصيد السابق",
                shown
                  ? `${fmt(previous)} ${filters.currency}`
                  : "يظهر بعد عرض الكشف",
              ],
              [
                "الرصيد الحالي",
                shown
                  ? `${fmt(previous + credit - debit)} ${filters.currency}`
                  : "يظهر بعد عرض الكشف",
              ],
            ]}
          />
        </section>
      )}
      {shown && partner ? (
        <section className="panel finance-results">
          <div className="panel-heading">
            <div>
              <h2>حركات الشريك · {filters.currency}</h2>
              <p>
                {filters.from || "بداية السجل"} — {filters.to || "نهاية السجل"}{" "}
                · طباعة تجريبية
              </p>
            </div>
            <span>{rows.length} حركة</span>
          </div>
          <FinanceRows
            headers={[
              "التاريخ",
              "رقم الحركة",
              "نوع الحركة",
              "رقم الحوالة أو المرجع",
              "البيان",
              "العملة",
              "مدين",
              "دائن",
              "الرصيد بعد الحركة",
              "الملاحظات",
            ]}
            rows={rows.map((m, index) => ({
              id: m.id,
              cells: [
                m.date.replace("T", " · "),
                m.id,
                m.type,
                m.reference,
                m.description,
                m.currency,
                fmt(m.debit),
                fmt(m.credit),
                fmt(
                  previous +
                    rows
                      .slice(0, index + 1)
                      .reduce((s, v) => s + v.credit - v.debit, 0),
                ),
                m.notes,
              ],
            }))}
          />
          <div className="finance-summary">
            {[
              ["إجمالي المدين", debit],
              ["إجمالي الدائن", credit],
              ["الرصيد النهائي", previous + credit - debit],
            ].map(([label, value]) => (
              <article key={label}>
                <small>{label}</small>
                <b dir="ltr">
                  {fmt(Number(value))} {filters.currency}
                </b>
              </article>
            ))}
          </div>
        </section>
      ) : (
        <section className="panel tl-empty">
          <h2>اختر الشريك واعرض كشفه</h2>
          <p>حدد العملة والفترة المطلوبة.</p>
        </section>
      )}
    </div>
  );
}
