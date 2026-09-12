import { translations } from "../i18n/translations";
import COMPANY_LOGO_BASE64 from './assets/logo.png';
import STAMP_BASE64 from './assets/stamp.png';
import { printDesign } from './print-design';
import { invoiceSections } from "./invoice-sections";

// Print colors are intentionally independent of the website theme.
const C = {
  primary: "#1E3A8A",
  primaryLight: "#DBEAFE",
  textMain: "#0F172A",
  textSub: "#64748B",
  surfaceVariant: "#F1F5F9",
  divider: "#E2E8F0",
  success: "#10B981",
  danger: "#EF4444",
};
const escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) => (Number(n) || 0).toFixed(2);
// CSS content is a separate escaping context from HTML.
const cssText = (value) => JSON.stringify(String(value ?? '').replace(/[\r\n\f]/g, ' ')).replace(/</g, '\\3c ');
const runningHeader = (name, title, rtl) => `@page{@top-right{content:${cssText(`${name} | ${title}`.slice(0, 100))};direction:${rtl ? 'rtl' : 'ltr'};font-family:Cairo,sans-serif;font-size:7pt;color:#70858a;border-bottom:1px solid #dbeaec}}`;
const date = (value, lang) =>
  value
    ? new Date(value).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";
function template(content, title, name, type, lang) {
  const t = translations[lang],
    rtl = lang === "ar";
  return `<!DOCTYPE html><html lang="${lang}" dir="${rtl ? "rtl" : "ltr"}"><head><meta charset="utf-8"><title>${escape(title)}</title><style>
  @page{size:A4;margin:0}*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{font-family:'Cairo',sans-serif;padding:25px 40px;background:#fff;color:${C.textMain};margin:0}.invoice-container{padding:10px}.header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid ${C.primary};padding-bottom:15px;margin-bottom:25px}.header-text h1{color:${C.primary};font-size:28px;font-weight:700;margin:0}.header-text h2{color:${C.textSub};font-size:16px;margin:5px 0 0;font-weight:600}.patient-box{background:${C.surfaceVariant};border-${rtl ? "right" : "left"}:4px solid ${C.primary};padding:15px;border-radius:8px;margin-bottom:30px}.patient-box p{margin:0;font-size:18px;font-weight:600}.patient-box span{color:${C.primary};font-weight:700;margin:0 5px}.date-group{margin-bottom:35px}.date-title{font-size:16px;font-weight:700;margin-bottom:15px}.date-title span{color:${C.primary};background:${C.primaryLight};padding:4px 12px;border-radius:20px;font-size:14px}table{width:100%;border-collapse:separate;border-spacing:0;margin-bottom:15px}th{background:${C.primary};color:#fff;padding:15px 12px;text-align:${rtl ? "right" : "left"};font-weight:600;font-size:15px}td{padding:15px 12px;border-bottom:1px solid ${C.divider};background:#fff;font-size:15px;overflow-wrap:anywhere}tr{break-inside:avoid}thead{display:table-header-group}.bottom-section{display:flex;justify-content:space-between;align-items:center;margin-top:40px;break-inside:avoid;background:${C.surfaceVariant};border-radius:12px;border:1px solid ${C.divider};padding:20px}.totals-box{width:50%}.total-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-size:16px;font-weight:600;color:${C.textSub}}.total-row span:last-child{color:${C.textMain};font-weight:700;font-size:18px}.total-row.final{border-top:2px dashed ${C.divider};padding-top:15px;margin-top:5px;margin-bottom:0}.total-row.final span:first-child{color:${C.textMain};font-size:18px}.total-row.final span:last-child{color:${C.danger};font-size:22px}.stamp-container{text-align:center;width:40%}.signature-title{font-size:18px;font-weight:700;margin-bottom:15px}.report-content{font-size:16px;line-height:1.8;min-height:300px;white-space:pre-wrap;overflow-wrap:anywhere}
  ${printDesign}${runningHeader(name, title, rtl)}</style></head><body><div class="invoice-container"><div class="header"><img src="${COMPANY_LOGO_BASE64}" class="brand-logo" alt="RetalCare"><div class="header-text" style="text-align:${rtl ? "left" : "right"}"><h1>${escape(title)}</h1><h2>${escape(t.pdfCompanySubtitle)}</h2></div></div><div class="patient-box"><p>${escape(type === "entity" ? t.pdfEntityInfo : t.pdfPatientInfo)} <span>${escape(name)}</span></p></div>${content}<footer class="print-footer"><span dir="ltr">RetalCare</span><span>${rtl ? "راحتك وصحتك أولويتنا" : "We take care of you with love"}</span></footer></div></body></html>`;
}
const stamp = (t) =>
  `<div class="stamp-container"><div class="signature-title">${escape(t.pdfApprovedStamp)}</div><div class="stamp-viewport"><img src="${STAMP_BASE64}" alt="RetalCare stamp"></div></div>`;
export function invoiceHTML(invoice, name, type, lang) {
  const t = translations[lang];
  const tables = invoiceSections(invoice)
    .map((section) => {
      const groups = {};
      for (const s of section.services) {
        const day = date(s.date, lang);
        (groups[day] ||= []).push(s);
      }
      return (
        Object.entries(groups)
          .map(
            ([day, items]) =>
              `<div class="date-group"><table><colgroup><col style="width:7%"><col style="width:43%"><col style="width:12%"><col style="width:17%"><col style="width:21%"></colgroup><thead><tr class="group-context"><th colspan="5">${section.title ? `<span class="section-label">${escape(section.title)}</span>` : ""}<div class="date-title">${escape(t.pdfServicesDay)} <span>${escape(day)}</span></div></th></tr><tr>${[t.pdfColIndex, t.pdfColServiceName, t.pdfColQuantity, t.pdfColPrice, t.pdfColTotal].map((v) => `<th>${escape(v)}</th>`).join("")}</tr></thead><tbody>${items.map((s, i) => `<tr><td>${i + 1}</td><td>${escape(s.name)}</td><td>${escape(s.quantity)}</td><td>${escape(s.price)}</td><td style="color:${C.primary};font-weight:bold">${escape(s.total)} ${escape(t.currency)}</td></tr>`).join("")}</tbody></table></div>`,
          )
          .join("")
      );
    })
    .join("");
  return template(
    tables +
      (invoice.notes
        ? `<p class="invoice-notes">${escape(t.pdfNotesTitle)} ${escape(invoice.notes)}</p>`
        : "") +
      `<div class="bottom-section">${stamp(t)}<div class="totals-box"><div class="total-row"><span>${escape(t.pdfTotalServices)}</span><span>${money(invoice.total)} ${escape(t.currency)}</span></div><div class="total-row"><span>${escape(t.pdfTotalPaid)}</span><span style="color:${C.success}">${money(invoice.paid)} ${escape(t.currency)}</span></div><div class="total-row final"><span>${escape(t.pdfRemainingDue)}</span><span>${money(invoice.remaining)} ${escape(t.currency)}</span></div></div></div>`,
    `${t.pdfDocTitle}${invoice.invoiceId ? " #" + invoice.invoiceId : ""}`,
    name,
    type,
    lang,
  );
}
export function reportHTML(report, name, lang) {
  const t = translations[lang];
  return template(
    `<p>${escape(t.reportDateLabel)}: ${escape(date(report.date, lang))}</p><div class="report-content">${escape(report.content)}</div><div class="bottom-section">${stamp(t)}</div>`,
    t.reportPdfTitle,
    name,
    "patient",
    lang,
  );
}
function print(html) {
  const frame = document.createElement("iframe");
  frame.title = "Print preview";
  frame.style.cssText = "position:fixed;width:0;height:0;border:0;";
  frame.onload = async () => {
    const win = frame.contentWindow;
    await win.document.fonts.ready;
    await Promise.all(
      [...win.document.images].map((img) => img.decode().catch(() => {})),
    );
    win.addEventListener(
      "afterprint",
      () => setTimeout(() => frame.remove(), 500),
      { once: true },
    );
    win.focus();
    win.print();
  };
  frame.srcdoc = html;
  document.body.append(frame);
}
export const printInvoice = (invoice, name, type, lang) =>
  print(invoiceHTML(invoice, name, type, lang));
export const printReport = (report, name, lang) =>
  print(reportHTML(report, name, lang));
