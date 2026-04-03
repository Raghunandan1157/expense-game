import { DailyData } from "./types";

// Simple linear regression for spending prediction
export function predictNextValues(data: DailyData[], count: number): DailyData[] {
  if (data.length < 2) return [];

  const n = data.length;
  const xs = data.map((_, i) => i);
  const ys = data.map((d) => d.total);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions: DailyData[] = [];
  const lastDate = new Date(data[data.length - 1].date);

  for (let i = 1; i <= count; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + i);
    const predicted = Math.max(0, Math.round(slope * (n - 1 + i) + intercept));
    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      total: predicted,
      car: 0,
      phone: 0,
      laptop: 0,
      food: 0,
    });
  }

  return predictions;
}

export function getWeeklyPrediction(weeklyData: DailyData[], count: number): DailyData[] {
  if (weeklyData.length < 2) return [];

  const n = weeklyData.length;
  const xs = weeklyData.map((_, i) => i);
  const ys = weeklyData.map((d) => d.total);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions: DailyData[] = [];
  const lastDate = new Date(weeklyData[weeklyData.length - 1].date);

  for (let i = 1; i <= count; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(nextDate.getDate() + 7 * i);
    const predicted = Math.max(0, Math.round(slope * (n - 1 + i) + intercept));
    predictions.push({
      date: nextDate.toISOString().split("T")[0],
      total: predicted,
      car: 0,
      phone: 0,
      laptop: 0,
      food: 0,
    });
  }

  return predictions;
}

export function getMonthlyPrediction(monthlyData: DailyData[], count: number): DailyData[] {
  if (monthlyData.length < 2) return [];

  const n = monthlyData.length;
  const xs = monthlyData.map((_, i) => i);
  const ys = monthlyData.map((d) => d.total);

  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((a, x, i) => a + x * ys[i], 0);
  const sumX2 = xs.reduce((a, x) => a + x * x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const predictions: DailyData[] = [];
  const lastDate = new Date(monthlyData[monthlyData.length - 1].date + "-01");

  for (let i = 1; i <= count; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setMonth(nextDate.getMonth() + i);
    const key = nextDate.toISOString().slice(0, 7);
    const predicted = Math.max(0, Math.round(slope * (n - 1 + i) + intercept));
    predictions.push({
      date: key,
      total: predicted,
      car: 0,
      phone: 0,
      laptop: 0,
      food: 0,
    });
  }

  return predictions;
}
