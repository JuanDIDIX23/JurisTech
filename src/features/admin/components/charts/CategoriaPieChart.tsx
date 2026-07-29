import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { colorPorIndice } from './palette';

export interface PorcionCategoria {
  nombre: string;
  valor: number;
}

interface CategoriaPieChartProps {
  data: PorcionCategoria[];
}

export default function CategoriaPieChart({ data }: CategoriaPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="valor"
          nameKey="nombre"
          cx="50%"
          cy="45%"
          innerRadius={54}
          outerRadius={88}
          paddingAngle={2}
          stroke="none"
        >
          {data.map((porcion, i) => (
            <Cell key={porcion.nombre} fill={colorPorIndice(i)} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 12, border: '1px solid #ebe4e1', fontSize: 12 }}
        />
        <Legend
          verticalAlign="bottom"
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, color: '#5a5a5a' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
