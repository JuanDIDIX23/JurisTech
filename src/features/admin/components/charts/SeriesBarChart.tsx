import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_COLOR, CHART_COLORS, GRID_COLOR } from './palette';
import type { PuntoSerie } from './SeriesLineChart';

interface SeriesBarChartProps {
  data: PuntoSerie[];
  nombre?: string;
}

export default function SeriesBarChart({ data, nombre = 'Leads' }: SeriesBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={{ stroke: GRID_COLOR }}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(37,112,232,0.06)' }}
          contentStyle={{ borderRadius: 12, border: '1px solid #ebe4e1', fontSize: 12 }}
          labelStyle={{ fontWeight: 600, color: '#1c1c1c' }}
        />
        <Bar
          dataKey="total"
          name={nombre}
          fill={CHART_COLORS[0]}
          radius={[6, 6, 0, 0]}
          maxBarSize={48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
