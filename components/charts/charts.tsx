'use client'

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const C = {
  primary: 'oklch(0.62 0.19 264)',
  accent: 'oklch(0.62 0.2 292)',
  teal: 'oklch(0.7 0.16 200)',
  green: 'oklch(0.7 0.16 155)',
  amber: 'oklch(0.78 0.15 75)',
  red: 'oklch(0.62 0.22 20)',
  grid: 'oklch(1 0 0 / 8%)',
  muted: 'oklch(0.68 0.02 264)',
}

export const chartPalette = [C.primary, C.accent, C.teal, C.green, C.amber, C.red]

const tooltipStyle = {
  background: 'oklch(0.2 0.02 264)',
  border: '1px solid oklch(1 0 0 / 12%)',
  borderRadius: 12,
  color: 'oklch(0.97 0.005 264)',
  fontSize: 12,
  padding: '8px 12px',
}

const axisProps = {
  stroke: C.muted,
  fontSize: 12,
  tickLine: false,
  axisLine: false,
}

export function AreaTrend({
  data,
  dataKey,
  xKey,
  color = C.primary,
  height = 260,
}: {
  data: Record<string, unknown>[]
  dataKey: string
  xKey: string
  color?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.4} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: C.grid }} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#grad-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DualBar({
  data,
  xKey,
  keys,
  height = 280,
}: {
  data: Record<string, unknown>[]
  xKey: string
  keys: { key: string; color: string; name: string }[]
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'oklch(1 0 0 / 4%)' }} />
        {keys.map((k) => (
          <Bar key={k.key} dataKey={k.key} name={k.name} fill={k.color} radius={[4, 4, 0, 0]} maxBarSize={34} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export function HBar({
  data,
  xKey,
  dataKey,
  height = 280,
}: {
  data: Record<string, unknown>[]
  xKey: string
  dataKey: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 16, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
        <XAxis type="number" {...axisProps} />
        <YAxis type="category" dataKey={xKey} width={130} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'oklch(1 0 0 / 4%)' }} />
        <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={chartPalette[i % chartPalette.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export function Donut({
  data,
  height = 280,
  colors = chartPalette,
}: {
  data: { name: string; value: number }[]
  height?: number
  colors?: string[]
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export function LineTrend({
  data,
  dataKey,
  xKey,
  color = C.accent,
  height = 260,
}: {
  data: Record<string, unknown>[]
  dataKey: string
  xKey: string
  color?: string
  height?: number
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
        <XAxis dataKey={xKey} {...axisProps} />
        <YAxis domain={[60, 90]} {...axisProps} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: C.grid }} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          dot={{ r: 3, fill: color }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
