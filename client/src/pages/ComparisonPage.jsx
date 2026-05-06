import { useEffect, useState } from "react";
import api from "../services/api";

const prettify = (value) => {
  const map = {
    aliasHash: "Alias HashMap",
    trie: "Trie Prefix",
    kmp: "KMP",
    rabinKarp: "Rabin-Karp",
    ahoCorasick: "Aho-Corasick",
    levenshtein: "Levenshtein"
  };
  return map[value] || value;
};

const ComparisonPage = () => {
  const [statements, setStatements] = useState([]);
  const [selected, setSelected] = useState("");
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStatements = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/statements");
        setStatements(data.statements);
        if (data.statements[0]) {
          setSelected(String(data.statements[0]._id));
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load statements");
      } finally {
        setLoading(false);
      }
    };
    loadStatements();
  }, []);

  useEffect(() => {
    if (!selected) return;
    const loadComparison = async () => {
      setError("");
      try {
        const { data } = await api.get(`/comparison/${selected}`);
        setComparison(data);
      } catch (err) {
        setError(err.response?.data?.message || "Could not fetch comparison");
      }
    };
    loadComparison();
  }, [selected]);

  if (loading) return <p className="text-slate-300">Loading statements...</p>;

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Algorithm Comparison Bench</h1>
        <p className="mt-2 text-sm text-slate-400">
          Analyze runtime, agreement, and accuracy of DAA modules used for merchant resolution.
        </p>
        <div className="mt-4 max-w-md">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200"
          >
            {statements.map((statement) => (
              <option key={statement._id} value={statement._id}>
                {statement.originalFileName} ({statement.totalTransactions} rows)
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-rose-300">{error}</p> : null}

      {comparison ? (
        <>
          <div className="glass-card overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4">
              <h3 className="text-lg font-semibold text-white">Performance and Accuracy</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Algorithm</th>
                  <th className="px-4 py-3">Matched Txns</th>
                  <th className="px-4 py-3">Avg Time (ms)</th>
                  <th className="px-4 py-3">Agreement %</th>
                  <th className="px-4 py-3">Accuracy %</th>
                </tr>
              </thead>
              <tbody>
                {comparison.comparisonSummary.map((row) => (
                  <tr key={row.algorithm} className="border-b border-slate-800/80">
                    <td className="px-4 py-3 text-white">{prettify(row.algorithm)}</td>
                    <td className="px-4 py-3 text-slate-300">{row.matchedTransactions}</td>
                    <td className="px-4 py-3 text-slate-300">{row.avgTimeMs}</td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.agreementWithEnsemblePct}%
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {row.accuracyPct === null ? "N/A" : `${row.accuracyPct}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="border-b border-slate-800 px-5 py-4">
              <h3 className="text-lg font-semibold text-white">Time Complexity Analysis</h3>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Algorithm</th>
                  <th className="px-4 py-3">Time Complexity</th>
                  <th className="px-4 py-3">Space Complexity</th>
                </tr>
              </thead>
              <tbody>
                {comparison.complexity.map((row) => (
                  <tr key={row.algorithm} className="border-b border-slate-800/80">
                    <td className="px-4 py-3 text-white">{row.algorithm}</td>
                    <td className="px-4 py-3 text-slate-300">{row.timeComplexity}</td>
                    <td className="px-4 py-3 text-slate-300">{row.spaceComplexity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ComparisonPage;

