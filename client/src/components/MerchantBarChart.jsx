import {
  BarChart,
  Bar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

const MerchantBarChart = ({ data }) => (
  <div className="glass-card p-5">
    <h3 className="mb-4 text-lg font-semibold text-white">Top Merchant Spend</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="merchant" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            cursor={{ fill: "rgba(15,23,42,0.4)" }}
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px"
            }}
          />
          <Bar dataKey="amount" fill="#7C3AED" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default MerchantBarChart;

