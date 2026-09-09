# analise-de-desempenho-algorotmico

# Análise de Desempenho Algorítmico

Repositório dedicado à implementação, medição de tempo de execução e análise gráfica de desempenho de algoritmos, com foco no comportamento do **Quicksort**.

## 📁 Estrutura do Repositório

```text
analise-de-desempenho-algoritmico/
│
├── dados/                  # Arquivos de dados gerados pelos testes (formato .csv)
│   └── quicksort_resultados.csv
│
├── graficos/               # Visualizações gráficas de desempenho geradas automaticamente
│   └── quicksort_comparação.png
│
├── scr/                    # Código-fonte principal do projeto
│   ├── main.py             # Script principal para execução dos testes
│   ├── quicksort.py        # Implementação do algoritmo Quicksort
│   ├── medicoes.py         # Funções para medição de tempo e benchmarks
│   ├── plotagem.py         # Geração de gráficos a partir dos dados coletados
│   └── export.py           # Exportação e salvamento de resultados
│
├── DIARIO.md               # Diário de bordo, anotações de progresso e observações
├── requirements.txt        # Dependências do projeto para execução dos scripts
├── .gitignore              # Arquivos e diretórios ignorados pelo Git
└── README.md               # Documentação do projeto