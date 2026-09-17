(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;
  // script.js ainda preenche esse destino; mantém-no oculto para evitar erro sem repetir a lista na tela.
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

// Gráfico acumulativo: médias medidas e referências teóricas normalizadas.
(() => {
  const canvas = document.getElementById('labChart'), input = document.getElementById('userInput'), button = document.getElementById('prepareLab');
  if (!canvas || !input || !button || typeof Chart === 'undefined') return;
  const measurements = new Map(); let chart;
  button.addEventListener('click', () => window.setTimeout(() => {
    const n = input.value.trim().split(/[\s,;]+/).filter(Boolean).length;
    const fixed = Number(document.getElementById('fixedTime')?.textContent), random = Number(document.getElementById('randomTime')?.textContent);
    if (n < 2 || !Number.isFinite(fixed) || !Number.isFinite(random)) return;
    const prior = measurements.get(n) || { fixed: [], random: [] }; prior.fixed.push(fixed); prior.random.push(random); measurements.set(n, prior);
    const points = [...measurements.entries()].sort((a,b) => a[0]-b[0]).map(([size,t]) => ({ n:size, fixed:t.fixed.reduce((a,b)=>a+b,0)/t.fixed.length, random:t.random.reduce((a,b)=>a+b,0)/t.random.length }));
    const maxN = points[points.length-1].n, maxT = Math.max(...points.flatMap(p=>[p.fixed,p.random]), Number.EPSILON);
    const normalized = fn => points.map(p => ({ x:p.n, y:maxT*fn(p.n)/fn(maxN) }));
    const previous = Chart.getChart(canvas); if (previous) previous.destroy(); if (chart) chart.destroy();
    chart = new Chart(canvas, { type:'line', data:{ datasets:[
      {label:'Pivô fixo · média medida',data:points.map(p=>({x:p.n,y:p.fixed})),borderColor:'#60a5fa',backgroundColor:'#60a5fa',showLine:true,pointRadius:4,pointHoverRadius:6,tension:.2},
      {label:'Pivô aleatório · média medida',data:points.map(p=>({x:p.n,y:p.random})),borderColor:'#4ade80',backgroundColor:'#4ade80',showLine:true,pointRadius:4,pointHoverRadius:6,tension:.2},
      {label:'Referência n log₂ n (normalizada)',data:normalized(n=>n*Math.log2(n)),borderColor:'#fbbf24',borderDash:[6,4],pointRadius:0,showLine:true,tension:0},
      {label:'Referência n² (normalizada)',data:normalized(n=>n*n),borderColor:'#c084fc',borderDash:[6,4],pointRadius:0,showLine:true,tension:0}
    ]}, options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},scales:{x:{type:'linear',title:{display:true,text:'Tamanho da entrada (N)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}},y:{title:{display:true,text:'Tempo (segundos)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}}},plugins:{legend:{labels:{color:'#eef2f8'}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y.toFixed(6)} s`}}}}});
    let note=document.getElementById('labChartNote'); if(!note){note=document.createElement('p');note.id='labChartNote';note.className='hint';canvas.parentElement.after(note);} note.textContent=points.length===1?'Há apenas um tamanho de entrada registrado: o gráfico mostra os pontos, mas ainda não há segmentos para formar uma tendência. Prepare a bancada com outros valores de N para conectar os resultados. As referências são teóricas e normalizadas.':'As linhas conectam as médias registradas para cada tamanho de entrada. As curvas n log₂ n e n² são referências teóricas normalizadas, não medições.';
  },0));
})();