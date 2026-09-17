/* =========================================================
   QUICKSORT LAB — CSV
   Responsabilidade deste módulo:
   - interpretar o CSV histórico;
   - filtrar medições;
   - montar arquivos CSV para exportação.
   ========================================================= */

/**
 * Divide uma linha CSV respeitando campos entre aspas.
 */
export function parseCsvLine(line) {
    const values = [];
    let value = "";
    let quoted = false;

    for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (character === '"') {
            if (quoted && line[index + 1] === '"') {
                value += '"';
                index++;
            } else {
                quoted = !quoted;
            }

            continue;
        }

        if (character === "," && !quoted) {
            values.push(value);
            value = "";
            continue;
        }

        value += character;
    }

    values.push(value);
    return values;
}

/**
 * Converte o conteúdo bruto do CSV em objetos da aplicação.
 */
export function parseCSV(text) {
    const normalized = text.replace(/^\uFEFF/, "").trim();

    if (!normalized) {
        return [];
    }

    const lines = normalized.split(/\r?\n/);
    const headers = parseCsvLine(lines.shift()).map((header) =>
        header.trim(),
    );

    return lines
        .filter((line) => line.trim())
        .map((line) => parseCsvLine(line))
        .map((values) => {
            const record = Object.fromEntries(
                headers.map((header, index) => [
                    header,
                    values[index]?.trim() ?? "",
                ]),
            );

            return {
                n: Number(record.tamanho_n),
                algorithm: record.algoritmo,
                scenario: record.cenario,
                time: Number(record.tempo_segundos),
                growth:
                    record.razao_crescimento === ""
                        ? null
                        : Number(record.razao_crescimento),
            };
        })
        .filter(
            (row) =>
                Number.isFinite(row.n) &&
                Number.isFinite(row.time) &&
                row.algorithm &&
                row.scenario,
        );
}

/**
 * Filtra as medições históricas conforme os controles da interface.
 */
export function filterRows(rows, algorithm = "all", scenario = "all") {
    return rows.filter(
        (row) =>
            (algorithm === "all" || row.algorithm === algorithm) &&
            (scenario === "all" || row.scenario === scenario),
    );
}

/**
 * Escapa um campo para uso seguro em CSV.
 */
export function csvField(value) {
    const text = String(value ?? "");

    return /[",\r\n]/.test(text)
        ? `"${text.replace(/"/g, '""')}"`
        : text;
}

/**
 * Converte matriz de valores em texto CSV.
 */
export function toCsv(rows) {
    return rows.map((row) => row.map(csvField).join(",")).join("\r\n");
}
