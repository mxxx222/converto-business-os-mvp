import { NextResponse, type NextRequest } from "next/server";

export function GET(req: NextRequest) {
  const url = new URL(req.url);
  const title = decodeURIComponent(url.searchParams.get("title") || "Converto");
  const desc = decodeURIComponent(url.searchParams.get("desc") || "");
  const loc = decodeURIComponent(url.searchParams.get("loc") || "Online");
  const durMin = Number(url.searchParams.get("dur") || 20);

  // Alku nyt + 2 päivää klo 10:00 paikallista aikaa (FI)
  const now = new Date();
  const start = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
  start.setHours(10, 0, 0, 0);
  const end = new Date(start.getTime() + durMin * 60 * 1000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Converto//Demo//FI
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${Math.random().toString(36).slice(2)}@converto.fi
DTSTAMP:${fmt(now)}
DTSTART:${fmt(start)}
DTEND:${fmt(end)}
SUMMARY:${title}
DESCRIPTION:${desc}
LOCATION:${loc}
END:VEVENT
END:VCALENDAR`;

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="converto-${title
        .toLowerCase()
        .replace(/\s+/g, "-")}.ics"`,
    },
  });
}


