# Quicksort Lab — análise, correções e arquitetura modular

## Estrutura final

```text
quicksort-lab/
├── index.html
├── style.css
├── script.js                 # controlador central da aplicação
├── js/
│   ├── quicksort.js          # algoritmo, validação e geração de passos
│   ├── metrics.js            # mediana e benchmark
│   ├── csv.js                # leitura, filtro e geração de CSV
│   └── animation.js          # controle da animação e velocidade
└── dados/
    └── quicksort_resultados.csv
```

## Alterações desta revisão

- A velocidade agora é única para as duas bancadas.
- O slider pode ser alterado durante a execução. A mudança é aplicada imediatamente ao próximo passo de cada bancada que estiver rodando.
- `script.js` passou a ser o único ponto de entrada da aplicação.
- `quicksort.js` concentra a implementação do algoritmo e a geração dos estados visuais.
- `metrics.js` concentra mediana e benchmark, sem dependência do DOM.
- `csv.js` concentra leitura, filtro e serialização dos dados.
- `animation.js` concentra `play`, `pause`, `next`, `reset` e atualização dinâmica da velocidade.
- Foram removidas duplicações de implementação do Quicksort, benchmarks e listeners encontrados nas versões anteriores.
- O CSS continua consolidado em um único `style.css`.
- A validação da saída é independente para cada estratégia e verifica ordenação, tamanho e multiplicidade dos valores.
- A inicialização do Chart.js foi ajustada para ocorrer antes do módulo central, evitando uma condição de corrida entre o carregamento da biblioteca e o primeiro render dos gráficos.
- Foram mantidos comentários e documentação JSDoc nas funções principais.

## Validações

- Sintaxe dos cinco arquivos JavaScript verificada com Node.
- Testes do Quicksort com entradas pequenas, ordenadas, inversas, repetidas, negativas e decimais.
- Testes da mediana para quantidade par e ímpar de valores.
- Teste do benchmark das duas estratégias.
- Teste do controlador de animação verificando que alterar a velocidade durante a execução substitui o timer anterior, sem duplicá-lo.
## Ajustes desta revisão

- O controle de velocidade foi movido para abaixo das duas bancadas.
- O mesmo slider continua controlando ambas as animações e pode ser alterado durante a execução.
- O histórico da sessão passou a registrar a distribuição da entrada em cada rodada.
- O CSV exportado da sessão também inclui a coluna `distribuicao`.
- Quando uma entrada gerada não é alterada manualmente, o histórico preserva a distribuição escolhida: Aleatória, Ordenada, Inversa ou Com repetidos.
- Quando o usuário modifica os valores diretamente, a rodada é registrada como `Personalizada`.
- Também foi removida uma declaração duplicada de `legend` no gráfico histórico.



## Ajuste posterior — velocidade da animação

- O controle deslizante foi substituído por botões de velocidade compartilhados.
- Opções disponíveis: 1×, 2×, 5×, 10× e 20×.
- A velocidade padrão passou para 5×.
- O atraso entre passos foi reduzido:
  - 1× = 500 ms
  - 2× = 250 ms
  - 5× = 100 ms
  - 10× = 50 ms
  - 20× = 25 ms
- A alteração continua podendo ser feita durante a execução e afeta as duas bancadas simultaneamente.
