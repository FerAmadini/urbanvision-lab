"""Pydantic request models.

Response shapes are plain dicts matching docs/API_CONTRACT.md exactly;
keeping them as dicts avoids serialization surprises in a demo.
"""
from typing import Literal, Optional

from pydantic import BaseModel, model_validator

Verdict = Literal["accepted", "rejected", "reclassified", "deleted"]


class AuditPatch(BaseModel):
    """Human audit verdict for a single detection."""

    verdict: Verdict
    corrected_class: Optional[str] = None
    comment: Optional[str] = None

    @model_validator(mode="after")
    def _require_corrected_class(self) -> "AuditPatch":
        if self.verdict == "reclassified" and not self.corrected_class:
            raise ValueError(
                "corrected_class is required when verdict is 'reclassified'"
            )
        return self


class HealthOut(BaseModel):
    status: str
    model: str
    classes_filtered: int
