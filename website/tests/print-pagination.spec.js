import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';

for (const lang of ['ar', 'en']) {
  test(`multipage invoice ${lang}`, async ({ page }, testInfo) => {
    test.skip(!process.env.PDF_PYTHON, 'Set PDF_PYTHON to a Python executable with pypdf for PDF verification.');
    await page.goto('/');
    const html = await page.evaluate(async (lang) => {
      const { invoiceHTML } = await import('/src/web/print.js');
      const services = Array.from({ length: 95 }, (_, i) => ({
        name: `${lang === 'ar' ? 'جلسة رعاية منزلية ومتابعة الحالة الصحية' : 'Home care visit and patient monitoring'} - ITEM${String(i + 1).padStart(3, '0')}`,
        date: '2026-09-01', sectionId: i < 70 ? 'a' : 'b', quantity: 1, price: 100, total: 100,
      }));
      return invoiceHTML({ invoiceId: 'QA-095', sections: [
        { id: 'a', title: lang === 'ar' ? 'الرعاية المنزلية' : 'Home care' },
        { id: 'b', title: lang === 'ar' ? 'المتابعة والتأهيل' : 'Follow-up care' },
      ], services, total: 9500, paid: 1000, remaining: 8500,
      notes: lang === 'ar' ? 'هذه فاتورة تجريبية لمراجعة تنسيق الصفحات.' : 'Sample invoice for pagination review.' },
      lang === 'ar' ? 'مريض تجريبي' : 'Sample patient', 'patient', lang);
    }, lang);
    await page.setContent(html);
    await page.emulateMedia({ media: 'print' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(img => img.decode()));
    });
    const pdf = testInfo.outputPath(`invoice-${lang}.pdf`);
    await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
    const text = execFileSync(process.env.PDF_PYTHON, ['-c', 'import sys; from pypdf import PdfReader; sys.stdout.buffer.write("\\f".join(p.extract_text() for p in PdfReader(sys.argv[1]).pages).encode("utf-8"))', pdf], { encoding: 'utf8' });
    const pages = text.split('\f').filter(p => p.trim());
    expect(pages.length).toBeGreaterThan(2);
    for (let i = 1; i <= 95; i++) {
      expect(text.match(new RegExp(`ITEM${String(i).padStart(3, '0')}`, 'g'))).toHaveLength(1);
    }
    for (const [i, content] of pages.entries()) {
      expect(content).toContain('RetalCare');
      expect(content).toMatch(new RegExp(`${i + 1}\\s*/\\s*${pages.length}`));
      if (lang === 'en' && content.includes('ITEM')) expect(content).toContain('Item / Service Name');
    }
    if (lang === 'en') {
      expect(pages.at(-1)).toContain('8,500'.replace(',', ''));
      expect(pages.at(-1)).toContain('Approved');
    }
    execFileSync('pdftoppm', ['-scale-to', '1000', '-png', pdf, testInfo.outputPath(`page-${lang}`)]);
  });
}
