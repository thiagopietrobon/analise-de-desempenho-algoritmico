<div align="center">

# 📊 Análise de Desempenho Algorítmico

![Banner do projeto](img/banner.jfif)

### Um estudo experimental sobre o comportamento do Quicksort

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Matplotlib](https://img.shields.io/badge/Matplotlib-3.x-11557C?style=for-the-badge&logo=python&logoColor=white)](https://matplotlib.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://www.chartjs.org/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/thiagopietrobon/analise-de-desempenho-algoritmico)
[![Status](https://img.shields.io/badge/Status-Concluído-success?style=for-the-badge)]()

**Implementação • Benchmark • Análise • Visualização • Laboratório Interativo**

</div>

---

## 📈 Resultado principal

O experimento compara duas estratégias de escolha do pivô no **Quicksort**:

- **Pivô fixo:** primeiro elemento do vetor;
- **Pivô aleatório:** elemento escolhido aleatoriamente.

Cada estratégia é testada com entradas **aleatórias** e **ordenadas**, permitindo observar na prática como a escolha do pivô influencia o desempenho do algoritmo.

<div align="center">

<img src="graficos/quicksort_compara%C3%A7%C3%A3o.png" alt="Comparação de desempenho do Quicksort" width="850">

</div>

> O principal comportamento observado é o crescimento muito mais acentuado do Quicksort com **pivô fixo em entradas ordenadas**, cenário que se aproxima do pior caso teórico `O(n²)`.

---

## 🌐 Quicksort Lab

Como extensão dos experimentos realizados em Python, o projeto possui um **laboratório experimental interativo** executado diretamente no navegador.

O **Quicksort Lab** permite visualizar os resultados históricos do experimento, explorar diferentes cenários e realizar novas comparações localmente, tornando possível observar de forma visual o comportamento do algoritmo em diferentes entradas.

### 🔗 Acesse o laboratório

<div align="center">

[![Quicksort Lab](https://img.shields.io/badge/QUICKSORT_LAB-Acessar_no_GitHub_Pages-63FF9B?style=for-the-badge&logo=github)](https://thiagopietrobon.github.io/analise-de-desempenho-algoritmico/)

</div>

### 🧪 Recursos do laboratório

O laboratório permite:

- visualizar os resultados históricos registrados no CSV do projeto;
- filtrar os resultados por estratégia de pivô;
- filtrar os resultados pela distribuição da entrada;
- alternar entre escala linear e logarítmica nos gráficos;
- gerar novas entradas automaticamente;
- utilizar entradas definidas manualmente;
- comparar **pivô fixo** e **pivô aleatório**;
- acompanhar visualmente a execução do Quicksort;
- controlar a velocidade da animação;
- alterar a velocidade durante a execução;
- realizar medições localmente no navegador;
- repetir as medições e calcular a mediana;
- acompanhar o histórico das medições da sessão;
- registrar a distribuição utilizada em cada rodada;
- exportar resultados locais e histórico para CSV.

### 📊 Dados históricos

O laboratório utiliza os resultados do experimento original armazenados no arquivo:

```text
dados/quicksort_resultados.csv
```

Esses dados são carregados no navegador e apresentados em um gráfico interativo, permitindo comparar as diferentes combinações de algoritmo e entrada.

### 🔬 Experimentação local

A bancada interativa permite criar novas entradas e executar as duas estratégias de Quicksort diretamente no navegador.

A entrada pode ser:

- aleatória;
- ordenada;
- inversa;
- composta por valores repetidos;
- personalizada pelo usuário.

A bancada também apresenta uma representação visual dos valores e permite acompanhar a execução do algoritmo passo a passo.

As medições realizadas no laboratório são independentes dos resultados históricos e dependem do ambiente em que o navegador está sendo executado.

---

## 🎯 Sobre o projeto

Este projeto foi desenvolvido para analisar experimentalmente o desempenho do algoritmo **Quicksort**, relacionando sua complexidade teórica com resultados obtidos através de benchmarks.

A análise considera diferentes tamanhos de entrada e compara o comportamento do algoritmo em situações favoráveis e desfavoráveis.

Além dos benchmarks realizados em Python, o projeto conta com um laboratório interativo desenvolvido para facilitar a visualização e a exploração dos resultados.

### Objetivos

- Implementar o Quicksort com diferentes estratégias de pivô;
- Medir o tempo de execução;
- Comparar entradas aleatórias e ordenadas;
- Observar o crescimento do tempo conforme `N` aumenta;
- Relacionar os resultados experimentais com a análise de complexidade;
- Gerar dados e gráficos automaticamente;
- Disponibilizar uma ferramenta interativa para exploração dos resultados.

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

### 🔬 Metodologia da bancada interativa

A bancada do **Quicksort Lab** possui uma metodologia independente do benchmark original.

Para cada nova entrada:

1. A entrada é validada;
2. É realizada uma execução de aquecimento para cada estratégia;
3. Cada estratégia é executada **5 vezes**;
4. A ordem de execução das estratégias é alternada;
5. A **mediana das 5 execuções** é apresentada;
6. As saídas são verificadas quanto à ordenação e consistência;
7. O resultado é registrado no histórico da sessão.

Essa separação mantém os dados do benchmark original preservados e permite utilizar a bancada como ferramenta complementar de experimentação.

---

## 📊 Resultados

Os dados obtidos mostram uma diferença bastante significativa entre os cenários.

### 🏆 Desempenho observado

Para `N = 16.000`:

| Estratégia        | Entrada   |        Tempo |
| ----------------- | --------- | -----------: |
| 🎲 Pivô aleatório | Aleatória | **0,0237 s** |
| 🎲 Pivô aleatório | Ordenada  | **0,0219 s** |
| ⚙️ Pivô fixo      | Aleatória | **0,0191 s** |
| ⚙️ Pivô fixo      | Ordenada  | **3,8570 s** |

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

Esse comportamento é consistente com a tendência do pior caso do Quicksort, cuja complexidade pode chegar a:

```text
O(n²)
```

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

No projeto, escolher sempre o **primeiro elemento** como pivô em um vetor já ordenado cria uma situação propícia para esse comportamento.

Por outro lado, a escolha aleatória do pivô reduz a dependência da ordem inicial dos dados e a probabilidade de ocorrerem divisões sistematicamente ruins.

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

As duas implementações estão no arquivo:

```text
src/quicksort.py
```

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
├── 📁 src/
│   ├── main.py
│   ├── quicksort.py
│   ├── medicoes.py
│   ├── plotagem.py
│   └── export.py
│
├── 📁 lab/
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── 📁 js/
│   │   ├── quicksort.js
│   │   ├── metrics.js
│   │   ├── csv.js
│   │   └── animation.js
│   └── 📁 dados/
│
├── 📄 DIARIO.md
├── 📄 requirements.txt
├── 📄 .gitignore
└── 📄 README.md
```

### Principais componentes

| Arquivo / Diretório | Responsabilidade |
| ------------------- | ---------------- |
| `main.py` | Coordena a execução do experimento |
| `quicksort.py` | Implementa as estratégias do Quicksort |
| `medicoes.py` | Executa os benchmarks e calcula as medianas |
| `plotagem.py` | Gera os gráficos |
| `export.py` | Exporta os resultados para CSV |
| `DIARIO.md` | Registra o desenvolvimento do projeto |
| `lab/` | Contém o laboratório interativo |
| `lab/index.html` | Estrutura da interface do laboratório |
| `lab/style.css` | Estilos e identidade visual |
| `lab/script.js` | Controlador central da aplicação |
| `lab/js/quicksort.js` | Algoritmo e etapas visuais do Quicksort |
| `lab/js/metrics.js` | Medições e cálculo das medianas |
| `lab/js/csv.js` | Leitura, filtragem e exportação de dados |
| `lab/js/animation.js` | Controle da reprodução e velocidade |

O laboratório utiliza JavaScript modular para separar as responsabilidades e facilitar a manutenção e evolução da aplicação.

---

## 🌐 Arquitetura do Quicksort Lab

A aplicação foi estruturada para separar a interface, o algoritmo, as métricas, os dados e a animação.

```text
                    Quicksort Lab
                          │
                    ┌─────┴─────┐
                    │ script.js │
                    │ controlador│
                    └─────┬─────┘
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
        ▼                 ▼                  ▼
 quicksort.js        metrics.js           csv.js
 algoritmo           medições             dados
 animação visual     medianas             filtros
        │                 │                  │
        └─────────────────┼──────────────────┘
                          │
                          ▼
                    animation.js
                  execução visual
```

A separação dos módulos evita concentrar toda a lógica em um único arquivo e facilita futuras alterações no algoritmo, na interface ou nas métricas.

---

## ⚙️ Tecnologias

<div align="center">

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white)
![Matplotlib](https://img.shields.io/badge/Matplotlib-11557C?style=flat-square&logo=python&logoColor=white)
![CSV](https://img.shields.io/badge/CSV-Data-217346?style=flat-square)
![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white)

</div>

---

## 🚀 Como executar

### Benchmark em Python

#### 1. Clone o repositório

```bash
git clone https://github.com/thiagopietrobon/analise-de-desempenho-algoritmico.git
```

#### 2. Entre no projeto

```bash
cd analise-de-desempenho-algoritmico
```

#### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

#### 4. Execute o benchmark

```bash
cd src
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

### Laboratório interativo

O **Quicksort Lab** pode ser executado diretamente no navegador.

Com o projeto aberto localmente, basta abrir:

```text
lab/index.html
```

Ou acessar a versão publicada no GitHub Pages:

> 🔗 **Quicksort Lab:** [Acessar laboratório](https://thiagopietrobon.github.io/analise-de-desempenho-algoritmico/)

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

O mesmo arquivo é utilizado pelo laboratório para apresentar os resultados históricos do experimento.

---

## 🔬 Relação entre o experimento e o laboratório

O laboratório foi desenvolvido como uma extensão visual e interativa dos experimentos realizados em Python.

Os resultados históricos apresentados pelo Lab são provenientes dos benchmarks registrados no CSV do projeto, enquanto as novas experimentações realizadas na bancada são executadas localmente no navegador.

```text
Experimento original
        │
        ▼
 Benchmark em Python
        │
        ▼
      CSV
        │
        ▼
 Quicksort Lab
        │
        ├── Dados históricos
        ├── Filtros
        ├── Gráficos
        └── Experimentação local
```

Dessa forma, o laboratório complementa o experimento original sem substituir os dados utilizados na análise principal.

---

## 🔬 Principais conclusões

A partir dos experimentos, podemos observar que:

**01.** O Quicksort apresenta desempenho próximo do esperado para `O(n log n)` nos cenários em que as partições não se tornam excessivamente desequilibradas.

**02.** O uso do primeiro elemento como pivô pode ser extremamente prejudicial para entradas ordenadas.

**03.** A escolha aleatória do pivô apresentou comportamento mais estável nos testes realizados.

**04.** A estratégia de escolha do pivô pode ter um impacto significativo no desempenho do algoritmo.

**05.** Os experimentos demonstram, na prática, a importância de relacionar a análise assintótica com o comportamento real de um algoritmo.

**06.** A experimentação interativa permite observar o comportamento do Quicksort em diferentes entradas e complementar a análise realizada pelos benchmarks.

---

## 🎓 Contexto acadêmico

Projeto desenvolvido com finalidade **acadêmica e educacional**, com foco no estudo de:

- Algoritmos de ordenação;
- Análise de complexidade;
- Estruturas de dados;
- Benchmarking;
- Análise experimental de algoritmos;
- Visualização de dados;
- Desenvolvimento de aplicações interativas.

---

## 👨‍💻 Autores

<div align="center">

### Thiago Henrique Barbosa Pietrobon

Estudante de Ciência da Computação

[![GitHub](https://img.shields.io/badge/GitHub-thiagopietrobon-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/thiagopietrobon)

### Eduarda Pilon Guarino

Estudante de Ciência da Computação

[![GitHub](https://img.shields.io/badge/GitHub-EduardaPilon-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/EduardaPilon)

</div>

---

<div align="center">

⭐ Se este projeto foi útil para você, considere deixar uma estrela no repositório!

**Análise de Desempenho Algorítmico • Quicksort • Python • JavaScript**

</div>