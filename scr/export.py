import csv
import os

def export_to_csv(rows, output_dir="dados", filename="resultados_medições.csv"):
    os.makedirs(output_dir, exist_ok=True)
    filepath = os.path.join(output_dir, filename)

    fieldnames = ["tamanho_n", "algoritmo", "cenario", "tempo_segundos", "razao_crescimento"]

    with open(filepath, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDados salvos com sucesso em: '{filepath}'")