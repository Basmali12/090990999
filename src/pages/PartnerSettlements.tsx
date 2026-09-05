import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  financeDate,
  financePartners,
  partnerBalance,
  settlementMock,
  settlementPreview,
} from "../data/partnerFinanceMock";
import type { Settlement } from "../data/partnerFinanceMock";
import {
  FinanceModal,
  FinanceDetails,
  FinanceRows,
} from "../components/FinanceViews";
import { PageHeader } from "../components/ui";
import "./financePages.css";
import "./partnerFinance.css";
type Action = "new" | "edit" | "view" | "print" | "cancel";
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const partnerName = (id: string) =>
  financePartners.find((p) => p.id === id)?.name || id;
function SettlementModal({
  record,
  action,
  close,
  save,
  cancel,
}: {
  record?: Settlement;
  action: Action;
  close: () => void;
  save: (draft: Omit<Settlement, "id" | "date" | "status">) => void;
  cancel: () => void;
}) {
  const [draft, setDraft] = useState({
    partnerId: record?.partnerId || "",
    currency: record?.currency || "USD",
    type: record?.type || "قبض",
    amount: record ? String(record.amount) : "",
    description: record?.description || "",
    notes: record?.notes || "",
  });
  const [error, setError] = useState("");
  const before =
    record &&
    draft.partnerId === record.partnerId &&
    draft.currency === record.currency
      ? record.before
      : partnerBalance(draft.partnerId, draft.currency);
  const amount = Number(draft.amount);
  const safeAmount = Number.isFinite(amount)
    ? Math.min(1e12, Math.max(0, amount))
    : 0;
  const after = settlementPreview(before, safeAmount, draft.type);
  const editable = action === "new" || action === "edit";
  function submit(e: FormEvent) {
    e.preventDefault();
    if (
      !draft.partnerId ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      amount > 1e12
    ) {
      setError("اختر الشريك وأدخل مبلغًا أكبر من صفر وحتى تريليون.");
      return;
    }
    if (draft.type === "مقاصة" && amount > Math.abs(before)) {
      setError(
        "مبلغ المقاصة التجريبية لا يتجاوز القيمة المطلقة للرصيد الحالي.",
      );
      return;
    }
    save({ ...draft, amount, before, after });
  }
  const title = {
    new: "تسوية جديدة",
    edit: "تعديل تسوية تجريبي",
    view: "تفاصيل التسوية",
    print: "معاينة طباعة التسوية",
    cancel: "إلغاء تسوية تجريبي",
  }[action];
  return (
    <FinanceModal title={title} close={close}>
      <div className={action === "print" ? "pf-print-receipt" : ""}>
        <p className="tl-disclaimer">
          محاكاة فقط، لا تُخصم أو تُضاف أموال. جميع الأرصدة في هذا السجل لعرض
          السيناريو.
        </p>
        {editable ? (
          <form noValidate onSubmit={submit}>
            <div className="tl-edit-grid">
              <label className="tl-field">
                <span>الشريك/المكتب</span>
                <select
                  aria-label="الشريك/المكتب"
                  value={draft.partnerId}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, partnerId: e.target.value }))
                  }
                >
                  <option value="">اختر الشريك</option>
                  {financePartners.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name} · {p.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="tl-field">
                <span>العملة</span>
                <select
                  aria-label="عملة التسوية"
                  value={draft.currency}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, currency: e.target.value }))
                  }
                >
                  <option>USD</option>
                  <option>IQD</option>
                </select>
              </label>
              <label className="tl-field">
                <span>نوع التسوية</span>
                <select
                  aria-label="نوع التسوية"
                  value={draft.type}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, type: e.target.value }))
                  }
                >
                  {["قبض", "دفع", "مقاصة"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </label>
              <label className="tl-field">
                <span>مبلغ التسوية</span>
                <input
                  aria-label="مبلغ التسوية"
                  type="number"
                  step="any"
                  min="0"
                  max="1000000000000"
                  value={draft.amount}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, amount: e.target.value }))
                  }
                />
              </label>
              <label className="tl-field">
                <span>البيان</span>
                <input
                  aria-label="البيان"
                  maxLength={180}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, description: e.target.value }))
                  }
                />
              </label>
              <label className="tl-field">
                <span>الملاحظات</span>
                <textarea
                  aria-label="الملاحظات"
                  maxLength={1000}
                  rows={3}
                  value={draft.notes}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, notes: e.target.value }))
                  }
                />
              </label>
            </div>
            <div className="finance-summary" aria-live="polite">
              <article>
                <small>الرصيد الحالي</small>
                <b dir="ltr">
                  {draft.partnerId ? `${fmt(before)} ${draft.currency}` : "—"}
                </b>
              </article>
              <article>
                <small>الرصيد بعد التسوية · معاينة</small>
                <b dir="ltr">
                  {draft.partnerId ? `${fmt(after)} ${draft.currency}` : "—"}
                </b>
              </article>
            </div>
            <p className="tl-disclaimer">
              للعرض فقط: القبض يزيد الرصيد، والدفع ينقصه، والمقاصة تقرّبه من
              الصفر. التسوية الجديدة تُحفظ «معلقة» ولا تغيّر رصيد الشريك.
            </p>
            {error && (
              <p className="tl-error" role="alert">
                {error}
              </p>
            )}
            <div className="tl-modal-actions">
              <button className="tl-button primary">
                حفظ التسوية التجريبية
              </button>
              <button className="tl-button" type="button" onClick={close}>
                رجوع
              </button>
            </div>
          </form>
        ) : (
          record && (
            <>
              <FinanceDetails
                items={[
                  ["رقم التسوية", record.id],
                  ["التاريخ", record.date.replace("T", " · ")],
                  ["الشريك/المكتب", partnerName(record.partnerId)],
                  ["العملة", record.currency],
                  ["الرصيد قبل التسوية", fmt(record.before)],
                  ["مبلغ التسوية", fmt(record.amount)],
                  ["نوع التسوية", record.type],
                  ["الرصيد بعد التسوية", fmt(record.after)],
                  ["الحالة", record.status],
                  ["البيان", record.description || "—"],
                  ["الملاحظات", record.notes || "—"],
                ]}
              />
              {action === "cancel" && (
                <>
                  <p>
                    تأكيد تغيير الحالة إلى «ملغاة»؟ تبقى الأرصدة الفعلية دون
                    تعديل.
                  </p>
                  <button className="tl-button primary" onClick={cancel}>
                    تأكيد الإلغاء التجريبي
                  </button>
                </>
              )}
              {action === "print" && (
                <button
                  className="tl-button primary pf-no-print"
                  onClick={() => window.print()}
                >
                  طباعة الإيصال التجريبي
                </button>
              )}
            </>
          )
        )}
      </div>
    </FinanceModal>
  );
}
export default function PartnerSettlements() {
  const [records, setRecords] = useState(() =>
    settlementMock.map((r) => ({ ...r })),
  );
  const [filters, setFilters] = useState({
    query: "",
    currency: "",
    from: "",
    to: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<{
    id?: string;
    action: Action;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const badDates = !!(filters.from && filters.to && filters.from > filters.to);
  const rows = records.filter(
    (r) =>
      !badDates &&
      `${partnerName(r.partnerId)} ${r.partnerId}`
        .toLowerCase()
        .includes(filters.query.trim().toLowerCase()) &&
      (!filters.currency || r.currency === filters.currency) &&
      (!filters.status || r.status === filters.status) &&
      (!filters.from || r.date.slice(0, 10) >= filters.from) &&
      (!filters.to || r.date.slice(0, 10) <= filters.to),
  );
  const pages = Math.max(1, Math.ceil(rows.length / 5));
  const current = Math.min(page, pages);
  const visible = rows.slice((current - 1) * 5, current * 5);
  const record = records.find((r) => r.id === selected?.id);
  function change(key: keyof typeof filters, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  }
  function save(draft: Omit<Settlement, "id" | "date" | "status">) {
    if (record) {
      setRecords((v) =>
        v.map((r) => (r.id === record.id ? { ...r, ...draft } : r)),
      );
    } else {
      setRecords((v) => [
        {
          ...draft,
          id: `SET-${Math.max(...v.map((r) => Number(r.id.slice(4)))) + 1}`,
          date: `${financeDate}T18:00`,
          status: "معلقة",
        },
        ...v,
      ]);
      setPage(1);
    }
    setSelected(null);
    setNotice("تم حفظ التسوية التجريبية في ذاكرة الصفحة فقط.");
  }
  return (
    <div className="finance-page settlements-page">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <span> / الشركاء / التسويات</span>
      </nav>
      <PageHeader
        title="التسويات"
        description="تنظيم سجلات التسويات ومعاينة أثرها بشكل تجريبي."
      >
        <button
          className="tl-button primary"
          onClick={() => setSelected({ action: "new" })}
        >
          تسوية جديدة
        </button>
      </PageHeader>
      <p className="tl-disclaimer">
        اليوم التجريبي: {financeDate}. بيانات محلية مؤقتة؛ تحديث المتصفح أو
        مغادرة الصفحة يفقد التعديلات. الأرصدة بعد التسوية معاينات غير مُرحّلة.
      </p>
      <div className="panel tl-filters">
        <div className="tl-filter-grid">
          <label className="tl-field">
            <span>بحث بالشريك</span>
            <input
              aria-label="بحث بالشريك"
              value={filters.query}
              onChange={(e) => change("query", e.target.value)}
            />
          </label>
          {(
            [
              ["currency", "العملة", ["USD", "IQD"]],
              ["status", "الحالة", ["مكتملة", "معلقة", "ملغاة"]],
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
              setFilters({
                query: "",
                currency: "",
                from: "",
                to: "",
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
          [
            "تسويات اليوم",
            rows.filter((r) => r.date.startsWith(financeDate)).length,
          ],
          ["إجمالي التسويات", rows.length],
          ["تسويات معلقة", rows.filter((r) => r.status === "معلقة").length],
          ["تسويات مكتملة", rows.filter((r) => r.status === "مكتملة").length],
        ].map(([label, value]) => (
          <article className="panel" key={label}>
            <small>{label}</small>
            <b className="tl-stat-number">{value}</b>
          </article>
        ))}
      </div>
      <p className="tl-summary-note">
        الإحصائيات أعداد سجلات حسب الفلاتر، وليست مجموع مبالغ بعملات مختلفة.
      </p>
      <p role="status" className="tl-notice">
        {notice}
      </p>
      <section className="panel finance-results">
        <div className="panel-heading">
          <h2>سجل التسويات</h2>
          <span>{rows.length} تسوية</span>
        </div>
        <FinanceRows
          headers={[
            "رقم التسوية",
            "التاريخ",
            "الشريك/المكتب",
            "العملة",
            "الرصيد قبل التسوية",
            "مبلغ التسوية",
            "نوع التسوية",
            "الرصيد بعد التسوية",
            "الحالة",
            "الإجراءات",
          ]}
          rows={visible.map((r) => ({
            id: r.id,
            cells: [
              r.id,
              r.date.replace("T", " · "),
              partnerName(r.partnerId),
              r.currency,
              fmt(r.before),
              fmt(r.amount),
              r.type,
              fmt(r.after),
              <span
                className={`tl-badge ${r.status === "مكتملة" ? "done" : r.status === "معلقة" ? "pending" : "cancelled"}`}
              >
                {r.status}
              </span>,
              <div className="tl-row-actions">
                {(
                  [
                    ["view", "عرض"],
                    ["edit", "تعديل تجريبي"],
                    ["print", "طباعة"],
                    ["cancel", "إلغاء تجريبي"],
                  ] as const
                ).map(([action, title]) => (
                  <button
                    key={action}
                    disabled={
                      r.status === "ملغاة" &&
                      (action === "edit" || action === "cancel")
                    }
                    onClick={() => setSelected({ id: r.id, action })}
                  >
                    {title}
                  </button>
                ))}
              </div>,
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
        <SettlementModal
          key={`${selected.id}-${selected.action}`}
          record={record}
          action={selected.action}
          close={() => setSelected(null)}
          save={save}
          cancel={() => {
            setRecords((v) =>
              v.map((r) =>
                r.id === record?.id ? { ...r, status: "ملغاة" } : r,
              ),
            );
            setSelected(null);
            setNotice("أُلغيت التسوية تجريبيًا دون تعديل أرصدة الشركاء.");
          }}
        />
      )}
    </div>
  );
}
