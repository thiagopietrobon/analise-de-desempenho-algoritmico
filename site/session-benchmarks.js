(() => {
    const $ = (id) => document.getElementById(id);
    const history = [];
    let chart;
    const median = (values) => {
        const sorted = [...values].sort((a, b) => a - b);
        return sorted[Math.floor(sorted.length / 2)];
    };
    const seconds = (value) => (value / 1000).toFixed(6);
    function sort(values, randomPivot) {
        const a = values.slice(),
            stack = [[0, values.length - 1]];
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
    function read() {
        const raw = $("userInput")?.value.trim();
        if (!raw) throw Error("Digite ou gere uma entrada antes de medir.");
        const values = raw
            .split(/[\s,;]+/)
            .filter(Boolean)
            .map(Number);
        if (
            values.length < 2 ||
            values.length > 20000 ||
            values.some((v) => !Number.isFinite(v))
        )
            throw Error("Informe de 2 a 20.000 números válidos.");
        return values;
    }
    function renderHistory() {
        let host = $("sessionHistory");
        if (!host) {
            host = document.createElement("section");
            host.id = "sessionHistory";
            host.className = "session-history";
            const report = document.querySelector(".report-panel");
            if (report) report.append(host);
        }
        host.innerHTML =
            "<h4>Histórico desta sessão</h4>" +
            (history.length
                ? '<div class="table-scroll"><table><thead><tr><th>N</th><th>Mediana pivô fixo (s)</th><th>Mediana pivô aleatório (s)</th></tr></thead><tbody>' +
                  history
                      .map(
                          (r) =>
                              `<tr><td>${r.n}</td><td>${r.fixed}</td><td>${r.random}</td></tr>`,
                      )
                      .join("") +
                  '</tbody></table></div><button type="button" class="secondary" id="exportSession">Exportar histórico CSV</button>'
                : "<p>Nenhuma medição registrada nesta sessão.</p>");
        $("exportSession")?.addEventListener("click", () => {
            const csv = [
                "N,mediana_pivo_fixo_s,mediana_pivo_aleatorio_s",
                ...history.map((r) => `${r.n},${r.fixed},${r.random}`),
            ].join("\n");
            const url = URL.createObjectURL(
                new Blob([csv], { type: "text/csv;charset=utf-8;" }),
            );
            const a = document.createElement("a");
            a.href = url;
            a.download = "quicksort_sessao.csv";
            a.click();
            URL.revokeObjectURL(url);
        });
    }
    $("prepareLab")?.addEventListener("click", () =>
        setTimeout(() => {
            try {
                const input = read();
                // Uma rodada de aquecimento por estratégia, descartada.
                sort(input, false);
                sort(input, true);
                const fixed = [],
                    random = [];
                for (let i = 0; i < 5; i++) {
                    const fixedFirst = i % 2 === 0;
                    const runFixed = () => {
                        const start = performance.now();
                        sort(input, false);
                        fixed.push(performance.now() - start);
                    };
                    const runRandom = () => {
                        const start = performance.now();
                        sort(input, true);
                        random.push(performance.now() - start);
                    };
                    if (fixedFirst) {
                        runFixed();
                        runRandom();
                    } else {
                        runRandom();
                        runFixed();
                    }
                }
                const f = median(fixed),
                    r = median(random),
                    row = {
                        n: input.length,
                        fixed: seconds(f),
                        random: seconds(r),
                    };
                history.push(row);
                $("fixedTime").textContent = row.fixed;
                $("randomTime").textContent = row.random;
                const a = sort(input, false),
                    b = sort(input, true),
                    ok =
                        a.length === b.length &&
                        a.every((v, i) => v === b[i]) &&
                        a.every((v, i) => i === 0 || a[i - 1] <= v);
                $("fixedCheck").textContent = ok
                    ? "Saída ordenada e consistente"
                    : "Resultado divergente";
                $("randomCheck").textContent = ok
                    ? "Saída ordenada e consistente"
                    : "Resultado divergente";
                const report = $("labInterpretation");
                if (report)
                    report.innerHTML = `<h4>Resumo da sessão</h4><p>N = ${input.length}. Mediana de 5 repetições por estratégia, após aquecimento. ${f === r ? "As medianas ficaram iguais." : f < r ? "Nesta sessão, a mediana do pivô fixo foi menor." : "Nesta sessão, a mediana do pivô aleatório foi menor."} Resultado válido apenas para esta entrada e estas condições.</p>`;
                if (typeof Chart !== "undefined" && $("labChart")) {
                    if (chart) chart.destroy();
                    chart = new Chart($("labChart"), {
                        type: "bar",
                        data: {
                            labels: ["Pivô fixo", "Pivô aleatório"],
                            datasets: [
                                {
                                    data: [f / 1000, r / 1000],
                                    backgroundColor: ["#60a5fa", "#4ade80"],
                                    maxBarThickness: 48,
                                    borderRadius: 4,
                                },
                            ],
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                tooltip: {
                                    callbacks: {
                                        label: (c) =>
                                            `${c.parsed.y.toFixed(6)} s`,
                                    },
                                },
                            },
                            scales: {
                                x: { grid: { display: false } },
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
                renderHistory();
            } catch (e) {
                const status = $("labStatus");
                if (status) status.textContent = e.message;
            }
        }, 0),
    );
})();
