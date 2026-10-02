import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SalesChartProps {
  chartType: 'line' | 'bar';
  data: Array<{ month: string; sales: number; profit: number }>;
}

export function SalesChart({ chartType, data }: SalesChartProps) {

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-xl shadow-soft-lg">
          <p className="font-medium mb-2 text-ink text-sm">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3 mb-2">
              <div 
                className="w-4 h-4 rounded-full shadow-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-ink-muted">
                {entry.name === 'sales' ? 'ยอดขาย' : 'กำไร'}:
              </span>
              <span className="text-sm font-bold" style={{ color: entry.color }}>
                ฿{entry.value.toLocaleString('th-TH')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 md:h-80 w-full" style={{ minHeight: '256px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'line' ? (
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid vertical={false} stroke="#ECEAF2" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#747083' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#747083' }}
              tickFormatter={(value) => `${+(value / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F4F3F7" }} />
            <Line 
              key="sales-line"
              type="monotone" 
              dataKey="sales" 
              stroke="#673AB7" 
              strokeWidth={2.5}
              dot={{ fill: '#673AB7', strokeWidth: 0, r: 3 }}
              activeDot={{ 
                r: 8, 
                stroke: '#673AB7', 
                strokeWidth: 3, 
                fill: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(103, 58, 183, 0.3))'
              }}
            />
            <Line 
              key="profit-line"
              type="monotone" 
              dataKey="profit" 
              stroke="#eab308" 
              strokeWidth={2.5}
              dot={{ fill: '#eab308', strokeWidth: 0, r: 3 }}
              activeDot={{ 
                r: 8, 
                stroke: '#eab308', 
                strokeWidth: 3, 
                fill: 'white',
                filter: 'drop-shadow(0 2px 4px rgba(234, 179, 8, 0.3))'
              }}
            />
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid vertical={false} stroke="#ECEAF2" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#747083' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#747083' }}
              tickFormatter={(value) => `${+(value / 1000).toFixed(1)}k`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#F4F3F7" }} />
            <Bar 
              key="sales-bar"
              dataKey="sales" 
              fill="#673AB7" 
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(103, 58, 183, 0.2))'
              }}
            />
            <Bar 
              key="profit-bar"
              dataKey="profit" 
              fill="#eab308" 
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              style={{
                filter: 'drop-shadow(0 4px 6px rgba(234, 179, 8, 0.2))'
              }}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}