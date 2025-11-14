import type { Metadata } from "next";

import DemoPageClient from "./DemoPageClient";

export const metadata: Metadata = {
  title: "Varaa demo – Converto™",
  description:
    "Näytämme automaation käytännössä ja laskemme ROI:n datallasi. 20 min demopyyntö.",
};

export default function DemoPage() {
  return <DemoPageClient />;
}
