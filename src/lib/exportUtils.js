/**
 * Export Utility Functions for Excel Spreadsheets and PDF Documents
 */

/**
 * Download data as an Excel-compatible CSV Spreadsheet (.csv / .xlsx format)
 * @param {Array<Object>} data Array of objects to export
 * @param {string} fileName Name of file (without extension)
 * @param {Array<string>} headers Optional custom headers
 */
export const exportToExcel = (data = [], fileName = "crm_export", headers = null) => {
  if (!data || data.length === 0) {
    alert("No data available to export.");
    return;
  }

  // Determine headers
  const keys = headers || Object.keys(data[0]);
  
  // Format CSV rows
  const csvRows = [];
  
  // Header row
  csvRows.push(keys.map((k) => `"${String(k).replace(/"/g, '""')}"`).join(","));

  // Data rows
  data.forEach((row) => {
    const values = keys.map((key) => {
      let val = row[key];
      if (val === null || val === undefined) val = "";
      if (typeof val === "object") {
        val = val.name || val.courseName || JSON.stringify(val);
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(","));
  });

  const csvString = "\uFEFF" + csvRows.join("\n"); // Add UTF-8 BOM for Microsoft Excel compatibility
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
  
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generate and download a PDF document (.pdf)
 * @param {string} title Document Title
 * @param {Array<string>} headers Column Header titles
 * @param {Array<Array<string>>} rows Table Row Data
 * @param {string} fileName Export File Name
 */
export const exportToPDF = (title = "CRM Report", headers = [], rows = [], fileName = "crm_report") => {
  // Create an HTML printable wrapper that auto-triggers save as PDF or blob download
  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    // Fallback: If popup blocked, export clean HTML Blob or download CSV/Excel
    exportToExcel(
      rows.map((row) => {
        const obj = {};
        headers.forEach((h, idx) => {
          obj[h] = row[idx] || "";
        });
        return obj;
      }),
      fileName
    );
    return;
  }

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const headerHtml = headers.map((h) => `<th style="border: 1px solid #e2e8f0; padding: 10px 14px; background-color: #006241; color: white; text-align: left; font-size: 13px;">${h}</th>`).join("");
  
  const rowsHtml = rows
    .map(
      (row, idx) =>
        `<tr style="background-color: ${idx % 2 === 0 ? "#ffffff" : "#f8fafc"};">
          ${row.map((cell) => `<td style="border: 1px solid #e2e8f0; padding: 8px 14px; font-size: 12px; color: #1e293b;">${cell}</td>`).join("")}
        </tr>`
    )
    .join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${dateStr}</title>
        <style>
          @page { size: A4 landscape; margin: 15mm; }
          body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 20px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 3px solid #006241; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #006241; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .meta { text-align: right; font-size: 12px; color: #475569; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .footer { margin-top: 30px; font-size: 11px; text-align: center; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">🎓 Student Admission CRM</h1>
            <div class="subtitle">${title}</div>
          </div>
          <div class="meta">
            <div>Generated: <strong>${dateStr}</strong></div>
            <div>Status: <strong>Official Report Sheet</strong></div>
          </div>
        </div>

        <table>
          <thead>
            <tr>${headerHtml}</tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Student Admission CRM System &bull; Confidential Academic & Financial Report
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
