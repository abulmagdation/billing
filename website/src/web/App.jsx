import { useEffect, useState } from "react";
import {
  Users,
  Files,
  ClipboardList,
  Plus,
  Search,
  ArrowUpLeft,
  ArrowUpRight,
  LogOut,
  Languages,
  HeartPulse,
  ArrowRight,
  ArrowLeft,
  X,
  Printer,
  Trash2,
  Pencil,
  Copy,
  RefreshCw,
  ShieldCheck,
  CalendarDays,
  ChevronDown,
  Check,
  LoaderCircle,
} from "lucide-react";
import { translations } from "../i18n/translations";
import { api } from "./api";
import { printInvoice, printReport } from "./print";
import { invoiceSections } from "./invoice-sections";

const words = {
  ar: {
    patients: "المرضى",
    invoices: "الفواتير",
    reports: "التقارير الطبية",
    workspace: "مساحة العمل",
    welcome: "كل التفاصيل، في مكان واحد.",
    intro: "إدارة ملفات المرضى والفواتير والتقارير بسهولة ووضوح.",
    newPatient: "إضافة مريض",
    editPatient: "تعديل بيانات المريض",
    section: "القسم",
    sectionTitle: "عنوان القسم",
    addSection: "إضافة قسم",
    generalSection: "الخدمات",
    sectionError: "اكتب عنوانًا لكل قسم وأضف بندًا واحدًا على الأقل لكل قسم.",
    search: "ابحث بالاسم أو رقم الفاتورة…",
    empty: "لا توجد سجلات لعرضها",
    emptySub: "ابدأ بإضافة ملف جديد، أو جرّب تغيير البحث.",
    error: "تعذر تحميل البيانات من السيرفر. تأكد من تشغيله ثم حاول مجددًا.",
    retry: "إعادة المحاولة",
    all: "جميع الملفات",
    patient: "مريض",
    entity: "جهة / مؤسسة",
    open: "فتح الملف",
    save: "حفظ",
    cancel: "إلغاء",
    name: "الاسم بالكامل",
    newInvoice: "فاتورة جديدة",
    newReport: "تقرير جديد",
    paid: "مسددة",
    due: "مبلغ مستحق",
    total: "الإجمالي",
    balance: "المتبقي",
    received: "المسدد",
    services: "بنود",
    print: "تصدير PDF",
    edit: "تعديل",
    duplicate: "نسخة جديدة",
    remove: "حذف",
    confirm: "هل تريد حذف هذا التقرير نهائيًا؟",
    more: "عرض المزيد",
    back: "رجوع",
    login: "تسجيل الدخول",
    loginIntro: "أهلًا بعودتك إلى رتال كير",
    loginSub: "ملفات منظّمة. فواتير واضحة. وقت أكبر للرعاية.",
    username: "اسم المستخدم",
    password: "كلمة المرور",
    loginError: "تعذر تسجيل الدخول. راجع البيانات واتصال السيرفر.",
    logout: "تسجيل الخروج",
    logoutConfirm: "هل تريد تسجيل الخروج؟",
    saved: "تم الحفظ بنجاح",
    saving: "جارٍ الحفظ…",
    service: "اسم الخدمة / البند",
    quantity: "الكمية",
    price: "سعر الوحدة",
    date: "التاريخ",
    addService: "إضافة البند",
    notes: "الملاحظات والضمان",
    content: "محتوى التقرير",
    invoiceIntro: "أضف الخدمات وراجع المبالغ قبل الحفظ.",
    reportIntro: "دوّن تفاصيل الحالة والتوصيات.",
    formError: "أدخل اسمًا وكمية صحيحة وسعرًا أكبر من صفر.",
    paidError: "المبلغ المسدد يجب أن يكون بين صفر وإجمالي الفاتورة.",
    copyInfo: "سيتم حفظ فاتورة جديدة مع الاحتفاظ بالفاتورة الأصلية.",
    secure: "مساحة منظّمة لرعاية أفضل",
    loaded: "السجلات المعروضة",
    filter: "تصفية الملفات",
    printHint: "من نافذة الطباعة اختر «حفظ بتنسيق PDF».",
    close: "إغلاق",
    pending: "جارٍ التحميل",
    individual: "مرضى أفراد",
    organizations: "الجهات والمؤسسات",
  },
  en: {
    patients: "Patients",
    invoices: "Invoices",
    reports: "Medical reports",
    workspace: "WORKSPACE",
    welcome: "Every detail. One place.",
    intro: "Patient records, invoices and reports, beautifully organized.",
    newPatient: "Add patient",
    editPatient: "Edit patient details",
    section: "Section",
    sectionTitle: "Section title",
    addSection: "Add section",
    generalSection: "Services",
    sectionError: "Every section needs a title and at least one item.",
    search: "Search by name or invoice number…",
    empty: "No records to display",
    emptySub: "Create a new record or try a different search.",
    error:
      "Unable to load data. Check that your server is running and try again.",
    retry: "Try again",
    all: "All records",
    patient: "Patient",
    entity: "Organization",
    open: "Open profile",
    save: "Save",
    cancel: "Cancel",
    name: "Full name",
    newInvoice: "New invoice",
    newReport: "New report",
    paid: "Paid",
    due: "Payment due",
    total: "Total",
    balance: "Balance",
    received: "Paid",
    services: "Items",
    print: "Export PDF",
    edit: "Edit",
    duplicate: "New copy",
    remove: "Delete",
    confirm: "Permanently delete this report?",
    more: "Load more",
    back: "Back",
    login: "Sign in",
    loginIntro: "Welcome back to RetalCare",
    loginSub: "Organized records. Clear invoices. More time for care.",
    username: "Username",
    password: "Password",
    loginError:
      "Unable to sign in. Check your credentials and server connection.",
    logout: "Sign out",
    logoutConfirm: "Sign out of your workspace?",
    saved: "Saved successfully",
    saving: "Saving…",
    service: "Service / item name",
    quantity: "Quantity",
    price: "Unit price",
    date: "Date",
    addService: "Add item",
    notes: "Notes & warranty",
    content: "Report content",
    invoiceIntro: "Add services and review the amounts before saving.",
    reportIntro: "Document the case details and recommendations.",
    formError: "Enter a name, a whole quantity and a price greater than zero.",
    paidError: "Payment must be between zero and the invoice total.",
    copyInfo:
      "A new invoice will be saved. The original invoice stays unchanged.",
    secure: "A thoughtful space for better care",
    loaded: "Records shown",
    filter: "Filter records",
    printHint: "Choose “Save as PDF” in the print dialog.",
    close: "Close",
    pending: "Loading",
    individual: "Individual patients",
    organizations: "Organizations",
  },
};
const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};
const initials = (name) =>
  (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join("");
const tone = (name) =>
  [...(name || "")].reduce((n, c) => n + c.charCodeAt(0), 0) % 4;
function Button({ children, icon: Icon, className = "", ...props }) {
  return (
    <button className={"button " + className} {...props}>
      {Icon && <Icon size={17} />} {children}
    </button>
  );
}
function Field({ label, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input {...props} />}
    </label>
  );
}

export default function App() {
  const [lang, setLang] = useState(() =>
    localStorage.getItem("app_language") === "en" ? "en" : "ar",
  );
  const w = words[lang],
    t = translations[lang],
    rtl = lang === "ar";
  const [session, setSession] = useState(null),
    [checking, setChecking] = useState(true);
  const [tab, setTab] = useState("patients"),
    [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]),
    [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1),
    [more, setMore] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  const [modal, setModal] = useState(null),
    [toast, setToast] = useState("");
  useEffect(() => {
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    localStorage.setItem("app_language", lang);
  }, [lang, rtl]);
  useEffect(() => {
    const token = sessionStorage.getItem("userToken"),
      userId = sessionStorage.getItem("userId");
    if (!token || !userId) {
      setChecking(false);
      return;
    }
    api("/auth/verify-token", { method: "POST", body: { token, userId } })
      .then((r) => {
        if (r.valid) setSession({ userId, username: r.username });
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);
  useEffect(() => {
    const id = setTimeout(() => {
      setQuery(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [search]);
  useEffect(() => {
    if (!session) return;
    const controller = new AbortController();
    setBusy(true);
    setError("");
    const path = patient
      ? `/invoices/${patient._id}`
      : `/${tab}?page=${page}&limit=12&search=${encodeURIComponent(query)}`;
    api(path, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) return;
        if (!Array.isArray(data)) throw new Error("Invalid response");
        setRecords((old) => (page === 1 ? data : [...old, ...data]));
        setMore(!patient && data.length === 12);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("load");
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
    return () => controller.abort();
  }, [session, tab, patient, page, query, revision]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const navigate = (value) => {
    setTab(value);
    setPatient(null);
    setSearch("");
    setQuery("");
    setRecords([]);
    setPage(1);
    setFilter("all");
  };
  const reload = () => {
    setPage(1);
    setRevision((n) => n + 1);
  };
  const money = (value) =>
    new Intl.NumberFormat(lang === "ar" ? "ar-EG" : "en-GB", {
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  const date = (value) =>
    value
      ? new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";
  const exportRecord = (item, report = false) => {
    try {
      const p = patient || item.patientId || {};
      if (report) printReport(item, p.name || "—", lang);
      else printInvoice(item, p.name || "—", p.type, lang);
      setToast(w.printHint);
    } catch {
      setToast(w.error);
    }
  };
  const switcher = (
    <button
      className="language"
      onClick={() => setLang(rtl ? "en" : "ar")}
      aria-label={rtl ? "Switch to English" : "التبديل إلى العربية"}
    >
      <Languages size={19} />
      <span lang={rtl ? "en" : "ar"}>{rtl ? "English" : "العربية"}</span>
    </button>
  );
  const visible = records.filter((r) =>
    tab === "patients" && !patient
      ? filter === "all" || r.type === filter
      : tab === "reports"
        ? !query ||
          (r.patientId?.name + " " + r.content)
            .toLowerCase()
            .includes(query.toLowerCase())
        : (!patient ||
            !query ||
            `${r.invoiceId || ""} ${(r.services || []).map((s) => s.name).join(" ")}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (filter === "all" ||
            (filter === "paid"
              ? Number(r.remaining) <= 0
              : Number(r.remaining) > 0)),
  );
  async function logout() {
    if (!window.confirm(w.logoutConfirm)) return;
    try {
      await api("/auth/logout", {
        method: "POST",
        body: { userId: session.userId },
      });
    } catch {}
    sessionStorage.removeItem("userToken");
    sessionStorage.removeItem("userId");
    setSession(null);
    navigate("patients");
  }
  if (checking)
    return (
      <div className="loading-screen">
        <HeartPulse />
        <LoaderCircle className="spin" />
      </div>
    );
  if (!session)
    return (
      <div className="login-page">
        <section className="login-art">
          <div className="brand">
            <span className="brand-icon">
              <HeartPulse />
            </span>
            <span>
              RetalCare<small>CARE, CONNECTED.</small>
            </span>
          </div>
          <div>
            <span className="eyebrow">RETALCARE / WORKSPACE</span>
            <h1>{w.loginSub}</h1>
            <p>{w.intro}</p>
          </div>
          <div className="art-orbit">
            <HeartPulse size={80} />
          </div>
          <small>01 / {w.secure}</small>
        </section>
        <section className="login-main">
          <div className="login-language">{switcher}</div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const f = new FormData(e.currentTarget);
              try {
                const r = await api("/auth/login", {
                  method: "POST",
                  body: Object.fromEntries(f),
                });
                if (!r.token || !r.userId) throw new Error();
                sessionStorage.setItem("userToken", r.token);
                sessionStorage.setItem("userId", r.userId);
                setSession({ userId: r.userId, username: f.get("username") });
              } catch {
                setError("login");
              } finally {
                setBusy(false);
              }
            }}
          >
            <span className="mini-icon">
              <ShieldCheck />
            </span>
            <h2>{w.loginIntro}</h2>
            <p>{w.intro}</p>
            <Field
              label={w.username}
              name="username"
              autoComplete="username"
              required
            />
            <Field
              label={w.password}
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            {error && (
              <div role="alert" className="error">
                {w.loginError}
              </div>
            )}
            <Button
              className="primary full"
              disabled={busy}
              icon={busy ? LoaderCircle : rtl ? ArrowLeft : ArrowRight}
            >
              {busy ? w.pending : w.login}
            </Button>
          </form>
          <small className="login-foot">RetalCare · {w.secure}</small>
        </section>
      </div>
    );
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">
            <HeartPulse />
          </span>
          <span>
            RetalCare<small>CARE, CONNECTED.</small>
          </span>
        </div>
        <p className="nav-label">{w.workspace}</p>
        <nav>
          {[
            ["patients", Users],
            ["invoices", Files],
            ["reports", ClipboardList],
          ].map(([key, Icon]) => (
            <button
              key={key}
              className={"nav-item " + (tab === key ? "active" : "")}
              onClick={() => navigate(key)}
            >
              <Icon size={20} />
              <span>{w[key]}</span>
              {tab === key && <i />}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="care-note">
            <HeartPulse size={24} />
            <strong>{w.secure}</strong>
            <span>RetalCare Workspace</span>
          </div>
          <button className="nav-item" onClick={logout}>
            <LogOut size={19} />
            {w.logout}
          </button>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div className="breadcrumb">
            RetalCare <span>/</span> <strong>{w[tab]}</strong>
          </div>
          <div className="top-actions">
            {switcher}
            <span className="vertical-line" />
            <div className="user-avatar">{initials(session.username)}</div>
            <span className="user-name">{session.username}</span>
            <button
              className="icon-button mobile-logout"
              aria-label={w.logout}
              onClick={logout}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="workspace">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                {w.workspace} <span className="tiny-line" />{" "}
                {new Date().getFullYear()}
              </div>
              <h1>{patient ? patient.name : w[tab]}</h1>
              <p>{patient ? w.invoiceIntro : w.intro}</p>
            </div>
            <div className="heading-actions">
              {patient ? (
                <>
                  <Button
                    icon={rtl ? ArrowRight : ArrowLeft}
                    onClick={() => {
                      setPatient(null);
                      reload();
                    }}
                  >
                    {w.back}
                  </Button>
                  <Button
                    className="primary"
                    icon={Plus}
                    onClick={() => setModal({ kind: "invoice", patient })}
                  >
                    {w.newInvoice}
                  </Button>
                  {patient.type !== "entity" && (
                    <Button
                      icon={Plus}
                      onClick={() => setModal({ kind: "report", patient })}
                    >
                      {w.newReport}
                    </Button>
                  )}
                  <Button
                    icon={Pencil}
                    onClick={() => setModal({ kind: "patient", item: patient })}
                  >
                    {w.editPatient}
                  </Button>
                </>
              ) : (
                <Button
                  className="primary"
                  icon={Plus}
                  onClick={() => setModal({ kind: "patient" })}
                >
                  {w.newPatient}
                </Button>
              )}
            </div>
          </div>
          {!patient && (
            <section className="welcome-banner">
              <div>
                <span className="eyebrow">RETALCARE</span>
                <h2>{w.welcome}</h2>
                <p>{w.intro}</p>
              </div>
              <div className="banner-mark">
                <HeartPulse size={55} />
              </div>
              <div className="banner-detail">
                <span>{w.loaded}</span>
                <strong>
                  {busy && page === 1 ? "—" : money(records.length)}
                </strong>
                <small>{w[tab]}</small>
              </div>
            </section>
          )}
          <section className="records-section">
            <div className="section-toolbar">
              <div className="filter-tabs" aria-label={w.filter}>
                {(tab === "patients" && !patient
                  ? [
                      ["all", w.all],
                      ["patient", w.individual],
                      ["entity", w.organizations],
                    ]
                  : tab === "reports"
                    ? [["all", w.all]]
                    : [
                        ["all", w.all],
                        ["paid", w.paid],
                        ["due", w.due],
                      ]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    className={filter === key ? "selected" : ""}
                    onClick={() => setFilter(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="search-wrap">
                <Search size={18} />
                <input
                  aria-label={w.search}
                  placeholder={w.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button aria-label={w.close} onClick={() => setSearch("")}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
            {error ? (
              <div className="empty error" role="alert">
                <RefreshCw />
                <p>{w.error}</p>
                <Button onClick={reload}>{w.retry}</Button>
              </div>
            ) : busy && page === 1 ? (
              <div className="card-grid">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div className="skeleton" key={n} />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="empty">
                <Files size={36} />
                <h3>{w.empty}</h3>
                <p>{w.emptySub}</p>
              </div>
            ) : (
              <div className="card-grid">
                {visible.map((item) =>
                  tab === "patients" && !patient ? (
                    <button
                      className={"patient-card tone-" + tone(item.name)}
                      key={item._id}
                      onClick={() => {
                        setPatient(item);
                        setSearch("");
                        setQuery("");
                        setPage(1);
                        setFilter("all");
                      }}
                    >
                      <div className="card-top">
                        <span className="record-icon">
                          <Users size={19} />
                        </span>
                        <span className="badge">
                          {item.type === "entity" ? w.entity : w.patient}
                        </span>
                      </div>
                      <div className="patient-identity">
                        <span className="initials">{initials(item.name)}</span>
                        <h3 dir="auto">{item.name}</h3>
                      </div>
                      <div className="card-bottom">
                        <span>{w.open}</span>
                        {rtl ? (
                          <ArrowUpLeft size={18} />
                        ) : (
                          <ArrowUpRight size={18} />
                        )}
                      </div>
                    </button>
                  ) : (
                    <article
                      className={
                        "document-card tone-" +
                        tone(item.patientId?.name || patient?.name || item._id)
                      }
                      key={item._id}
                    >
                      <div className="card-top">
                        <span className="record-icon">
                          {tab === "reports" ? (
                            <ClipboardList size={19} />
                          ) : (
                            <Files size={19} />
                          )}
                        </span>
                        <span
                          className={
                            "badge " +
                            (tab !== "reports"
                              ? item.remaining > 0
                                ? "due"
                                : "paid"
                              : "")
                          }
                        >
                          {tab === "reports"
                            ? w.reports
                            : item.remaining > 0
                              ? w.due
                              : w.paid}
                        </span>
                      </div>
                      <h3 dir="auto">
                        {patient?.name || item.patientId?.name || "—"}
                      </h3>
                      <div className="record-meta">
                        <bdi>{item.invoiceId || ""}</bdi>
                        <span>
                          <CalendarDays size={13} />
                          {date(item.date)}
                        </span>
                      </div>
                      {tab === "reports" ? (
                        <p className="report-excerpt" dir="auto">
                          {item.content}
                        </p>
                      ) : (
                        <>
                          <div className="invoice-amount">
                            <span>{w.total}</span>
                            <strong>
                              {money(item.total)} <small>{t.currency}</small>
                            </strong>
                          </div>
                          <div className="amount-row">
                            <div>
                              <span>{w.received}</span>
                              <b>{money(item.paid)}</b>
                            </div>
                            <div>
                              <span>{w.balance}</span>
                              <b
                                className={
                                  item.remaining > 0 ? "outstanding" : ""
                                }
                              >
                                {money(item.remaining)}
                              </b>
                            </div>
                            <div>
                              <span>{w.services}</span>
                              <b>{item.services?.length || 0}</b>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="card-bottom document-actions">
                        <Button
                          className="export"
                          icon={Printer}
                          onClick={() => exportRecord(item, tab === "reports")}
                        >
                          {w.print}
                        </Button>
                        {(patient || item.patientId) && (
                          <Button
                            icon={tab === "reports" ? Pencil : Copy}
                            onClick={() =>
                              setModal({
                                kind: tab === "reports" ? "report" : "invoice",
                                patient: patient || item.patientId,
                                item,
                              })
                            }
                          >
                            {tab === "reports" ? w.edit : w.duplicate}
                          </Button>
                        )}
                        {tab === "reports" && (
                          <button
                            className="icon-button danger"
                            aria-label={w.remove}
                            onClick={() => setModal({ kind: "delete", item })}
                          >
                            <Trash2 size={17} />
                          </button>
                        )}
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
            {more && !error && (
              <div className="load-more">
                <Button
                  disabled={busy}
                  icon={busy ? LoaderCircle : ChevronDown}
                  onClick={() => setPage((n) => n + 1)}
                >
                  {busy ? w.pending : w.more}
                </Button>
              </div>
            )}
          </section>
          <footer>
            RetalCare <span>·</span> {w.secure}
          </footer>
        </div>
      </main>
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
        </div>
      )}
      {modal && (
        <Editor
          key={modal.kind + (modal.item?._id || "")}
          modal={modal}
          close={() => setModal(null)}
          w={w}
          t={t}
          lang={lang}
          onSaved={(updatedPatient) => {
            if (updatedPatient && patient?._id === updatedPatient._id)
              setPatient(updatedPatient);
            setModal(null);
            reload();
            setToast(w.saved);
          }}
        />
      )}
    </div>
  );
}

function Editor({ modal, close, w, t, lang, onSaved }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [initialSections] = useState(() =>
    invoiceSections(modal.item || {}, w.generalSection),
  );
  const [sections, setSections] = useState(
    initialSections.map(({ id, title }) => ({ id, title })),
  );
  const [activeSection, setActiveSection] = useState(initialSections[0].id);
  const [services, setServices] = useState(
    initialSections.flatMap((section) =>
      section.services.map((s) => ({
        ...s,
        id: s.id || crypto.randomUUID(),
        sectionId: section.id,
      })),
    ),
  );
  const [paid, setPaid] = useState(modal.item?.paid || 0);
  const [draft, setDraft] = useState({
    name: "",
    price: "",
    quantity: "1",
    date: today(),
  });
  const total =
    Math.round(services.reduce((n, s) => n + Number(s.total), 0) * 100) / 100;
  useEffect(() => {
    const before = document.activeElement;
    const dialog = document.querySelector("dialog");
    dialog.showModal();
    return () => before?.focus();
  }, []);
  function add() {
    const price = Number(draft.price),
      quantity = Number(draft.quantity);
    if (
      !draft.name.trim() ||
      !Number.isFinite(price) ||
      price <= 0 ||
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      !draft.date
    ) {
      setError(w.formError);
      return;
    }
    setServices((s) => [
      ...s,
      {
        ...draft,
        sectionId: activeSection,
        name: draft.name.trim(),
        price,
        quantity,
        total: Math.round(price * quantity * 100) / 100,
        id: crypto.randomUUID(),
      },
    ]);
    setDraft({ ...draft, name: "", price: "", quantity: "1" });
    setError("");
  }
  async function save(e) {
    e.preventDefault();
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget));
    if (
      modal.kind === "invoice" &&
      sections.some(
        (section) =>
          !section.title.trim() ||
          !services.some((s) => s.sectionId === section.id),
      )
    ) {
      setError(w.sectionError);
      return;
    }
    if (
      modal.kind === "invoice" &&
      (!services.length ||
        !Number.isFinite(Number(paid)) ||
        Number(paid) < 0 ||
        Number(paid) > total)
    ) {
      setError(!services.length ? t.addServicesFirstAlert : w.paidError);
      return;
    }
    setBusy(true);
    try {
      if (modal.kind === "patient") {
        if (!f.name.trim()) throw new Error(w.formError);
        const updated = await api(
          "/patients" + (modal.item ? "/" + modal.item._id : ""),
          {
            method: modal.item ? "PUT" : "POST",
            body: { name: f.name.trim(), type: f.type },
          },
        );
        onSaved(updated);
        return;
      } else if (modal.kind === "delete") {
        await api(`/reports/${modal.item._id}`, { method: "DELETE" });
      } else if (modal.kind === "report") {
        if (!f.content.trim()) throw new Error(t.reportTextAlert);
        await api("/reports" + (modal.item ? "/" + modal.item._id : ""), {
          method: modal.item ? "PUT" : "POST",
          body: {
            patientId: modal.patient._id,
            date: f.date,
            content: f.content,
          },
        });
      } else {
        await api("/invoices", {
          method: "POST",
          body: {
            patientId: modal.patient._id,
            date: f.date,
            sections: sections.map((s) => ({ ...s, title: s.title.trim() })),
            services: invoiceSections({ sections, services }).flatMap(
              (s) => s.services,
            ),
            total,
            paid: Number(paid),
            remaining: Math.round((total - Number(paid)) * 100) / 100,
            notes: f.notes,
          },
        });
      }
      onSaved();
    } catch (err) {
      setError(err.name === "AbortError" ? w.error : err.message || w.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <dialog
      className={modal.kind === "invoice" ? "wide" : ""}
      onCancel={(e) => {
        if (busy) e.preventDefault();
        else close();
      }}
    >
      <form onSubmit={save}>
        <div className="modal-header">
          <div>
            <span className="eyebrow">RETALCARE</span>
            <h2>
              {modal.kind === "patient"
                ? modal.item
                  ? w.editPatient
                  : w.newPatient
                : modal.kind === "report"
                  ? modal.item
                    ? w.edit
                    : w.newReport
                  : modal.kind === "delete"
                    ? w.remove
                    : w.newInvoice}
            </h2>
            {modal.patient && <p dir="auto">{modal.patient.name}</p>}
          </div>
          <button
            type="button"
            className="icon-button"
            disabled={busy}
            onClick={close}
            aria-label={w.close}
          >
            <X />
          </button>
        </div>
        <div className="modal-body">
          {modal.kind === "patient" ? (
            <>
              <Field
                label={w.name}
                name="name"
                defaultValue={modal.item?.name || ""}
                required
                autoFocus
                dir="auto"
              />
              <Field label={t.patientTypeLabel}>
                <select
                  name="type"
                  defaultValue={modal.item?.type || "patient"}
                >
                  <option value="patient">{w.patient}</option>
                  <option value="entity">{w.entity}</option>
                </select>
              </Field>
            </>
          ) : modal.kind === "delete" ? (
            <p>{w.confirm}</p>
          ) : (
            <>
              <p className="form-intro">
                {modal.kind === "invoice" ? w.invoiceIntro : w.reportIntro}
              </p>
              {modal.item && modal.kind === "invoice" && (
                <div className="notice">{w.copyInfo}</div>
              )}
              <Field
                label={w.date}
                name="date"
                type="date"
                defaultValue={
                  modal.kind === "report" && modal.item?.date
                    ? modal.item.date.slice(0, 10)
                    : today()
                }
                required
              />
              {modal.kind === "report" ? (
                <Field label={w.content}>
                  <textarea
                    name="content"
                    rows={9}
                    defaultValue={modal.item?.content || ""}
                    required
                    dir="auto"
                  />
                </Field>
              ) : (
                <>
                  <section className="service-entry">
                    <div className="invoice-sections">
                      {sections.map((section, index) => (
                        <div className="section-editor" key={section.id}>
                          <Field
                            label={`${w.sectionTitle} ${index + 1}`}
                            value={section.title}
                            onChange={(e) =>
                              setSections((all) =>
                                all.map((s) =>
                                  s.id === section.id
                                    ? { ...s, title: e.target.value }
                                    : s,
                                ),
                              )
                            }
                            dir="auto"
                          />
                          {sections.length > 1 &&
                            !services.some(
                              (s) => s.sectionId === section.id,
                            ) && (
                              <Button
                                type="button"
                                icon={Trash2}
                                onClick={() => {
                                  setSections((all) =>
                                    all.filter((s) => s.id !== section.id),
                                  );
                                  if (activeSection === section.id)
                                    setActiveSection(
                                      sections.find((s) => s.id !== section.id)
                                        .id,
                                    );
                                }}
                              >
                                {w.remove}
                              </Button>
                            )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        icon={Plus}
                        onClick={() => {
                          const id = crypto.randomUUID();
                          setSections((all) => [...all, { id, title: "" }]);
                          setActiveSection(id);
                        }}
                      >
                        {w.addSection}
                      </Button>
                    </div>
                    <Field label={w.section}>
                      <select
                        value={activeSection}
                        onChange={(e) => setActiveSection(e.target.value)}
                      >
                        {sections.map((s, i) => (
                          <option key={s.id} value={s.id}>
                            {s.title || `${w.section} ${i + 1}`}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label={w.service}
                      value={draft.name}
                      onChange={(e) =>
                        setDraft({ ...draft, name: e.target.value })
                      }
                      dir="auto"
                    />
                    <div className="form-row">
                      <Field
                        label={w.quantity}
                        type="number"
                        min="1"
                        step="1"
                        value={draft.quantity}
                        onChange={(e) =>
                          setDraft({ ...draft, quantity: e.target.value })
                        }
                      />
                      <Field
                        label={w.price}
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={draft.price}
                        onChange={(e) =>
                          setDraft({ ...draft, price: e.target.value })
                        }
                      />
                      <Field
                        label={w.date}
                        type="date"
                        value={draft.date}
                        onChange={(e) =>
                          setDraft({ ...draft, date: e.target.value })
                        }
                      />
                    </div>
                    <Button type="button" icon={Plus} onClick={add}>
                      {w.addService}
                    </Button>
                  </section>
                  <div className="service-list">
                    {invoiceSections({ sections, services }).map((section) => (
                      <section className="section-preview" key={section.id}>
                        <h3 dir="auto">{section.title}</h3>
                        {section.services.map((s) => (
                          <div key={s.id}>
                            <span dir="auto">
                              {s.name}
                              <small>
                                {s.quantity} × {s.price} ·{" "}
                                {s.date?.slice(0, 10)}
                              </small>
                            </span>
                            <b>
                              {s.total} {t.currency}
                            </b>
                            <button
                              type="button"
                              className="icon-button danger"
                              aria-label={w.remove}
                              onClick={() =>
                                setServices((all) =>
                                  all.filter((x) => x.id !== s.id),
                                )
                              }
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        ))}
                      </section>
                    ))}
                  </div>
                  <Field
                    label={w.received}
                    type="number"
                    min="0"
                    max={total}
                    step="0.01"
                    value={paid}
                    onChange={(e) => setPaid(e.target.value)}
                  />
                  <Field label={w.notes}>
                    <textarea
                      name="notes"
                      defaultValue={modal.item?.notes || ""}
                      rows={2}
                      dir="auto"
                    />
                  </Field>
                  <div className="form-total">
                    <span>
                      {w.total}
                      <b>
                        {total.toFixed(2)} {t.currency}
                      </b>
                    </span>
                    <span>
                      {w.balance}
                      <b>
                        {(total - Number(paid || 0)).toFixed(2)} {t.currency}
                      </b>
                    </span>
                  </div>
                </>
              )}
            </>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <div className="modal-footer">
          <Button type="button" disabled={busy} onClick={close}>
            {w.cancel}
          </Button>
          <Button
            type="submit"
            className={modal.kind === "delete" ? "danger-fill" : "primary"}
            disabled={busy}
            icon={busy ? LoaderCircle : Check}
          >
            {busy ? w.saving : modal.kind === "delete" ? w.remove : w.save}
          </Button>
        </div>
      </form>
    </dialog>
  );
}
