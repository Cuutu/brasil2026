export type Currency = "BRL" | "USD" | "ARS";

export interface Person {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amountBRL: number;
  paidBy: string; // person id
  category: "general" | "airbnb" | "vuelos" | "comida" | "transporte" | "otro";
  createdAt: string;
}

export interface ExchangeRates {
  USD: number;
  ARS: number;
  updatedAt: string;
}
