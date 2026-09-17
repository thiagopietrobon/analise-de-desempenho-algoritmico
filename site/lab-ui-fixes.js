// Exportação dos resultados medidos localmente na bancada.
document.addEventListener('DOMContentLoaded', () => {
  const exportButton = document.getElementById('exportLocalCsv');
  if (!exportButton) return;

  exportButton.addEventListener('click', () => {
    const fixed = document.getElementById('fixedTime')?.textContent?.trim();
    const random = document.getElementById('randomTime')?.textContent?.trim();
    const raw = document.getElementById('userInput')?.value?.trim() || '';
    const status = document.getElementById('labStatus');

    if (!raw || !fixed || !random || fixed === '—' || random === '—') {
      if (status) status.textContent = 'Prepare a bancada antes de exportar os resultados locais.';
      return;
    }

    const count = raw.split(/[\s,;]+/).filter(Boolean).length;
    const csv = [
      'tamanho_n,algoritmo,tempo_segundos',
      `${count},Pivo fixo,${fixed.replace(',', '.')}`,
      `${count},Pivo aleatorio,${random.replace(',', '.')}`
    ].join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quicksort_resultados_locais.csv';
    link.click();
    URL.revokeObjectURL(url);
  });
});
