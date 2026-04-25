import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

function ForecastChart({ data }) {
  return (
    <div className="h-80 w-full overflow-hidden">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb923c" stopOpacity={0.45} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="day"
            stroke="#94a3b8"
            tickLine={false}
            axisLine={false}
            interval={2}
            minTickGap={18}
          />
          <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            formatter={(value) => [`${value}`, 'Prediction']}
            labelFormatter={(label) => {
              const activeEntry = data.find((entry) => entry.day === label);
              return activeEntry?.fullDate ?? label;
            }}
            wrapperStyle={{ pointerEvents: 'none', zIndex: 1 }}
            contentStyle={{
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(10,10,14,0.9)',
              color: '#fff',
            }}
          />
          <Area
            type="monotone"
            dataKey="prediction"
            stroke="#fb923c"
            strokeWidth={3}
            activeDot={{
              r: 6,
              fill: '#fdba74',
              stroke: '#fff7ed',
              strokeWidth: 2,
            }}
            dot={(props) => {
              return (
                <circle
                  cx={props.cx}
                  cy={props.cy}
                  r={3}
                  fill="#fb923c"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={1}
                />
              );
            }}
            fillOpacity={1}
            fill="url(#forecastFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ForecastChart;
