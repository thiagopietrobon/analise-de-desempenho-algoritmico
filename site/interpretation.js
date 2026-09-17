(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;

  const number = value => Number(value).toLocaleString('pt-BR');
  const metricText = side => {
    const node = byId(`${side}Metrics`);
    if (!node) return null;
    const values = [...node.querySelectorAll('span')].map(item => item.textContent.trim());
    return values.length ? values.join(' · ') : null;
  };

  function update() {
    const fixedText = byId('fixedTime')?.textContent.trim();
    const randomText = byId('randomTime')?.textContent.trim();
    if (!fixedText || !randomText || fixedText === '—' || randomText === '—') return;
    const fixed = Number(fixedText);
    const random = Number(randomText);
    if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;

    const raw = byId('userInput')?.value.trim() || '';
    const tokens = raw ? raw.split(/[\s,;]+/).filter(Boolean) : [];
    const count = tokens.length;
    const paragraphs = [`Nesta sessão foram medidos ${number(count)} valores. O pivô fixo levou ${fixedText} s e o pivô aleatório levou ${randomText} s; a diferença observada foi de ${Math.abs(fixed - random).toFixed(6)} s.`];
    const fixedMetrics = metricText('fixed');
    const randomMetrics = metricText('random');
    if (fixedMetrics && randomMetrics) paragraphs.push(`Métricas da animação — pivô fixo: ${fixedMetrics}. Pivô aleatório: ${randomMetrics}.`);
    paragraphs.push('A medição de tempo e a animação são execuções separadas. Como o pivô aleatório é sorteado novamente, os contadores exibidos na animação não descrevem necessariamente a execução cronometrada. A profundidade máxima refere-se à recursão da visualização, não à pilha do algoritmo iterativo cronometrado.');
    if (count > 1 && new Set(tokens.map(Number)).size < count) paragraphs.push('A entrada contém valores repetidos; isso também influencia as partições produzidas por esta implementação.');

    report.replaceChildren();
    const heading = document.createElement('h4');
    heading.textContent = 'Leitura desta sessão';
    report.appendChild(heading);
    paragraphs.forEach(text => {
      const p = document.createElement('p');
      p.textContent = text;
      report.appendChild(p);
    });
  }

  // O listener principal prepara a bancada primeiro; atualizamos depois dele.
  byId('prepareLab')?.addEventListener('click', () => setTimeout(update, 0));
})();