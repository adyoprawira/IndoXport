# suppliers/brin_stub.py

import random
from typing import Dict, Any


def simulate_brin_qc(request_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulasi proses QC di BRIN.

    - Random tapi deterministic (seed pakai batch_code) supaya hasil konsisten per batch.
    - Kalau batch_code diawali "SAFE-" → otomatis PASS (buat demo).
    - Selain itu pakai rule sederhana: lcms_score <= 60 dianggap lolos.
    """
    batch_code = str(request_payload.get("batch_code", "UNKNOWN"))
    rnd = random.Random(batch_code)

    # Simulasi hasil lab
    results = {
        "lcms_score": rnd.uniform(0, 100),       # 0–100 (semakin tinggi semakin kotor)
        "microbial_load_cfu": rnd.uniform(0, 10000),
        "heavy_metal_ppm": rnd.uniform(0, 3),
        "histamine_ppm": rnd.uniform(0, 150),
    }

    # 🔓 Mode demo: batch dengan prefix "SAFE-" selalu PASS
    if batch_code.lower().startswith("safe-"):
        passed = True
    else:
        # Rule sederhana, cukup 1 parameter biar gampang jelasin di demo
        passed = results["lcms_score"] <= 60

    response = {
        "passed": passed,
        "results": results,
        "lab_name": "BRIN Jakarta (stub)",
    }

    return response
