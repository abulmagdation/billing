import { test, expect } from "@playwright/test";
test("patient editing, sections and printable images", async ({ page }) => {
  const patient = { _id: "p1", name: "Test patient", type: "patient" };
  let saved;
  await page.addInitScript(() => localStorage.setItem("app_language", "en"));
  await page.route("**/api/**", async (route) => {
    const req = route.request(),
      path = new URL(req.url()).pathname;
    let data = [];
    if (path.endsWith("/auth/login")) data = { token: "test", userId: "u1" };
    if (path === "/api/patients") data = [patient];
    if (path === "/api/patients/p1") {
      Object.assign(patient, req.postDataJSON());
      data = patient;
    }
    if (path === "/api/invoices" && req.method() === "POST") {
      saved = req.postDataJSON();
      data = { ...saved, _id: "i1" };
    }
    await route.fulfill({ json: data });
  });
  await page.goto("/");
  await page.getByLabel("Username", { exact: true }).fill("tester");
  await page.getByLabel("Password", { exact: true }).fill("test");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.locator(".patient-card").click();
  await page.getByRole("button", { name: "Edit patient details" }).click();
  await page.getByLabel("Full name").fill("Updated patient");
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("h1")).toHaveText("Updated patient");
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  await page.getByLabel("Section title 1").fill("Consultations");
  const add = async (name, day) => {
    await page.getByLabel("Service / item name").fill(name);
    await page.getByLabel("Unit price").fill("10");
    await page.locator(".service-entry input[type=date]").fill(day);
    await page.getByRole("button", { name: "Add item", exact: true }).click();
  };
  await add("Later visit", "2026-09-12");
  await add("Earlier visit", "2026-09-01");
  await page.getByRole("button", { name: "Add section", exact: true }).click();
  await page.getByLabel("Section title 2").fill("Equipment");
  await add("Rental", "2026-08-01");
  await expect(page.locator(".section-preview").first()).toContainText(
    /Earlier visit[\s\S]*Later visit/,
  );
  await page.getByRole("button", { name: "Save", exact: true }).click();
  await expect(page.locator("dialog")).toHaveCount(0);
  expect(saved.sections.map((s) => s.title)).toEqual([
    "Consultations",
    "Equipment",
  ]);
  expect(saved.services.map((s) => s.name)).toEqual([
    "Earlier visit",
    "Later visit",
    "Rental",
  ]);
  expect(saved.total).toBe(30);
  for (const lang of ["ar", "en"]) {
    const html = await page.evaluate(
      async ({ saved, lang }) => {
        const { invoiceHTML } = await import("/src/web/print.js");
        return invoiceHTML(saved, "Updated patient", "patient", lang);
      },
      { saved, lang },
    );
    await page.setViewportSize({ width: 696, height: 1017 });
    await page.setContent(html);
    await page.emulateMedia({ media: "print" });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map((img) => img.decode()));
    });
    expect(await page.locator("img").count()).toBe(2);
    expect(
      await page
        .locator("img")
        .evaluateAll((images) => images.every((img) => img.naturalWidth > 0)),
    ).toBe(true);
    await expect(page.locator('.brand-logo')).toBeVisible();
    await expect(page.locator('.stamp-viewport')).toBeVisible();
    expect(await page.locator('.brand-logo').evaluate((img) => img.naturalWidth)).toBe(3508);
    expect(await page.locator(".date-group").first().innerText()).toContain(
      "Earlier visit",
    );
    await page.screenshot({
      path: `test-results/invoice-sections-${lang}.png`,
      fullPage: true,
    });
  }
});
