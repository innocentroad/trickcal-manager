"""Canonical names used by the species field in generated game data."""

from __future__ import annotations

from typing import Any


SPECIES_NAME_ALIASES = {"？？？": "ミスティック"}


def normalize_species_name(value: Any) -> Any:
    """Map the exact legacy species label; leave every other value unchanged."""
    if not isinstance(value, str):
        return value
    return SPECIES_NAME_ALIASES.get(value, value)
