import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/ui";
import { FinanceModal, FinanceDetails } from "../components/FinanceViews";
import { cashboxBalances } from "../data/cashboxMock";
import { useCustomers } from "../data/customerRecords";
import { partnerMock } from "../data/partnerRecords";
import "./financePages.css";
import "./cashbox.css";
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
function localTime() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function empty() {
  return {
    date: localTime(),
    party: "",
    partyType: "عميل",
    currency: "",
    amount: "",
    reason: "",
    reference: "",
    description: "",
    notes: "",
  };
}
type Values = ReturnType<typeof empty>;
type Snapshot = Values & { id: string; before: number; after: number };
export default function CashVoucher({
  payment = false,
}: {
  payment?: boolean;
}) {
  const navigate = useNavigate();
  const customers = useCustomers();
  const title = payment ? "سند صرف" : "سند قبض";
  const [id] = useState(
    () =>
      `DEMO-${payment ? "PAY" : "REC"}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  );
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>(
    {},
  );
  const [saved, setSaved] = useState<Snapshot | null>(null);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const amount = Number.isFinite(Number(values.amount))
    ? Math.min(1e12, Math.max(0, Number(values.amount)))
    : 0;
  const currencyValid = Object.hasOwn(cashboxBalances, values.currency);
  const before = currencyValid ? cashboxBalances[values.currency] : 0;
  const after = before + (payment ? -amount : amount);
  const excess = payment && currencyValid && amount > before;
  const parties =
    values.partyType === "عميل"
      ? customers.map((c) => c.name)
      : values.partyType === "شريك"
        ? partnerMock.map((p) => p.name)
        : [];
  function change(key: keyof Values, value: string) {
    setValues((v) => ({
      ...v,
      [key]: value,
      ...(key === "partyType" ? { party: "" } : {}),
    }));
    setErrors((e) => ({
      ...e,
      [key]: undefined,
      ...(key === "partyType" ? { party: undefined } : {}),
    }));
    setSaved(null);
    setMessage("");
  }
  function validate() {
    const next: Partial<Record<keyof Values, string>> = {};
    if (!values.party.trim()) next.party = "الطرف مطلوب.";
    if (!currencyValid) next.currency = "اختر العملة.";
    if (
      !values.amount ||
      !Number.isFinite(Number(values.amount)) ||
      Number(values.amount) <= 0 ||
      Number(values.amount) > 1e12
    )
      next.amount = "أدخل مبلغًا أكبر من صفر وحتى تريليون.";
    if (!values.date || !Number.isFinite(Date.parse(values.date)))
      next.date = "حدد تاريخًا ووقتًا صالحين.";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      document.getElementById(`voucher-${first}`)?.focus();
      return false;
    }
    return true;
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate()) return;
    setSaved({ ...values, party: values.party.trim(), id, before, after });
    setMessage(
      "تم حفظ السند التجريبي في ذاكرة الصفحة فقط؛ لا يؤثر على رصيد الصندوق أو سجل الحركات.",
    );
    if (
      (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
      "print"
    )
      setPreview(true);
  }
  function field(
    key: keyof Values,
    label: string,
    type = "text",
    required = false,
  ) {
    return (
      <label className="tl-field" htmlFor={`voucher-${key}`}>
        <span>
          {label}
          {required ? " *" : ""}
        </span>
        <input
          id={`voucher-${key}`}
          aria-label={label}
          type={type}
          required={required}
          value={values[key]}
          onInput={
            type === "datetime-local"
              ? (e) => change(key, e.currentTarget.value)
              : undefined
          }
          onChange={(e) => change(key, e.target.value)}
          min={type === "number" ? 0 : undefined}
          max={type === "number" ? 1e12 : undefined}
          step={type === "number" ? "any" : undefined}
          maxLength={type === "text" ? 180 : undefined}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `voucher-error-${key}` : undefined}
        />
        {errors[key] && (
          <small id={`voucher-error-${key}`} className="tl-error">
            {errors[key]}
          </small>
        )}
      </label>
    );
  }
  return (
    <div className="finance-page cash-voucher">
      <nav className="breadcrumb">
        <Link to="/dashboard">الرئيسية</Link>
        <Link to="/cashbox"> / الصندوق</Link>
        <span> / {title}</span>
      </nav>
      <PageHeader
        title={title}
        description={`إعداد ${title} تجريبي ومراجعة الرصيد المتوقع قبل الحفظ.`}
      />
      <p className="tl-disclaimer">
        محاكاة محلية فقط. السند محفوظ مؤقتًا داخل الصفحة ويُفقد عند المغادرة أو
        تحديث المتصفح.
      </p>
      <div className="panel voucher-meta">
        <div>
          <small>رقم السند التجريبي</small>
          <b dir="ltr">{id}</b>
        </div>
        <span className={`tl-badge ${saved ? "done" : "review"}`}>
          {saved ? "محفوظ تجريبيًا" : "مسودة"}
        </span>
      </div>
      <form noValidate onSubmit={submit}>
        <section className="panel voucher-section">
          <h2>بيانات {title}</h2>
          <div className="voucher-grid">
            {field("date", "التاريخ والوقت", "datetime-local", true)}
            <label className="tl-field">
              <span>نوع الطرف</span>
              <select
                aria-label="نوع الطرف"
                value={values.partyType}
                onChange={(e) => change("partyType", e.target.value)}
              >
                {["عميل", "شريك", "أخرى"].map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="tl-field" htmlFor="voucher-party">
              <span>الطرف *</span>
              <input
                id="voucher-party"
                aria-label="الطرف"
                list="voucher-parties"
                value={values.party}
                onChange={(e) => change("party", e.target.value)}
                required
                maxLength={160}
                placeholder="اسم الطرف أو اختيار اسم تجريبي"
                aria-invalid={!!errors.party}
                aria-describedby={
                  errors.party ? "voucher-party-error" : undefined
                }
              />
              <datalist id="voucher-parties">
                {parties.map((p) => (
                  <option value={p} key={p} />
                ))}
              </datalist>
              {errors.party && (
                <small className="tl-error" id="voucher-party-error">
                  {errors.party}
                </small>
              )}
            </label>
            <label className="tl-field" htmlFor="voucher-currency">
              <span>العملة *</span>
              <select
                id="voucher-currency"
                aria-label="العملة"
                value={values.currency}
                onChange={(e) => change("currency", e.target.value)}
                required
                aria-invalid={!!errors.currency}
                aria-describedby={
                  errors.currency ? "voucher-currency-error" : undefined
                }
              >
                <option value="">اختر العملة</option>
                {Object.keys(cashboxBalances).map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {errors.currency && (
                <small className="tl-error" id="voucher-currency-error">
                  {errors.currency}
                </small>
              )}
            </label>
            {field("amount", "المبلغ", "number", true)}
            {field("reason", payment ? "سبب الصرف" : "سبب القبض")}
            {field("reference", "رقم المرجع إن وجد")}
            {field("description", "البيان")}
            <label className="tl-field voucher-notes">
              <span>الملاحظات</span>
              <textarea
                aria-label="الملاحظات"
                rows={3}
                maxLength={1000}
                value={values.notes}
                onChange={(e) => change("notes", e.target.value)}
              />
            </label>
          </div>
        </section>
        <section className="panel voucher-section">
          <h2>معاينة الرصيد</h2>
          <div className="finance-summary" aria-live="polite">
            {[
              ["رصيد الصندوق الحالي", before],
              [payment ? "المبلغ المطلوب صرفه" : "المبلغ المقبوض", amount],
              [
                payment
                  ? "الرصيد المتوقع بعد الصرف"
                  : "الرصيد المتوقع بعد القبض",
                after,
              ],
            ].map(([label, value]) => (
              <article key={label}>
                <small>{label}</small>
                <b dir="ltr">
                  {currencyValid
                    ? `${fmt(Number(value))} ${values.currency}`
                    : "—"}
                </b>
              </article>
            ))}
          </div>
          {excess && (
            <p className="voucher-warning" role="status">
              تنبيه: المبلغ التجريبي أكبر من رصيد الصندوق الحالي. الرصيد المتوقع
              سالب؛ هذا تحذير بصري فقط ولا يمنع الحفظ التجريبي.
            </p>
          )}
          <p className="tl-disclaimer">
            المعاينة = الرصيد الحالي {payment ? "−" : "+"} المبلغ. لن يحدث{" "}
            {payment ? "خصم" : "إيداع"} فعلي عند الحفظ.
          </p>
        </section>
        <p className="tl-notice" role="status">
          {message}
        </p>
        <div className="panel voucher-actions">
          <button type="submit" value="save" className="tl-button primary">
            حفظ تجريبي
          </button>
          <button type="submit" value="print" className="tl-button">
            حفظ وطباعة
          </button>
          <button
            type="button"
            className="tl-button"
            onClick={() => {
              setValues(empty());
              setErrors({});
              setSaved(null);
              setMessage("تم مسح الحقول.");
              document.getElementById("voucher-party")?.focus();
            }}
          >
            مسح
          </button>
          <button
            type="button"
            className="tl-button"
            onClick={() => navigate("/cashbox")}
          >
            إلغاء
          </button>
        </div>
      </form>
      {preview && saved && (
        <FinanceModal
          title={`معاينة طباعة ${title}`}
          close={() => setPreview(false)}
        >
          <div className="voucher-print">
            <h2>{title} · نسخة تجريبية</h2>
            <p className="tl-disclaimer">
              غير صالح للتعامل المالي. لم تُنفذ حركة مالية أو يُعدّل رصيد
              الصندوق.
            </p>
            <FinanceDetails
              items={[
                ["رقم السند", saved.id],
                ["التاريخ والوقت", saved.date.replace("T", " · ")],
                ["الطرف", saved.party],
                ["نوع الطرف", saved.partyType],
                ["العملة", saved.currency],
                ["المبلغ", fmt(Number(saved.amount))],
                [payment ? "سبب الصرف" : "سبب القبض", saved.reason || "—"],
                ["المرجع", saved.reference || "—"],
                ["البيان", saved.description || "—"],
                ["الملاحظات", saved.notes || "—"],
                [
                  "رصيد الصندوق الحالي",
                  `${fmt(saved.before)} ${saved.currency}`,
                ],
                ["الرصيد المتوقع", `${fmt(saved.after)} ${saved.currency}`],
              ]}
            />
            <button
              className="tl-button primary voucher-print-button"
              onClick={() => window.print()}
            >
              طباعة الإيصال التجريبي
            </button>
          </div>
        </FinanceModal>
      )}
    </div>
  );
}
