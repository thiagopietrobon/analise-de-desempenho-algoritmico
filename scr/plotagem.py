import os
import matplotlib.pyplot as plt

def plot_results(sizes, results, output_dir="graficos", filename="quicksort_testes.png"):
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5))

    # Entrada Aleatória
    axes[0].plot(sizes, results["Fixo_Aleatorio"], 'o-', label="Pivô Fixo")
    axes[0].plot(sizes, results["Rand_Aleatorio"], 's--', label="Pivô Aleatório")
    axes[0].set_title("Entrada Aleatória — Ambos O(N log N)")
    axes[0].set_xlabel("Tamanho (N)")
    axes[0].set_ylabel("Tempo (segundos)")
    axes[0].grid(True)
    axes[0].legend()

    # Entrada Ordenada
    axes[1].plot(sizes, results["Fixo_Ordenado"], 'o-', color='red', label="Pivô Fixo — O(N²)")
    axes[1].plot(sizes, results["Rand_Ordenado"], 's--', color='green', label="Pivô Aleatório — O(N log N)")
    axes[1].set_title("Entrada Ordenada — Pior Caso")
    axes[1].set_xlabel("Tamanho (N)")
    axes[1].set_ylabel("Tempo (segundos)")
    axes[1].grid(True)
    axes[1].legend()

    plt.tight_layout()
    plt.savefig(filepath)
    print(f"Gráfico salvo com sucesso em: '{filepath}'")