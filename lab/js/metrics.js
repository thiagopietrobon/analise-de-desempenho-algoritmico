/* =========================================================
   QUICKSORT LAB — MÉTRICAS
   Responsabilidade deste módulo:
   - calcular mediana;
   - medir uma execução;
   - realizar o benchmark completo das duas estratégias.
   ========================================================= */

/**
 * Calcula a mediana sem alterar o vetor original.
 *
 * @param {number[]} values Valores medidos.
 * @returns {number} Mediana.
 */
export function median(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    return sorted.length % 2
        ? sorted[middle]
        : (sorted[middle - 1] + sorted[middle]) / 2;
}

/**
 * Mede uma única execução do algoritmo.
 *
 * @param {number[]} input Entrada a ordenar.
 * @param {boolean} randomPivot Estratégia do pivô.
 * @param {Function} sortFunction Função de ordenação injetada pelo módulo principal.
 * @returns {number} Tempo em segundos.
 */
export function measureOnce(input, randomPivot, sortFunction) {
    const start = performance.now();

    sortFunction(input, randomPivot);

    return (performance.now() - start) / 1000;
}

/**
 * Executa o benchmark com aquecimento e repetições alternadas.
 * Alternar a ordem reduz o efeito de favorecer sempre a mesma estratégia.
 *
 * @param {number[]} input Entrada a testar.
 * @param {Function} sortFunction Função de ordenação.
 * @param {number} repetitions Número de repetições por estratégia.
 * @returns {{fixed: number, random: number, samples: object}}
 */
export function benchmark(input, sortFunction, repetitions = 5) {
    // Aquecimento descartado.
    measureOnce(input, false, sortFunction);
    measureOnce(input, true, sortFunction);

    const samples = {
        fixed: [],
        random: [],
    };

    for (let repetition = 0; repetition < repetitions; repetition++) {
        const order =
            repetition % 2 === 0
                ? ["fixed", "random"]
                : ["random", "fixed"];

        for (const side of order) {
            samples[side].push(
                measureOnce(input, side === "random", sortFunction),
            );
        }
    }

    return {
        fixed: median(samples.fixed),
        random: median(samples.random),
        samples,
    };
}
