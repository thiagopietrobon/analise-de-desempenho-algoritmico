(() => {
  const byId = id => document.getElementById(id);
  const report = byId('labInterpretation');
  if (!report) return;

  // Mantém o destino interno do script principal sem repetir os dados na interface.
  if (!byId('sortedOutput')) {
    const output = document.createElement('pre');
    output.id = 'sortedOutput';
    output.hidden = true;
    document.body.appendChild(output);
  }

  function addSectionNav() {
    if (byId('sectionRail')) return;
    const nav = document.createElement('nav');
    nav.id = 'sectionRail';
    nav.className = 'section-rail';
    nav.setAttribute('aria-label', 'Navegação pelas seções');
    nav.innerHTML = '<a href="#inicio" aria-label="Início" title="Início"></a><a href="#resultados" aria-label="Gráficos" title="Gráficos"></a><a href="#laboratorio" aria-label="Bancada" title="Bancada"></a><a href="#metodologia" aria-label="Metodologia" title="Metodologia"></a>';
    document.body.appendChild(nav);
    const links = [...nav.querySelectorAll('a')];
    const sections = links.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        links.forEach(link => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-current', active);
          if (active) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }), { rootMargin: '-25% 0px -60% 0px' });
      sections.forEach(section => observer.observe(section));
    }
  }

  function update() {
    const fixedText = byId('fixedTime')?.textContent.trim();
    const randomText = byId('randomTime')?.textContent.trim();
    if (!fixedText || !randomText || fixedText === '—' || randomText === '—') return;
    const fixed = Number(fixedText);
    const random = Number(randomText);
    if (!Number.isFinite(fixed) || !Number.isFinite(random)) return;
    const difference = Math.abs(fixed - random);
    const faster = fixed === random
      ? 'Os tempos ficaram iguais na precisão exibida.'
      : fixed < random
        ? 'Nesta execução, o pivô fixo terminou antes.'
        : 'Nesta execução, o pivô aleatório terminou antes.';
    const checks = byId('fixedCheck')?.textContent.trim() || '—';
    report.replaceChildren();
    const heading = document.createElement('h4');
    heading.textContent = 'Resumo da sessão';
    const paragraph = document.createElement('p');
    paragraph.textContent = `${faster} Diferença absoluta: ${difference.toLocaleString('pt-BR', { maximumFractionDigits: 6 })} s. ${checks}. A medição é separada da animação; uma execução isolada não permite concluir qual estratégia é melhor em geral.`;
    report.append(heading, paragraph);
  }

  addSectionNav();
  byId('prepareLab')?.addEventListener('click', () => setTimeout(update, 0));
})();
