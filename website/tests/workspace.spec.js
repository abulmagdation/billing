import { test, expect } from "@playwright/test";
test("bilingual workspace, forms, responsive layout and isolated print", async ({
  page,
}) => {
  const failures = [];
  page.on("pageerror", (e) => failures.push(e.message));
  const patient = { _id: "p1", name: "مريض اختبار", type: "patient" };
  const invoice = {
    _id: "i1",
    patientId: patient,
    invoiceId: "INV-123",
    date: "2026-09-12",
    total: 200,
    paid: 50,
    remaining: 150,
    services: [
      {
        id: "s1",
        name: "خدمة اختبار",
        date: "2026-09-12",
        quantity: 2,
        price: 100,
        total: 200,
      },
    ],
  };
  const report = {
    _id: "r1",
    patientId: patient,
    date: "2026-09-11",
    content: "تقرير اختبار",
  };
  const writes = [];
  await page.route("**/api/**", async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    if (req.method() !== "GET") writes.push({ path, body: req.postDataJSON() });
    let data = [];
    if (path.endsWith("/auth/login")) data = { token: "test", userId: "u1" };
    else if (path.endsWith("/patients"))
      data = req.method() === "GET" ? [patient] : patient;
    else if (path.includes("/invoices"))
      data = req.method() === "GET" ? [invoice] : invoice;
    else if (path.includes("/reports"))
      data = req.method() === "GET" ? [report] : report;
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.getByLabel("اسم المستخدم").fill("test");
  await page.getByLabel("كلمة المرور").fill("test");
  await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
  await expect(page.locator(".patient-card")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await page.getByRole("button", { name: "Switch to English" }).click();
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.locator(".patient-card")).toContainText("Patient");
  await page.getByRole("button", { name: "Add patient", exact: true }).click();
  await page.getByLabel("Full name").fill("Test record");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.locator(".patient-card").click();
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  await page.getByLabel("Service / item name").fill("Test item");
  await page.getByLabel("Unit price").fill("25");
  await page.getByRole("button", { name: "Add item", exact: true }).click();
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  expect(writes.find((x) => x.path === "/api/invoices").body.total).toBe(25);
  await page
    .locator("nav")
    .getByRole("button", { name: "Medical reports" })
    .click();
  await expect(page.locator(".report-excerpt")).toContainText("تقرير اختبار");
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Report content").fill("Updated test");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "التبديل إلى العربية" }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/mobile-ar.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page
    .locator("nav")
    .getByRole("button", { name: "المرضى", exact: true })
    .click();
  await page.screenshot({
    path: "test-results/desktop-ar.png",
    fullPage: true,
  });
  const html = await page.evaluate(async () => {
    const { invoiceHTML } = await import("/src/web/print.js");
    return invoiceHTML(
      {
        invoiceId: "INV-1",
        total: 20,
        paid: 0,
        remaining: 20,
        services: [
          {
            name: "<script>bad</script>",
            quantity: 1,
            price: 20,
            total: 20,
            date: "2026-09-12",
          },
        ],
      },
      "Name",
      "patient",
      "ar",
    );
  });
  expect(html).toContain("&lt;script&gt;");
  expect(html).not.toContain("RETAL Dental Clinic");
  expect(html).toContain("#1E3A8A");
  expect(failures).toEqual([]);
});
