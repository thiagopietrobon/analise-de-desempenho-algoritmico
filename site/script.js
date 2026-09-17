const CSV_URL = '../dados/quicksort_resultados.csv';
const $ = (id) => document.getElementById(id);
let rows = [], chart, labChart;
const palette = ['#60a5fa','#4ade80','#fbbf24','#c084fc'];
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines.shift().split(',');
  return lines.map(line => {
    const values = line.split(',');
    const obj = Object.fromEntries(headers.map((h,i) => [h, values[i]]));
    return {n:Number(obj.tamanho_n), algorithm:obj.algoritmo, scenario:obj.cenario, time:Number(obj.tempo_segundos), growth:obj.razao_crescimento === '' ? null : Number(obj.razao_crescimento)};
  });
}
function filtered() {
  return rows.filter(r => ($('algorithm').value === 'all' || r.algorithm === $('algorithm').value) && ($('scenario').value === 'all' || r.scenario === $('scenario').value));
}
function render() {
  const data = filtered();
  $('resultsBody').innerHTML = data.map(r => `<tr><td>${r.n.toLocaleString('pt-BR')}</td><td>${r.algorithm}</td><td>${r.scenario}</td><td>${r.time.toFixed(6)}</td><td>${r.growth === null ? '—' : r.growth.toFixed(2)+'×'}</td></tr>`).join('');
  $('tableStatus').textContent = `Exibindo ${data.length} de ${rows.length} medições.`;
  if (typeof Chart === 'undefined') { showError('A biblioteca dos gráficos não carregou. Verifique sua conexão com a internet.'); return; }
  const keys = [...new Set(data.map(r => r.algorithm+'|'+r.scenario))];
  const datasets = keys.map(key => {
    const [a,s] = key.split('|');
    const color = palette[keys.indexOf(key)%palette.length];
    return {label:`Pivô ${a.toLowerCase()} · entrada ${s.toLowerCase()}`, data:data.filter(r=>r.algorithm===a&&r.scenario===s).sort((x,y)=>x.n-y.n).map(r=>({x:r.n,y:r.time})), borderColor:color, backgroundColor:color, tension:.2};
  });
  if (chart) chart.destroy();
  chart = new Chart($('resultsChart'), {type:'line',data:{datasets},options:{responsive:true,maintainAspectRatio:false,interaction:{mode:'nearest',intersect:false},scales:{x:{type:'linear',title:{display:true,text:'Tamanho da entrada (N)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}},y:{type:$('scale').value,title:{display:true,text:'Tempo (segundos)'},ticks:{color:'#9aa6b8'},grid:{color:'#252d3b'}}},plugins:{legend:{labels:{color:'#eef2f8'}},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${c.parsed.y.toFixed(6)} s`}}}}});
}
function showError(message) { const el=$('error'); if(el){el.textContent=message;el.hidden=false;} }
function quicksort(input, randomPivot) {
  const a=input.slice();
  // Pilha explícita: evita estouro de pilha de chamadas recursivas.
  const stack=[[0,a.length-1]];
  while(stack.length) {
    let [lo,hi]=stack.pop();
    while(lo<hi) {
      let p=lo;
      if(randomPivot){p=lo+Math.floor(Math.random()*(hi-lo+1));[a[p],a[lo]]=[a[lo],a[p]];}
      const pivot=a[lo]; let i=lo+1;
      for(let j=lo+1;j<=hi;j++){if(a[j]<=pivot){[a[i],a[j]]=[a[j],a[i]];i++;}}
      const pivotIndex=i-1; [a[lo],a[pivotIndex]]=[a[pivotIndex],a[lo]];
      // Processa o lado menor imediatamente e empilha o maior para limitar a pilha.
      const left=[lo,pivotIndex-1], right=[pivotIndex+1,hi];
      if(left[1]-left[0] < right[1]-right[0]) { if(right[0]<right[1])stack.push(right); [lo,hi]=left; }
      else { if(left[0]<left[1])stack.push(left); [lo,hi]=right; }
    }
  }
  return a;
}
function runLab() {
  try {
    const raw=$('userInput').value.trim();
    if(!raw) throw new Error('Digite números ou clique em “Gerar entrada”.');
    const input=raw.split(/[\s,;]+/).filter(Boolean).map(Number);
    if(input.some(v=>!Number.isFinite(v))) throw new Error('Use apenas números válidos separados por vírgulas ou espaços.');
    if(input.length<2) throw new Error('Informe pelo menos dois números.');
    if(input.length>20000) throw new Error('O limite é de 20.000 números.');
    const start1=performance.now(), fixed=quicksort(input,false), t1=(performance.now()-start1)/1000;
    const start2=performance.now(), random=quicksort(input,true), t2=(performance.now()-start2)/1000;
    $('fixedTime').textContent=t1.toFixed(6); $('randomTime').textContent=t2.toFixed(6);
    const ok=fixed.every((v,i)=>v===random[i]);
    $('fixedCheck').textContent=ok?'Saída ordenada e consistente':'Verifique o resultado';
    $('randomCheck').textContent=ok?'Saída ordenada e consistente':'Verifique o resultado';
    $('sortedOutput').textContent=fixed.slice(0,200).join(', ')+(fixed.length>200?` … (${fixed.length} valores no total)`:'' );
    $('labStatus').textContent=`Executados ${input.length.toLocaleString('pt-BR')} valores. Medição local do navegador; não compare diretamente com o CSV.`;
    if(typeof Chart==='undefined') throw new Error('A biblioteca dos gráficos não carregou.');
    if(labChart)labChart.destroy();
    labChart=new Chart($('labChart'),{type:'bar',data:{labels:['Pivô fixo','Pivô aleatório'],datasets:[{label:'Tempo (s)',data:[t1,t2],backgroundColor:[palette[0],palette[1]]}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9aa6b8'}},y:{beginAtZero:true,title:{display:true,text:'Segundos'},ticks:{color:'#9aa6b8'}}}}});
  } catch(e) { $('labStatus').textContent=e.message; }
}
function generate() {
  const count=Math.max(2,Math.min(20000,Number($('amount').value)||1000)), type=$('inputType').value;
  let a=Array.from({length:count},()=>Math.floor(Math.random()*100000));
  if(type==='sorted')a.sort((x,y)=>x-y);
  if(type==='reverse')a.sort((x,y)=>y-x);
  if(type==='duplicates')a=Array.from({length:count},()=>Math.floor(Math.random()*10));
  $('userInput').value=a.join(', '); $('labStatus').textContent=`Entrada de ${count.toLocaleString('pt-BR')} números gerada.`;
}
$('algorithm').addEventListener('change',render); $('scenario').addEventListener('change',render); $('scale').addEventListener('change',render);
$('reset').addEventListener('click',()=>{$('algorithm').value='all';$('scenario').value='all';$('scale').value='linear';render();});
$('generate').addEventListener('click',generate); $('runLab').addEventListener('click',runLab);
$('download').addEventListener('click',()=>{const blob=new Blob([['tamanho_n,algoritmo,cenario,tempo_segundos,razao_crescimento',...rows.map(r=>[r.n,r.algorithm,r.scenario,r.time,r.growth??''].join(','))].join('\n')],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='quicksort_resultados.csv';a.click();URL.revokeObjectURL(url);});
fetch(CSV_URL).then(r=>{if(!r.ok)throw new Error(`CSV não encontrado (HTTP ${r.status}). Confira a pasta aberta no Live Server.`);return r.text();}).then(text=>{rows=parseCSV(text);render();}).catch(e=>{ $('resultsBody').innerHTML=`<tr><td colspan="5">Erro ao carregar os dados: ${e.message}</td></tr>`; $('tableStatus').textContent=''; showError(e.message); });