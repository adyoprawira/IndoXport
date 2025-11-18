from __future__ import annotations

import json

from datetime import date

from django.http import HttpResponseNotAllowed, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

from buyers.models import BuyerRequirement, QualityCheckLog
from buyers.services import (
    build_document_pack,
    create_quality_check,
    find_market_matches,
)


def _json_response(content: dict, status: int = 200, safe: bool = True) -> JsonResponse:
    response = JsonResponse(content, status=status, safe=safe)
    response["Access-Control-Allow-Origin"] = "*"
    return response


def _list_requirement_payload(requirement: BuyerRequirement) -> dict:
    return requirement.as_dict()


@csrf_exempt
def requirements_view(request):
    if request.method == "GET":
        requirements = BuyerRequirement.objects.order_by("-created_at")
        payload = {"results": [_list_requirement_payload(req) for req in requirements]}
        return _json_response(payload)

    if request.method == "POST":
        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return _json_response({"error": "Invalid JSON payload"}, status=400)

        try:
            requirement = BuyerRequirement.objects.create(
                buyer_name=body["buyer_name"],
                product_type=body["product_type"],
                volume_required=int(body["volume_required"]),
                allowed_contaminants=body.get("allowed_contaminants", {}),
                shipping_window_start=date.fromisoformat(body["shipping_window_start"]),
                shipping_window_end=date.fromisoformat(body["shipping_window_end"]),
            )
        except KeyError as exc:
            return _json_response(
                {"error": f"Missing required field: {exc.args[0]}"}, status=400
            )
        except ValueError as exc:
            return _json_response({"error": str(exc)}, status=400)

        create_quality_check(requirement)
        return _json_response(requirement.as_dict(), status=201)

    return HttpResponseNotAllowed(["GET", "POST"])


def matches_view(request, pk: int):
    requirement = get_object_or_404(BuyerRequirement, pk=pk)
    matches = find_market_matches(requirement)
    return _json_response(matches, safe=False)


@csrf_exempt
def revalidate_view(request, pk: int):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    requirement = get_object_or_404(BuyerRequirement, pk=pk)
    qc = create_quality_check(requirement)
    requirement.status = BuyerRequirement.STATUS_MATCHED
    requirement.save(update_fields=["status"])
    documents = build_document_pack(requirement)

    payload = {
        "quality_status": qc.status,
        "quality_hash": qc.hash,
        "documents": documents,
    }
    return _json_response(payload)
