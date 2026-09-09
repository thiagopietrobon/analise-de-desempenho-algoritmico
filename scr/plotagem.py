import matplotlib.pyplot as plt

def plot_results(sizes, results, output_filename="quicksort_benchmark.png"):
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
    plt.savefig(output_filename)
    print(f"\nGráfico salvo com sucesso como '{output_filename}'.")