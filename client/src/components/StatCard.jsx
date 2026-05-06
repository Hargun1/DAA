const StatCard = ({ label, value, hint }) => (
  <div className="glass-card p-5">
    <p className="text-sm text-slate-400">{label}</p>
    <h3 className="mt-2 text-2xl font-semibold text-white">{value}</h3>
    {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
  </div>
);

export default StatCard;

