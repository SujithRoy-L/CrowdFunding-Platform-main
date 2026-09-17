export const exportToCSV = (data, filename) => {
  if (!data || !data.length) {
    console.warn("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);

  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          let cellValue = row[header];

          if (cellValue === null || cellValue === undefined) {
            cellValue = "";
          }

          if (typeof cellValue === "string") {
            cellValue = cellValue.replace(/"/g, '""');
            if (
              cellValue.includes(",") ||
              cellValue.includes('"') ||
              cellValue.includes("\n")
            ) {
              cellValue = `"${cellValue}"`;
            }
          }
          return cellValue;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");

  if (navigator.msSaveBlob) {
    navigator.msSaveBlob(blob, filename);
  } else {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
