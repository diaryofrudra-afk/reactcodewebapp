import { Line } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

interface LineChartProps {
  data: ChartData<'line'>;
  options?: ChartOptions<'line'>;
  height?: number;
}

export function LineChart({ data, options, height }: LineChartProps) {
  const defaultOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    ...options,
  };
  return <Line data={data} options={defaultOptions} height={height} />;
}
