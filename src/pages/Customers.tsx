import CustomerForm from '../components/CustomerForm';
import { useEffect, useRef, useState } from "react";

import { Link } from "react-router-dom";
import { PageHeader } from "../components/ui";
import Icon from "../components/Icon";
import {

  toggleCustomer,
  useCustomers,
} from "../data/customerRecords";
import type { Customer } from "../data/customerRecords";
import "./transferList.css";
import "./customers.css";
type CustomerAction = "view" | "edit" | "add" | "statement" | "disable";
const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
function balanceType(c: Customer, currency = "") {
  const values = currency
    ? [c.balances[currency] || 0]
    : Object.values(c.balances);
  return values.some((v) => v < 0)
    ? "مدين"
    : values.some((v) => v > 0)
      ? "دائن"
      : "متعادل";
}
function Balance({ value, currency }: { value: number; currency: string }) {
  return (
    <span
      className={`customer-balance ${value < 0 ? "debtor" : value > 0 ? "creditor" : "neutral"}`}
    >
      <b dir="ltr">{number(value)}</b>
      <small>{currency}</small>
    </span>
  );
}
function CustomerModal({
  customer,
  action,
  close,
}: {
  customer?: Customer;
  action: CustomerAction;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    d?.showModal();
    return () => d?.close();
  }, []);
  const titles = {
    view: "بيانات العميل",
    edit: "تعديل العميل",
    add: "إضافة عميل",
    statement: "كشف حساب العميل",
    disable: customer?.active ? "تعطيل تجريبي" : "تفعيل تجريبي",
  };
  return (
    <dialog
      className="tl-modal customer-modal"
      ref={ref}
      aria-labelledby="customer-modal-title"
      onCancel={close}
    >
      <div className="tl-modal-heading">
        <div>
          <span className="eyebrow">{customer?.id || "عميل جديد"}</span>
          <h2 id="customer-modal-title">{titles[action]}</h2>
        </div>
        <button className="tl-button" onClick={close}>
          إغلاق
        </button>
      </div>
      <p className="tl-disclaimer">
        بيانات Mock مؤقتة؛ تُفقد التعديلات عند تحديث المتصفح.
      </p>
      {action === "add" || action === "edit" ? (
        <CustomerForm customer={customer} onSaved={close} onCancel={close}/>
      ) : (
        customer && (
          <>
            {action === "disable" ? (
              <>
                <p>
                  هل تريد {customer.active ? "تعطيل" : "تفعيل"} العميل «
                  {customer.name}» تجريبيًا؟ بياناته وأرصدته ستبقى محفوظة داخل
                  الجلسة.
                </p>
                <div className="tl-modal-actions">
                  <button
                    className="tl-button primary"
                    onClick={() => {
                      toggleCustomer(customer.id);
                      close();
                    }}
                  >
                    تأكيد {customer.active ? "التعطيل" : "التفعيل"}
                  </button>
                  <button className="tl-button" onClick={close}>
                    رجوع
                  </button>
                </div>
              </>
            ) : (
              <>
                <dl className="tl-details">
                  {[
                    ["الاسم", customer.name],
                    ["الهاتف", customer.phone || "—"],
                    ["العنوان", customer.address || "—"],
                    ["الحالة", customer.active ? "نشط" : "معطل"],
                    ["تاريخ الإضافة", customer.created],
                    ["آخر تحديث", customer.updated],
                    ["آخر حركة", customer.lastActivity],
                    ["ملاحظات", customer.notes || "—"],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
                {action === "statement" && (
                  <p className="tl-disclaimer">
                    كشف تجريبي: الرصيد الافتتاحي أدناه يطابق رصيد العميل. لا
                    توجد عمليات مالية فعلية أو سجل حركات مُنشأ.
                  </p>
                )}
                <div className="customer-statement">
                  {Object.entries(customer.balances).map(
                    ([currency, value]) => (
                      <article key={currency}>
                        <div>
                          <b>{currency}</b>
                          <span
                            className={`customer-type ${value < 0 ? "debtor" : value > 0 ? "creditor" : "neutral"}`}
                          >
                            {value < 0 ? "مدين" : value > 0 ? "دائن" : "متعادل"}
                          </span>
                        </div>
                        <small>
                          {action === "statement"
                            ? "رصيد افتتاحي تجريبي / الرصيد الختامي"
                            : "الرصيد التجريبي"}
                        </small>
                        <Balance value={value} currency={currency} />
                      </article>
                    ),
                  )}
                </div>
              </>
            )}
          </>
        )
      )}
    </dialog>
  );
}
export default function Customers({
  balances = false,
}: {
  balances?: boolean;
}) {
  const customers = useCustomers();
  const [filters, setFilters] = useState({
    name: "",
    phone: "",
    id: "",
    status: "",
    currency: "",
    type: "",
    hasBalance: "",
  });
  const [selected, setSelected] = useState<{
    id?: string;
    action: CustomerAction;
  } | null>(null);
  const [page, setPage] = useState(1);
  const currencies = [
    ...new Set(customers.flatMap((c) => Object.keys(c.balances))),
  ];
  const rows = [...customers].sort((a,b)=>a.name.localeCompare(b.name,"ar")||a.id.localeCompare(b.id)).filter(
    (c) =>
      (balances ? `${c.name} ${c.phone} ${c.id}`.toLowerCase().includes(filters.name.trim().toLowerCase()) : c.name.includes(filters.name.trim())) &&
      c.phone.includes(filters.phone.trim()) &&
      c.id.toLowerCase().includes(filters.id.trim().toLowerCase()) &&
      (!filters.status || (filters.status === "active") === c.active) &&
      (!filters.currency || Object.hasOwn(c.balances, filters.currency)) &&
      (!filters.type || balanceType(c, filters.currency) === filters.type) &&
      (!filters.hasBalance ||
        (filters.hasBalance === "yes") ===
          (filters.currency
            ? (c.balances[filters.currency] || 0) !== 0
            : Object.values(c.balances).some((v) => v !== 0))),
  );
  const pages = Math.max(1, Math.ceil(rows.length / 5));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * 5, current * 5);
  const customer = customers.find((c) => c.id === selected?.id);
  const title = balances ? "أرصدة العملاء" : "العملاء";
  function change(key: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function amount(c: Customer, currency: string) {
    return !filters.currency || filters.currency === currency ? (
      <Balance value={c.balances[currency] || 0} currency={currency} />
    ) : (
      <span className="customer-muted">—</span>
    );
  }
  function others(c: Customer) {
    const pairs = Object.entries(c.balances).filter(
      ([code]) =>
        !["USD", "IQD"].includes(code) &&
        (!filters.currency || filters.currency === code),
    );
    return pairs.length
      ? pairs.map(([code, value]) => (
          <Balance key={code} value={value} currency={code} />
        ))
      : "—";
  }
  function actions(c: Customer) {
    return (
      <div className="tl-row-actions">
        {(balances
          ? ([["statement", "عرض كشف الحساب"]] as const)
          : ([
              ["view", "عرض"],
              ["edit", "تعديل"],
              ["statement", "كشف حساب"],
              ["disable", c.active ? "تعطيل تجريبي" : "تفعيل تجريبي"],
            ] as const)
        ).map(([action, label]) => (
          <button
            key={action}
            onClick={() => setSelected({ id: c.id, action })}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }
  const headers = balances
    ? [
        "كود العميل",
        "اسم العميل",
        "الهاتف",
        "رصيد الدولار",
        "رصيد الدينار",
        "رصيد العملات الأخرى",
        "نوع الرصيد",

        "عرض كشف الحساب",
      ]
    : ["التسلسل",
        "كود العميل",
        "الاسم",
        "الهاتف",
        "العنوان",
        "الرصيد بالدولار",
        "الرصيد بالدينار",
        "آخر حركة",
        "الحالة",
        "الإجراءات",
      ];
  return (
    <div className="customers-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / {title}</span>
      </nav>
      <PageHeader
        title={title}
        description={
          balances
            ? "نظرة واضحة على أرصدة العملاء، مع فصل كل عملة."
            : "إدارة بيانات العملاء وحالاتهم محليًا."
        }
      >
        {!balances && (
          <button
            className="tl-button primary"
            onClick={() => setSelected({ action: "add" })}
          >
            <Icon name="users" size={18} />
            إضافة عميل
          </button>
        )}
      </PageHeader>
      <p className="tl-disclaimer">
        محاكاة محلية فقط · الشهر التجريبي: سبتمبر 2026. الموجب: دائن (للعميل)،
        السالب: مدين (على العميل). لا نجمع عملات مختلفة في رصيد واحد.
      </p>
      <div className="panel tl-filters">
        <div className="tl-filter-grid">
          {(balances
            ? ([["name", "بحث بالاسم أو الهاتف أو كود العميل"]] as const)
            : ([
                ["name", "بحث بالاسم"],
                ["phone", "الهاتف"],
                ["id", "رقم/كود العميل"],
              ] as const)
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
          {balances ? null : (<label className="tl-field">
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
          )}
        </div>
        <div className="tl-filter-actions">
          <button
            className="tl-button"
            onClick={() => {
              setFilters({
                name: "",
                phone: "",
                id: "",
                status: "",
                currency: "",
                type: "",
                hasBalance: "",
              });
              setPage(1);
            }}
          >
            مسح الفلاتر
          </button>
        </div>
      </div>
      <div className="tl-stats">
        {(balances ? currencies.map(code=>["إجمالي "+code, `${number(rows.reduce((sum,c)=>sum+(c.balances[code]||0),0))} ${code}`])
          : [
              ["إجمالي العملاء", rows.length],
              ["العملاء النشطون", rows.filter((c) => c.active).length],
              [
                "العملاء الذين لديهم رصيد",
                rows.filter((c) =>
                  Object.values(c.balances).some((v) => v !== 0),
                ).length,
              ],
              [
                "عملاء جدد هذا الشهر",
                rows.filter((c) => c.created.startsWith("2026-09")).length,
              ],
            ]
        ).map(([label, value]) => (
          <article className="panel" key={label}>
            <small>{label}</small>
            <b className="customer-stat-value" dir="ltr">
              {value}
            </b>
          </article>
        ))}
      </div>
      <p className="tl-summary-note">
        الإحصائيات حسب الفلاتر.{" "}
        {balances
          ? "الإجماليات حسب نتائج البحث، وكل عملة مستقلة."
          : ""}
      </p>
      <section className="panel tl-results">
        <div className="panel-heading">
          <h2>{balances ? "قائمة الأرصدة" : "دليل العملاء"}</h2>
          <span className="eyebrow">{rows.length} عميل</span>
        </div>
        {!rows.length ? (
          <div className="tl-empty">
            <Icon name="users" size={35} />
            <h2>لا يوجد عملاء مطابقون</h2>
            <p>جرّب تغيير الفلاتر.</p>
          </div>
        ) : (
          <>
            <div
              className="tl-table-scroll"
              role="region"
              aria-label="جدول العملاء"
              tabIndex={0}
            >
              <table>
                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {visible.map((c,index) => (
                    <tr key={c.id}>{!balances&&<td>{(current-1)*5+index+1}</td>}
                      <td dir="ltr">{c.id}</td>
                      <td>{c.name}</td>
                      {balances ? (<><td dir="ltr">{c.phone||"—"}</td><td>{amount(c, "USD")}</td>
                          <td>{amount(c, "IQD")}</td>
                          <td>{others(c)}</td>
                          <td>
                            <span
                              className={`customer-type ${balanceType(c, filters.currency) === "مدين" ? "debtor" : balanceType(c, filters.currency) === "دائن" ? "creditor" : "neutral"}`}
                            >
                              {balanceType(c, filters.currency)}
                            </span>
                          </td>

                        </>
                      ) : (
                        <>
                          <td dir="ltr">{c.phone || "—"}</td>
                          <td>{c.address || "—"}</td>
                          <td>{amount(c, "USD")}</td>
                          <td>{amount(c, "IQD")}</td>
                          <td>{c.lastActivity}</td>
                          <td>
                            <span
                              className={`tl-badge ${c.active ? "done" : "cancelled"}`}
                            >
                              {c.active ? "نشط" : "معطل"}
                            </span>
                          </td>
                        </>
                      )}
                      <td>{actions(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="tl-mobile-cards">
              {visible.map((c,index) => (
                <article className="tl-mobile-card" key={c.id}>
                  <header>
                    <b>{!balances&&<span className="count-badge">{(current-1)*5+index+1}</span>} {c.name}</b>
                    <span dir="ltr">{c.id}</span>
                  </header>
                  <dl>{balances&&<div><dt>الهاتف</dt><dd dir="ltr">{c.phone||"—"}</dd></div>}
                    {!balances && (
                      <>
                        <div>
                          <dt>الهاتف</dt>
                          <dd dir="ltr">{c.phone || "—"}</dd>
                        </div>
                        <div>
                          <dt>العنوان</dt>
                          <dd>{c.address || "—"}</dd>
                        </div>
                        <div>
                          <dt>الحالة</dt>
                          <dd>{c.active ? "نشط" : "معطل"}</dd>
                        </div>
                      </>
                    )}
                    <div>
                      <dt>الدولار</dt>
                      <dd>{amount(c, "USD")}</dd>
                    </div>
                    <div>
                      <dt>الدينار</dt>
                      <dd>{amount(c, "IQD")}</dd>
                    </div>
                    {balances && (
                      <>
                        <div>
                          <dt>عملات أخرى</dt>
                          <dd>{others(c)}</dd>
                        </div>
                        <div>
                          <dt>نوع الرصيد</dt>
                          <dd>
                            <span
                              className={`customer-type ${balanceType(c, filters.currency) === "مدين" ? "debtor" : balanceType(c, filters.currency) === "دائن" ? "creditor" : "neutral"}`}
                            >
                              {balanceType(c, filters.currency)}
                            </span>
                          </dd>
                        </div>
                      </>
                    )}
                    {!balances&&<div><dt>آخر حركة</dt><dd>{c.lastActivity}</dd></div>}
                  </dl>
                  {actions(c)}
                </article>
              ))}
            </div>
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
          </>
        )}
      </section>
      {selected && (
        <CustomerModal
          key={`${selected.id}-${selected.action}`}
          customer={customer}
          action={selected.action}
          close={() => setSelected(null)}
        />
      )}
    </div>
  );
}



