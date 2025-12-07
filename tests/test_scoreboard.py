import pytest

from scoreboard import compute_win_rate


def test_zero_games_returns_zero():
    assert compute_win_rate(0, 0) == 0.0


def test_negative_values_rejected():
    with pytest.raises(ValueError):
        compute_win_rate(-1, 2)
    with pytest.raises(ValueError):
        compute_win_rate(1, -2)


def test_wins_cannot_exceed_games():
    with pytest.raises(ValueError):
        compute_win_rate(3, 2)


def test_regular_computation():
    assert compute_win_rate(3, 5) == 0.6
