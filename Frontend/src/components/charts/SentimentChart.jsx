import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function SentimentChart({ data, onPointSelect, interactive = true, height = '420px' }) {
  const scores = data.map((item) => Number(item.score)).filter((value) => Number.isFinite(value));
  const hasCompactRange = scores.length > 0 && scores.every((value) => value >= -1 && value <= 1);
  const yAxisProps = hasCompactRange
    ? { domain: [-1, 1], ticks: [-1, -0.5, 0, 0.5, 1] }
    : { domain: [20, 90], ticks: [20, 35, 50, 65, 80, 90] };
  const valueSuffix = hasCompactRange ? '' : '/100';

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 26, right: 32, left: 12, bottom: 14 }}>
          <defs>
            <linearGradient id="sentimentStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#facc15" />
              <stop offset="50%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
          <XAxis
            dataKey="shortLabel"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            minTickGap={42}
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => value.split(' ').slice(0, 2).join(' ')}
          />
          <YAxis
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            domain={yAxisProps.domain}
            ticks={yAxisProps.ticks}
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: 'rgba(251, 146, 60, 0.18)', strokeWidth: 1 }}
            contentStyle={{
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(10,10,14,0.94)',
              color: '#fff',
              boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
            }}
            formatter={(value) => [`${value}${valueSuffix}`, 'Sentiment']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.time ?? ''}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="#f97316"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
            onClick={interactive ? (payload) => onPointSelect?.(payload?.activePayload?.[0]?.payload) : undefined}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default SentimentChart;
