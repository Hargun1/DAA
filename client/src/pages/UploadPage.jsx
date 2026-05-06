import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const UploadPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError("Please choose a CSV file first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("statement", file);
      const { data } = await api.post("/statements/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setMessage("Statement processed successfully.");
      navigate(`/dashboard?statementId=${data.statementId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="glass-card p-6">
        <h1 className="text-2xl font-semibold text-white">Upload Bank Statement CSV</h1>
        <p className="mt-2 text-sm text-slate-400">
          Supported columns: date, description, amount, and optional expectedMerchant.
        </p>
      </div>
      <form onSubmit={onSubmit} className="glass-card space-y-4 p-6">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-200 file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-white"
        />
        {error ? <p className="text-sm text-rose-300">{error}</p> : null}
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-brand px-5 py-3 font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Upload & Resolve"}
        </button>
      </form>
    </div>
  );
};

export default UploadPage;

