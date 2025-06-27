'use client';

import { TrendingUp } from "lucide-react";
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TrendsChartProps {
  data: {
    labels: string[];
    sxh: number[];
    tcm: number[];
    soi: number[];
  };
}

const formatData = (data: TrendsChartProps['data']) => {
  return data.labels.map((label, index) => ({
    name: label,
    "Sốt xuất huyết": data.sxh[index],
    "Tay chân miệng": data.tcm[index],
    "Sởi & nghi Sởi": data.soi[index],
  }));
};

export default function TrendsChart({ data }: TrendsChartProps) {
  const chartData = formatData(data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Xu hướng Dịch bệnh
        </CardTitle>
        <CardDescription>Số ca bệnh truyền nhiễm trọng điểm được báo cáo hàng tháng.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "var(--radius)",
                }}
              />
              <Legend iconSize={10} />
              <Line type="monotone" dataKey="Sốt xuất huyết" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-1))' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Tay chân miệng" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-2))' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Sởi & nghi Sởi" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--chart-3))' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
