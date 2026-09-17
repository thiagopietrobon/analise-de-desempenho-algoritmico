/* =========================================================
   QUICKSORT LAB — ALGORITMOS
   Responsabilidade deste módulo:
   - executar o Quicksort;
   - validar a saída;
   - gerar os eventos usados pela animação.
   ========================================================= */

/**
 * Ordena uma cópia da entrada usando Quicksort iterativo.
 *
 * @param {number[]} input Entrada original.
 * @param {boolean} randomPivot Define se o pivô será escolhido aleatoriamente.
 * @returns {number[]} Nova lista ordenada.
 */
export function quicksort(input, randomPivot = false) {
    const values = input.slice();
    const stack = [[0, values.length - 1]];

    while (stack.length) {
        let [low, high] = stack.pop();

        while (low < high) {
            let pivotIndex = low;

            if (randomPivot) {
                pivotIndex =
                    low + Math.floor(Math.random() * (high - low + 1));

                [values[pivotIndex], values[low]] = [
                    values[low],
                    values[pivotIndex],
                ];
            }

            const pivot = values[low];
            let storeIndex = low + 1;

            for (let index = low + 1; index <= high; index++) {
                if (values[index] <= pivot) {
                    [values[storeIndex], values[index]] = [
                        values[index],
                        values[storeIndex],
                    ];
                    storeIndex++;
                }
            }

            const finalPivotIndex = storeIndex - 1;

            [values[low], values[finalPivotIndex]] = [
                values[finalPivotIndex],
                values[low],
            ];

            const left = [low, finalPivotIndex - 1];
            const right = [finalPivotIndex + 1, high];

            // Processa a menor partição primeiro para limitar a pilha auxiliar.
            if (left[1] - left[0] < right[1] - right[0]) {
                if (right[0] < right[1]) {
                    stack.push(right);
                }

                [low, high] = left;
            } else {
                if (left[0] < left[1]) {
                    stack.push(left);
                }

                [low, high] = right;
            }
        }
    }

    return values;
}

/**
 * Confere se a saída está ordenada e contém exatamente os mesmos valores
 * da entrada, incluindo a quantidade de ocorrências repetidas.
 *
 * @param {number[]} input Entrada original.
 * @param {number[]} output Resultado do algoritmo.
 * @returns {boolean} True quando a saída é válida.
 */
export function isValidOutput(input, output) {
    if (input.length !== output.length) {
        return false;
    }

    for (let index = 1; index < output.length; index++) {
        if (output[index - 1] > output[index]) {
            return false;
        }
    }

    const counts = new Map();

    for (const value of input) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }

    for (const value of output) {
        const count = counts.get(value);

        if (!count) {
            return false;
        }

        if (count === 1) {
            counts.delete(value);
        } else {
            counts.set(value, count - 1);
        }
    }

    return counts.size === 0;
}

/**
 * Cria snapshots da execução para a bancada visual.
 * Esta versão é limitada às entradas pequenas pela camada de interface.
 *
 * @param {number[]} input Entrada a visualizar.
 * @param {boolean} randomPivot Estratégia do pivô.
 * @returns {{events: object[], stats: object}}
 */
export function createQuicksortSteps(input, randomPivot = false) {
    const values = input.slice();
    const events = [];
    const stats = {
        comparisons: 0,
        swaps: 0,
        partitions: 0,
        maxDepth: 0,
    };

    /** Salva uma fotografia da bancada naquele instante. */
    const record = (message, active = [], pivot = -1) => {
        events.push({
            values: values.slice(),
            message,
            active,
            pivot,
            stats: { ...stats },
        });
    };

    /** Troca dois elementos e atualiza a contagem de trocas. */
    const swap = (first, second) => {
        if (first === second) {
            return;
        }

        [values[first], values[second]] = [
            values[second],
            values[first],
        ];
        stats.swaps++;
    };

    /**
     * Ordena recursivamente somente para produzir os estados visuais.
     * A entrada é pequena o suficiente para manter a animação controlável.
     */
    const sort = (low, high, depth) => {
        stats.maxDepth = Math.max(stats.maxDepth, depth);

        if (low >= high) {
            return;
        }

        stats.partitions++;

        let pivotIndex = low;

        if (randomPivot) {
            pivotIndex =
                low + Math.floor(Math.random() * (high - low + 1));

            swap(pivotIndex, low);
            record(
                `Pivô sorteado: ${values[low]}.`,
                [low, pivotIndex],
                low,
            );
        }

        const pivot = values[low];

        record(`Pivô escolhido: ${pivot}.`, [low, high], low);

        let storeIndex = low + 1;

        for (let index = low + 1; index <= high; index++) {
            stats.comparisons++;

            record(
                `Comparando ${values[index]} com pivô ${pivot}.`,
                [index],
                low,
            );

            if (values[index] <= pivot) {
                swap(storeIndex, index);

                record(
                    `${values[storeIndex]} ≤ ${pivot}: elemento encaminhado à partição menor.`,
                    [storeIndex, index],
                    low,
                );

                storeIndex++;
            }
        }

        const finalPivotIndex = storeIndex - 1;

        swap(low, finalPivotIndex);

        record(
            `Pivô ${pivot} fixado na posição ${finalPivotIndex}.`,
            [finalPivotIndex],
            finalPivotIndex,
        );

        sort(low, finalPivotIndex - 1, depth + 1);
        sort(finalPivotIndex + 1, high, depth + 1);
    };

    sort(0, values.length - 1, 1);
    record("Ordenação concluída.");

    return { events, stats };
}
