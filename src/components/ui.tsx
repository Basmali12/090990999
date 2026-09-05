import {AnimatedNumber,AnimatedCard,StatusPulse} from './premium/MotionUI';
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import type { stats } from "../data/mockData";
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {children}
    </header>
  );
}
export function StatCard({ stat }: { stat: (typeof stats)[number] }) {
  return (
    <AnimatedCard className={`stat-card ${stat.tone}`}>
      <div className="stat-top">
        <span>{stat.title}</span>
        <span className="icon-tile">
          <Icon name={stat.icon} />
        </span>
      </div>
      <div className="stat-value">
        <b dir="ltr"><AnimatedNumber value={stat.value}/></b>
        <small>{stat.unit}</small>
      </div>
      <p>
        <span className="tiny-dot" />
        {stat.note}
      </p>
    </AnimatedCard>
  );
}
export function StatusBadge({ status }: { status: string }) {
 return <StatusPulse tone={['مكتملة','مسلمة','نشط','محفوظة تجريبيًا'].includes(status)?'success':['معلقة','قيد المعالجة'].includes(status)?'warning':status==='ملغاة'?'danger':'info'}>{status}</StatusPulse>;
}
export function EmptyDevelopmentState({ icon }: { icon: string }) {
  return (
    <section className="development panel">
      <div className="development-art">
        <span />
        <Icon name={icon} size={42} />
      </div>
      <span className="eyebrow">قريبًا في نظامك</span>
      <h2>هذه الوحدة قيد التطوير</h2>
      <p>سيتم تفعيل وظائف هذه الشاشة في المرحلة القادمة</p>
      <Link className="button secondary" to="/dashboard">
        العودة إلى الرئيسية <Icon name="arrow" size={17} />
      </Link>
    </section>
  );
}
export function DataTable<T>({
  columns,
  rows,
  rowKey,
}: {
  columns: { title: string; render: (row: T) => ReactNode }[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="جدول العمليات، قابل للتمرير أفقيًا"
    >
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.title}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)}>
              {columns.map((c) => (
                <td key={c.title}>{c.render(r)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function QuickActionCard({
  title,
  path,
  icon,
}: {
  title: string;
  path: string;
  icon: string;
}) {
  return (
    <Link className="quick-action" to={path}>
      <Icon name={icon} size={22} />
      <span>{title}</span>
      <Icon name="arrow" size={15} />
    </Link>
  );
}

