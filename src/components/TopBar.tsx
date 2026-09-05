import {PremiumButton,AnimatedInput} from './premium/MotionUI';
import Icon from "./Icon";
export default function TopBar({
  theme,
  toggleTheme,
  toggleSidebar,
  collapsed,
  mobile,
  drawerOpen,
}: {
  theme: string;
  toggleTheme: () => void;
  toggleSidebar: () => void;
  collapsed: boolean;
  mobile: boolean;
  drawerOpen: boolean;
}) {
  return (
    <header className="topbar">
      <div className="topbar-start">
        <PremiumButton
          className="icon-button"
          aria-label={
            mobile
              ? "فتح القائمة"
              : collapsed
                ? "تكبير القائمة الجانبية"
                : "تصغير القائمة الجانبية"
          }
          aria-expanded={mobile ? drawerOpen : !collapsed}
          aria-controls="main-sidebar"
          onClick={toggleSidebar}
        >
          <Icon name="menu" />
        </PremiumButton>
        <div className="search-field">
          <Icon name="search" size={18} />
          <AnimatedInput
            aria-label="البحث العام التجريبي"
            placeholder="ابحث في النظام..."
          />
          <span>تجريبي</span>
        </div>
      </div>
      <div className="topbar-end">
        <span className="local-tag">
          <i />
          بيئة تجريبية
        </span>
        <PremiumButton
          className="icon-button"
          aria-label={
            theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الليلي"
          }
          onClick={toggleTheme}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} />
        </PremiumButton>
        <div className="user-info">
          <span className="avatar">أ م</span>
          <div>
            <b>أحمد محمد</b>
            <small>مدير المكتب · مستخدم تجريبي</small>
          </div>
        </div>
      </div>
    </header>
  );
}

