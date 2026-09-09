import random
import time
import statistics
from quicksort import quicksort_fixed, quicksort_random

def run_benchmark(sizes, seed=42):
    random.seed(seed)
    results = {
        "Fixo_Aleatorio": [],
        "Fixo_Ordenado": [],
        "Rand_Aleatorio": [],
        "Rand_Ordenado": []
    }

    print(f"{'Tamanho (N)':<12} | {'Algoritmo':<15} | {'Cenário':<10} | {'Tempo (s)':<10} | {'Razão (T_N / T_N/2)':<20}")
    print("-" * 75)

    last_times = {}

    for size in sizes:
        base_random = [random.randint(0, 1000000) for _ in range(size)]
        base_sorted = list(range(size))

        experiments = [
            ("Fixo", "Aleatório", quicksort_fixed, base_random, "Fixo_Aleatorio"),
            ("Fixo", "Ordenado", quicksort_fixed, base_sorted, "Fixo_Ordenado"),
            ("Aleatório", "Aleatório", quicksort_random, base_random, "Rand_Aleatorio"),
            ("Aleatório", "Ordenado", quicksort_random, base_sorted, "Rand_Ordenado")
        ]

        for alg_name, scenario, func, base_data, key in experiments:
            # Execução 0 descartada
            warmup_arr = base_data.copy()
            func(warmup_arr, 0, len(warmup_arr) - 1)

            #Execuções Medidas
            measured_times = []
            for _ in range(3):
                test_arr = base_data.copy()
                start = time.perf_counter()
                func(test_arr, 0, len(test_arr) - 1)
                end = time.perf_counter()
                measured_times.append(end - start)

            median_time = statistics.median(measured_times)
            results[key].append(median_time)

            ratio_str = "N/A"
            if key in last_times:
                ratio = median_time / last_times[key]
                ratio_str = f"{ratio:.2f}x"
            last_times[key] = median_time

            print(f"{size:<12} | {alg_name:<15} | {scenario:<10} | {median_time:<10.6f} | {ratio_str:<20}")

    return results