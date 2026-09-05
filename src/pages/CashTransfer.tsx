import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  registers,
  registerCurrencies,
  boxName,
} from "../data/cashRegistersMock";
import { FinanceModal, FinanceDetails } from "../components/FinanceViews";
import { PageHeader } from "../components/ui";
import "./financePages.css";
import "./cashbox.css";
const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(n);
const initial = {
  date: "2026-09-05T18:00",
  source: "",
  target: "",
  currency: "",
  receivedCurrency: "",
  amount: "",
  rate: "",
  reason: "",
  description: "",
  notes: "",
};
type Values = typeof initial;
type Snapshot = Values & {
  sourceBefore: number;
  targetBefore: number;
  received: number;
  sourceAfter: number;
  targetAfter: number;
};
export default function CashTransfer() {
  const navigate = useNavigate();
  const [id] = useState(
    () => `DEMO-TR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
  );
  const [values, setValues] = useState({ ...initial });
  const [error, setError] = useState("");
  const [saved, setSaved] = useState<Snapshot | null>(null);
  const [preview, setPreview] = useState(false);
  const source = registers.find((b) => b.id === values.source);
  const target = registers.find((b) => b.id === values.target);
  const different =
    !!values.currency &&
    !!values.receivedCurrency &&
    values.currency !== values.receivedCurrency;
  const amount = Number.isFinite(Number(values.amount))
    ? Math.min(1e12, Math.max(0, Number(values.amount)))
    : 0;
  const rate = different
    ? Number.isFinite(Number(values.rate))
      ? Math.min(1e6, Math.max(0, Number(values.rate)))
      : 0
    : 1;
  const received = amount * rate;
  const sourceBefore = source?.balances[values.currency] || 0;
  const targetBefore = target?.balances[values.receivedCurrency] || 0;
  const sourceAfter = sourceBefore - amount;
  const targetAfter = targetBefore + received;
  function change(key: keyof Values, value: string) {
    setValues((v) => ({
      ...v,
      [key]: value,
      ...(key === "currency" ? { receivedCurrency: value, rate: "" } : {}),
      ...(key === "receivedCurrency" ? { rate: "" } : {}),
    }));
    setError("");
    setSaved(null);
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!source || !target) {
      setError("اختر الصندوق المصدر والصندوق المستلم.");
      return;
    }
    if (source.id === target.id) {
      setError("لا يمكن اختيار الصندوق نفسه مصدرًا ومستلمًا.");
      return;
    }
    if (
      !registerCurrencies.includes(values.currency) ||
      !registerCurrencies.includes(values.receivedCurrency)
    ) {
      setError("اختر عملة التحويل وعملة الاستلام.");
      return;
    }
    if (
      !Number.isFinite(Number(values.amount)) ||
      Number(values.amount) <= 0 ||
      Number(values.amount) > 1e12
    ) {
      setError("أدخل مبلغًا أكبر من صفر وحتى تريليون.");
      return;
    }
    if (
      different &&
      (!Number.isFinite(Number(values.rate)) ||
        Number(values.rate) <= 0 ||
        Number(values.rate) > 1e6)
    ) {
      setError("أدخل سعر تحويل موجبًا وحتى مليون.");
      return;
    }
    if (!values.date || !Number.isFinite(Date.parse(values.date))) {
      setError("حدد تاريخًا ووقتًا صالحين.");
      return;
    }
    setSaved({
      ...values,
      sourceBefore,
      targetBefore,
      received,
      sourceAfter,
      targetAfter,
    });
    setError("");
    if (
      (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") ===
      "print"
    )
      setPreview(true);
  }
  function field(key: keyof Values, label: string, type = "text") {
    return (
      <label className="tl-field">
        <span>{label}</span>
        <input
          aria-label={label}
          type={type}
          value={values[key]}
          onInput={
            type === "datetime-local"
              ? (e) => change(key, e.currentTarget.value)
              : undefined
          }
          onChange={(e) => change(key, e.target.value)}
          maxLength={type === "text" ? 180 : undefined}
          step={type === "number" ? "any" : undefined}
        />
      </label>
    );
  }
  return (
    <div className="finance-page cash-voucher">
      <nav className="breadcrumb">
        <Link to="/cashbox">الصندوق</Link>
        <span> / تحويل بين الصناديق</span>
      </nav>
      <PageHeader
        title="تحويل بين الصناديق"
        description="معاينة تحويل تجريبي بين صندوقين، بعملة واحدة أو عملتين."
      />
      <p className="tl-disclaimer">
        بيانات محلية فقط؛ الحفظ مؤقت داخل الصفحة ولا يغيّر الأرصدة أو يُنشئ حركة
        مالية.
      </p>
      <div className="panel voucher-meta">
        <div>
          <small>رقم الحركة التجريبي</small>
          <b dir="ltr">{id}</b>
        </div>
        <span className={`tl-badge ${saved ? "done" : "review"}`}>
          {saved ? "محفوظ تجريبيًا" : "مسودة"}
        </span>
      </div>
      <form noValidate onSubmit={submit}>
        <section className="panel voucher-section">
          <h2>بيانات التحويل</h2>
          <div className="voucher-grid">
            {field("date", "التاريخ والوقت", "datetime-local")}
            {(
              [
                ["source", "الصندوق المصدر"],
                ["target", "الصندوق المستلم"],
              ] as const
            ).map(([key, label]) => (
              <label className="tl-field" key={key}>
                <span>{label}</span>
                <select
                  aria-label={label}
                  value={values[key]}
                  onChange={(e) => change(key, e.target.value)}
                >
                  <option value="">اختر الصندوق</option>
                  {registers.map((b) => (
                    <option value={b.id} key={b.id}>
                      {b.name} · {b.branch}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            {(
              [
                ["currency", "العملة"],
                ["receivedCurrency", "عملة الاستلام"],
              ] as const
            ).map(([key, label]) => (
              <label className="tl-field" key={key}>
                <span>{label}</span>
                <select
                  aria-label={label}
                  value={values[key]}
                  onChange={(e) => change(key, e.target.value)}
                >
                  <option value="">اختر العملة</option>
                  {registerCurrencies.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
            ))}
            {field("amount", "المبلغ", "number")}
            {different && field("rate", "سعر التحويل", "number")}
            <div className="tl-field">
              <span>المبلغ المستلم</span>
              <output className="tl-button" aria-live="polite">
                {values.receivedCurrency
                  ? `${fmt(received)} ${values.receivedCurrency}`
                  : "—"}
              </output>
            </div>
            {field("reason", "سبب التحويل")}
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
          {different && (
            <p className="tl-disclaimer">
              سعر التحويل = عدد وحدات {values.receivedCurrency} لكل وحدة{" "}
              {values.currency}. المبلغ المستلم = المبلغ × السعر؛ السعر يدوي
              وتجريبي.
            </p>
          )}
        </section>
        <section className="panel voucher-section">
          <h2>معاينة الأرصدة</h2>
          <div className="finance-summary" aria-live="polite">
            {[
              [
                "رصيد المصدر قبل التحويل",
                sourceBefore,
                values.currency,
                !!source,
              ],
              [
                "رصيد المستلم قبل التحويل",
                targetBefore,
                values.receivedCurrency,
                !!target,
              ],
              ["الرصيد المتوقع للمصدر", sourceAfter, values.currency, !!source],
              [
                "الرصيد المتوقع للمستلم",
                targetAfter,
                values.receivedCurrency,
                !!target,
              ],
            ].map(([label, value, currency, valid]) => (
              <article key={String(label)}>
                <small>{label}</small>
                <b dir="ltr">
                  {valid && currency
                    ? `${fmt(Number(value))} ${currency}`
                    : "—"}
                </b>
              </article>
            ))}
          </div>
          {source && values.currency && amount > sourceBefore && (
            <p className="voucher-warning" role="status">
              تنبيه: المبلغ أكبر من رصيد المصدر. هذا تحذير بصري فقط ولا يمنع
              الحفظ التجريبي.
            </p>
          )}
        </section>
        {error && (
          <p className="tl-error" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="tl-notice" role="status">
            تم حفظ المعاينة محليًا فقط، دون تعديل الصندوقين.
          </p>
        )}
        <div className="panel voucher-actions">
          <button className="tl-button primary" type="submit" value="save">
            حفظ تجريبي
          </button>
          <button className="tl-button" type="submit" value="print">
            حفظ وطباعة
          </button>
          <button
            className="tl-button"
            type="button"
            onClick={() => {
              setValues({ ...initial });
              setError("");
              setSaved(null);
            }}
          >
            مسح
          </button>
          <button
            className="tl-button"
            type="button"
            onClick={() => navigate("/cashbox")}
          >
            إلغاء
          </button>
        </div>
      </form>
      {preview && saved && (
        <FinanceModal
          title="معاينة تحويل بين الصناديق"
          close={() => setPreview(false)}
        >
          <div className="voucher-print">
            <h2>إيصال تحويل تجريبي</h2>
            <p className="tl-disclaimer">
              غير صالح للتعامل المالي؛ لم تُنفّذ عملية تحويل.
            </p>
            <FinanceDetails
              items={[
                ["رقم الحركة", id],
                ["التاريخ والوقت", saved.date],
                ["المصدر", boxName(saved.source)],
                ["المستلم", boxName(saved.target)],
                ["المبلغ", `${fmt(Number(saved.amount))} ${saved.currency}`],
                [
                  "سعر التحويل",
                  saved.currency === saved.receivedCurrency ? "1" : saved.rate,
                ],
                [
                  "المبلغ المستلم",
                  `${fmt(saved.received)} ${saved.receivedCurrency}`,
                ],
                [
                  "رصيد المصدر قبل",
                  `${fmt(saved.sourceBefore)} ${saved.currency}`,
                ],
                [
                  "رصيد المصدر المتوقع",
                  `${fmt(saved.sourceAfter)} ${saved.currency}`,
                ],
                [
                  "رصيد المستلم قبل",
                  `${fmt(saved.targetBefore)} ${saved.receivedCurrency}`,
                ],
                [
                  "رصيد المستلم المتوقع",
                  `${fmt(saved.targetAfter)} ${saved.receivedCurrency}`,
                ],
                ["السبب", saved.reason || "—"],
                ["البيان", saved.description || "—"],
                ["الملاحظات", saved.notes || "—"],
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
