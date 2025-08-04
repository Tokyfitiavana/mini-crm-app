export const exportToCSV = (columns: Record<string, any>) => {
    const rows: string[][] = [['Statut', 'Titre', 'Client', 'Valeur (€)']];
    Object.values(columns).forEach((col) => {
      col.opportunities.forEach((opp: any) => {
        rows.push([col.title, opp.title, opp.clientName, opp.value.toString()]);
      });
    });
  
    const csvContent = rows.map((e) => e.join(';')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'pipeline.csv');
    link.click();
  };
  