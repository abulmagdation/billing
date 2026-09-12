import arabicRegular from '@fontsource/cairo/files/cairo-arabic-400-normal.woff2?url';
import arabicBold from '@fontsource/cairo/files/cairo-arabic-700-normal.woff2?url';
import latinRegular from '@fontsource/cairo/files/cairo-latin-400-normal.woff2?url';
import latinBold from '@fontsource/cairo/files/cairo-latin-700-normal.woff2?url';

// Print-only styles. Keep the raster artwork unmodified; the stamp viewport
// excludes the photograph's surrounding background without distorting it.
export const printDesign = `
@font-face{font-family:Cairo;font-style:normal;font-weight:400;src:url('${arabicRegular}') format('woff2')}
@font-face{font-family:Cairo;font-style:normal;font-weight:700;src:url('${arabicBold}') format('woff2')}
@font-face{font-family:Cairo;font-style:normal;font-weight:400;src:url('${latinRegular}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
@font-face{font-family:Cairo;font-style:normal;font-weight:700;src:url('${latinBold}') format('woff2');unicode-range:U+0000-00FF,U+2000-206F}
@page{size:A4;margin:14mm 13mm}
@page{margin:17mm 13mm 19mm;
 @top-left{content:'RetalCare';font-family:Cairo,sans-serif;font-size:8pt;color:#177782;border-bottom:1px solid #dbeaec}
 @bottom-left{content:'RetalCare';font-family:Cairo,sans-serif;font-size:8pt;color:#70858a;border-top:1px solid #dbeaec}
 @bottom-right{content:counter(page) ' / ' counter(pages);direction:ltr;font-family:Cairo,sans-serif;font-size:8pt;color:#177782;border-top:1px solid #dbeaec}
}
*{box-sizing:border-box}
body{padding:0;color:#243c43;font-size:12px}
.invoice-container{padding:0}
.header{border-bottom:3px solid #049ba7;padding-bottom:21px;margin-bottom:24px;gap:28px}
.brand-logo{width:142px;max-height:none!important;max-width:142px!important;object-fit:contain}
.header-text{flex:1}
.header-text h1{color:#164b54;font-size:27px;line-height:1.5;margin-bottom:7px}
.header-text h2{font-size:12px;color:#6a8288;letter-spacing:.1px}
.patient-box{border:1px solid #dbeaec;border-inline-start:4px solid #079ba7;background:#f2f8f8;border-radius:9px;padding:15px 18px;margin-bottom:26px}
.patient-box p{font-size:14px;color:#70858a}.patient-box span{font-size:16px;color:#214f59}
.invoice-container>h2{font-size:18px!important;color:#116472!important;margin:24px 0 14px;padding-bottom:9px;border-bottom:1px solid #d9e7e9;break-after:avoid}
.date-group{margin-bottom:22px}.date-title{font-size:12px;color:#5f7880;margin-bottom:10px;break-after:avoid}.date-title span{color:#087f8b;background:#e8f5f5;font-size:11px;padding:4px 10px;border-radius:6px}
table{table-layout:fixed;border:1px solid #e0eaec;border-radius:8px;overflow:hidden;margin-bottom:10px}
th{background:#175e68;padding:10px 8px;font-size:11px;font-weight:600}
th:first-child{width:7%}th:nth-child(2){width:43%}th:nth-child(3){width:12%}th:nth-child(4){width:17%}th:nth-child(5){width:21%}
td{font-size:11px;line-height:1.7;padding:11px 8px;border-bottom:1px solid #e5edef;vertical-align:top}
tbody tr:nth-child(even) td{background:#f7fafb}tbody tr:last-child td{border-bottom:none}td:last-child{color:#156b77!important}
.bottom-section{margin-top:26px;background:#fff;border:0;border-top:1px solid #d9e7e9;border-radius:0;padding:22px 0 0;gap:26px}
.totals-box{width:52%;background:#f2f8f8;border:1px solid #d9e8e9;border-radius:10px;padding:17px}
.total-row{font-size:11px;color:#71858b;margin-bottom:13px;gap:14px}.total-row span:last-child{font-size:14px;color:#274b54;white-space:nowrap}
.total-row.final{border-top:1px solid #cbdfe2;padding-top:13px;margin-top:3px}.total-row.final span:first-child{font-size:12px;color:#274b54}.total-row.final span:last-child{font-size:19px;color:#126571}
.stamp-container{width:40%;align-self:center}.signature-title{font-size:12px;color:#75888d;font-weight:600;margin-bottom:12px}
.stamp-viewport{width:210px;max-width:100%;aspect-ratio:1056/380;overflow:hidden;position:relative;margin:auto;direction:ltr}
.stamp-viewport img{position:absolute;width:145.4545%;max-width:none!important;height:auto!important;left:-22.727%;top:-71.05%}
.report-content{color:#29454e;font-size:14px;line-height:2.1;min-height:320px}
.print-footer{border-top:1px solid #e4ecee;margin-top:28px;padding-top:12px;display:flex;justify-content:space-between;color:#8b9a9f;font-size:9px;break-inside:avoid}
.header,.patient-box{break-inside:avoid}
.header-text{min-width:0;overflow-wrap:anywhere}
.header-text h1{font-size:24px}
.date-group{margin-bottom:17px}
table{overflow:visible;border-radius:0;border:0}
thead{display:table-header-group;break-inside:avoid;break-after:avoid}
tbody{break-inside:auto}
tr{break-inside:avoid;page-break-inside:avoid}
td{padding:8px;line-height:1.65}
.group-context th{background:white;color:#156b77;padding:13px 0 10px;border-top:1px solid #dbeaec}
.group-context .section-label{display:block;font-size:16px;line-height:1.7;margin-bottom:5px;overflow-wrap:anywhere}
.group-context .date-title{margin:0;font-weight:400}
th:first-child,th:nth-child(2),th:nth-child(3),th:nth-child(4),th:nth-child(5){width:auto}
.numeric{font-variant-numeric:tabular-nums;white-space:nowrap}
.invoice-notes{white-space:pre-wrap;overflow-wrap:anywhere;orphans:3;widows:3;border-inline-start:3px solid #049ba7;padding:10px 14px;background:#f7fafb}
.bottom-section{break-inside:avoid;page-break-inside:avoid}
.report-content{orphans:3;widows:3}
@media print{.print-footer{border:0;margin-top:15px;padding-top:0}}
`;
