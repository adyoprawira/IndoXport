import importlib
from pathlib import Path

from django.conf import settings
from django.test import SimpleTestCase, override_settings


class ConfigUrlsTests(SimpleTestCase):
    @override_settings(DEBUG=True, MEDIA_URL="/media/", MEDIA_ROOT=Path(settings.BASE_DIR) / "test-media")
    def test_static_urls_included_when_debug(self):
        import config.urls

        module = importlib.reload(config.urls)
        pattern_strings = [str(pattern.pattern) for pattern in module.urlpatterns]
        self.assertTrue(any("media" in route for route in pattern_strings))
