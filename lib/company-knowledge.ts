import type { Business } from "@/lib/types";

export function formatCompanyKnowledgeForAi(business: Business) {
  return [
    `Default business: ${business.name}`,
    `Phone: ${business.phone}`,
    `Service areas: ${business.serviceArea}`,
    business.servicesOffered ? `Services offered: ${business.servicesOffered}` : "",
    business.emergencyAvailability
      ? `Emergency availability: ${business.emergencyAvailability}`
      : "",
    business.brandsServiced ? `Brands serviced: ${business.brandsServiced}` : "",
    business.financingOptions
      ? `Financing options: ${business.financingOptions}`
      : "",
    business.warrantyNotes ? `Warranty notes: ${business.warrantyNotes}` : "",
    business.preferredTone ? `Preferred tone: ${business.preferredTone}` : "",
    business.phrasesToAvoid ? `Phrases to avoid: ${business.phrasesToAvoid}` : "",
    `CTA phone rule: ${business.ctaPhoneRule}`,
    business.trackingPhone ? `Tracking phone: ${business.trackingPhone}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
