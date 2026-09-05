import { useEffect, useRef, useState } from "react";
import type { ReactNode, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import { PageHeader, StatusBadge } from "../components/ui";
import { transferMock } from "../data/transferMock";
import "./newTransfer.css";

const blank = {
  sender: "",
  senderPhone: "",
  senderAddress: "",
  recipient: "",
  recipientPhone: "",
  recipientAddress: "",
  amount: "",
  currency: "",
  commission: "0",
  companyRate: "20",
  voucher: "",
  reason: "",
  notes: "",
};
type Values = typeof blank;
type Errors = Partial<Record<keyof Values, string>>;
const number = (value: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(value);
function Section({
  title,
  icon,
  step,
  children,
}: {
  title: string;
  icon: string;
  step: string;
  children: ReactNode;
}) {
  return (
    <section className="panel transfer-section">
      <div className="transfer-section-heading">
        <span className="icon-tile teal">
          <Icon name={icon} />
        </span>
        <h2>{title}</h2>
        <span className="section-step">{step}</span>
      </div>
      {children}
    </section>
  );
}
export default function NewTransfer() {
  const [values, setValues] = useState<Values>({ ...blank });
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [timestamp, setTimestamp] = useState(() => new Date());
  const [preview, setPreview] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (preview) dialog.current?.showModal();
    else dialog.current?.close();
  }, [preview]);
  const amount = Number.isFinite(Number(values.amount))
    ? Math.min(1e12, Math.max(0, Number(values.amount)))
    : 0;
  const currency = transferMock.currencies.find(
    (c) => c.code === values.currency,
  );
  const commission = Number.isFinite(Number(values.commission)) ? Math.max(0, Number(values.commission)) : 0;
  const usd = currency ? (amount + commission) / currency.perDollar : 0;
  const iqd = usd * 1480;
  const toman = usd * 60000;
  const remainingUSD = transferMock.previousUSD - usd;
  const remainingIQD = transferMock.previousIQD - iqd;
  const dateLabel = timestamp.toLocaleString("ar-IQ", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  function change(key: keyof Values, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
    setSaved(false);
    setMessage("");
  }
  function field(
    key: keyof Values,
    label: string,
    options: {
      type?: string;
      required?: boolean;
      placeholder?: string;
      wide?: boolean;
      min?: number;
      max?: number;
    } = {},
  ) {
    return (
      <div className={`transfer-field ${options.wide ? "field-wide" : ""}`}>
        <label htmlFor={`transfer-${key}`}>
          {label}
          {options.required && <span className="required-mark"> *</span>}
        </label>
        <input
          id={`transfer-${key}`}
          name={key}
          value={values[key]}
          onChange={(e) => change(key, e.target.value)}
          type={options.type || "text"}
          inputMode={
            options.type === "number"
              ? "decimal"
              : options.type === "tel"
                ? "tel"
                : undefined
          }
          dir={
            options.type === "number" || options.type === "tel"
              ? "ltr"
              : undefined
          }
          required={options.required}
          min={options.min}
          max={options.max}
          step={options.type === "number" ? "any" : undefined}
          maxLength={options.type === "number" ? undefined : 160}
          placeholder={options.placeholder}
          aria-invalid={!!errors[key]}
          aria-describedby={errors[key] ? `error-${key}` : undefined}
        />
        {errors[key] && (
          <small id={`error-${key}`} className="field-error">
            {errors[key]}
          </small>
        )}
      </div>
    );
  }
  function validate() {
    const next: Errors = {};
    if (!values.sender.trim()) next.sender = "أدخل اسم المرسل";
    if (!values.recipient.trim()) next.recipient = "أدخل اسم المستفيد";
    if (
      !values.amount ||
      !Number.isFinite(Number(values.amount)) ||
      Number(values.amount) <= 0 ||
      Number(values.amount) > 1e12
    )
      next.amount = "أدخل مبلغًا أكبر من صفر وحتى 1,000,000,000,000";
    if (!currency) next.currency = "اختر عملة الحوالة";
    for (const key of ["companyRate"] as const)
      if (
        !values[key] ||
        !Number.isFinite(Number(values[key])) ||
        Number(values[key]) < 0 ||
        Number(values[key]) > 100
      )
        next[key] = "أدخل نسبة بين 0 و100";
    if (!values.commission.trim() || !Number.isFinite(Number(values.commission)) || Number(values.commission)<0 || Number(values.commission)>1e12) next.commission="أدخل عمولة يدوية من صفر إلى تريليون";
    setErrors(next);
    const first = Object.keys(next)[0];
    if (first) {
      setMessage("راجع الحقول المحددة قبل الحفظ.");
      document.getElementById(`transfer-${first}`)?.focus();
      return false;
    }
    return true;
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) return;
    setSaved(true);
    setMessage(
      "تم حفظ النسخة التجريبية في ذاكرة هذه الصفحة فقط. لا يتم إرسال حوالة فعلية، وتُفقد البيانات عند المغادرة أو التحديث.",
    );
    if (
      (event.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
      "print"
    )
      setPreview(true);
  }
  function clear() {
    setValues({ ...blank, commission: "0", companyRate: "20" });
    setErrors({});
    setSaved(false);
    setMessage("تم مسح الحقول.");
    setTimestamp(new Date());
    document.getElementById("transfer-sender")?.focus();
  }
  return (
    <div className="new-transfer">
      <nav className="breadcrumb" aria-label="مسار الصفحة">
        <Link to="/dashboard">الرئيسية</Link>
        <Icon name="chevron" size={12} />
        <span>الحوالات</span>
        <Icon name="chevron" size={12} />
        <b>إرسال حوالة جديدة</b>
      </nav>
      <PageHeader
        title="إرسال حوالة جديدة"
        description="أدخل بيانات الحوالة وراجع الملخص قبل حفظ النسخة التجريبية."
      >
        <span className="page-icon">
          <Icon name="transfer" size={25} />
        </span>
      </PageHeader>
      <div className="transfer-meta panel">
        <div>
          <small>رقم الحوالة التجريبي</small>
          <b dir="ltr">{transferMock.id}</b>
        </div>
        <div>
          <small>التاريخ والوقت</small>
          <b>{dateLabel}</b>
        </div>
        <div>
          <small>حالة الحوالة</small>
          <StatusBadge status={saved ? "محفوظة تجريبيًا" : "مسودة"} />
        </div>
        <span className="transfer-demo">
          <Icon name="shield" size={16} />
          محاكاة محلية فقط
        </span>
      </div>
      <form noValidate onSubmit={save} className="transfer-form">
        <div className="transfer-parties">
          <Section title="بيانات المرسل" icon="user" step="01">
            <div className="transfer-fields party-fields">
              {field("sender", "اسم المرسل", {
                required: true,
                placeholder: "الاسم الكامل",
                wide: true,
              })}
              {field("senderPhone", "رقم هاتف المرسل", {
                type: "tel",
                placeholder: "07xx xxx xxxx",
              })}
              {field("senderAddress", "العنوان", {
                placeholder: "المدينة، المنطقة",
              })}
            </div>
          </Section>
          <Section title="بيانات المستفيد" icon="users" step="02">
            <div className="transfer-fields party-fields">
              {field("recipient", "اسم المستفيد", {
                required: true,
                placeholder: "الاسم الكامل",
                wide: true,
              })}
              {field("recipientPhone", "رقم هاتف المستفيد", {
                type: "tel",
                placeholder: "07xx xxx xxxx",
              })}
              {field("recipientAddress", "عنوان المستفيد", {
                placeholder: "المدينة، المنطقة",
              })}
            </div>
          </Section>
        </div>
        <Section title="بيانات الحوالة" icon="transfer" step="03">
          <div className="transfer-fields">
            {field("amount", "مبلغ الحوالة", {
              type: "number",
              required: true,
              min: 0,
              max: 1e12,
              placeholder: "0.00",
            })}
            <div className="transfer-field">
              <label htmlFor="transfer-currency">
                العملة <span className="required-mark">*</span>
              </label>
              <select
                id="transfer-currency"
                required
                value={values.currency}
                onChange={(e) => change("currency", e.target.value)}
                aria-invalid={!!errors.currency}
                aria-describedby={
                  errors.currency ? "error-currency" : undefined
                }
              >
                <option value="">اختر العملة</option>
                {transferMock.currencies.map((c) => (
                  <option value={c.code} key={c.code}>
                    {c.label} · {c.code}
                  </option>
                ))}
              </select>
              {errors.currency && (
                <small id="error-currency" className="field-error">
                  {errors.currency}
                </small>
              )}
            </div>
            {field("commission", "العمولة", {type:"number",min:0,max:1e12})}
            {field("companyRate", "نسبة الشركة (%)", {
              type: "number",
              min: 0,
              max: 100,
            })}

          </div>
          <details className="transfer-optional"><summary>عرض المبالغ التوضيحية</summary><div className="transfer-totals" aria-live="polite">
            {[
              ["المبلغ المطلوب بالدولار", usd, "USD"],
              ["المبلغ المطلوب بالدينار", iqd, "IQD"],
              ["المبلغ المطلوب بالتومان", toman, "IRT"],
            ].map(([label, value, code]) => (
              <div className="transfer-total" key={label}>
                <small>{label}</small>
                <div>
                  <b dir="ltr">{number(Number(value))}</b>
                  <span>{code}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="transfer-explanation">
            حساب تجريبي: المبلغ + العمولة، ثم تحويل توضيحي على أساس 1 دولار =
            1,480 دينار = 60,000 تومان. القيم الثلاث بدائل لنفس المبلغ وليست
            مبالغ تُجمع.
          </p>
        </details></Section><details className="transfer-optional"><summary>عرض الأرصدة التجريبية</summary><Section title="الرصيد" icon="wallet" step="04">
          <div className="transfer-balances">
            {[
              ["رصيد سابق بالدولار", transferMock.previousUSD, "USD"],
              ["الرصيد المتبقي بالدولار", remainingUSD, "USD"],
              ["رصيد سابق بالدينار", transferMock.previousIQD, "IQD"],
              ["المتبقي بالدينار", remainingIQD, "IQD"],
            ].map(([label, value, code], index) => (
              <div
                className={`balance-cell ${index % 2 ? "balance-remaining" : ""} ${Number(value) < 0 ? "negative-balance" : ""}`}
                key={label}
              >
                <small>{label}</small>
                <div>
                  <b dir="ltr">{number(Number(value))}</b>
                  <span>{code}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="transfer-explanation">
            أرصدة ثابتة للمحاكاة؛ كل رصيد متبقٍ يعرض سيناريو الخصم بهذه العملة
            بصورة مستقلة. الحفظ لا يغيّر أي رصيد.
          </p>
        </Section>
        </details><Section title="تفاصيل إضافية" icon="layers" step="05">
          <div className="transfer-fields additional-fields">
            {field("voucher", "رقم الصك أو القسيمة", {
              placeholder: "اختياري",
            })}
            {field("reason", "سبب الحوالة", {
              placeholder: "مثال: مصاريف عائلية",
            })}
            <div className="transfer-field field-wide">
              <label htmlFor="transfer-notes">الملاحظات</label>
              <textarea
                id="transfer-notes"
                value={values.notes}
                onChange={(e) => change("notes", e.target.value)}
                placeholder="أضف أي تفاصيل إضافية للحوالة..."
                rows={3}
                maxLength={1000}
              />
            </div>
          </div>
        </Section>
        <div
          className={`transfer-feedback ${saved ? "saved" : ""}`}
          role="status"
        >
          {message ||
            "الحقول المعلّمة بـ * مطلوبة. الحفظ مؤقت داخل هذه الصفحة فقط."}
        </div>
        <div className="transfer-actions panel">
          <div className="transfer-primary-actions">
            <button
              className="transfer-button primary"
              type="submit"
              value="save"
            >
              حفظ <Icon name="shield" size={17} />
            </button>
            <button className="transfer-button" type="submit" value="print">
              حفظ وطباعة <Icon name="layers" size={17} />
            </button>
          </div>
          <div className="transfer-secondary-actions">
            <button
              className="transfer-button subtle"
              type="button"
              onClick={clear}
            >
              مسح الحقول
            </button>
            <button
              className="transfer-button subtle"
              type="button"
              onClick={() => navigate("/dashboard")}
            >
              إلغاء
            </button>
          </div>
        </div>
      </form>
      <dialog
        ref={dialog}
        className="transfer-print"
        aria-labelledby="receipt-title"
        onCancel={() => setPreview(false)}
        onClose={() => setPreview(false)}
      >
        <div className="receipt-heading">
          <Icon name="exchange" size={28} />
          <div>
            <h2 id="receipt-title">معاينة إيصال الحوالة</h2>
            <p>
              أعمال المستقبل · نسخة تجريبية غير صالحة للتعامل المالي
            </p>
          </div>
        </div>
        <dl>
          {[
            ["رقم الحوالة", transferMock.id],
            ["التاريخ والوقت", dateLabel],
            ["المرسل", values.sender],
            ["هاتف المرسل", values.senderPhone],
            ["عنوان المرسل", values.senderAddress],
            ["المستفيد", values.recipient],
            ["هاتف المستفيد", values.recipientPhone],
            ["عنوان المستفيد", values.recipientAddress],
            ["المبلغ", `${number(amount)} ${values.currency}`],

            ["العمولة", `${number(commission)} ${values.currency}`],
            ["نسبة الشركة", `${values.companyRate}%`],
            [
              "الإجمالي بعملة الحوالة",
              `${number(amount + commission)} ${values.currency}`,
            ],
            ["المطلوب بالدولار", `${number(usd)} USD`],
            ["المطلوب بالدينار", `${number(iqd)} IQD`],
            ["المطلوب بالتومان", `${number(toman)} IRT`],
            ["الصك أو القسيمة", values.voucher],
            ["السبب", values.reason],
            ["الملاحظات", values.notes],
          ].map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value || "—"}</dd>
            </div>
          ))}
        </dl>
        <p className="transfer-explanation">
          إيصال محاكاة فقط. لم يتم إرسال حوالة أو خصم رصيد.
        </p>
        <div className="receipt-actions">
          <button
            type="button"
            className="transfer-button primary"
            onClick={() => window.print()}
          >
            طباعة الإيصال
          </button>
          <button
            type="button"
            className="transfer-button"
            onClick={() => setPreview(false)}
          >
            إغلاق المعاينة
          </button>
        </div>
      </dialog>
    </div>
  );
}


