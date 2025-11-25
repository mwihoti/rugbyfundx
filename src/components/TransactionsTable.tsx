import { Transaction } from "@/types";

interface TransactionsTableProps {
  transactions: Transaction[];
  limit?: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function TransactionsTable({ transactions, limit }: TransactionsTableProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getTypeColor = (type: string) => {
    switch (type) {
      case "donation":
        return "bg-blue-100 text-blue-800";
      case "payout":
        return "bg-green-100 text-green-800";
      case "engagement":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-green-200">
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Amount (ADA)</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">Wallet</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700">TX Hash</th>
          </tr>
        </thead>
        <tbody>
          {displayTransactions.map((tx) => (
            <tr key={tx.id} className="border-b border-green-100 hover:bg-gray-50 transition">
              <td className="px-4 py-3 text-gray-900">{formatDate(tx.timestamp)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getTypeColor(tx.type)}`}>
                  {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3 font-semibold text-[#065f46]">{tx.amount}</td>
              <td className="px-4 py-3 text-gray-600 font-mono text-xs">{tx.walletAddress}</td>
              <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                <a
                  href={`https://cardanoscan.io/transaction/${tx.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#065f46] hover:underline"
                >
                  {tx.txHash.slice(0, 8)}...
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
