import { parse } from "csv-parse/sync";

const resolveColumn = (row, keys) => {
  const rowKeys = Object.keys(row);
  return rowKeys.find((column) =>
    keys.some((key) => column.toLowerCase().trim() === key.toLowerCase())
  );
};

const parseAmount = (value) => {
  if (value === null || value === undefined) return 0;
  const raw = String(value).trim();
  if (!raw) return 0;
  const normalized = raw.replace(/[,₹$]/g, "");
  if (normalized.startsWith("(") && normalized.endsWith(")")) {
    return -Number(normalized.slice(1, -1));
  }
  return Number(normalized);
};

export const parseStatementCsv = (buffer) => {
  const text = buffer.toString("utf-8");
  const rows = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });

  if (!rows.length) {
    throw new Error("CSV file is empty");
  }

  const dateColumn =
    resolveColumn(rows[0], ["date", "txn date", "transaction date"]) || "date";
  const descColumn =
    resolveColumn(rows[0], ["description", "narration", "remarks", "merchant"]) ||
    "description";
  const amountColumn =
    resolveColumn(rows[0], ["amount", "debit/credit", "txn amount", "value"]) ||
    "amount";
  const expectedMerchantColumn = resolveColumn(rows[0], [
    "expectedmerchant",
    "expected merchant",
    "actual merchant",
    "groundtruth"
  ]);

  return rows.map((row, index) => {
    const dateRaw = row[dateColumn];
    const description = row[descColumn];
    const amount = parseAmount(row[amountColumn]);
    const parsedDate = new Date(dateRaw);

    if (!description || Number.isNaN(amount) || Number.isNaN(parsedDate.getTime())) {
      throw new Error(`Invalid CSV row at line ${index + 2}`);
    }

    return {
      date: parsedDate,
      description: String(description),
      amount,
      expectedMerchant: expectedMerchantColumn
        ? String(row[expectedMerchantColumn] || "").trim() || null
        : null
    };
  });
};

