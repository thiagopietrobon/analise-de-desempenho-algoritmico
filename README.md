<div align="center">

# 📊 Análise de Desempenho Algorítmico

![Banner do projeto](img/banner.jfif)

### Um estudo experimental sobre o comportamento do Quicksort

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge\&logo=python\&logoColor=white)](https://www.python.org/)
[![Matplotlib](https://img.shields.io/badge/Matplotlib-3.x-11557C?style=for-the-badge\&logo=python\&logoColor=white)](https://matplotlib.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge\&logo=github)](https://github.com/thiagopietrobon/analise-de-desempenho-algoritmico)
[![Status](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)]()

**Implementação • Benchmark • Análise • Visualização**

</div>

---

## 📈 Resultado principal

O experimento compara duas estratégias de escolha do pivô no **Quicksort**:

* **Pivô fixo:** primeiro elemento do vetor;
* **Pivô aleatório:** elemento escolhido aleatoriamente.

Cada estratégia é testada com entradas **aleatórias** e **ordenadas**, permitindo observar na prática como a escolha do pivô influencia o desempenho do algoritmo.

<div align="center">

<img src="graficos/quicksort_compara%C3%A7%C3%A3o.png" alt="Comparação de desempenho do Quicksort" width="850">

</div>

>O principal comportamento observado é o crescimento muito mais acentuado do Quicksort com **pivô fixo em entradas ordenadas**, cenário que se aproxima do pior caso teórico `O(n²)`.

---

## 🎯 Sobre o projeto

Este projeto foi desenvolvido para analisar experimentalmente o desempenho do algoritmo **Quicksort**, relacionando sua complexidade teórica com resultados obtidos através de benchmarks.

A análise considera diferentes tamanhos de entrada e compara o comportamento do algoritmo em situações favoráveis e desfavoráveis.

### Objetivos

* Implementar o Quicksort com diferentes estratégias de pivô;
* Medir o tempo de execução;
* Comparar entradas aleatórias e ordenadas;
* Observar o crescimento do tempo conforme `N` aumenta;
* Relacionar os resultados experimentais com a análise de complexidade;
* Gerar dados e gráficos automaticamente.

---

## 🧪 Metodologia

Foram utilizados cinco tamanhos de entrada:

|        N | Elementos |
| -------: | --------: |
|  `1.000` |        🔹 |
|  `2.000` |        🔹 |
|  `4.000` |        🔹 |
|  `8.000` |        🔹 |
| `16.000` |        🔹 |

Para cada tamanho são executados quatro cenários:

| Algoritmo         | Entrada   |
| ----------------- | --------- |
| ⚙️ Pivô fixo      | Aleatória |
| ⚙️ Pivô fixo      | Ordenada  |
| 🎲 Pivô aleatório | Aleatória |
| 🎲 Pivô aleatório | Ordenada  |

Cada experimento é executado **3 vezes**, utilizando a **mediana dos tempos** como resultado final da medição.

Também é realizada uma execução de *warmup* antes das medições, cujo resultado é descartado.

Para tornar os experimentos reproduzíveis, é utilizada uma semente fixa:

```python
SEED = 42
```

---

## 📊 Resultados

Os dados obtidos mostram uma diferença bastante significativa entre os cenários.

### 🏆 Melhor desempenho observado

Para `N = 16.000`:

| Estratégia        | Entrada   |        Tempo |
| ----------------- | --------- | -----------: |
| 🎲 Pivô aleatório | Aleatória | **0,0237 s** |
| 🎲 Pivô aleatório | Ordenada  | **0,0219 s** |
| ⚙️ Pivô fixo      | Aleatória | **0,0191 s** |
| ⚠️ Pivô fixo      | Ordenada  | **3,8570 s** |

Os valores acima são provenientes dos resultados armazenados no CSV do projeto.

### ⚠️ O pior caso

O cenário mais significativo é o **pivô fixo com entrada ordenada**.

|      N |    Tempo |
| -----: | -------: |
|  1.000 | 0,0157 s |
|  2.000 | 0,0643 s |
|  4.000 | 0,2430 s |
|  8.000 | 0,9585 s |
| 16.000 | 3,8570 s |

Entre `N = 1.000` e `N = 16.000`, o tamanho da entrada foi multiplicado por **16**, enquanto o tempo de execução aumentou aproximadamente **246 vezes**.

Esse comportamento é consistente com a tendência do pior caso do Quicksort, cuja complexidade pode chegar a: `O(n²)`

---

## 🧠 Complexidade

O Quicksort possui diferentes comportamentos dependendo de como as partições são formadas.

### 🟢 Caso médio

Quando o pivô divide o vetor de maneira relativamente equilibrada:

```text
O(n log n)
```

### 🟡 Melhor caso

Com divisões muito equilibradas:

```text
O(n log n)
```

### 🔴 Pior caso

Quando o pivô produz divisões extremamente desequilibradas:

```text
O(n²)
```

No projeto, escolher sempre o **primeiro elemento** como pivô em um vetor já ordenado cria exatamente uma situação propícia para esse comportamento.

Por outro lado, a escolha aleatória do pivô reduz a probabilidade de ocorrerem divisões sistematicamente ruins.

---

## 🔍 O que foi implementado?

### Pivô fixo

A implementação utiliza o primeiro elemento do intervalo como pivô:

```python
pivot = arr[low]
```

### Pivô aleatório

Na segunda estratégia, um índice aleatório é escolhido e colocado na primeira posição antes do particionamento:

```python
rand_idx = random.randint(low, high)
arr[low], arr[rand_idx] = arr[rand_idx], arr[low]
```

Assim, o restante do processo de particionamento pode ser reutilizado.

As duas implementações estão no arquivo `src/quicksort.py`.

---

## 🏗️ Estrutura do projeto

```text
analise-de-desempenho-algoritmico/
│
├── 📁 dados/
│   └── quicksort_resultados.csv
│
├── 📁 graficos/
│   └── quicksort_comparação.png
│
├── 📁 img/
│
├── 📁 scr/
│   ├── main.py
│   ├── quicksort.py
│   ├── medicoes.py
│   ├── plotagem.py
│   └── export.py
│
├── 📄 DIARIO.md
├── 📄 requirements.txt
├── 📄 .gitignore
└── 📄 README.md
```

### Principais componentes

| Arquivo        | Responsabilidade                            |
| -------------- | ------------------------------------------- |
| `main.py`      | Coordena a execução do experimento          |
| `quicksort.py` | Implementa as duas versões do Quicksort     |
| `medicoes.py`  | Executa os benchmarks e calcula as medianas |
| `plotagem.py`  | Gera os gráficos                            |
| `export.py`    | Exporta os resultados para CSV              |
| `DIARIO.md`    | Registra o desenvolvimento do projeto       |

O `main.py` define os tamanhos dos testes, executa os benchmarks, exporta os resultados e gera o gráfico automaticamente.

---

## ⚙️ Tecnologias

<div align="center">

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square\&logo=python\&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=flat-square\&logo=python\&logoColor=white)
![CSV](https://img.shields.io/badge/CSV-Data-217346?style=flat-square)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square\&logo=git\&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square\&logo=github\&logoColor=white)

</div>

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/thiagopietrobon/analise-de-desempenho-algoritmico.git
```

### 2. Entre no projeto

```bash
cd analise-de-desempenho-algoritmico
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Execute o benchmark

```bash
cd scr
python main.py
```

Ao finalizar, o programa irá:

```text
        Benchmark
            │
            ▼
    Executa os testes
            │
            ▼
    Calcula as medianas
            │
       ┌────┴────┐
       ▼         ▼
      CSV      Gráfico
```

Os resultados serão armazenados em:

```text
dados/quicksort_resultados.csv
```

e o gráfico em:

```text
graficos/quicksort_comparação.png
```

---

## 📁 Dados gerados

O arquivo CSV contém:

```text
tamanho_n
algoritmo
cenario
tempo_segundos
razao_crescimento
```

A coluna `razao_crescimento` representa a relação entre o tempo atual e o tempo obtido para o tamanho anterior.

---

## 🔬 Principais conclusões

A partir dos experimentos, podemos observar que:

**01.** O Quicksort apresenta desempenho próximo do esperado para `O(n log n)` nos cenários em que as partições não se tornam excessivamente desequilibradas.

**02.** O uso do primeiro elemento como pivô pode ser extremamente prejudicial para entradas ordenadas.

**03.** A estratégia de pivô aleatório apresentou comportamento muito mais estável nos testes realizados.

**04.** A escolha da estratégia de particionamento pode ter um impacto muito maior no desempenho do que simplesmente aumentar a capacidade computacional.

**05.** Os experimentos demonstram, na prática, a importância de relacionar a análise assintótica com o comportamento real de um algoritmo.

---

## 🎓 Contexto acadêmico

Projeto desenvolvido com finalidade **acadêmica e educacional**, com foco no estudo de:

* Algoritmos de ordenação;
* Análise de complexidade;
* Estruturas de dados;
* Benchmarking;
* Análise experimental de algoritmos;
* Visualização de dados.

---

## 👨‍💻 Autores

<div align="center">

### Thiago Henrique Barbosa Pietrobon

Estudante de Ciência da Computação

[![GitHub](https://img.shields.io/badge/GitHub-thiagopietrobon-181717?style=for-the-badge\&logo=github\&logoColor=white)](https://github.com/thiagopietrobon)

### Eduarda Pilon Guarino

Estudante de Ciência da Computação

[![GitHub](https://img.shields.io/badge/GitHub-EduardaPilon-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EduardaPilon)

</div>

---

<div align="center">

⭐ Se este projeto foi útil para você, considere deixar uma estrela no repositório!

**Análise de Desempenho Algorítmico • Quicksort • Python**

</div>
