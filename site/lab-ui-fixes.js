// Ajustes de interface da bancada: seleção de velocidade e exportação local.
document.addEventListener('DOMContentLoaded', () => {
  const speedGroup = document.querySelector('.speed-options');
  if (speedGroup) {
    speedGroup.querySelectorAll('button[data-speed]').forEach((button) => {
      button.addEventListener('click', () => {
        speedGroup.querySelectorAll('button[data-speed]').forEach((item) => {
          const active = item === button;
          item.classList.toggle('is-selected', active);
          item.setAttribute('aria-pressed', String(active));
        });
      });
    });
  }

  const exportButton = document.getElementById('exportLocalCsv');
  if (exportButton) {
    exportButton.addEventListener('click', () => {
      const fixed = document.getElementById('fixedTime')?.textContent?.trim();
      const random = document.getElementById('randomTime')?.textContent?.trim();
      if (!fixed || !random || fixed === '—' || random === '—') {
        const status = document.getElementById('labStatus');
        if (status) status.textContent = 'Prepare a bancada antes de exportar os resultados locais.';
        return;
      }
      const input = document.getElementById('userInput')?.value || '';
      const count = input.trim() ? input.trim().split(/[\\s,;]+/).filter(Boolean).length : 0;
      const csv = [
        'tamanho_n,algoritmo,tempo_segundos',
        `${count},Pivo fixo,${fixed.replace(',', '.')}`,
        `${count},Pivo aleatorio,${random.replace(',', '.')}`
      ].join('\\r\\n');
      const blob = new Blob(['\\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quicksort_resultados_locais.csv';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
});
