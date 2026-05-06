const confidenceColor = (confidence) => {
  if (confidence >= 0.8) return "bg-emerald-500/20 text-emerald-300";
  if (confidence >= 0.6) return "bg-amber-500/20 text-amber-300";
  return "bg-rose-500/20 text-rose-300";
};

const ConfidenceBadge = ({ confidence }) => (
  <span
    className={`rounded-full px-2 py-1 text-xs font-semibold ${confidenceColor(
      confidence
    )}`}
  >
    {(confidence * 100).toFixed(1)}%
  </span>
);

export default ConfidenceBadge;

