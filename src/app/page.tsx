"use client";

import { useEffect, useState, useCallback } from "react";
import type { Person, Expense, ExchangeRates } from "@/types";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "airbnb", label: "Airbnb / Alojamiento" },
  { value: "vuelos", label: "Vuelos" },
  { value: "comida", label: "Comida" },
  { value: "transporte", label: "Transporte" },
  { value: "otro", label: "Otro" },
] as const;

const STORAGE_PERSONS = "brasil2026_persons";
const STORAGE_EXPENSES = "brasil2026_expenses";

function loadPersons(): Person[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(STORAGE_PERSONS);
    if (s) return JSON.parse(s);
  } catch {}
  return [{ id: "1", name: "Persona 1" }];
}

function loadExpenses(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(STORAGE_EXPENSES);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

function formatMoney(value: number, currency: "BRL" | "USD" | "ARS") {
  const symbols = { BRL: "R$", USD: "US$", ARS: "$" };
  return `${symbols[currency]} ${value.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Home() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [newPersonName, setNewPersonName] = useState("");
  const [newExpenseDesc, setNewExpenseDesc] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpensePaidBy, setNewExpensePaidBy] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense["category"]>("general");

  useEffect(() => {
    setPersons(loadPersons());
    setExpenses(loadExpenses());
  }, []);

  useEffect(() => {
    if (persons.length) localStorage.setItem(STORAGE_PERSONS, JSON.stringify(persons));
  }, [persons]);

  useEffect(() => {
    if (expenses.length) localStorage.setItem(STORAGE_EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

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
    const t = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(t);
  }, [fetchRates]);

  const addPerson = () => {
    const name = newPersonName.trim() || `Persona ${persons.length + 1}`;
    if (name) {
      setPersons((p) => [...p, { id: crypto.randomUUID(), name }]);
      setNewPersonName("");
    }
  };

  const removePerson = (id: string) => {
    if (persons.length <= 1) return;
    setPersons((p) => p.filter((x) => x.id !== id));
    setExpenses((e) => e.filter((x) => x.paidBy !== id));
  };

  const addExpense = () => {
    const amount = parseFloat(newExpenseAmount.replace(",", "."));
    if (!newExpenseDesc.trim() || isNaN(amount) || amount <= 0 || !newExpensePaidBy) return;
    setExpenses((e) => [
      ...e,
      {
        id: crypto.randomUUID(),
        description: newExpenseDesc.trim(),
        amountBRL: amount,
        paidBy: newExpensePaidBy,
        category: newExpenseCategory,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewExpenseDesc("");
    setNewExpenseAmount("");
  };

  const removeExpense = (id: string) => {
    setExpenses((e) => e.filter((x) => x.id !== id));
  };

  const totalBRL = expenses.reduce((s, e) => s + e.amountBRL, 0);
  const n = persons.length || 1;
  const perPersonBRL = totalBRL / n;

  const balance: Record<string, number> = {};
  persons.forEach((p) => (balance[p.id] = perPersonBRL));
  expenses.forEach((e) => {
    balance[e.paidBy] = (balance[e.paidBy] ?? 0) - e.amountBRL;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-teal-900 to-cyan-900 text-white">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Brasil 2026</h1>
          <p className="mt-1 text-emerald-200/90">Gastos del viaje</p>
        </header>

        {/* Tasas de cambio */}
        <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-2 text-sm font-semibold text-emerald-200">Conversión (1 BRL)</h2>
          {rates ? (
            <div className="flex flex-wrap gap-4 text-lg">
              <span>1 BRL = {formatMoney(rates.USD, "USD")}</span>
              <span>1 BRL = {formatMoney(rates.ARS, "ARS")}</span>
              <button
                type="button"
                onClick={fetchRates}
                className="text-sm text-emerald-300 underline hover:no-underline"
              >
                Actualizar
              </button>
            </div>
          ) : (
            <p className="text-amber-200">Cargando tasas...</p>
          )}
        </section>

        {/* Personas */}
        <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-emerald-200">Personas ({persons.length})</h2>
          <div className="flex flex-wrap gap-2">
            {persons.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-1 rounded-full bg-emerald-600/60 px-3 py-1 text-sm"
              >
                {p.name}
                <button
                  type="button"
                  onClick={() => removePerson(p.id)}
                  className="ml-1 rounded-full hover:bg-white/20"
                  aria-label="Quitar"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              placeholder="Nombre"
              value={newPersonName}
              onChange={(e) => setNewPersonName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPerson()}
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={addPerson}
              className="rounded-lg bg-emerald-500 px-4 py-2 font-medium hover:bg-emerald-600"
            >
              Agregar
            </button>
          </div>
        </section>

        {/* Nuevo gasto */}
        <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-emerald-200">Nuevo gasto</h2>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Descripción (ej: Airbnb, cena)"
              value={newExpenseDesc}
              onChange={(e) => setNewExpenseDesc(e.target.value)}
              className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input
                type="text"
                inputMode="decimal"
                placeholder="Monto (BRL)"
                value={newExpenseAmount}
                onChange={(e) => setNewExpenseAmount(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 placeholder:text-white/50 focus:border-emerald-400 focus:outline-none"
              />
              <select
                value={newExpensePaidBy}
                onChange={(e) => setNewExpensePaidBy(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              >
                <option value="">Quién pagó</option>
                {persons.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value as Expense["category"])}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 focus:border-emerald-400 focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addExpense}
                className="rounded-lg bg-emerald-500 font-medium hover:bg-emerald-600"
              >
                Agregar gasto
              </button>
            </div>
          </div>
        </section>

        {/* Resumen totales */}
        <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-2 text-sm font-semibold text-emerald-200">Total y por persona</h2>
          <div className="space-y-1 text-lg">
            <p>
              Total: <strong>{formatMoney(totalBRL, "BRL")}</strong>
              {rates && (
                <>
                  {" "}
                  ≈ {formatMoney(totalBRL * rates.USD, "USD")} / {formatMoney(totalBRL * rates.ARS, "ARS")}
                </>
              )}
            </p>
            <p>
              Por persona ({n}): <strong>{formatMoney(perPersonBRL, "BRL")}</strong>
              {rates && (
                <>
                  {" "}
                  ≈ {formatMoney(perPersonBRL * rates.USD, "USD")} / {formatMoney(perPersonBRL * rates.ARS, "ARS")}
                </>
              )}
            </p>
          </div>
        </section>

        {/* Quién debe a quién (simplificado) */}
        {persons.length > 0 && (
          <section className="mb-6 rounded-2xl bg-white/10 p-4 backdrop-blur">
            <h2 className="mb-2 text-sm font-semibold text-emerald-200">Balance por persona</h2>
            <ul className="space-y-1">
              {persons.map((p) => {
                const b = balance[p.id] ?? 0;
                return (
                  <li key={p.id} className="flex justify-between">
                    <span>{p.name}</span>
                    <span className={b > 0 ? "text-amber-300" : b < 0 ? "text-emerald-300" : ""}>
                      {b > 0 ? "recibe " : b < 0 ? "debe " : "en paz "}
                      {formatMoney(Math.abs(b), "BRL")}
                      {rates && b !== 0 && (
                        <span className="ml-1 text-sm opacity-90">
                          ≈ {formatMoney(Math.abs(b) * rates.USD, "USD")}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Lista de gastos */}
        <section className="rounded-2xl bg-white/10 p-4 backdrop-blur">
          <h2 className="mb-3 text-sm font-semibold text-emerald-200">Gastos ({expenses.length})</h2>
          {expenses.length === 0 ? (
            <p className="text-white/70">Aún no hay gastos. Agregá el primero arriba.</p>
          ) : (
            <ul className="space-y-2">
              {[...expenses].reverse().map((e) => {
                const paidBy = persons.find((p) => p.id === e.paidBy);
                const cat = CATEGORIES.find((c) => c.value === e.category);
                return (
                  <li
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2"
                  >
                    <div>
                      <span className="font-medium">{e.description}</span>
                      <span className="ml-2 text-sm text-white/70">
                        {cat?.label} · {paidBy?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{formatMoney(e.amountBRL, "BRL")}</span>
                      {rates && (
                        <span className="text-sm text-white/70">
                          ≈ {formatMoney(e.amountBRL * rates.USD, "USD")}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExpense(e.id)}
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
          Los datos se guardan en tu navegador. Tasas de cambio vía Frankfurter API.
        </footer>
      </div>
    </div>
  );
}
