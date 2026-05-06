import { useEffect, useState } from "react";
import api from "../services/api";

const AliasesPage = () => {
  const [aliases, setAliases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ alias: "", merchantName: "", category: "" });

  const fetchAliases = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/aliases");
      setAliases(data.aliases);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load aliases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAliases();
  }, []);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      await api.post("/aliases", form);
      setForm({ alias: "", merchantName: "", category: "" });
      fetchAliases();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create alias");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Alias Manager</h1>
        <p className="mt-2 text-sm text-slate-400">
          Teach PayTrace your bank-specific code aliases for better resolution accuracy.
        </p>
      </div>

      <form onSubmit={onSubmit} className="glass-card grid gap-4 p-6 md:grid-cols-4">
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-brand focus:outline-none"
          placeholder="Alias (e.g., AMZ)"
          value={form.alias}
          onChange={(event) => setForm((prev) => ({ ...prev, alias: event.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-brand focus:outline-none"
          placeholder="Merchant (e.g., Amazon)"
          value={form.merchantName}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, merchantName: event.target.value }))
          }
          required
        />
        <input
          className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 focus:border-brand focus:outline-none"
          placeholder="Category (optional)"
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
        />
        <button
          className="rounded-xl bg-brand px-4 py-3 font-semibold text-white hover:bg-violet-500"
          type="submit"
        >
          Add Alias
        </button>
      </form>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      <div className="glass-card overflow-hidden">
        <div className="border-b border-slate-800 px-5 py-4">
          <h3 className="text-lg font-semibold text-white">Known Aliases</h3>
        </div>
        {loading ? (
          <p className="p-5 text-slate-400">Loading aliases...</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Alias</th>
                <th className="px-4 py-3">Merchant</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Scope</th>
              </tr>
            </thead>
            <tbody>
              {aliases.map((item) => (
                <tr key={item._id} className="border-b border-slate-800/80">
                  <td className="px-4 py-3 text-white">{item.alias}</td>
                  <td className="px-4 py-3 text-slate-300">{item.merchantName}</td>
                  <td className="px-4 py-3 text-slate-300">{item.category}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {item.user ? "User" : "Global"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AliasesPage;

