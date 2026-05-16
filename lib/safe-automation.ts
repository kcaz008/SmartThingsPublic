export const disclosureTemplates = [
  {
    id: "neighborly_helper",
    name: "Neighborly helper",
    body: "Hi - sorry you are dealing with that. We are {business_name}, a local HVAC company, and we can help take a look if you still need someone. Happy to point you in the right direction either way.",
  },
  {
    id: "second_opinion",
    name: "Second opinion",
    body: "Getting a second opinion is smart before a major HVAC repair or replacement. {business_name} can review what you were told and explain options without pressure.",
  },
  {
    id: "maintenance_tip",
    name: "Light context",
    body: "It may help to note when the issue started and whether the system is cooling, heating, or making unusual noise. {business_name} can help if it keeps happening.",
  },
];

export const reviewQueueStages = [
  {
    label: "Draft created",
    description: "AI creates a suggested reply after a user-triggered scan.",
  },
  {
    label: "Human review",
    description: "A team member checks tone, context, and source rules.",
  },
  {
    label: "Manual action",
    description: "The user copies, ignores, or tracks the opportunity outcome.",
  },
];

export const auditEventExamples = [
  "scan_started",
  "scan_completed",
  "reply_copied",
  "marked_ignored",
  "marked_replied",
  "marked_booked",
  "marked_won",
];

export const crmFollowupExamples = [
  "Call homeowner after they replied by DM.",
  "Create estimate appointment in CRM.",
  "Send booked job details to dispatcher.",
];
