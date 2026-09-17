// Complementos da bancada: aquecimento, cinco medições, mediana e histórico da sessão.
(function () {
  const $ = id => document.getElementById(id);
  const history = [];
  let sessionChart;
  const originalPrepare = window.prepare;

  function median(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  function timedRun(input, randomPivot) {
    const start = performance.now();
    const output = window.quicksort(input.slice(), randomPivot);
    return { seconds: (performance.now() - start) / 1000, output };
  }

  window.prepare = function () {
    try {
      const input = window.readInput();
      ['fixed', 'random'].forEach(side => {
        const lab = window.labs[side];
        window.pause(side);
        if (input.length <= 30) {
          const result = window.makeSteps(input.slice(), side === 'random');
          lab.events = result.events;
          lab.index = 0;
          window.draw(side);
        } else {
          lab.events = [];
          lab.index = 0;
          $(side + 'Bars').innerHTML = '';
          $(side + 'Event').textContent = 'Animação desativada para entradas acima de 30 valores.';
          $(side + 'Count').textContent = 'Medição sem animação';
          $(side + 'State').textContent = 'Medição';
        }
      });

      const results = { fixed: [], random: [] };
      // Aquecimento descartado, uma vez por estratégia.
      timedRun(input, false);
      timedRun(input, true);
      // Cinco repetições válidas, alternando a ordem das estratégias.
      for (let i = 0; i < 5; i++) {
        const order = i % 2 === 0 ? ['fixed', 'random'] : ['random', 'fixed'];
        order.forEach(side => {
          const result = timedRun(input, side === 'random');
          results[side].push(result.seconds);
        });
      }
      const fixedMedian = median(results.fixed);
      const randomMedian = median(results.random);
      const fixed = window.quicksort(input.slice(), false);
      const random = window.quicksort(input.slice(), true);
      const sorted = fixed.every((v, i) => i === 0 || fixed[i - 1] <= v);
      const equal = fixed.length === random.length && fixed.every((v, i) => v === random[i]);
      $('fixedTime').textContent = fixedMedian.toFixed(6);
      $('randomTime').textContent = randomMedian.toFixed(6);
      $('fixedCheck').textContent = sorted && equal ? 'Ordenada; saída igual à outra estratégia' : 'Verificação falhou';
      $('randomCheck').textContent = sorted && equal ? 'Ordenada; saída igual à outra estratégia' : 'Verificação falhou';
      const record = { n: input.length, fixed: fixedMedian, random: randomMedian, at: new Date().toLocaleTimeString('pt-BR') };
      history.push(record);
      renderHistory();
      $('sortedOutput').textContent = fixed.slice(0, 200).join(', ');
      $('labStatus').textContent = `Medição concluída: N=${input.length}; 1 aquecimento descartado e 5 repetições por estratégia. Valores exibidos são medianas.`;
      const interpretation = $('labInterpretation');
      if (interpretation) interpretation.innerHTML = `<h4>Resumo da sessão</h4><p>N=${input.length}. Mediana: pivô fixo ${fixedMedian.toFixed(6)} s; pivô aleatório ${randomMedian.toFixed(6)} s. As saídas ${sorted && equal ? 'estão ordenadas e são iguais' : 'não passaram em todas as verificações'}. Esta comparação descreve apenas esta execução no navegador.</p>`;
    } catch (error) {
      $('labStatus').textContent = error.message;
    }
  };

  function renderHistory() {
    let host = $('sessionHistory');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sessionHistory';
      host.className = 'table-panel';
      const report = document.querySelector('.report-panel');
      report.appendChild(host);
    }
    host.innerHTML = `<h4>Histórico desta sessão</h4><p>${history.length} registro(s), mantidos apenas nesta visita.</p><div class="table-scroll"><table><thead><tr><th>Horário</th><th>N</th><th>Mediana pivô fixo (s)</th><th>Mediana pivô aleatório (s)</th></tr></thead><tbody>${history.map(r => `<tr><td>${r.at}</td><td>${r.n}</td><td>${r.fixed.toFixed(6)}</td><td>${r.random.toFixed(6)}</td></tr>`).join('')}</tbody></table></div><button id="exportSession" class="secondary" type="button">Exportar histórico da sessão CSV</button><div class="chart-wrap"><canvas id="sessionChart" role="img" aria-label="Comparação das medianas registradas nesta sessão"></canvas></div>`;
    $('exportSession').addEventListener('click', () => {
      const lines = ['horario,n,mediana_pivo_fixo_s,mediana_pivo_aleatorio_s', ...history.map(r => [r.at, r.n, r.fixed, r.random].join(','))];
      const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'quicksort_sessao.csv'; a.click();
      URL.revokeObjectURL(url);
    });
    if (typeof Chart !== 'undefined') {
      if (sessionChart) sessionChart.destroy();
      sessionChart = new Chart($('sessionChart'), {
        type: 'bar',
        data: { labels: history.map(r => `N=${r.n}`), datasets: [
          { label: 'Pivô fixo (mediana)', data: history.map(r => r.fixed) },
          { label: 'Pivô aleatório (mediana)', data: history.map(r => r.random) }
        ] },
        options: { responsive: true, maintainAspectRatio: false, animation: false,
          scales: { x: { ticks: { maxRotation: 0 } }, y: { beginAtZero: true, title: { display: true, text: 'Tempo (segundos)' } } }
        }
      });
    }
  }
})();