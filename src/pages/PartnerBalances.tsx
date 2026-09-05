import { useState } from "react";
import { Link } from "react-router-dom";
import {
  financePartners,
  partnerMovements,
  financeDate,
} from "../data/partnerFinanceMock";
import {
  FinanceRows,
  FinanceModal,
  FinanceDetails,
} from "../components/FinanceViews";
import { PageHeader } from "../components/ui";
import "./financePages.css";
import "./partnerFinance.css";
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
export default function PartnerBalances() {
  const [filters, setFilters] = useState({
    name: "",
    code: "",
    currency: "",
    type: "",
    status: "",
  });
  const [selected, setSelected] = useState<{
    id: string;
    movements: boolean;
  } | null>(null);
  const type = (p: (typeof financePartners)[number]) => {
    const n = filters.currency === "IQD" ? p.iqd : p.usd;
    return n < 0 ? "مدين" : n > 0 ? "دائن" : "متعادل";
  };
  const rows = financePartners.filter(
    (p) =>
      p.name.includes(filters.name.trim()) &&
      p.id.toLowerCase().includes(filters.code.trim().toLowerCase()) &&
      (!filters.type || type(p) === filters.type) &&
      (!filters.status || (filters.status === "active") === p.active),
  );
  const partner = financePartners.find((p) => p.id === selected?.id);
  const money = (n: number, c: string) => (
    <span dir="ltr">
      {!filters.currency || filters.currency === c ? `${fmt(n)} ${c}` : "—"}
    </span>
  );
  function change(key: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }
  return (
    <div className="finance-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / الشركاء / الأرصدة</span>
      </nav>
      <PageHeader
        title="أرصدة الشركاء"
        description="أرصدة المكاتب والشركاء، مفصّلة حسب العملة."
      />
      <p className="tl-disclaimer">
        لقطة Mock ثابتة؛ الموجب دائن للشريك والسالب مدين عليه. العملات منفصلة،
        ولا تغيّر التسويات التجريبية هذه الأرصدة.
      </p>
      <div className="panel tl-filters">
        <div className="tl-filter-grid">
          {(
            [
              ["name", "بحث باسم الشريك أو المكتب"],
              ["code", "كود الشريك"],
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
          {(
            [
              [
                "currency",
                "العملة",
                [
                  ["USD", "USD"],
                  ["IQD", "IQD"],
                ],
              ],
              [
                "type",
                "نوع الرصيد",
                [
                  ["مدين", "مدين"],
                  ["دائن", "دائن"],
                  ["متعادل", "متعادل"],
                ],
              ],
              [
                "status",
                "الحالة",
                [
                  ["active", "نشط"],
                  ["disabled", "معطل"],
                ],
              ],
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
                {options.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        <div className="tl-filter-actions">
          <button
            className="tl-button"
            onClick={() =>
              setFilters({
                name: "",
                code: "",
                currency: "",
                type: "",
                status: "",
              })
            }
          >
            مسح الفلاتر
          </button>
        </div>
      </div>
      <div className="tl-stats">
        {[
          [
            "إجمالي أرصدة الدولار",
            money(
              rows.reduce((s, p) => s + p.usd, 0),
              "USD",
            ),
          ],
          [
            "إجمالي أرصدة الدينار",
            money(
              rows.reduce((s, p) => s + p.iqd, 0),
              "IQD",
            ),
          ],
          [
            "عدد الشركاء المدينين",
            rows.filter((p) => type(p) === "مدين").length,
          ],
          [
            "عدد الشركاء الدائنين",
            rows.filter((p) => type(p) === "دائن").length,
          ],
        ].map(([label, value], i) => (
          <article className="panel" key={i}>
            <small>{label}</small>
            <b className="pf-stat">{value}</b>
          </article>
        ))}
      </div>
      <section className="panel finance-results">
        <div className="panel-heading">
          <h2>قائمة أرصدة الشركاء</h2>
          <span>{rows.length} شريك حسب الفلاتر</span>
        </div>
        <FinanceRows
          headers={[
            "كود الشريك",
            "اسم الشريك/المكتب",
            "رصيد الدولار",
            "رصيد الدينار",
            "رصيد العملات الأخرى",
            "نوع الرصيد",
            "آخر حركة",
            "آخر تحديث",
            "الإجراءات",
          ]}
          rows={rows.map((p) => ({
            id: p.id,
            cells: [
              p.id,
              p.name,
              money(p.usd, "USD"),
              money(p.iqd, "IQD"),
              "—",
              <span
                className={`tl-badge ${type(p) === "مدين" ? "pending" : type(p) === "دائن" ? "done" : "review"}`}
              >
                {type(p)}
              </span>,
              p.lastActivity,
              financeDate,
              <div className="tl-row-actions">
                <button
                  onClick={() => setSelected({ id: p.id, movements: false })}
                >
                  عرض التفاصيل
                </button>
                <Link
                  className="tl-button"
                  to={`/partners/statement?partner=${p.id}`}
                >
                  كشف الحساب
                </Link>
                <button
                  onClick={() => setSelected({ id: p.id, movements: true })}
                >
                  عرض الحركات
                </button>
              </div>,
            ],
          }))}
        />
      </section>
      {partner && (
        <FinanceModal
          title={selected?.movements ? "حركات الشريك" : "تفاصيل رصيد الشريك"}
          close={() => setSelected(null)}
        >
          <FinanceDetails
            items={[
              ["كود الشريك", partner.id],
              ["الاسم", partner.name],
              ["المسؤول", partner.manager],
              ["الهاتف", partner.phone],
              ["الحالة", partner.active ? "نشط" : "معطل"],
              ["رصيد الدولار", `${fmt(partner.usd)} USD`],
              ["رصيد الدينار", `${fmt(partner.iqd)} IQD`],
            ]}
          />
          {selected?.movements && (
            <div className="pf-movement-cards">
              {partnerMovements
                .filter(
                  (m) =>
                    m.partnerId === partner.id &&
                    (!filters.currency || m.currency === filters.currency),
                )
                .map((m) => (
                  <article className="tl-mobile-card" key={m.id}>
                    <b>
                      {m.type} · {m.currency}
                    </b>
                    <FinanceDetails
                      items={[
                        ["التاريخ", m.date],
                        ["رقم الحركة", m.id],
                        ["المرجع", m.reference],
                        ["مدين", fmt(m.debit)],
                        ["دائن", fmt(m.credit)],
                        ["البيان", m.description],
                      ]}
                    />
                  </article>
                ))}
            </div>
          )}
        </FinanceModal>
      )}
    </div>
  );
}
