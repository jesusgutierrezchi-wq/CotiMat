import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { DashboardDayCount } from '../../types';

interface QuotesTrendChartProps {
  data: DashboardDayCount[];
}

const ACCENT = '#B5540C';

function formatDayTick(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

function TrendTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: DashboardDayCount }[] }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-muted">{formatDayTick(point.date)}</p>
      <p className="text-sm font-semibold tabular-nums text-ink">
        {point.count} {point.count === 1 ? 'cotización' : 'cotizaciones'}
      </p>
    </div>
  );
}

/** Single series over time: one hue, one axis, hover tooltip. No legend needed — the title names the series. */
export function QuotesTrendChart({ data }: QuotesTrendChartProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-ink">Cotizaciones — últimos 30 días</h2>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.22} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E4E4E1" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDayTick}
              interval={Math.ceil(data.length / 6) - 1}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B6B70', fontSize: 12 }}
            />
            <Tooltip content={<TrendTooltip />} cursor={{ stroke: '#E4E4E1' }} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={ACCENT}
              strokeWidth={2}
              fill="url(#trendFill)"
              dot={false}
              activeDot={{ r: 4, fill: ACCENT, stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
