export function exportToCsv(rows: string[][]) {
  // TODO: add authorization and streaming for large exports.
  return rows.map((row) => row.join(",")).join("\n");
}
