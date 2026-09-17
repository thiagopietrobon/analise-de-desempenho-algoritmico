(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;

  const format = value => Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 6 });

  function addSectionNav() {
    if (document.getElementById('sectionRail')) return;
    const nav = document.createElement('nav');
    nav.id = 'sectionRail';
    nav.className = 'section-rail';
    nav.setAttribute('aria-label', 'Navegação pelas seções');
    nav.innerHTML = '<span class="section-rail-title">SEÇÕES</span><a href="#inicio" aria-label="Ir ao início">Início</a><a href="#resultados">Resultados</a><a href="#laboratorio">Bancada</a><a href="#metodologia">Metodologia</a>';
    document.body.appendChild(nav);
    const links = [...nav.querySelectorAll('a')];
    const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('is-current', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-20% 0px -65% 0px' });
      sections.forEach(section => observer.observe(section));
    }
  }

  function block(title, content, className) {
    const section = document.createElement('section');
    section.className = `reading-block ${className || ''}`;
    const h = document.createElement('h5');
    h.textContent = title;
    const p = document.createElement('p');
    p.textContent = content;
    section.append(h, p);
    return section;
  }

  function update() {
    const fixedText = byId('fixedTime')?.textContent.trim();
    const randomText = byId('randomTime')?.textContent.trim();
    if (!fixedText || !randomText || fixedText === '—' || randomText === '—') return;
    const fixed = Number(fixedText), random = Number(randomText);
    if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;
    const raw = byId('userInput')?.value.trim() || '';
    const values = raw ? raw.split(/[\s,;]+/).filter(Boolean).map(Number) : [];
    const count = values.length;
    const difference = Math.abs(fixed - random);
    const observation = fixed === random
      ? 'Os tempos são iguais na precisão apresentada.'
      : fixed < random
        ? 'Nesta execução, o tempo exibido para o pivô fixo foi menor.'
        : 'Nesta execução, o tempo exibido para o pivô aleatório foi menor.';
    const checks = `Pivô fixo: ${byId('fixedCheck')?.textContent.trim() || '—'}; pivô aleatório: ${byId('randomCheck')?.textContent.trim() || '—'}.`;
    const caveats = 'A cronometragem e a animação são execuções distintas; os contadores da animação não representam necessariamente a execução cronometrada. O pivô aleatório pode mudar entre execuções. Este resultado isolado não permite concluir desempenho geral: navegador, dispositivo, entrada e tarefas simultâneas podem alterar os tempos.';
    const repeat = 'Para uma comparação mais consistente, repita com a mesma entrada, registre várias execuções e compare medidas agregadas, como a mediana.';

    report.replaceChildren();
    const heading = document.createElement('h4');
    heading.textContent = 'Leitura desta sessão';
    report.appendChild(heading);
    report.appendChild(block('01 · Resumo da entrada', `Foram informados ${format(count)} valores.`, 'reading-summary'));
    report.appendChild(block('02 · Tempos medidos', `Pivô fixo: ${fixedText} s. Pivô aleatório: ${randomText} s. Diferença absoluta: ${format(difference)} s. ${observation}`, 'reading-timing'));
    report.appendChild(block('03 · Verificação', checks, 'reading-check'));
    report.appendChild(block('04 · Como interpretar', caveats, 'reading-caveat'));
    report.appendChild(block('05 · Próximo passo', repeat, 'reading-next'));
    if (count > 1 && values.every(Number.isFinite) && new Set(values).size < count) {
      report.appendChild(block('Observação sobre os dados', 'A entrada contém valores repetidos; isso pode influenciar as partições produzidas pela implementação.', 'reading-note'));
    }
  }

  addSectionNav();
  byId('prepareLab')?.addEventListener('click', () => setTimeout(update, 0));
})();