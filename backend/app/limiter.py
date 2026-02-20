"""
MacroMate – Shared Rate Limiter
Zentrale Limiter-Instanz für alle Router.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])
