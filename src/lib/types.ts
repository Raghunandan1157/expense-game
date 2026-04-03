export type Category = "car" | "phone" | "laptop" | "food";

export interface ExpenseEntry {
  id: string;
  category: Category;
  cost: number;
  timestamp: string; // ISO string
}

export interface DailyData {
  date: string; // YYYY-MM-DD
  total: number;
  car: number;
  phone: number;
  laptop: number;
  food: number;
}

export const CATEGORIES: Record<
  Category,
  { label: string; cost: number; emoji: string; limit: number | null }
> = {
  car: { label: "Car", cost: 50, emoji: "🚗", limit: 1 },
  phone: { label: "Phone", cost: 10, emoji: "📱", limit: 1 },
  laptop: { label: "Laptop", cost: 20, emoji: "💻", limit: 1 },
  food: { label: "Eat / Drink", cost: 1, emoji: "🍔", limit: null },
};
