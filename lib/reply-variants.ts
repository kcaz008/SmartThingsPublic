export type ReplyVariant = {
  id: "neighborly" | "expert" | "soft_dm";
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
}: {
  companyName: string;
  phone: string;
  serviceType: string;
  urgency: string;
  town?: string;
}): ReplyVariant[] {
  const location = town && town !== "Unknown" ? ` in ${town}` : "";
  const fastContext =
    urgency === "high"
      ? "Since it sounds urgent, I would not wait too long on it."
      : "It is worth getting checked before it turns into a bigger issue.";
  const contact = phone
    ? ` Call or text ${phone}.`
    : " Send a message if you want help.";

  const variants: ReplyVariant[] = [
    {
      id: "neighborly",
      personality: "Helpful neighbor",
      description: "Warm, casual, low-pressure public comment.",
      reply: `Sorry you are dealing with that${location}. ${fastContext} A quick check of airflow, thermostat settings, and the outdoor unit can narrow it down. ${companyName} can help if you still need someone.${contact}`,
    },
    {
      id: "expert",
      personality: "Experienced tech",
      description: "More practical detail, still human and not salesy.",
      reply: `That sounds like a ${serviceType.toLowerCase()} issue worth diagnosing. If the system is running but not keeping up, the first checks are airflow, outdoor coil, and electrical/thermostat basics. ${companyName} services this area.${contact}`,
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
