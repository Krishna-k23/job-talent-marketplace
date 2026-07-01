// frontend/src/app/components/common/ChartWidget.tsx
import React from 'react';
import { LucideIcon } from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, AreaChart, Area
} from 'recharts';

export type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface ChartWidgetProps {
  type: ChartType;
  data: any[];
  dataKey: string | string[];
  nameKey?: string;
  title?: string;
  subtitle?: string;
  icon?: LucideIcon;
  colors?: string[];
  height?: number;
  loading?: boolean;
  className?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showTooltip?: boolean;
  xAxisKey?: string;
  yAxisLabel?: string;
  xAxisLabel?: string;
  stacked?: boolean;
}

const DEFAULT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

export default function ChartWidget({
  type,
  data,
  dataKey,
  nameKey = 'name',
  title,
  subtitle,
  icon: Icon,
  colors = DEFAULT_COLORS,
  height = 250,
  loading = false,
  className = '',
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  xAxisKey = 'name',
  yAxisLabel,
  xAxisLabel,
  stacked = false,
}: ChartWidgetProps) {
  
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500" style={{ height }}>
        <span className="text-sm">No data available</span>
      </div>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <LineChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} label={xAxisLabel ? { value: xAxisLabel, position: 'bottom' } : undefined} />
            <YAxis tick={{ fontSize: 11 }} label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'left' } : undefined} />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            )}
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length] }}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))
            ) : (
              <Line
                type="monotone"
                dataKey={Array.isArray(dataKey) ? dataKey[0] : dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0] }}
              />
            )}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            )}
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => {
                const color = colors[index % colors.length];
                return (
                  <defs key={`gradient-${key}`}>
                    <linearGradient id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                );
              })
            ) : (
              <defs>
                <linearGradient id="gradient-main" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
            )}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={`url(#gradient-${key})`}
                  strokeWidth={2}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))
            ) : (
              <Area
                type="monotone"
                dataKey={Array.isArray(dataKey) ? dataKey[0] : dataKey}
                stroke={colors[0]}
                fill="url(#gradient-main)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={data}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />}
            <XAxis dataKey={xAxisKey} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            )}
            {showLegend && <Legend />}
            {Array.isArray(dataKey) ? (
              dataKey.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[4, 4, 0, 0]}
                  stackId={stacked ? 'stack' : undefined}
                  name={key.charAt(0).toUpperCase() + key.slice(1)}
                />
              ))
            ) : (
              <Bar dataKey={Array.isArray(dataKey) ? dataKey[0] : dataKey} fill={colors[0]} radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            )}
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              dataKey={Array.isArray(dataKey) ? dataKey[0] : dataKey}
              nameKey={nameKey}
              cx="50%"
              cy="50%"
              outerRadius={Math.min(120, height / 2 - 20)}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            {showTooltip && (
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff'
                }}
              />
            )}
            {showLegend && <Legend />}
          </PieChart>
        );

      default:
        return (
          <div className="flex items-center justify-center text-slate-400" style={{ height }}>
            <span>Unsupported chart type: {type}</span>
          </div>
        );
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-800/80 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-700/60 shadow-lg ${className}`}>
      {(title || subtitle) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <div className="flex items-center gap-2">
                {Icon && <Icon size={18} className="text-indigo-500" />}
                <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
              </div>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}