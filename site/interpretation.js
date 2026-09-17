(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;
  const format = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 6 });
  function addSectionNav() {
    if (document.getElementById('sectionRail')) return;
    const nav = document.createElement('nav'); nav.id = 'sectionRail'; nav.className = 'section-rail'; nav.setAttribute('aria-label', 'Navegação pelas seções');
    nav.innerHTML = '<span class="section-rail-title">SEÇÕES</span><a href="#inicio">Início</a><a href="#resultados">Resultados</a><a href="#laboratorio">Bancada</a><a href="#metodologia">Metodologia</a>'; document.body.appendChild(nav);
    const links = [...nav.querySelectorAll('a')], sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (!entry.isIntersecting) return; links.forEach(link => { const active = link.getAttribute('href') === `#${entry.target.id}`; link.classList.toggle('is-current', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); }); }), { rootMargin: '-20% 0px -65% 0px' }); sections.forEach(section => observer.observe(section)); }
  }
  function block(title, content, className) { const section = document.createElement('section'); section.className = `reading-block ${className || ''}`; const h = document.createElement('h5'); h.textContent = title; const p = document.createElement('p'); p.textContent = content; section.append(h, p); return section; }
  function update() {
    const fixedText = byId('fixedTime')?.textContent.trim(), randomText = byId('randomTime')?.textContent.trim();
    if (!fixedText || !randomText || fixedText === '—' || randomText === '—') return;
    const fixed = Number(fixedText), random = Number(randomText); if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;
    const raw = byId('userInput')?.value.trim() || '', values = raw ? raw.split(/[\s,;]+/).filter(Boolean).map(Number) : [], count = values.length;
    const difference = Math.abs(fixed - random), observation = fixed === random ? 'Os tempos são iguais na precisão apresentada.' : fixed < random ? 'Nesta execução, o tempo exibido para o pivô fixo foi menor.' : 'Nesta execução, o tempo exibido para o pivô aleatório foi menor.';
    const checks = `Pivô fixo: ${byId('fixedCheck')?.textContent.trim() || '—'}; pivô aleatório: ${byId('randomCheck')?.textContent.trim() || '—'}.`;
    report.replaceChildren(); const heading = document.createElement('h4'); heading.textContent = 'Leitura desta sessão'; report.appendChild(heading);
    report.appendChild(block('01 · Resumo da entrada', `Foram informados ${format(count)} valores.`, 'reading-summary'));
    report.appendChild(block('02 · Tempos medidos', `Pivô fixo: ${fixedText} s. Pivô aleatório: ${randomText} s. Diferença absoluta: ${format(difference)} s. ${observation}`, 'reading-timing'));
    report.appendChild(block('03 · Verificação', checks, 'reading-check'));
    report.appendChild(block('04 · Como interpretar', 'A cronometragem e a animação são execuções distintas; os contadores da animação não representam necessariamente a execução cronometrada. O pivô aleatório pode mudar entre execuções. Um resultado isolado não permite concluir desempenho geral: navegador, dispositivo, entrada e tarefas simultâneas podem alterar os tempos.', 'reading-caveat'));
    report.appendChild(block('05 · Próximo passo', 'Para uma comparação mais consistente, repita com a mesma entrada, registre várias execuções e compare medidas agregadas, como a mediana.', 'reading-next'));
    if (count > 1 && values.every(Number.isFinite) && new Set(values).size < count) report.appendChild(block('Observação sobre os dados', 'A entrada contém valores repetidos; isso pode influenciar as partições produzidas pela implementação.', 'reading-note'));
  }
  addSectionNav(); byId('prepareLab')?.addEventListener('click', () => setTimeout(update, 0));
})();

// Substitui o gráfico local de barras por uma curva acumulada de medições reais.
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
      {label:'Pivô fixo · média medida',data:points.map(p=>({x:p.n,y:p.fixed})),borderColor:'#60a5fa',backgroundColor:'#60a5fa',tension:.2},
      {label:'Pivô aleatório · média medida',data:points.map(p=>({x:p.n,y:p.random})),borderColor:'#4ade80',backgroundColor:'#4ade80',tension:.2},
      {label:'Referência n log₂ n (normalizada)',data:normalized(n=>n*Math.log2(n)),borderColor:'#fbbf24',borderDash:[6,4],pointRadius:0,tension:0},
      {label:'Referência n² (normalizada)',data:normalized(n=>n*n),borderColor:'#c084fc',borderDash:[6,4],pointRadius:0,tension:0}
    ]}, options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},scales:{x:{type:'linear',title:{display:true,text:'Tamanho da entrada (N)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}},y:{title:{display:true,text:'Tempo (segundos)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}}},plugins:{legend:{labels:{color:'#eef2f8'}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y.toFixed(6)} s`}}}}});
    let note=document.getElementById('labChartNote'); if(!note){note=document.createElement('p');note.id='labChartNote';note.className='hint';canvas.parentElement.after(note);} note.textContent='Os pontos são médias das repetições feitas nesta página para cada N. As curvas n log₂ n e n² são referências teóricas normalizadas, não medições nem ajuste estatístico. Para visualizar a tendência, prepare entradas de tamanhos diferentes.';
  },0));
})();