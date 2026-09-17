(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;
  // Mantém o destino interno usado pelo script principal, sem exibir a lista novamente.
  if (!byId('sortedOutput')) {
    const output = document.createElement('pre');
    output.id = 'sortedOutput';
    output.hidden = true;
    document.body.appendChild(output);
  }
  const format = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  function addSectionNav() {
    if (document.getElementById('sectionRail')) return;
    const nav = document.createElement('nav'); nav.id = 'sectionRail'; nav.className = 'section-rail'; nav.setAttribute('aria-label', 'Navegação pelas seções');
    nav.innerHTML = '<a href="#inicio" aria-label="Início" title="Início"></a><a href="#resultados" aria-label="Gráficos" title="Gráficos"></a><a href="#laboratorio" aria-label="Bancada" title="Bancada"></a><a href="#metodologia" aria-label="Metodologia" title="Metodologia"></a>'; document.body.appendChild(nav);
    const links = [...nav.querySelectorAll('a')], sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; links.forEach(link => { const active = link.getAttribute('href') === `#${entry.target.id}`; link.classList.toggle('is-current', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }), { rootMargin: '-25% 0px -60% 0px' }); sections.forEach(section => observer.observe(section)); }
  }
  function update() {
    const fixedText = byId('fixedTime')?.textContent.trim(), randomText = byId('randomTime')?.textContent.trim();
    if (!fixedText || !randomText || fixedText === '—' || randomText === '—') return;
    const fixed = Number(fixedText), random = Number(randomText);
    if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;
    const difference = Math.abs(fixed - random);
    const faster = fixed === random ? 'Os tempos ficaram iguais na precisão exibida.' : fixed < random ? 'Nesta execução, o pivô fixo terminou antes.' : 'Nesta execução, o pivô aleatório terminou antes.';
    const checks = byId('fixedCheck')?.textContent.trim() || '—';
    report.replaceChildren();
    const heading = document.createElement('h4'); heading.textContent = 'Resumo da sessão';
    const paragraph = document.createElement('p');
    paragraph.textContent = `${faster} Diferença absoluta: ${format(difference)} s. ${checks}. A medição é separada da animação; uma execução isolada não permite concluir qual estratégia é melhor em geral.`;
    report.append(heading, paragraph);
  }
  addSectionNav(); byId('prepareLab')?.addEventListener('click', () => setTimeout(update, 0));
})();

// Gráfico de barras compacto para comparar os tempos desta execução.
(() => {
  const canvas = document.getElementById('labChart'), button = document.getElementById('prepareLab');
  if (!canvas || !button || typeof Chart === 'undefined') return;
  let chart;
  button.addEventListener('click', () => window.setTimeout(() => {
    const fixed = Number(document.getElementById('fixedTime')?.textContent), random = Number(document.getElementById('randomTime')?.textContent);
    if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;
    if (chart) chart.destroy();
    chart = new Chart(canvas, {
      type: 'bar',
      data: { labels: ['Pivô fixo', 'Pivô aleatório'], datasets: [{ label: 'Tempo (segundos)', data: [fixed, random], backgroundColor: ['#60a5fa', '#4ade80'], borderRadius: 5, maxBarThickness: 58 }] },
      options: { indexAxis: 'x', responsive: true, maintainAspectRatio: false, animation: { duration: 450 }, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => `${c.parsed.y.toFixed(6)} s` } } }, scales: { x: { ticks: { color: '#9aa6b8' }, grid: { display: false } }, y: { beginAtZero: true, title: { display: true, text: 'Tempo (segundos)', color: '#9aa6b8' }, ticks: { color: '#9aa6b8' }, grid: { color: '#252d3b' } } } }
    });
  }, 0));
})();