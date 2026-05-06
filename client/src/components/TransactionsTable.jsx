import ConfidenceBadge from "./ConfidenceBadge";

const amountStyle = (amount) =>
  amount < 0 ? "text-rose-300 font-semibold" : "text-emerald-300 font-semibold";

const TransactionsTable = ({ transactions }) => (
  <div className="glass-card overflow-hidden">
    <div className="border-b border-slate-800 px-5 py-4">
      <h3 className="text-lg font-semibold text-white">Resolved Transactions</h3>
    </div>
    <div className="max-h-[420px] overflow-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-900/80 text-slate-400">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Description</th>
            <th className="px-4 py-3">Resolved Merchant</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Confidence</th>
            <th className="px-4 py-3">Flags</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction._id} className="border-b border-slate-800/80">
              <td className="px-4 py-3 text-slate-300">
                {new Date(transaction.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-slate-200">{transaction.description}</td>
              <td className="px-4 py-3 text-white">{transaction.resolvedMerchant}</td>
              <td className={`px-4 py-3 ${amountStyle(transaction.amount)}`}>
                ₹ {Math.abs(transaction.amount).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <ConfidenceBadge confidence={transaction.confidence} />
              </td>
              <td className="px-4 py-3 text-xs">
                {transaction.isRecurring ? (
                  <span className="mr-2 rounded bg-cyan-500/20 px-2 py-1 text-cyan-300">
                    recurring
                  </span>
                ) : null}
                {transaction.isUnknown ? (
                  <span className="rounded bg-rose-500/20 px-2 py-1 text-rose-300">
                    unknown
                  </span>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default TransactionsTable;

