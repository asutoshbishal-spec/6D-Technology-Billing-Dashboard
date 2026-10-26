import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis
} from "recharts";
import { formatMoney } from "../utils/format";

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p>{label}</p>
      {payload.map(item => (
        <strong key={item.dataKey} style={{ color: item.color }}>{item.name}: {formatMoney(item.value * (item.dataKey === "billed" || item.dataKey === "collected" ? 1000 : 1))}</strong>
      ))}
    </div>
  );
}

export function RevenueTrendChart({ data }) {
  return (
    <div className="h-[270px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 5, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="billedFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1ba88a" stopOpacity={0.19} /><stop offset="100%" stopColor="#1ba88a" stopOpacity={0.01} /></linearGradient>
          </defs>
          <CartesianGrid stroke="#edf1f5" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8793a4", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8793a4", fontSize: 10 }} tickFormatter={value => `$${value}k`} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="billed" name="Billed" stroke="#1ba88a" strokeWidth={2.5} fill="url(#billedFill)" />
          <Area type="monotone" dataKey="collected" name="Collected" stroke="#658ce2" strokeWidth={2} fill="transparent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function EnterpriseUsageChart({ data }) {
  return (
    <div className="h-[290px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="usageFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#658ce2" stopOpacity={0.22} /><stop offset="100%" stopColor="#658ce2" stopOpacity={0.02} /></linearGradient>
          </defs>
          <CartesianGrid stroke="#edf1f5" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#8793a4", fontSize: 11 }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: "#8793a4", fontSize: 10 }} tickFormatter={value => `${value} TB`} />
          <Tooltip formatter={value => [`${value} TB`, "Data usage"]} />
          <Area type="monotone" dataKey="usage" name="Data usage" stroke="#658ce2" strokeWidth={2.5} fill="url(#usageFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AgingChart({ data }) {
  return (
    <div className="h-[210px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 14, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="#edf1f5" strokeDasharray="4 4" horizontal={false} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="bucket" axisLine={false} tickLine={false} width={78} tick={{ fill: "#69778c", fontSize: 10 }} />
          <Tooltip formatter={value => formatMoney(value)} cursor={{ fill: "#f6f8fb" }} />
          <Bar dataKey="amount" name="Balance" radius={[0, 6, 6, 0]} barSize={18}>
            {data.map(item => <Cell key={item.bucket} fill={item.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueMixChart({ data }) {
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <div className="h-[180px] w-full max-w-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={78} paddingAngle={3} stroke="none">
              {data.map(item => <Cell key={item.name} fill={item.color} />)}
            </Pie>
            <Tooltip formatter={value => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid w-full grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-1">
        {data.map(item => (
          <div className="flex items-center justify-between gap-3 text-xs" key={item.name}>
            <span className="flex items-center gap-2 text-slate-500"><i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
            <strong className="font-semibold text-ink">{item.value}%</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
