import sys
from medicoes import run_benchmark
from export import export_to_csv
from plotagem import plot_results

sys.setrecursionlimit(200000)

SIZES = [1000, 2000, 4000, 8000, 16000]
SEED = 42

DATA_DIR = "dados"
GRAPHS_DIR = "graficos"

if __name__ == "__main__":
    plot_data, raw_rows = run_benchmark(SIZES, seed=SEED)
    
    # Exportação para subpastas
    export_to_csv(raw_rows, output_dir=DATA_DIR, filename="quicksort_resultados.csv")
    plot_results(SIZES, plot_data, output_dir=GRAPHS_DIR, filename="quicksort_comparação.png")