"""Utilities for computing basic game statistics.

The functions in this module are intentionally small but defensive so they can
be used in small command-line utilities without pulling in extra dependencies.
"""

from __future__ import annotations


def compute_win_rate(wins: int, games_played: int) -> float:
    """Compute the win rate as a float between 0.0 and 1.0.

    A common bug in quick scripts is to divide by ``games_played`` without
    checking for zero, which raises ``ZeroDivisionError`` and makes it hard to
    render standings. This helper avoids that problem and validates the inputs
    so the calling code can trust the return value.

    Args:
        wins: Number of wins recorded.
        games_played: Total number of games played.

    Returns:
        The win rate (wins / games_played) or ``0.0`` when no games have been
        played yet.

    Raises:
        ValueError: If ``wins`` or ``games_played`` are negative or if ``wins``
            exceeds ``games_played``.
    """

    if wins < 0 or games_played < 0:
        raise ValueError("wins and games_played must be non-negative")
    if wins > games_played:
        raise ValueError("wins cannot exceed games_played")

    if games_played == 0:
        return 0.0

    return wins / games_played
