/**
 * Utility function to export data to CSV format
 * @param data - Array of objects to export
 * @param filename - Name of the CSV file (without .csv extension)
 * @param columns - Optional array of column definitions { key: string, label: string }
 * @returns void - Triggers browser download
 */
export function exportToCSV(
  data: any[],
  filename: string,
  columns?: { key: string; label: string }[]
): void {
  if (!data || data.length === 0) {
    throw new Error('No data available for export');
  }

  // If columns are provided, use them; otherwise use all keys from first object
  const headers = columns
    ? columns.map((col) => col.label)
    : Object.keys(data[0]);

  // Escape and format CSV value
  const escapeCSVValue = (value: any): string => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return '';
    }
    
    // Handle dates
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    
    // Convert to string
    let str = String(value);
    
    // Escape quotes by doubling them
    str = str.replace(/"/g, '""');
    
    // Wrap in quotes if value contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str}"`;
    }
    
    return str;
  };

  // Create CSV rows
  const rows = data.map((item) => {
    if (columns) {
      return columns.map((col) => escapeCSVValue(item[col.key]));
    } else {
      return Object.values(item).map(escapeCSVValue);
    }
  });

  // Build CSV content
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Create blob and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

