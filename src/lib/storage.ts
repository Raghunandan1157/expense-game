import { ExpenseEntry, Category, CATEGORIES, DailyData } from "./types";

const STORAGE_KEY = "expense-game-data";

export function getEntries(): ExpenseEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveEntries(entries: ExpenseEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

export function getCategoryUsagesToday(category: Category): number {
  const today = getTodayString();
  return getEntries().filter(
    (e) => e.category === category && e.timestamp.startsWith(today)
  ).length;
}

export function canUseCategory(category: Category): boolean {
  const limit = CATEGORIES[category].limit;
  if (limit === null) return true;
  return getCategoryUsagesToday(category) < limit;
}

export function addExpense(category: Category): ExpenseEntry | null {
  if (!canUseCategory(category)) return null;
  const entry: ExpenseEntry = {
    id: crypto.randomUUID(),
    category,
    cost: CATEGORIES[category].cost,
    timestamp: new Date().toISOString(),
  };
  const entries = getEntries();
  entries.push(entry);
  saveEntries(entries);
  return entry;
}

export function getDailyTotals(): DailyData[] {
  const entries = getEntries();
  const map = new Map<string, DailyData>();

  for (const e of entries) {
    const date = e.timestamp.split("T")[0];
    if (!map.has(date)) {
      map.set(date, { date, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const d = map.get(date)!;
    d[e.category] += e.cost;
    d.total += e.cost;
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getWeeklyTotals(): DailyData[] {
  const daily = getDailyTotals();
  if (daily.length === 0) return [];

  const weeks = new Map<string, DailyData>();
  for (const d of daily) {
    const dt = new Date(d.date);
    const weekStart = new Date(dt);
    weekStart.setDate(dt.getDate() - dt.getDay());
    const key = weekStart.toISOString().split("T")[0];
    if (!weeks.has(key)) {
      weeks.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const w = weeks.get(key)!;
    w.total += d.total;
    w.car += d.car;
    w.phone += d.phone;
    w.laptop += d.laptop;
    w.food += d.food;
  }

  return Array.from(weeks.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMonthlyTotals(): DailyData[] {
  const daily = getDailyTotals();
  if (daily.length === 0) return [];

  const months = new Map<string, DailyData>();
  for (const d of daily) {
    const key = d.date.slice(0, 7); // YYYY-MM
    if (!months.has(key)) {
      months.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const m = months.get(key)!;
    m.total += d.total;
    m.car += d.car;
    m.phone += d.phone;
    m.laptop += d.laptop;
    m.food += d.food;
  }

  return Array.from(months.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getMinuteTotals(): DailyData[] {
  const entries = getEntries();
  const map = new Map<string, DailyData>();

  for (const e of entries) {
    const dt = new Date(e.timestamp);
    const key = `${dt.toISOString().split("T")[0]} ${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
    if (!map.has(key)) {
      map.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const d = map.get(key)!;
    d[e.category] += e.cost;
    d.total += e.cost;
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getHourlyTotals(): DailyData[] {
  const entries = getEntries();
  const map = new Map<string, DailyData>();

  for (const e of entries) {
    const dt = new Date(e.timestamp);
    const key = `${dt.toISOString().split("T")[0]} ${String(dt.getHours()).padStart(2, "0")}:00`;
    if (!map.has(key)) {
      map.set(key, { date: key, total: 0, car: 0, phone: 0, laptop: 0, food: 0 });
    }
    const d = map.get(key)!;
    d[e.category] += e.cost;
    d.total += e.cost;
  }

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getTodayTotal(): number {
  const today = getTodayString();
  return getEntries()
    .filter((e) => e.timestamp.startsWith(today))
    .reduce((sum, e) => sum + e.cost, 0);
}
