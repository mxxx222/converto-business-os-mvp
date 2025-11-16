import { Client } from "@notionhq/client";

export const notion = process.env.NOTION_TOKEN
  ? new Client({ auth: process.env.NOTION_TOKEN })
  : null;

export async function createDemoLead(
  dbId: string,
  p: {
    name?: string;
    email: string;
    company?: string;
    phone?: string;
    notes?: string;
  }
) {
  if (!notion) return { ok: false, error: "NOTION_TOKEN puuttuu" };
  if (!dbId) return { ok: false, error: "NOTION_DEMO_DB_ID puuttuu" };

  const props: Record<string, unknown> = {
    Nimi: { title: [{ text: { content: p.name || p.email } }] },
    Sähköposti: { email: p.email },
  };

  if (p.company) {
    props.Yritys = { rich_text: [{ text: { content: p.company } }] };
  }
  if (p.phone) {
    props.Puhelin = { phone_number: p.phone };
  }
  if (p.notes) {
    props.Kuvaus = { rich_text: [{ text: { content: p.notes } }] };
  }

  const page = await notion.pages.create({
    parent: { database_id: dbId },
    properties: props as any, // Type assertion for Notion API compatibility
  });

  return { ok: true, id: (page as any).id };
}



