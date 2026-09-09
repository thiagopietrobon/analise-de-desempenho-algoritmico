import sys
from scr.medicoes import run_benchmark
from plotagem import plot_results

# Ajuste global de recursão necessário para o pior caso do Pivô Fixo
sys.setrecursionlimit(200000)

SIZES = [1000, 2000, 4000, 8000, 16000]
SEED = 42

if __name__ == "__main__":
    results = run_benchmark(SIZES, seed=SEED)
    plot_results(SIZES, results)