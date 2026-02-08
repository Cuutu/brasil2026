"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Person, ImportantItem, ExchangeRates } from "@/types";

const STORAGE_PERSONS = "brasil2026_persons";
const STORAGE_IMPORTANT = "brasil2026_important";

function loadPersons(): Person[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(STORAGE_PERSONS);
    if (s) return JSON.parse(s);
  } catch {}
  return [{ id: "1", name: "Persona 1" }];
}

function loadImportant(): ImportantItem[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(STORAGE_IMPORTANT);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

function formatMoney(value: number, currency: "BRL" | "USD" | "ARS") {
  const symbols = { BRL: "R$", USD: "US$", ARS: "$" };
  return `${symbols[currency]} ${value.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CosasImportantesPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [items, setItems] = useState<ImportantItem[]>([]);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [useLocalOnly, setUseLocalOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState("");
  const [information, setInformation] = useState("");
  const [amount, setAmount] = useState("");
  const [addedBy, setAddedBy] = useState("");

  const fetchFromApi = useCallback(async () => {
    try {
      const [pRes, iRes] = await Promise.all([
        fetch("/api/persons"),
        fetch("/api/important"),
      ]);
      if (pRes.status === 503 || iRes.status === 503) {
        setUseLocalOnly(true);
        setPersons(loadPersons());
        setItems(loadImportant());
        return;
      }
      if (pRes.ok && iRes.ok) {
        const pData = await pRes.json();
        const iData = await iRes.json();
        setPersons(Array.isArray(pData) ? pData : []);
        setItems(Array.isArray(iData) ? iData : []);
        setUseLocalOnly(false);
        return;
      }
    } catch {
      /* fall through */
    }
    setUseLocalOnly(true);
    setPersons(loadPersons());
    setItems(loadImportant());
  }, []);

  useEffect(() => {
    fetchFromApi().finally(() => setLoading(false));
  }, [fetchFromApi]);

  useEffect(() => {
    if (useLocalOnly) localStorage.setItem(STORAGE_IMPORTANT, JSON.stringify(items));
  }, [useLocalOnly, items]);

  const fetchRates = useCallback(async () => {
    try {
      const res = await fetch("/api/exchange");
      if (res.ok) {
        const data = await res.json();
        setRates(data);
      }
    } catch {
      setRates(null);
    }
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const addItem = async () => {
    if (!information.trim()) return;
    const num = amount.trim() ? parseFloat(amount.replace(",", ".")) : NaN;
    const amountBRL = amount.trim() ? (isNaN(num) || num <= 0 ? null : num) : null;
    if (amount.trim() && amountBRL === null) return;
    const newOne: ImportantItem = {
      id: crypto.randomUUID(),
      link: link.trim(),
      information: information.trim(),
      amountBRL,
      addedBy: addedBy || (persons[0]?.id ?? ""),
      createdAt: new Date().toISOString(),
    };
    if (useLocalOnly) {
      setItems((prev) => [...prev, newOne]);
      setLink("");
      setInformation("");
      setAmount("");
      return;
    }
    try {
      const res = await fetch("/api/important", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: newOne.link,
          information: newOne.information,
          amountBRL: newOne.amountBRL,
          addedBy: newOne.addedBy,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setItems((prev) => [{ id: data.id, link: data.link, information: data.information, amountBRL: data.amountBRL, addedBy: data.addedBy, createdAt: data.createdAt }, ...prev]);
        setLink("");
        setInformation("");
        setAmount("");
      }
    } catch {
      setUseLocalOnly(true);
      setItems((prev) => [...prev, newOne]);
      setLink("");
      setInformation("");
      setAmount("");
    }
  };

  const removeItem = async (id: string) => {
    if (useLocalOnly) {
      setItems((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    try {
      const res = await fetch(`/api/important?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      if (res.ok) setItems((prev) => prev.filter((x) => x.id !== id));
      else setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <nav className="mb-4 flex justify-center gap-4 text-sm">
          <Link href="/" className="text-white/70 hover:text-white">
            Gastos
          </Link>
          <Link href="/cosas-importantes" className="font-medium text-emerald-300 underline">
            Cosas importantes
          </Link>
        </nav>
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Cosas importantes</h1>
          <p className="mt-1 text-emerald-200/90">Links, datos y precios de referencia</p>
        </header>

        {useLocalOnly && (
          <div className="mb-4 rounded-xl bg-amber-500/20 border border-amber-400/50 px-4 py-3 text-amber-100 text-sm">
            <strong>Modo local:</strong> los datos solo se guardan en este dispositivo. Para compartir con el grupo, configurá Supabase (ver README).
          </div>
        )}

        {loading && <p className="mb-4 text-center text-white/70">Cargando…</p>}

        {rates && (
          <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <h2 className="mb-2 text-sm font-semibold text-emerald-200">Conversión (1 BRL)</h2>
            <div className="flex flex-wrap gap-4 text-lg">
              <span>1 BRL = {formatMoney(rates.USD, "USD")}</span>
              <span>1 BRL = {formatMoney(rates.ARS, "ARS")}</span>
            </div>
          </section>
        )}

        <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-emerald-200">Agregar</h2>
          <div className="space-y-3">
            <input
              type="url"
              placeholder="Link (opcional)"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
            />
            <textarea
              placeholder="Información *"
              value={information}
              onChange={(e) => setInformation(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 placeholder:text-white/50 focus:border-emerald-400 focus:outline-none resize-none"
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Cuánto vale en BRL (opcional)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
              />
              <select
                value={addedBy}
                onChange={(e) => setAddedBy(e.target.value)}
                className="rounded-lg border border-white/20 bg-white px-3 py-2 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="">Quién lo sube</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={addItem}
              className="w-full rounded-lg bg-emerald-500 py-2 font-medium hover:bg-emerald-600 sm:w-auto sm:px-6"
            >
              Agregar
            </button>
          </div>
        </section>

        <section className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-emerald-200">Listado ({items.length})</h2>
          {items.length === 0 ? (
            <p className="text-white/70">Aún no hay nada. Agregá el primer ítem arriba.</p>
          ) : (
            <ul className="space-y-4">
              {[...items].reverse().map((item) => {
                const who = persons.find((p) => p.id === item.addedBy);
                return (
                  <li
                    key={item.id}
                    className="rounded-lg bg-white/5 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-300 underline break-all hover:no-underline"
                          >
                            {item.link}
                          </a>
                        ) : null}
                        <p className="mt-1 font-medium text-white">{item.information}</p>
                        <p className="mt-1 text-sm text-white/70">
                          {who ? `Subido por ${who.name}` : "—"}
                        </p>
                        {item.amountBRL != null && (
                          <p className="mt-1 text-sm">
                            <span className="text-white/90">
                              {formatMoney(item.amountBRL, "BRL")}
                            </span>
                            {rates && (
                              <>
                                {" "}
                                ≈ {formatMoney(item.amountBRL * rates.USD, "USD")} /{" "}
                                {formatMoney(item.amountBRL * rates.ARS, "ARS")}
                              </>
                            )}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="rounded p-1 text-red-300 hover:bg-white/10"
                        aria-label="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <footer className="mt-8 text-center text-sm text-white/60">
          {useLocalOnly ? "Datos en este navegador." : "Datos compartidos en la nube."}
        </footer>
      </div>
    </div>
  );
}
