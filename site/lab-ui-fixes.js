/*
 * Exportação dos resultados medidos na bancada local.
 *
 * Este arquivo complementa o script principal: ele não executa o Quicksort
 * nem calcula os tempos. Apenas lê os resultados já exibidos na página e
 * permite salvá-los em um arquivo CSV.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Localiza o botão criado no HTML. Se ele não existir, não há nada a fazer.
    const exportButton = document.getElementById("exportLocalCsv");

    if (!exportButton) {
        return;
    }

    // Executa a exportação somente quando o usuário clicar no botão.
    exportButton.addEventListener("click", () => {
        // Lê os tempos que o script principal já colocou na interface.
        const fixed = document.getElementById("fixedTime")?.textContent?.trim();

        const random = document
            .getElementById("randomTime")
            ?.textContent?.trim();

        // Recupera a entrada usada para estimar a quantidade de elementos.
        const raw = document.getElementById("userInput")?.value?.trim() || "";

        // Área acessível para apresentar mensagens ao usuário.
        const status = document.getElementById("labStatus");

        // Evita criar um CSV se a bancada ainda não tiver resultados válidos.
        if (!raw || !fixed || !random || fixed === "—" || random === "—") {
            if (status) {
                status.textContent =
                    "Prepare a bancada antes de exportar os resultados locais.";
            }

            return;
        }

        // Conta os valores separados por espaço, vírgula ou ponto e vírgula.
        const count = raw.split(/[\s,;]+/).filter(Boolean).length;

        // Monta o conteúdo CSV: cabeçalho e uma linha para cada estratégia.
        // A vírgula decimal é trocada por ponto para manter o formato numérico.
        const csv = [
            "tamanho_n,algoritmo,tempo_segundos",
            `${count},Pivo fixo,${fixed.replace(",", ".")}`,
            `${count},Pivo aleatorio,${random.replace(",", ".")}`,
        ].join("\r\n");

        // O BOM ajuda programas como o Excel a reconhecerem o arquivo UTF-8.
        const blob = new Blob(["\uFEFF", csv], {
            type: "text/csv;charset=utf-8;",
        });

        // Cria uma URL temporária para o arquivo gerado no navegador.
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "quicksort_resultados_locais.csv";

        // Aciona o download e libera a URL temporária em seguida.
        link.click();
        URL.revokeObjectURL(url);
    });
});
