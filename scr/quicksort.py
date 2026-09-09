import random

def partition_fixed(arr, low, high):
    pivot = arr[low]
    i = low + 1
    for j in range(low + 1, high + 1):
        if arr[j] <= pivot:
            arr[i], arr[j] = arr[j], arr[i]
            i += 1
    arr[low], arr[i - 1] = arr[i - 1], arr[low]
    return i - 1

def partition_random(arr, low, high):
    rand_idx = random.randint(low, high)
    arr[low], arr[rand_idx] = arr[rand_idx], arr[low]
    return partition_fixed(arr, low, high)

def quicksort_fixed(arr, low, high):
    if low < high:
        p = partition_fixed(arr, low, high)
        quicksort_fixed(arr, low, p - 1)
        quicksort_fixed(arr, p + 1, high)

def quicksort_random(arr, low, high):
    if low < high:
        p = partition_random(arr, low, high)
        quicksort_random(arr, low, p - 1)
        quicksort_random(arr, p + 1, high)