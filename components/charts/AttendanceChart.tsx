'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AttendanceChartProps {
  data: any[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Bible Study" fill="#001F3F" name="Bible Study" />
        <Bar dataKey="Mid-Week Service" fill="#FFB703" name="Mid-Week Service" />
      </BarChart>
    </ResponsiveContainer>
  );
}

