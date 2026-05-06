import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const colors = ["#7C3AED", "#06B6D4", "#22C55E", "#F59E0B", "#EF4444", "#3B82F6"];

const CategoryPieChart = ({ data }) => (
  <div className="glass-card p-5">
    <h3 className="mb-4 text-lg font-semibold text-white">Category Distribution</h3>
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="category"
            outerRadius={110}
            label={(entry) => entry.category}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#0f172a",
              border: "1px solid #334155",
              borderRadius: "12px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default CategoryPieChart;

