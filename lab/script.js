/* =========================================================
   QUICKSORT LAB — CONTROLADOR CENTRAL
   Este arquivo conecta os módulos e controla a interface.

   Módulos:
   - js/quicksort.js  → algoritmo, validação e passos visuais;
   - js/metrics.js    → medianas e benchmark;
   - js/csv.js        → leitura, filtro e exportação CSV;
   - js/animation.js  → reprodução da animação.
   ========================================================= */

import {
    createQuicksortSteps,
    isValidOutput,
    quicksort,
} from "./js/quicksort.js";
import { benchmark } from "./js/metrics.js";
import { filterRows, parseCSV, toCsv } from "./js/csv.js";
import { createAnimationController } from "./js/animation.js";

const CONFIG = Object.freeze({
    csvUrl: "./dados/quicksort_resultados.csv",
    animationMaxSize: 30,
    maxInputSize: 20000,
    largeInputWarning: 10000,
    benchmarkRepetitions: 5,
});

const COLORS = Object.freeze({
    fixed: "#55d9ff",
    random: "#63ff9b",
    referenceOne: "#ffc857",
    referenceTwo: "#c084fc",
    text: "#d9ffe8",
    muted: "#86ad95",
    grid: "#1c4935",
});

const $ = (id) => document.getElementById(id);

/* Estado que pertence à aplicação, e não a um módulo específico. */
const state = {
    rows: [],
    historicalChart: null,
    localChart: null,
    sessionChart: null,
    sessionHistory: [],
    animationSpeed: 3,
    preparing: false,
    controllers: {},
};

/* ---------- Utilidades de interface ---------- */

/** Escapa texto antes de inseri-lo em HTML. */
function escapeHtml(value) {
    return String(value).replace(
        /[&<>"']/g,
        (character) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;",
            })[character],
    );
}

/** Mostra a mensagem de erro global. */
function showError(message) {
    const error = $("error");

    if (error) {
        error.textContent = message;
        error.hidden = false;
    }
}

/** Limpa a mensagem de erro global. */
function clearError() {
    const error = $("error");

    if (error) {
        error.hidden = true;
        error.textContent = "";
    }
}

/** Formata segundos no padrão usado pela interface. */
function formatSeconds(value) {
    return value.toFixed(6);
}

/** Atualiza o status da bancada. */
function updateLabStatus(message, warning = false) {
    const status = $("labStatus");

    if (!status) {
        return;
    }

    status.textContent = message;
    status.classList.toggle("warning-text", warning);
}

/* ---------- CSV histórico ---------- */

/** Cria as séries do gráfico histórico. */
function buildHistoricalDatasets(data) {
    const keys = [
        ...new Set(data.map((row) => `${row.algorithm}|${row.scenario}`)),
    ];

    const colors = [
        COLORS.fixed,
        COLORS.random,
        COLORS.referenceOne,
        COLORS.referenceTwo,
    ];

    return keys.map((key, index) => {
        const [algorithm, scenario] = key.split("|");
        const color = colors[index % colors.length];

        return {
            label: `Pivô ${algorithm.toLowerCase()} · entrada ${scenario.toLowerCase()}`,
            data: data
                .filter(
                    (row) =>
                        row.algorithm === algorithm &&
                        row.scenario === scenario,
                )
                .sort((a, b) => a.n - b.n)
                .map((row) => ({ x: row.n, y: row.time })),
            borderColor: color,
            backgroundColor: color,
            tension: 0.2,
            pointRadius: 3,
        };
    });
}

/** Renderiza tabela e gráfico das medições históricas. */
function renderHistoricalResults() {
    const data = filterRows(
        state.rows,
        $("algorithm")?.value ?? "all",
        $("scenario")?.value ?? "all",
    );

    const body = $("resultsBody");
    const status = $("tableStatus");

    if (body) {
        body.innerHTML = data.length
            ? data
                  .map(
                      (row) => `
                        <tr>
                            <td>${row.n.toLocaleString("pt-BR")}</td>
                            <td>${escapeHtml(row.algorithm)}</td>
                            <td>${escapeHtml(row.scenario)}</td>
                            <td>${row.time.toFixed(6)}</td>
                            <td>${row.growth === null ? "—" : `${row.growth.toFixed(2)}×`}</td>
                        </tr>
                    `,
                  )
                  .join("")
            : '<tr><td colspan="5">Nenhuma medição corresponde aos filtros atuais.</td></tr>';
    }

    if (status) {
        status.textContent =
            `Exibindo ${data.length} de ${state.rows.length} medições.`;
    }

    renderHistoricalChart(data);
}

/** Renderiza o gráfico histórico com Chart.js. */
function renderHistoricalChart(data) {
    if (typeof Chart === "undefined" || !$("resultsChart")) {
        return;
    }

    state.historicalChart?.destroy();

    state.historicalChart = new Chart($("resultsChart"), {
        type: "line",
        data: {
            datasets: buildHistoricalDatasets(data),
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 500 },
            interaction: { mode: "nearest", intersect: false },
            scales: {
                x: {
                    type: "linear",
                    title: {
                        display: true,
                        text: "Tamanho da entrada (N)",
                    },
                    ticks: { color: COLORS.muted },
                    grid: { color: COLORS.grid },
                },
                y: {
                    type: $("scale")?.value ?? "linear",
                    title: {
                        display: true,
                        text: "Tempo (segundos)",
                    },
                    ticks: { color: COLORS.muted },
                    grid: { color: COLORS.grid },
                },
            },
            plugins: {
                legend: { labels: { color: COLORS.text } },
                tooltip: {
                    callbacks: {
                        label: (context) =>
                            `${context.dataset.label}: ${context.parsed.y.toFixed(6)} s`,
                    },
                },
            },
        },
    });
}

/** ---------- Entrada e geração ---------- */

/** Lê, converte e valida a entrada digitada. */
function readInput() {
    const raw = $("userInput")?.value.trim();

    if (!raw) {
        throw new Error("Digite números ou gere uma entrada.");
    }

    const values = raw
        .split(/[\s,;]+/)
        .filter(Boolean)
        .map(Number);

    if (values.some((value) => !Number.isFinite(value))) {
        throw new Error("A entrada contém valor inválido.");
    }

    if (values.length < 2) {
        throw new Error("Informe ao menos dois números.");
    }

    if (values.length > CONFIG.maxInputSize) {
        throw new Error(
            `Limite da medição: ${CONFIG.maxInputSize.toLocaleString("pt-BR")} números.`,
        );
    }

    return values;
}

/** Gera a entrada de acordo com a distribuição escolhida. */
function generateInput() {
    const requested = Number($("amount")?.value);
    const size = Number.isFinite(requested)
        ? Math.min(CONFIG.maxInputSize, Math.max(2, Math.floor(requested)))
        : 16;

    const type = $("inputType")?.value ?? "random";
    let values = Array.from(
        { length: size },
        () => Math.floor(Math.random() * 100),
    );

    if (type === "sorted") {
        values.sort((a, b) => a - b);
    } else if (type === "reverse") {
        values.sort((a, b) => b - a);
    } else if (type === "duplicates") {
        values = Array.from(
            { length: size },
            () => Math.floor(Math.random() * 10),
        );
    }

    $("amount").value = size;
    $("userInput").value = values.join(", ");

    updateLabStatus(
        size <= CONFIG.animationMaxSize
            ? `Entrada de ${size} valores gerada. Prepare a bancada para animar ou medir.`
            : `Entrada de ${size} valores gerada. Acima de ${CONFIG.animationMaxSize}, a execução será medida sem animação.`,
    );
}

/* ---------- Desenho das bancadas ---------- */

/** Desenha uma etapa da animação em uma bancada. */
function renderLab(side, event, controllerState) {
    const host = $(`${side}Bars`);

    if (!host) {
        return;
    }

    if (!event) {
        host.innerHTML = "";
        return;
    }

    const minimum = Math.min(...event.values);
    const maximum = Math.max(...event.values);
    const range = maximum - minimum || 1;

    host.innerHTML = event.values
        .map((value, index) => {
            const isActive = event.active.includes(index);
            const isPivot = index === event.pivot;
            const height = 18 + ((value - minimum) / range) * 78;

            return `
                <div
                    class="bar-item${isActive ? " is-active" : ""}${isPivot ? " is-pivot" : ""}"
                    style="height: ${height}%"
                    title="Índice ${index}: ${value}"
                >
                    <span>${value}</span>
                </div>
            `;
        })
        .join("");

    $(`${side}Event`).textContent = event.message;
    $(`${side}Count`).textContent =
        `Passo ${controllerState.index + 1} de ${controllerState.events.length}`;
}

/** Atualiza o texto de estado de uma bancada. */
function updateLabStateLabel(side, controllerState) {
    const stateLabel = $(`${side}State`);

    if (!stateLabel) {
        return;
    }

    if (!controllerState.events.length) {
        stateLabel.textContent = "Pronto";
    } else if (controllerState.index >= controllerState.events.length - 1) {
        stateLabel.textContent = "Concluído";
    } else if (controllerState.running) {
        stateLabel.textContent = "Executando";
    } else {
        stateLabel.textContent = "Pausado";
    }
}

/** Desenha a prévia de uma entrada grande que não será animada. */
function drawPreview(side, input) {
    const size = CONFIG.animationMaxSize;
    const sample = Array.from(
        { length: size },
        (_, index) =>
            input[Math.floor((index * (input.length - 1)) / (size - 1))],
    );

    const minimum = Math.min(...sample);
    const range = Math.max(...sample) - minimum || 1;

    $(`${side}Bars`).innerHTML = sample
        .map((value, index) => {
            const height = 18 + ((value - minimum) / range) * 78;

            return `
                <div
                    class="bar-item"
                    style="height: ${height}%"
                    title="Amostra ${index + 1}: ${value}"
                >
                    <span>${value}</span>
                </div>
            `;
        })
        .join("");

    $(`${side}Event`).textContent =
        `Prévia de ${size} valores representativos; animação desativada acima de ${size}.`;
    $(`${side}Count`).textContent = `Prévia de ${size} / ${input.length}`;
    $(`${side}State`).textContent = "Prévia";
}

/** Prepara as duas bancadas usando a mesma entrada. */
function prepareAnimations(input) {
    for (const side of ["fixed", "random"]) {
        const controller = state.controllers[side];

        controller.pause();

        if (input.length <= CONFIG.animationMaxSize) {
            const result = createQuicksortSteps(
                input,
                side === "random",
            );

            controller.load(result.events);
        } else {
            controller.load([]);
            drawPreview(side, input);
        }
    }
}

/* ---------- Relatório e gráficos locais ---------- */

/** Mostra o gráfico compacto da medição atual. */
function renderLocalChart(fixed, random) {
    if (typeof Chart === "undefined" || !$("labChart")) {
        return;
    }

    state.localChart?.destroy();

    state.localChart = new Chart($("labChart"), {
        type: "bar",
        data: {
            labels: ["Pivô fixo", "Pivô aleatório"],
            datasets: [
                {
                    label: "Mediana (s)",
                    data: [fixed, random],
                    backgroundColor: [COLORS.fixed, COLORS.random],
                    borderRadius: 4,
                    maxBarThickness: 48,
                },
            ],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context) =>
                            `${context.parsed.y.toFixed(6)} s`,
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

/** Atualiza a interpretação descritiva da comparação atual. */
function renderInterpretation(n, fixed, random) {
    const report = $("labInterpretation");

    if (!report) {
        return;
    }

    const difference = Math.abs(fixed - random);
    let comparison;

    if (fixed === random) {
        comparison = "As medianas ficaram iguais na precisão exibida.";
    } else if (fixed < random) {
        comparison = "Nesta sessão, a mediana do pivô fixo foi menor.";
    } else {
        comparison = "Nesta sessão, a mediana do pivô aleatório foi menor.";
    }

    report.innerHTML = `
        <h4>Resumo da sessão</h4>
        <p>
            N = ${n.toLocaleString("pt-BR")}. Medianas de
            ${CONFIG.benchmarkRepetitions} repetições por estratégia, após
            aquecimento. ${comparison}
            Diferença absoluta: ${difference.toFixed(6)} s.
            O resultado descreve apenas esta entrada e estas condições de execução.
        </p>
    `;
}

/** Valida de forma independente a saída das duas estratégias. */
function renderValidation(input) {
    const fixedValid = isValidOutput(input, quicksort(input, false));
    const randomValid = isValidOutput(input, quicksort(input, true));

    $("fixedCheck").textContent = fixedValid
        ? "Saída ordenada e consistente"
        : "Verificação falhou";

    $("randomCheck").textContent = randomValid
        ? "Saída ordenada e consistente"
        : "Verificação falhou";
}

/* ---------- Histórico da sessão ---------- */

/** Renderiza a tabela e o gráfico acumulado da sessão. */
function renderSessionHistory() {
    const host = $("sessionHistory");

    if (!host) {
        return;
    }

    host.hidden = state.sessionHistory.length === 0;

    if (!state.sessionHistory.length) {
        host.replaceChildren();
        return;
    }

    host.innerHTML = `
        <h4>Histórico desta sessão</h4>
        <p>
            ${state.sessionHistory.length} registro(s), mantidos apenas nesta visita.
        </p>
        <div class="table-scroll">
            <table>
                <thead>
                    <tr>
                        <th>Horário</th>
                        <th>N</th>
                        <th>Mediana pivô fixo (s)</th>
                        <th>Mediana pivô aleatório (s)</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.sessionHistory
                        .map(
                            (row) => `
                                <tr>
                                    <td>${escapeHtml(row.at)}</td>
                                    <td>${row.n.toLocaleString("pt-BR")}</td>
                                    <td>${formatSeconds(row.fixed)}</td>
                                    <td>${formatSeconds(row.random)}</td>
                                </tr>
                            `,
                        )
                        .join("")}
                </tbody>
            </table>
        </div>
        <button id="exportSession" class="secondary" type="button">
            Exportar histórico CSV
        </button>
        <div class="chart-wrap">
            <canvas
                id="sessionChart"
                role="img"
                aria-label="Comparação das medianas das medições desta sessão"
            ></canvas>
        </div>
    `;

    $("exportSession")?.addEventListener("click", exportSessionCsv);
    renderSessionChart();
}

/** Desenha o gráfico acumulado da sessão. */
function renderSessionChart() {
    if (typeof Chart === "undefined" || !$("sessionChart")) {
        return;
    }

    state.sessionChart?.destroy();

    state.sessionChart = new Chart($("sessionChart"), {
        type: "bar",
        data: {
            labels: state.sessionHistory.map(
                (row) => `N=${row.n.toLocaleString("pt-BR")}`,
            ),
            datasets: [
                {
                    label: "Pivô fixo (mediana)",
                    data: state.sessionHistory.map((row) => row.fixed),
                    backgroundColor: COLORS.fixed,
                },
                {
                    label: "Pivô aleatório (mediana)",
                    data: state.sessionHistory.map((row) => row.random),
                    backgroundColor: COLORS.random,
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

/* ---------- Exportação ---------- */

/** Cria o download de um arquivo CSV. */
function downloadCsv(csv, filename) {
    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Exporta o CSV histórico completo carregado na página. */
function exportHistoricalCsv() {
    const rows = [
        [
            "tamanho_n",
            "algoritmo",
            "cenario",
            "tempo_segundos",
            "razao_crescimento",
        ],
        ...state.rows.map((row) => [
            row.n,
            row.algorithm,
            row.scenario,
            row.time,
            row.growth ?? "",
        ]),
    ];

    downloadCsv(toCsv(rows), "quicksort_resultados.csv");
}

/** Exporta a medição local atual. */
function exportLocalCsv() {
    const fixed = $("fixedTime")?.textContent.trim();
    const random = $("randomTime")?.textContent.trim();

    if (!fixed || !random || fixed === "—" || random === "—") {
        updateLabStatus(
            "Prepare a bancada antes de exportar os resultados locais.",
            true,
        );
        return;
    }

    let input;

    try {
        input = readInput();
    } catch {
        updateLabStatus(
            "Não foi possível recuperar a entrada usada na medição.",
            true,
        );
        return;
    }

    const rows = [
        ["tamanho_n", "algoritmo", "tempo_segundos"],
        [input.length, "Pivo fixo", fixed.replace(",", ".")],
        [input.length, "Pivo aleatorio", random.replace(",", ".")],
    ];

    downloadCsv(toCsv(rows), "quicksort_resultados_locais.csv");
}

/** Exporta todas as medições feitas durante a visita. */
function exportSessionCsv() {
    if (!state.sessionHistory.length) {
        return;
    }

    const rows = [
        [
            "horario",
            "n",
            "mediana_pivo_fixo_s",
            "mediana_pivo_aleatorio_s",
        ],
        ...state.sessionHistory.map((row) => [
            row.at,
            row.n,
            row.fixed,
            row.random,
        ]),
    ];

    downloadCsv(toCsv(rows), "quicksort_sessao.csv");
}

/* ---------- Preparação da bancada ---------- */

/**
 * Valida a entrada, prepara as animações e mede as duas estratégias.
 */
function prepareLab() {
    if (state.preparing) {
        return;
    }

    state.preparing = true;

    const button = $("prepareLab");

    if (button) {
        button.disabled = true;
        button.textContent = "Medindo…";
    }

    try {
        const input = readInput();

        prepareAnimations(input);

        if (input.length > CONFIG.largeInputWarning) {
            updateLabStatus(
                `Atenção: N=${input.length.toLocaleString("pt-BR")}. Entradas grandes podem levar mais tempo, especialmente com pivô fixo.`,
                true,
            );
        } else {
            updateLabStatus("Preparando a medição…");
        }

        // Permite a atualização visual do aviso antes do benchmark síncrono.
        window.setTimeout(() => {
            try {
                const results = benchmark(
                    input,
                    quicksort,
                    CONFIG.benchmarkRepetitions,
                );

                $("fixedTime").textContent = formatSeconds(results.fixed);
                $("randomTime").textContent = formatSeconds(results.random);

                renderValidation(input);
                renderLocalChart(results.fixed, results.random);
                renderInterpretation(
                    input.length,
                    results.fixed,
                    results.random,
                );

                state.sessionHistory.push({
                    at: new Date().toLocaleTimeString("pt-BR"),
                    n: input.length,
                    fixed: results.fixed,
                    random: results.random,
                });

                renderSessionHistory();
                updateLabStatus(
                    `Medição concluída: N=${input.length.toLocaleString("pt-BR")}; aquecimento descartado e ${CONFIG.benchmarkRepetitions} repetições por estratégia. Medianas exibidas; animação até ${CONFIG.animationMaxSize} valores.`,
                );
                clearError();
            } catch (error) {
                const message =
                    error?.message || "Não foi possível preparar a bancada.";

                updateLabStatus(message, true);
                showError(message);
            } finally {
                state.preparing = false;

                if (button) {
                    button.disabled = false;
                    button.textContent = "Preparar bancada ↻";
                }
            }
        }, 0);
    } catch (error) {
        state.preparing = false;

        if (button) {
            button.disabled = false;
            button.textContent = "Preparar bancada ↻";
        }

        const message = error?.message || "Entrada inválida.";
        updateLabStatus(message, true);
        showError(message);
    }
}

/* ---------- Navegação lateral ---------- */

/** Cria a navegação lateral e marca a seção atualmente visível. */
function addSectionNavigation() {
    if ($("sectionRail")) {
        return;
    }

    const navigation = document.createElement("nav");
    navigation.id = "sectionRail";
    navigation.className = "section-rail";
    navigation.setAttribute("aria-label", "Navegação pelas seções");
    navigation.innerHTML = `
        <a href="#inicio" aria-label="Início" title="Início"></a>
        <a href="#resultados" aria-label="Resultados" title="Resultados"></a>
        <a href="#laboratorio" aria-label="Bancada" title="Bancada"></a>
        <a href="#metodologia" aria-label="Metodologia" title="Metodologia"></a>
    `;

    document.body.appendChild(navigation);

    const links = [...navigation.querySelectorAll("a")];
    const sections = links
        .map((link) =>
            document.querySelector(link.getAttribute("href")),
        )
        .filter(Boolean);

    if (!("IntersectionObserver" in window)) {
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            for (const entry of entries) {
                if (!entry.isIntersecting) {
                    continue;
                }

                for (const link of links) {
                    const active =
                        link.getAttribute("href") ===
                        `#${entry.target.id}`;

                    link.classList.toggle("is-current", active);

                    if (active) {
                        link.setAttribute("aria-current", "location");
                    } else {
                        link.removeAttribute("aria-current");
                    }
                }
            }
        },
        { rootMargin: "-25% 0px -60% 0px" },
    );

    sections.forEach((section) => observer.observe(section));
}

/* ---------- Controle da velocidade compartilhada ---------- */

/** Atualiza a velocidade compartilhada e aplica a mudança imediatamente. */
function updateSpeed(value) {
    const availableSpeeds = [1, 2, 5, 10, 20];
    const numericValue = Number(value);

    if (!availableSpeeds.includes(numericValue)) {
        return;
    }

    state.animationSpeed = numericValue;

    const label = $("speedLabel");

    if (label) {
        label.textContent = `${state.animationSpeed}×`;
    }

    // Mantém apenas um botão visualmente selecionado.
    document.querySelectorAll(".speed-option").forEach((button) => {
        const selected = Number(button.dataset.speed) === state.animationSpeed;
        button.classList.toggle("is-selected", selected);
        button.setAttribute("aria-pressed", String(selected));
    });

    // A mesma velocidade é aplicada às duas bancadas.
    Object.values(state.controllers).forEach((controller) =>
        controller.updateSpeed(),
    );
}

/* ---------- Eventos ---------- */

/** Liga todos os controles da interface. */
function bindEvents() {
    $("algorithm")?.addEventListener("change", renderHistoricalResults);
    $("scenario")?.addEventListener("change", renderHistoricalResults);
    $("scale")?.addEventListener("change", renderHistoricalResults);

    $("reset")?.addEventListener("click", () => {
        $("algorithm").value = "all";
        $("scenario").value = "all";
        $("scale").value = "linear";
        renderHistoricalResults();
    });

    $("generate")?.addEventListener("click", generateInput);
    $("prepareLab")?.addEventListener("click", prepareLab);

    document.querySelectorAll(".speed-option").forEach((button) => {
        button.addEventListener("click", () => {
            updateSpeed(button.dataset.speed);
        });
    });

    document.querySelectorAll(".step-run").forEach((button) => {
        button.addEventListener("click", () =>
            state.controllers[button.dataset.side]?.play(),
        );
    });

    document.querySelectorAll(".step-pause").forEach((button) => {
        button.addEventListener("click", () =>
            state.controllers[button.dataset.side]?.pause(),
        );
    });

    document.querySelectorAll(".step-next").forEach((button) => {
        button.addEventListener("click", () =>
            state.controllers[button.dataset.side]?.next(),
        );
    });

    document.querySelectorAll(".step-reset").forEach((button) => {
        button.addEventListener("click", () =>
            state.controllers[button.dataset.side]?.reset(),
        );
    });

    $("download")?.addEventListener("click", exportHistoricalCsv);
    $("exportLocalCsv")?.addEventListener("click", exportLocalCsv);
}

/* ---------- Carregamento inicial ---------- */

/** Carrega o CSV histórico. */
async function loadHistoricalData() {
    try {
        const response = await fetch(CONFIG.csvUrl);

        if (!response.ok) {
            throw new Error(`CSV não encontrado (HTTP ${response.status}).`);
        }

        state.rows = parseCSV(await response.text());
        renderHistoricalResults();
        clearError();
    } catch (error) {
        const message = error?.message || "Não foi possível carregar o CSV.";
        const body = $("resultsBody");
        const status = $("tableStatus");

        if (body) {
            body.innerHTML = `
                <tr>
                    <td colspan="5">Erro ao carregar: ${escapeHtml(message)}</td>
                </tr>
            `;
        }

        if (status) {
            status.textContent =
                "Não foi possível carregar as medições históricas.";
        }

        showError(message);
    }
}

/* ---------- Inicialização central ---------- */

/** Cria os dois controladores usando uma única fonte de velocidade. */
function createControllers() {
    for (const side of ["fixed", "random"]) {
        state.controllers[side] = createAnimationController({
            getSpeed: () => state.animationSpeed,
            onRender: (event, controllerState) =>
                renderLab(side, event, controllerState),
            onStateChange: (controllerState) =>
                updateLabStateLabel(side, controllerState),
        });
    }
}

/** Ponto único de entrada da aplicação. */
document.addEventListener("DOMContentLoaded", () => {
    createControllers();
    bindEvents();
    addSectionNavigation();

    const selectedSpeed =
        Number(document.querySelector(".speed-option.is-selected")?.dataset.speed) ||
        5;
    updateSpeed(selectedSpeed);

    generateInput();
    loadHistoricalData();
});
