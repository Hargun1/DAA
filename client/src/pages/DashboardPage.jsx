import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import StatCard from "../components/StatCard";
import MerchantBarChart from "../components/MerchantBarChart";
import CategoryPieChart from "../components/CategoryPieChart";
import TransactionsTable from "../components/TransactionsTable";

const DashboardPage = () => {
  const [searchParams] = useSearchParams();
  const statementId = searchParams.get("statementId");
  const [state, setState] = useState({
    loading: true,
    error: "",
    statement: null,
    dashboard: null
  });

  useEffect(() => {
    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: "" }));
      try {
        const endpoint = statementId
          ? `/statements/${statementId}/dashboard`
          : "/statements/latest/dashboard";
        const { data } = await api.get(endpoint);
        setState({ loading: false, error: "", ...data });
      } catch (error) {
        setState({
          loading: false,
          error: error.response?.data?.message || "Could not fetch dashboard",
          statement: null,
          dashboard: null
        });
      }
    };
    load();
  }, [statementId]);

  const topUnknownCount = useMemo(
    () => state.dashboard?.unknownTransactions?.length || 0,
    [state.dashboard]
  );

  if (state.loading) {
    return <p className="text-slate-300">Loading dashboard...</p>;
  }

  if (state.error) {
    return (
      <div className="glass-card p-6">
        <p className="text-rose-300">{state.error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Financial Intelligence Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">
          Statement: <span className="text-slate-200">{state.statement?.originalFileName}</span>
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total Spend" value={`₹ ${state.dashboard.totals.spent}`} />
        <StatCard label="Total Income" value={`₹ ${state.dashboard.totals.income}`} />
        <StatCard label="Net Flow" value={`₹ ${state.dashboard.totals.net}`} />
        <StatCard
          label="Unknown Merchants"
          value={topUnknownCount}
          hint="Flagged for manual alias correction"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <MerchantBarChart data={state.dashboard.merchantBreakdown} />
        <CategoryPieChart data={state.dashboard.categoryBreakdown} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Recurring Payments</h3>
          {state.dashboard.recurringPayments.length ? (
            <div className="space-y-3">
              {state.dashboard.recurringPayments.map((item, index) => (
                <div
                  key={`${item.merchant}-${index}`}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4"
                >
                  <p className="font-medium text-slate-100">{item.merchant}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    ₹ {item.amount} · {item.occurrences} times
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No recurring patterns detected yet.</p>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="mb-4 text-lg font-semibold text-white">Unknown Merchant Flags</h3>
          {state.dashboard.unknownTransactions.length ? (
            <div className="space-y-3">
              {state.dashboard.unknownTransactions.slice(0, 8).map((item) => (
                <div
                  key={item._id}
                  className="rounded-xl border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300"
                >
                  <p>{item.description}</p>
                  <p className="mt-1 text-slate-500">Confidence {(item.confidence * 100).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No unresolved merchants in this statement.</p>
          )}
        </div>
      </section>

      <TransactionsTable transactions={state.dashboard.transactions} />
    </div>
  );
};

export default DashboardPage;

