// Complementos da bancada: captura o botão antes do listener original.
(function () {
  const $ = id => document.getElementById(id);
  const history = [];
  let sessionChart;

  function median(values) {
    const sorted = values.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }

  function quicksort(input, randomPivot) {
    const a = input.slice();
    const stack = [[0, a.length - 1]];
    while (stack.length) {
      let [lo, hi] = stack.pop();
      while (lo < hi) {
        let p = lo;
        if (randomPivot) {
          p = lo + Math.floor(Math.random() * (hi - lo + 1));
          [a[p], a[lo]] = [a[lo], a[p]];
        }
        const pivot = a[lo];
        let i = lo + 1;
        for (let j = lo + 1; j <= hi; j++) {
          if (a[j] <= pivot) {
            [a[i], a[j]] = [a[j], a[i]];
            i++;
          }
        }
        const k = i - 1;
        [a[lo], a[k]] = [a[k], a[lo]];
        const left = [lo, k - 1], right = [k + 1, hi];
        if (left[1] - left[0] < right[1] - right[0]) {
          if (right[0] < right[1]) stack.push(right);
          [lo, hi] = left;
        } else {
          if (left[0] < left[1]) stack.push(left);
          [lo, hi] = right;
        }
      }
    }
    return a;
  }

  function timed(input, randomPivot) {
    const start = performance.now();
    const output = quicksort(input, randomPivot);
    return { seconds: (performance.now() - start) / 1000, output };
  }

  function renderHistory() {
    let host = $('sessionHistory');
    if (!host) {
      host = document.createElement('div');
      host.id = 'sessionHistory';
      host.className = 'table-panel';
      $('.report-panel').appendChild(host);
    }
    host.innerHTML = `<h4>Histórico desta sessão</h4><p>${history.length} registro(s), mantidos apenas nesta visita.</p><div class="table-scroll"><table><thead><tr><th>Horário</th><th>N</th><th>Mediana pivô fixo (s)</th><th>Mediana pivô aleatório (s)</th></tr></thead><tbody>${history.map(r => `<tr><td>${r.at}</td><td>${r.n}</td><td>${r.fixed.toFixed(6)}</td><td>${r.random.toFixed(6)}</td></tr>`).join('')}</tbody></table></div><button id="exportSession" class="secondary" type="button">Exportar histórico da sessão CSV</button><div class="chart-wrap"><canvas id="sessionChart" role="img" aria-label="Comparação das medianas registradas nesta sessão"></canvas></div>`;
    $('exportSession').addEventListener('click', () => {
      const rows = ['horario,n,mediana_pivo_fixo_s,mediana_pivo_aleatorio_s', ...history.map(r => [r.at, r.n, r.fixed, r.random].join(','))];
      const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob), a = document.createElement('a');
      a.href = url; a.download = 'quicksort_sessao.csv'; a.click(); URL.revokeObjectURL(url);
    });
    if (typeof Chart !== 'undefined') {
      if (sessionChart) sessionChart.destroy();
      sessionChart = new Chart($('sessionChart'), {
        type: 'bar', data: { labels: history.map(r => `N=${r.n}`), datasets: [
          { label: 'Pivô fixo (mediana)', data: history.map(r => r.fixed) },
          { label: 'Pivô aleatório (mediana)', data: history.map(r => r.random) }
        ] }, options: { responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { position: 'bottom' } },
          scales: { x: { ticks: { maxRotation: 0 } }, y: { beginAtZero: true, title: { display: true, text: 'Tempo (segundos)' } } }
        }
      });
    }
  }

  function prepare() {
    const status = $('labStatus');
    try {
      const raw = $('userInput').value.trim();
      if (!raw) throw new Error('Digite números ou gere uma entrada.');
      const input = raw.split(/[\s,;]+/).filter(Boolean).map(Number);
      if (input.some(v => !Number.isFinite(v))) throw new Error('A entrada contém valor inválido.');
      if (input.length < 2) throw new Error('Informe ao menos dois números.');
      if (input.length > 20000) throw new Error('Limite da medição: 20.000 números.');

      // Atualiza a animação original somente quando ela é suportada; o cronômetro fica separado.
      if (input.length > 30) {
        for (const side of ['fixed', 'random']) {
          const bars = $(side + 'Bars');
          if (bars) bars.innerHTML = '';
          $(side + 'Event').textContent = 'Animação desativada para entradas acima de 30 valores.';
          $(side + 'Count').textContent = 'Medição sem animação';
          $(side + 'State').textContent = 'Medição';
        }
      }

      timed(input, false); // aquecimento descartado
      timed(input, true);
      const results = { fixed: [], random: [] };
      for (let i = 0; i < 5; i++) {
        const order = i % 2 === 0 ? ['fixed', 'random'] : ['random', 'fixed'];
        order.forEach(side => results[side].push(timed(input, side === 'random').seconds));
      }
      const fixed = median(results.fixed), random = median(results.random);
      const fixedOutput = quicksort(input, false), randomOutput = quicksort(input, true);
      const sorted = fixedOutput.every((v, i) => i === 0 || fixedOutput[i - 1] <= v);
      const equal = fixedOutput.length === randomOutput.length && fixedOutput.every((v, i) => v === randomOutput[i]);
      $('fixedTime').textContent = fixed.toFixed(6);
      $('randomTime').textContent = random.toFixed(6);
      const check = sorted && equal ? 'Ordenada; saída igual à outra estratégia' : 'Verificação falhou';
      $('fixedCheck').textContent = check; $('randomCheck').textContent = check;
      $('sortedOutput').textContent = fixedOutput.slice(0, 200).join(', ');
      status.textContent = `Medição concluída: N=${input.length}; 1 aquecimento descartado e 5 repetições válidas por estratégia. Valores exibidos são medianas.`;
      $('labInterpretation').innerHTML = `<h4>Resumo da sessão</h4><p>N=${input.length}. Mediana: pivô fixo ${fixed.toFixed(6)} s; pivô aleatório ${random.toFixed(6)} s. As saídas ${sorted && equal ? 'estão ordenadas e são iguais' : 'não passaram em todas as verificações'}. Esta comparação descreve apenas esta execução no navegador.</p>`;
      history.push({ n: input.length, fixed, random, at: new Date().toLocaleTimeString('pt-BR') });
      renderHistory();
      if (typeof Chart !== 'undefined') {
        if (window.labChart) window.labChart.destroy();
        window.labChart = new Chart($('labChart'), { type: 'bar', data: {
          labels: ['Pivô fixo', 'Pivô aleatório'], datasets: [{ label: 'Mediana (s)', data: [fixed, random] }]
        }, options: { responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, title: { display: true, text: 'Tempo (segundos)' } } }
        }});
      }
    } catch (error) { status.textContent = error.message; }
  }

  // Captura antes do listener de script.js, evitando depender de funções locais não exportadas.
  document.addEventListener('click', event => {
    if (event.target.closest('#prepareLab')) {
      event.preventDefault(); event.stopImmediatePropagation(); prepare();
    }
  }, true);
})();