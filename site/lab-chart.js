(() => {
  const canvas = document.getElementById('labChart');
  const input = document.getElementById('userInput');
  const button = document.getElementById('prepareLab');
  if (!canvas || !input || !button || typeof Chart === 'undefined') return;
  const measurements = new Map();
  let chart;
  const parseSize = () => input.value.trim().split(/[\s,;]+/).filter(Boolean).length;
  button.addEventListener('click', () => {
    window.setTimeout(() => {
      const n = parseSize();
      const fixed = Number(document.getElementById('fixedTime')?.textContent);
      const random = Number(document.getElementById('randomTime')?.textContent);
      if (n < 2 || !Number.isFinite(fixed) || !Number.isFinite(random)) return;
      const prior = measurements.get(n) || { fixed: [], random: [] };
      prior.fixed.push(fixed); prior.random.push(random);
      measurements.set(n, prior);
      const points = [...measurements.entries()].sort((a,b) => a[0]-b[0]).map(([size,t]) => ({n:size,fixed:t.fixed.reduce((a,b)=>a+b,0)/t.fixed.length,random:t.random.reduce((a,b)=>a+b,0)/t.random.length}));
      const maxN = points[points.length-1].n;
      const maxT = Math.max(...points.flatMap(p=>[p.fixed,p.random]), Number.EPSILON);
      const norm = fn => points.map(p => ({x:p.n,y:maxT*fn(p.n)/fn(maxN)}));
      if (chart) chart.destroy();
      chart = new Chart(canvas, {type:'line',data:{datasets:[
        {label:'Pivô fixo · média medida',data:points.map(p=>({x:p.n,y:p.fixed})),borderColor:'#60a5fa',backgroundColor:'#60a5fa',tension:.2},
        {label:'Pivô aleatório · média medida',data:points.map(p=>({x:p.n,y:p.random})),borderColor:'#4ade80',backgroundColor:'#4ade80',tension:.2},
        {label:'Referência n log₂ n (normalizada)',data:norm(n=>n*Math.log2(n)),borderColor:'#fbbf24',borderDash:[6,4],pointRadius:0,tension:0},
        {label:'Referência n² (normalizada)',data:norm(n=>n*n),borderColor:'#c084fc',borderDash:[6,4],pointRadius:0,tension:0}
      ]},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},scales:{x:{type:'linear',title:{display:true,text:'Tamanho da entrada (N)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}},y:{title:{display:true,text:'Tempo (segundos)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}}},plugins:{legend:{labels:{color:'#eef2f8'}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y.toFixed(6)} s`}}}}});
      let note = document.getElementById('labChartNote');
      if (!note) { note=document.createElement('p'); note.id='labChartNote'; note.className='hint'; canvas.parentElement.after(note); }
      note.textContent='Cada ponto medido representa a média das repetições para esse N nesta página. As curvas n log₂ n e n² são referências teóricas normalizadas ao maior N e ao maior tempo observado; não são medições nem ajuste estatístico.';
    }, 0);
  });
})();