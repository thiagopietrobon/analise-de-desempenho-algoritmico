// Complementos da bancada: medições repetidas, histórico de sessão e gráfico compacto.
(() => {
    const $ = (id) => document.getElementById(id);
    const history = [];
    let historyChart;
    const median = (values) => {
        const sorted = [...values].sort((a, b) => a - b);
        const m = Math.floor(sorted.length / 2);
        return sorted.length % 2 ? sorted[m] : (sorted[m - 1] + sorted[m]) / 2;
    };
    function sort(input, randomPivot) {
        const a = input.slice(),
            stack = [[0, a.length - 1]];
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
                for (let j = lo + 1; j <= hi; j++)
                    if (a[j] <= pivot) {
                        [a[i], a[j]] = [a[j], a[i]];
                        i++;
                    }
                const k = i - 1;
                [a[lo], a[k]] = [a[k], a[lo]];
                const left = [lo, k - 1],
                    right = [k + 1, hi];
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
    function timed(input, random) {
        const start = performance.now();
        const output = sort(input, random);
        return { seconds: (performance.now() - start) / 1000, output };
    }
    function drawSample(side, input) {
        const sample =
            input.length <= 30
                ? input
                : Array.from(
                      { length: 30 },
                      (_, i) =>
                          input[Math.floor((i * (input.length - 1)) / 29)],
                  );
        const min = Math.min(...sample),
            range = Math.max(...sample) - min || 1;
        const host = $(side + "Bars");
        host.innerHTML = sample
            .map(
                (v, i) =>
                    `<div class="bar-item" style="height:${18 + ((v - min) / range) * 78}%" title="Amostra ${i + 1}: ${v}"><span>${v}</span></div>`,
            )
            .join("");
        if (input.length > 30) {
            $(side + "Event").textContent =
                "Prévia de 30 valores representativos; animação desativada acima de 30.";
            $(side + "Count").textContent = `Prévia de 30 / ${input.length}`;
            $(side + "State").textContent = "Prévia";
        }
    }
    function renderHistory() {
        let host = $("sessionHistory");
        if (!host) {
            host = document.createElement("div");
            host.id = "sessionHistory";
            host.className = "table-panel";
            const report =
                document.querySelector(".report-panel") ||
                $("laboratorio") ||
                document.body;
            report.appendChild(host);
        }
        host.innerHTML = `<h4>Histórico desta sessão</h4><p>${history.length} registro(s), mantidos apenas nesta visita.</p><div class="table-scroll"><table><thead><tr><th>Horário</th><th>N</th><th>Mediana pivô fixo (s)</th><th>Mediana pivô aleatório (s)</th></tr></thead><tbody>${history.map((r) => `<tr><td>${r.at}</td><td>${r.n}</td><td>${r.fixed.toFixed(6)}</td><td>${r.random.toFixed(6)}</td></tr>`).join("")}</tbody></table></div><button id="exportSession" class="secondary" type="button">Exportar histórico da sessão CSV</button><div class="chart-wrap"><canvas id="sessionChart" role="img" aria-label="Comparação das medianas desta sessão"></canvas></div>`;
        $("exportSession").addEventListener("click", () => {
            const lines = [
                "horario,n,mediana_pivo_fixo_s,mediana_pivo_aleatorio_s",
                ...history.map((r) => [r.at, r.n, r.fixed, r.random].join(",")),
            ];
            const blob = new Blob(["\ufeff" + lines.join("\n")], {
                type: "text/csv;charset=utf-8;",
            });
            const url = URL.createObjectURL(blob),
                a = document.createElement("a");
            a.href = url;
            a.download = "quicksort_sessao.csv";
            a.click();
            URL.revokeObjectURL(url);
        });
        if (typeof Chart !== "undefined") {
            if (historyChart) historyChart.destroy();
            historyChart = new Chart($("sessionChart"), {
                type: "bar",
                data: {
                    labels: history.map((r) => `N=${r.n}`),
                    datasets: [
                        {
                            label: "Pivô fixo (mediana)",
                            data: history.map((r) => r.fixed),
                        },
                        {
                            label: "Pivô aleatório (mediana)",
                            data: history.map((r) => r.random),
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: { legend: { position: "bottom" } },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: { display: true, text: "Tempo (s)" },
                        },
                    },
                },
            });
        }
    }
    function prepare() {
        const status = $("labStatus");
        try {
            const raw = $("userInput").value.trim();
            if (!raw) throw Error("Digite números ou gere uma entrada.");
            const input = raw
                .split(/[\s,;]+/)
                .filter(Boolean)
                .map(Number);
            if (input.some((v) => !Number.isFinite(v)))
                throw Error("A entrada contém valor inválido.");
            if (input.length < 2) throw Error("Informe ao menos dois números.");
            if (input.length > 20000)
                throw Error("Limite da medição: 20.000 números.");
            ["fixed", "random"].forEach((side) => drawSample(side, input));
            timed(input, false);
            timed(input, true); // um aquecimento descartado por estratégia
            const values = { fixed: [], random: [] };
            for (let i = 0; i < 5; i++)
                (i % 2 ? ["random", "fixed"] : ["fixed", "random"]).forEach(
                    (side) =>
                        values[side].push(
                            timed(input, side === "random").seconds,
                        ),
                );
            const fixed = median(values.fixed),
                random = median(values.random);
            const a = sort(input, false),
                b = sort(input, true);
            const sorted = a.every((v, i) => i === 0 || a[i - 1] <= v),
                equal = a.length === b.length && a.every((v, i) => v === b[i]);
            $("fixedTime").textContent = fixed.toFixed(6);
            $("randomTime").textContent = random.toFixed(6);
            const check =
                sorted && equal
                    ? "Ordenada; saída igual à outra estratégia"
                    : "Verificação falhou";
            $("fixedCheck").textContent = check;
            $("randomCheck").textContent = check;
            $("sortedOutput").textContent = a.slice(0, 200).join(", ");
            status.textContent = `Medição concluída: N=${input.length}; aquecimento descartado e 5 repetições por estratégia. Medianas exibidas; animação até 30 valores.`;
            const report = $("labInterpretation");
            if (report)
                report.innerHTML = `<h4>Resumo da sessão</h4><p>N=${input.length}. Mediana: pivô fixo ${fixed.toFixed(6)} s; pivô aleatório ${random.toFixed(6)} s. Saídas ${sorted && equal ? "ordenadas e iguais" : "com falha na verificação"}. Resultado desta execução no navegador.</p>`;
            history.push({
                n: input.length,
                fixed,
                random,
                at: new Date().toLocaleTimeString("pt-BR"),
            });
            renderHistory();
            if (typeof Chart !== "undefined") {
                if (window.labChart) window.labChart.destroy();
                window.labChart = new Chart($("labChart"), {
                    type: "bar",
                    data: {
                        labels: ["Pivô fixo", "Pivô aleatório"],
                        datasets: [
                            {
                                label: "Mediana (s)",
                                data: [fixed, random],
                                backgroundColor: ["#60a5fa", "#4ade80"],
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: "Tempo (segundos)",
                                },
                            },
                        },
                    },
                });
            }
        } catch (error) {
            status.textContent =
                error?.message || "Não foi possível preparar a bancada.";
        }
    }
    document.addEventListener(
        "click",
        (event) => {
            if (event.target.closest("#prepareLab")) {
                event.preventDefault();
                event.stopImmediatePropagation();
                prepare();
            }
        },
        true,
    );
})();
