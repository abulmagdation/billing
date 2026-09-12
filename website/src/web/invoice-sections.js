export const chronological = (items) =>
  [...items].sort(
    (a, b) => (Date.parse(a.date) || 0) - (Date.parse(b.date) || 0),
  );
export function invoiceSections(invoice, defaultTitle = "") {
  const services = invoice.services || [];
  if (!invoice.sections?.length)
    return [
      { id: "general", title: defaultTitle, services: chronological(services) },
    ];
  const sections = invoice.sections.map((s) => ({
    ...s,
    services: chronological(services.filter((item) => item.sectionId === s.id)),
  }));
  const unassigned = services.filter(
    (item) => !invoice.sections.some((s) => s.id === item.sectionId),
  );
  if (unassigned.length)
    sections.push({
      id: "legacy",
      title: defaultTitle,
      services: chronological(unassigned),
    });
  return sections;
}
