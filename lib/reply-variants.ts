export type ReplyVariant = {
  id: "company" | "personal" | "second_responder" | "soft_dm";
  personality: string;
  description: string;
  reply: string;
};

export function buildReplyVariants({
  companyName,
  phone,
  serviceType,
  urgency,
  town,
  secondResponderName,
  ctaPhoneRule,
  phoneSafeInPublic = true,
}: {
  companyName: string;
  phone: string;
  serviceType: string;
  urgency: string;
  town?: string;
  secondResponderName?: string;
  ctaPhoneRule?: string;
  phoneSafeInPublic?: boolean;
}): ReplyVariant[] {
  const location = town && town !== "Unknown" ? ` in ${town}` : "";
  const fastContext =
    urgency === "high"
      ? "Since it sounds urgent, I would not wait too long on it."
      : "It is worth getting checked before it turns into a bigger issue.";
  const shouldUsePhone =
    phone &&
    phoneSafeInPublic &&
    !["dm_only", "never_first_public", "no_cta_if_promo_sensitive"].includes(
      ctaPhoneRule ?? "",
    );
  const contact = shouldUsePhone
    ? ` Call or text ${phone}.`
    : " Send a message if you want help.";

  const variants: ReplyVariant[] = [
    {
      id: "company",
      personality: "Reply as company",
      description: "Clear public comment from the business brand.",
      reply: `Sorry you are dealing with that${location}. ${fastContext} A quick check of airflow, thermostat settings, and the outdoor unit can narrow it down. ${companyName} can help if you still need someone.${contact}`,
    },
    {
      id: "personal",
      personality: "Reply as team member",
      description: "Feels like a person helping, not a brand ad.",
      reply: `That sounds like a ${serviceType.toLowerCase()} issue worth diagnosing. If the system is running but not keeping up, the first checks are airflow, outdoor coil, and electrical/thermostat basics. Happy to help point you in the right direction.${contact}`,
    },
    {
      id: "second_responder",
      personality: "Second responder",
      description: "Use when a teammate already replied but a human follow-up helps.",
      reply: `${secondResponderName ?? "Another team member"} here. If you still have not gotten this sorted, I would keep the next step simple: confirm airflow, outdoor-unit operation, and whether the system is short-cycling. I can help narrow it down without piling on another sales pitch.${contact}`,
    },
    {
      id: "soft_dm",
      personality: "Soft DM option",
      description: "Best when the group dislikes promotional comments.",
      reply: `I would keep this simple: it may need a quick look rather than guessing in the thread. If you want, DM me the basic symptoms and I can point you in the right direction. ${companyName} is also reachable at ${phone || "our main number"}.`,
    },
  ];

  return variants.map((variant) => ({
    ...variant,
    reply: limitWords(variant.reply, 85),
  }));
}

function limitWords(value: string, maxWords: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  return words.length <= maxWords ? value : words.slice(0, maxWords).join(" ");
}
