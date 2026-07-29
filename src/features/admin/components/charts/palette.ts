// Paleta de los gráficos, alineada con tailwind.config.js.
export const CHART_COLORS = [
  '#2570e8', // brand-600
  '#7ab5ff', // brand-400
  '#0e2d7a', // brand-900
  '#c9b9b0', // sand-400
  '#5a5a5a', // stone-600
  '#4a94ff', // brand-500
] as const;

export const AXIS_COLOR = '#909090'; // stone-400
export const GRID_COLOR = '#ebe4e1'; // sand-200

export function colorPorIndice(i: number): string {
  return CHART_COLORS[i % CHART_COLORS.length];
}
