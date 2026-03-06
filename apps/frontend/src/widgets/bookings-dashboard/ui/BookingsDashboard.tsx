"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { Users, CheckCircle2, XCircle, Star } from "lucide-react";
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

const MONTHS_SHORT = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
];

function getPeriodCutoff(period: Period): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (period === "7d") {
    const d = new Date(today);
    d.setDate(today.getDate() - 6);
    return d;
  }
  if (period === "30d") {
    const d = new Date(today);
    d.setDate(today.getDate() - 29);
    return d;
  }
  const d = new Date(today);
  d.setDate(today.getDate() - 12 * 7);
  return d;
}

function buildChartData(
  bookings: BookingRecord[],
  period: Period,
): { date: string; bookings: number }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period === "7d" || period === "30d") {
    const days = period === "7d" ? 7 : 30;
    const counts: Record<string, number> = {};
    for (const b of bookings) {
      if (b.rawDate) counts[b.rawDate] = (counts[b.rawDate] ?? 0) + 1;
    }
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (days - 1) + i);
      const key = d.toISOString().slice(0, 10);
      return {
        date: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
        bookings: counts[key] ?? 0,
      };
    });
  }

  // 3m — 13 weekly buckets
  const weekCounts: number[] = Array(13).fill(0);
  for (const b of bookings) {
    if (!b.rawDate) continue;
    const d = new Date(b.rawDate);
    const diffDays = Math.floor((today.getTime() - d.getTime()) / 86400000);
    const weekIdx = 12 - Math.floor(diffDays / 7);
    if (weekIdx >= 0 && weekIdx < 13) weekCounts[weekIdx]++;
  }
  return Array.from({ length: 13 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (12 - i) * 7);
    return {
      date: `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`,
      bookings: weekCounts[i],
    };
  });
}

type Props = {
  bookings: BookingRecord[];
};

export function BookingsDashboard({ bookings }: Props) {
  const [period, setPeriod] = useState<Period>("7d");

  const cutoff = getPeriodCutoff(period);
  const inPeriod = bookings.filter(
    (b) => b.rawDate && new Date(b.rawDate) >= cutoff,
  );

  const total = inPeriod.length;
  const confirmed = inPeriod.filter((b) => b.status === "confirmed").length;
  const cancelled = inPeriod.filter((b) => b.status === "cancelled").length;

  const eventCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    if (b.eventName && b.eventName !== "—")
      acc[b.eventName] = (acc[b.eventName] ?? 0) + 1;
    return acc;
  }, {});
  const topEventEntry = Object.entries(eventCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const topEvent = topEventEntry?.[0] ?? "—";
  const topEventCount = topEventEntry?.[1] ?? 0;

  const chartData = buildChartData(inPeriod, period);

  const periodLabel =
    period === "7d" ? "за 7 дней" : period === "30d" ? "за 30 дней" : "за 3 месяца";

  const stats = [
    {
      label: "Всего заявок",
      value: total,
      sub: periodLabel,
      icon: Users,
    },
    {
      label: "Подтверждено",
      value: confirmed,
      sub: total > 0 ? `${Math.round((confirmed / total) * 100)}% от заявок` : "—",
      icon: CheckCircle2,
    },
    {
      label: "Отменено",
      value: cancelled,
      sub: total > 0 ? `${Math.round((cancelled / total) * 100)}% от заявок` : "—",
      icon: XCircle,
    },
    {
      label: "Топ событие",
      value: topEvent,
      sub: `${topEventCount} бронирований`,
      icon: Star,
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
