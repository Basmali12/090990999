import { Link } from "react-router-dom";
import {
  operations,
  pending,
  rates,
  stats,
  quickActions,
} from "../data/mockData";
import {
  DataTable,
  PageHeader,
  QuickActionCard,
  StatCard,
  StatusBadge,
} from "../components/ui";
import Icon from "../components/Icon";
export default function Dashboard() {
  return (
    <>
      <PageHeader
        title="نظرة شاملة على أعمالك"
        description="أهلًا أحمد، إليك ملخص حركة المكتب لهذا اليوم."
      >
        <div className="date-chip">
          <Icon name="clock" size={17} />
          السبت، 5 سبتمبر 2026<span>يوم تجريبي</span>
        </div>
      </PageHeader>
      <div className="demo-notice">
        <span>
          <i />
          مساحة عملك، في مكان واحد
        </span>
        <small>جميع الأرصدة والعمليات المعروضة بيانات تجريبية</small>
      </div>
      <section className="stats-grid" aria-label="ملخص المكتب">
        {stats.map((stat) => (
          <StatCard key={stat.title} stat={stat} />
        ))}
      </section>
      <section className="quick-section">
        <div className="section-heading">
          <h2>إجراءات سريعة</h2>
          <span>ابدأ عملية جديدة</span>
        </div>
        <div className="quick-grid">
          {quickActions.map((a) => (
            <QuickActionCard key={a.path} {...a} />
          ))}
        </div>
      </section>
      <div className="dashboard-columns">
        <section className="panel operations-panel">
          <div className="panel-heading">
            <div>
              <h2>آخر العمليات</h2>
              <p>أحدث الحركات في المكتب</p>
            </div>
            <Link to="/reports">
              عرض جميع العمليات <Icon name="arrow" size={15} />
            </Link>
          </div>
          <DataTable
            rows={operations}
            rowKey={(r) => r.id}
            columns={[
              {
                title: "رقم العملية",
                render: (r) => (
                  <span className="operation-id" dir="ltr">
                    {r.id}
                  </span>
                ),
              },
              { title: "النوع", render: (r) => r.type },
              {
                title: "العميل",
                render: (r) => <b className="customer-name">{r.customer}</b>,
              },
              {
                title: "المبلغ",
                render: (r) => (
                  <b className="number" dir="ltr">
                    {r.amount}
                  </b>
                ),
              },
              {
                title: "العملة",
                render: (r) => <span className="currency">{r.currency}</span>,
              },
              {
                title: "الحالة",
                render: (r) => <StatusBadge status={r.status} />,
              },
              {
                title: "الوقت",
                render: (r) => <span className="time">{r.time}</span>,
              },
            ]}
          />
          <div className="table-footer">
            <span>عرض آخر 5 عمليات تجريبية</span>
            <span className="tiny-dot" />
            تحديث محلي
          </div>
        </section>
        <section className="panel rates-panel">
          <div className="panel-heading">
            <div>
              <h2>أسعار الصرف اليوم</h2>
              <p>أسعار توضيحية · غير مباشرة</p>
            </div>
            <span className="icon-tile teal">
              <Icon name="exchange" />
            </span>
          </div>
          {rates.map((r) => (
            <article className="rate" key={r.pair}>
              <div className="rate-title">
                <span className="currency-symbol">{r.symbol}</span>
                <div>
                  <b dir="ltr">{r.pair}</b>
                  <small>{r.name}</small>
                </div>
                <span className="sample-label">تجريبي</span>
              </div>
              <div className="rate-prices">
                <div>
                  <small>شراء</small>
                  <b>
                    {r.buy}
                    <em>IQD</em>
                  </b>
                </div>
                <div>
                  <small>بيع</small>
                  <b>
                    {r.sell}
                    <em>IQD</em>
                  </b>
                </div>
              </div>
            </article>
          ))}
          <Link className="rates-link" to="/exchange/rates">
            جميع أسعار العملات <Icon name="arrow" size={15} />
          </Link>
        </section>
      </div>
      <section className="panel pending-panel">
        <div className="panel-heading">
          <div className="pending-title">
            <span className="icon-tile amber">
              <Icon name="clock" />
            </span>
            <div>
              <h2>
                الحوالات المعلقة <span className="count-badge">7</span>
              </h2>
              <p>حوالات تحتاج إلى المتابعة</p>
            </div>
          </div>
          <Link to="/transfers/undelivered">
            عرض الكل <Icon name="arrow" size={15} />
          </Link>
        </div>
        <div className="pending-grid">
          {pending.map((p) => (
            <Link
              to="/transfers/undelivered"
              className="pending-item"
              key={p.id}
            >
              <div>
                <b>{p.name}</b>
                <small>
                  <span dir="ltr">{p.id}</span> · {p.city}
                </small>
              </div>
              <div className="pending-amount">
                <b dir="ltr">{p.amount}</b>
                <small>{p.currency}</small>
              </div>
              <Icon name="chevron" size={15} />
            </Link>
          ))}
        </div>
      </section>
      <footer className="content-footer">
        <span>نظام الصيرفة والحوالات</span>
        <span>واجهة تجريبية · لا تُنفّذ عمليات مالية فعلية</span>
      </footer>
    </>
  );
}
