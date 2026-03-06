"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/ui/chart";
import type { BookingRecord } from "@/widgets/bookings-table";

type Period = "7d" | "30d" | "3m";

const CHART_COLOR = "#498BD7";

function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generateChartData(
  period: Period,
): { date: string; bookings: number }[] {
  const MONTHS = [
    "янв",
    "фев",
    "мар",
    "апр",
    "май",
    "июн",
    "июл",
    "авг",
    "сен",
    "окт",
    "ноя",
    "дек",
  ];
  const today = new Date(2026, 2, 5);

  if (period === "7d") {
    const rand = seededRand(42);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 6 + i);
      return {
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        bookings: Math.round(2 + rand() * 10),
      };
    });
  }

  if (period === "30d") {
    const rand = seededRand(42);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - 29 + i);
      return {
        date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
        bookings: Math.round(2 + rand() * 12),
      };
    });
  }

  // 3m: weekly points (~13 weeks)
  const rand = seededRand(42);
  return Array.from({ length: 13 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 12 * 7 + i * 7);
    return {
      date: `${d.getDate()} ${MONTHS[d.getMonth()]}`,
      bookings: Math.round(15 + rand() * 40),
    };
  });
}

type Props = {
  bookings: BookingRecord[];
};

export function BookingsDashboard({ bookings }: Props) {
  const [period, setPeriod] = useState<Period>("7d");

  const chartData = generateChartData(period);
  const total = chartData.reduce((s, d) => s + d.bookings, 0);
  const confirmed = Math.round(total * 0.65);
  const cancelled = Math.round(total * 0.12);

  const eventCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    acc[b.eventName] = (acc[b.eventName] ?? 0) + 1;
    return acc;
  }, {});
  const topEventEntry = Object.entries(eventCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topEvent = topEventEntry?.[0] ?? "—";
  const topEventCount = topEventEntry?.[1] ?? 0;

  const stats = [
    {
      label: "Всего заявок",
      value: total,
      sub:
        period === "7d"
          ? "за 7 дней"
          : period === "30d"
            ? "за 30 дней"
            : "за 3 месяца",
      icon: Users,
      trend: +12,
    },
    {
      label: "Подтверждено",
      value: confirmed,
      sub: `${Math.round((confirmed / total) * 100)}% от заявок`,
      icon: CheckCircle2,
      trend: +5,
    },
    {
      label: "Отменено",
      value: cancelled,
      sub: `${Math.round((cancelled / total) * 100)}% от заявок`,
      icon: XCircle,
      trend: -3,
    },
    {
      label: "Топ событие",
      value: topEvent,
      sub: `${topEventCount} бронирований`,
      icon: Star,
      trend: null,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-black">
            <CardHeader className="pb-0 -pt-4 px-4">
              <div className="flex items-center justify-between">
                <span className="text-lg text-muted-foreground">{s.label}</span>
                <s.icon className="size-5 text-muted-foreground shrink-0" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pt-0 -mt-4 -pb-4 space-y-1">
              <div className="text-3xl font-bold truncate">{s.value}</div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-lg text-muted-foreground truncate">
                  {s.sub}
                </span>
                {s.trend !== null && (
                  <span
                    className={`flex items-center text-lg font-medium shrink-0 ${
                      s.trend > 0 ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {s.trend > 0 ? (
                      <TrendingUp className="size-4 mr-0.5" />
                    ) : (
                      <TrendingDown className="size-4 mr-0.5" />
                    )}
                    {s.trend > 0 ? "+" : ""}
                    {s.trend}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-black">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <CardTitle className="text-xl">Динамика заявок</CardTitle>
              <p className="text-lg text-muted-foreground mt-0.5">
                {period === "7d"
                  ? "За последние 7 дней"
                  : period === "30d"
                    ? "За последние 30 дней"
                    : "За последние 3 месяца"}
              </p>
            </div>
            <div className="flex gap-1">
              {(["7d", "30d", "3m"] as Period[]).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  className={`text-lg h-11 px-4 ${period !== p ? "border-black" : ""}`}
                  onClick={() => setPeriod(p)}
                >
                  {p === "7d" ? "7 дней" : p === "30d" ? "30 дней" : "3 месяца"}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{ bookings: { label: "Заявки", color: CHART_COLOR } }}
            className="h-50 w-full"
          >
            <AreaChart
              data={chartData}
              margin={{ left: -20, right: 0, top: 4, bottom: 0 }}
            >
              <defs>
                <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={CHART_COLOR}
                    stopOpacity={0.18}
                  />
                  <stop offset="95%" stopColor={CHART_COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval="preserveStartEnd"
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="bookings"
                stroke={CHART_COLOR}
                strokeWidth={2}
                fill="url(#bookingsGrad)"
                dot={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
