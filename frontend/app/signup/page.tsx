"use client";

// Note: metadata export is not allowed in client components
// This would need to be moved to a layout or parent server component

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { getAuthHeaders } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [businessId, setBusinessId] = useState("");
  const [plan, setPlan] = useState("business");
  const [goal, setGoal] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1) Create Supabase user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            company,
            business_id: businessId,
            plan,
            goal,
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // 2) Call backend onboarding endpoint to create tenant + role context
      try {
        const headers = await getAuthHeaders();
        const apiBase =
          process.env.NEXT_PUBLIC_API_BASE || process.env.NEXT_PUBLIC_API_URL || "";
        const url = apiBase
          ? `${apiBase.replace(/\/$/, "")}/api/auth/onboard`
          : "/api/auth/onboard";

        await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...headers,
          },
          body: JSON.stringify({
            name,
            email,
            company,
            business_id: businessId,
            plan,
            goal,
          }),
        });
      } catch (onboardError) {
        // Onboarding failure should not block login; log to console for now.
        console.warn("Onboarding call failed", onboardError);
      }

      // 3) Redirect to dashboard after successful sign up
      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message || "Rekisteröityminen epäonnistui");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <section className="bg-slate-50/50">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight">
              Aloita ilmainen 30 päivän kokeilu
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Ei luottokorttia. Ei sitoutumista. Käyttöönotto 15 minuutissa.
            </p>
          </div>

          <div className="mt-12 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Nimi *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Sähköposti *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Yritys *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="businessId"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Y-tunnus
                  </label>
                  <input
                    type="text"
                    id="businessId"
                    name="businessId"
                    placeholder="1234567-8"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="plan"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Paketti
                  </label>
                  <select
                    id="plan"
                    name="plan"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="starter">Starter (149 €/kk)</option>
                    <option value="business">Business (299 €/kk)</option>
                    <option value="professional">
                      Professional (499 €/kk)
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Salasana *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Vähintään 8 merkkiä"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="goal"
                  className="block text-sm font-medium text-slate-700"
                >
                  Tavoite (valinnainen)
                </label>
                <textarea
                  id="goal"
                  name="goal"
                  rows={3}
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="Mitä haluatte automatisoida? Kuinka monta dokumenttia käsittelette kuukaudessa?"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 px-5 py-3 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Luodaan tiliä..." : "Aloita ilmainen kokeilu"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Rekisteröitymällä hyväksyt{" "}
                <Link
                  href="/legal/privacy"
                  className="text-blue-600 hover:underline"
                >
                  tietosuojakäytännön
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-600">
              Kysymyksiä?{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Ota yhteyttä
              </Link>{" "}
              tai{" "}
              <Link href="/demo" className="text-blue-600 hover:underline">
                varaa demo
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
