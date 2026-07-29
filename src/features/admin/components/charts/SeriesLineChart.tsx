import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AXIS_COLOR, CHART_COLORS, GRID_COLOR } from './palette';

export interface PuntoSerie {
  label: string;
  total: number;
}

interface SeriesLineChartProps {
  data: PuntoSerie[];
  /** etiqueta de la serie en el tooltip */
  nombre?: string;
}

export default function SeriesLineChart({ data, nombre = 'Leads' }: SeriesLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={{ stroke: GRID_COLOR }}
          minTickGap={16}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: AXIS_COLOR }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #ebe4e1',
            fontSize: 12,
          }}
          labelStyle={{ fontWeight: 600, color: '#1c1c1c' }}
        />
        <Line
          type="monotone"
          dataKey="total"
          name={nombre}
          stroke={CHART_COLORS[0]}
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
