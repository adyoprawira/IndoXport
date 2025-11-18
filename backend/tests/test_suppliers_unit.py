from django.test import SimpleTestCase

from suppliers.brin_stub import simulate_brin_qc


class BrinStubTests(SimpleTestCase):
    def test_simulate_brin_qc_handles_safe_prefix(self):
        safe = simulate_brin_qc({"batch_code": "SAFE-100"})
        self.assertTrue(safe["passed"])

        random_result = simulate_brin_qc({"batch_code": "RISKY-999"})
        self.assertIn("lcms_score", random_result["results"])
        self.assertIn(random_result["passed"], [True, False])
