export const cfg = {
  abHeadlineB: process.env.NEXT_PUBLIC_AB_HEADLINE === "B",
  resendFrom: process.env.RESEND_FROM ?? "Converto <noreply@converto.fi>",
  resendTo: process.env.RESEND_TO ?? "sales@converto.fi",
  notionDemoDbId: process.env.NOTION_DEMO_DB_ID ?? "",
};

