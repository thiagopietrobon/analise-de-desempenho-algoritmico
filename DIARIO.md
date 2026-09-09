# Diário de Bordo — Experimento de Algoritmos de Ordenação

## 1. Identificação e Configuração do Experimento
* **Par de Algoritmos:** Quicksort com Pivô Fixo (primeiro elemento) vs. Quicksort com Pivô Aleatório
* **Amostragem:** $N \in \{1000, 2000, 4000, 8000, 16000\}$
* **Metodologia de Medição:**
  * Semente fixa (`SEED = 42`)
  * 3 execuções válidas com descarte do *warmup* (1ª execução)
  * Coleta da mediana dos tempos por ponto

## 2. Tabela de Resultados Consolidados

| Tamanho ($N$) | Pivô Fixo (Aleat.) | Razão | Pivô Fixo (Ord.) | Razão | Pivô Rand (Aleat.) | Razão | Pivô Rand (Ord.) | Razão |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1000** | 0,0009 s | - | 0,0157 s | - | 0,0011 s | - | 0,0010 s | - |
| **2000** | 0,0018 s | 2,01 | 0,0643 s | 4,11 | 0,0026 s | 2,37 | 0,0024 s | 2,36 |
| **4000** | 0,0054 s | 2,96 | 0,2430 s | 3,78 | 0,0052 s | 2,02 | 0,0049 s | 2,02 |
| **8000** | 0,0092 s | 1,72 | 0,9585 s | 3,94 | 0,0107 s | 2,05 | 0,0101 s | 2,07 |
| **16000** | 0,0191 s | 2,07 | 3,8570 s | 4,02 | 0,0237 s | 2,22 | 0,0219 s | 2,16 |

## 3. Análise dos Resultados e Justificativas

### Classes de Crescimento
* **Pivô Fixo (Entrada Ordenada) — Classe $O(n^2)$:** A razão de crescimento entre tamanhos consecutivos ($T(2N)/T(N)$) estabiliza em torno de **4,0** ($4,11 \rightarrow 3,78 \rightarrow 3,94 \rightarrow 4,02$). Como o tamanho do vetor $N$ dobra a cada passo, a quadruplicação do tempo ($2^2 = 4$) comprova experimentalmente a complexidade quadrática.
* **Pivô Fixo (Entrada Aleatória) — Classe $O(n \log n)$:** Apresenta razões com média próxima a $2,19$, condizente com o crescimento assintótico esperado de $n \log n$.
* **Pivô Aleatório (Ambos os Cenários) — Classe $O(n \log n)$:** Registra razões consistentes entre $2,02$ e $2,37$ (média $\approx 2,15$) tanto em entradas aleatórias quanto ordenadas, demonstrando imunidade à ordenação prévia dos dados.

### O que mudou entre Entrada Aleatória e Ordenada (e Por Quê)
* **No Pivô Fixo:** A seleção determinística do primeiro elemento em um vetor pré-ordenado faz com que o menor valor restante seja sempre escolhido como pivô. Isso desbalanceia as partições no pior caso possível ($0$ elementos de um lado e $n-1$ do outro), aumentando a profundidade da árvore de recursão de $\log_2 n$ para $n$ e resultando em $O(n^2)$ comparações.
* **No Pivô Aleatório:** O sorteio do índice do pivô quebra a estrutura do vetor ordenado. Como a probabilidade de escolher o pior pivô consecutivamente é desprezível, as divisões do vetor mantêm-se equilibradas, preservando a profundidade $\log_2 n$ da árvore recursiva e garantindo a classe $O(n \log n)$.
