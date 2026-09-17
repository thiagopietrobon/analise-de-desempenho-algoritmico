(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;

  const format = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 6 });

  function update() {
    const fixedText = byId('fixedTime')?.textContent.trim();
    const randomText = byId('randomTime')?.textContent.trim();
    if (!fixedText || !randomText || fixedText === '—' || randomText === '—') return;
    const fixed = Number(fixedText);
    const random = Number(randomText);
    if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;

    const raw = byId('userInput')?.value.trim() || '';
    const values = raw ? raw.split(/[\s,;]+/).filter(Boolean).map(Number) : [];
    const count = values.length;
    const difference = Math.abs(fixed - random);
    const paragraphs = [];
    paragraphs.push(`Entrada informada: ${format(count)} valores. Tempo medido — pivô fixo: ${fixedText} s; pivô aleatório: ${randomText} s.`);
    paragraphs.push(`Diferença absoluta observada: ${format(difference)} s. ${fixed === random ? 'Os tempos exibidos são iguais na precisão apresentada.' : fixed < random ? 'Nesta execução, o tempo exibido para o pivô fixo foi menor.' : 'Nesta execução, o tempo exibido para o pivô aleatório foi menor.'}`);

    const fixedCheck = byId('fixedCheck')?.textContent.trim();
    const randomCheck = byId('randomCheck')?.textContent.trim();
    if (fixedCheck && randomCheck && fixedCheck !== 'Aguardando execução' && randomCheck !== 'Aguardando execução') {
      paragraphs.push(`Verificação/contadores reportados pela bancada — pivô fixo: ${fixedCheck}; pivô aleatório: ${randomCheck}. Esses dados descrevem a instrumentação apresentada pela página; consulte os rótulos para saber exatamente o que cada contador representa.`);
    }

    paragraphs.push('A cronometragem e a animação são execuções distintas. Portanto, os contadores da visualização não devem ser tratados como contadores da execução cronometrada. O pivô aleatório também pode ser sorteado de forma diferente entre execuções.');
    paragraphs.push('Esta é uma observação de uma única sessão, não uma conclusão geral sobre desempenho. O resultado pode variar com a entrada, o navegador, o dispositivo e outras tarefas em execução. Para comparar com mais rigor, repita o teste com a mesma entrada, registre várias medições e compare medidas agregadas, como a mediana.');
    if (count > 1 && values.every(Number.isFinite) && new Set(values).size < count) {
      paragraphs.push('A entrada contém valores repetidos; a distribuição de valores pode afetar as partições geradas por esta implementação.');
    }

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

  byId('prepareLab')?.addEventListener('click', () => setTimeout(update, 0));
})();