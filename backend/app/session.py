import os
import sqlite3
import threading
import time
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from functools import lru_cache
from typing import Optional

IDLE_EXPIRY_SECONDS = 2 * 60 * 60


@dataclass
class SessionTurn:
    timestamp: float
    target_description: str
    hint: str
    thumbnail_b64: Optional[str] = None


@dataclass
class SessionRecord:
    session_id: str
    started_at: float
    last_active_at: float
    ended_at: Optional[float] = None
    turns: list[SessionTurn] = field(default_factory=list)

    def expired(self, now: Optional[float] = None) -> bool:
        now = now if now is not None else time.time()
        return self.ended_at is None and now - self.last_active_at > IDLE_EXPIRY_SECONDS


class SessionStore(ABC):
    @abstractmethod
    def start(self) -> SessionRecord: ...

    @abstractmethod
    def get(self, session_id: str) -> Optional[SessionRecord]:
        """Active session or None if unknown, ended, or idle-expired."""

    @abstractmethod
    def append_turn(self, session_id: str, turn: SessionTurn) -> bool: ...

    @abstractmethod
    def end(self, session_id: str) -> Optional[SessionRecord]: ...


class InMemorySessionStore(SessionStore):
    def __init__(self) -> None:
        self._sessions: dict[str, SessionRecord] = {}
        self._lock = threading.Lock()

    def start(self) -> SessionRecord:
        now = time.time()
        record = SessionRecord(session_id=uuid.uuid4().hex, started_at=now, last_active_at=now)
        with self._lock:
            self._sessions[record.session_id] = record
        return record

    def get(self, session_id: str) -> Optional[SessionRecord]:
        with self._lock:
            record = self._sessions.get(session_id)
            if record is None or record.ended_at is not None or record.expired():
                return None
            return record

    def append_turn(self, session_id: str, turn: SessionTurn) -> bool:
        with self._lock:
            record = self._sessions.get(session_id)
            if record is None or record.ended_at is not None or record.expired():
                return False
            record.turns.append(turn)
            record.last_active_at = time.time()
            return True

    def end(self, session_id: str) -> Optional[SessionRecord]:
        with self._lock:
            record = self._sessions.get(session_id)
            if record is None or record.expired():
                return None
            if record.ended_at is None:
                record.ended_at = time.time()
            return record


class SqliteSessionStore(SessionStore):
    def __init__(self, path: str) -> None:
        self._path = path
        with self._conn() as conn:
            conn.execute(
                "CREATE TABLE IF NOT EXISTS sessions ("
                "id TEXT PRIMARY KEY, started_at REAL, last_active_at REAL, ended_at REAL)"
            )
            conn.execute(
                "CREATE TABLE IF NOT EXISTS turns ("
                "session_id TEXT, timestamp REAL, target_description TEXT, "
                "hint TEXT, thumbnail_b64 TEXT)"
            )

    def _conn(self) -> sqlite3.Connection:
        return sqlite3.connect(self._path)

    def _load(self, conn: sqlite3.Connection, session_id: str) -> Optional[SessionRecord]:
        row = conn.execute(
            "SELECT id, started_at, last_active_at, ended_at FROM sessions WHERE id = ?",
            (session_id,),
        ).fetchone()
        if row is None:
            return None
        record = SessionRecord(
            session_id=row[0], started_at=row[1], last_active_at=row[2], ended_at=row[3]
        )
        for t in conn.execute(
            "SELECT timestamp, target_description, hint, thumbnail_b64 "
            "FROM turns WHERE session_id = ? ORDER BY timestamp",
            (session_id,),
        ):
            record.turns.append(
                SessionTurn(timestamp=t[0], target_description=t[1], hint=t[2], thumbnail_b64=t[3])
            )
        return record

    def start(self) -> SessionRecord:
        now = time.time()
        record = SessionRecord(session_id=uuid.uuid4().hex, started_at=now, last_active_at=now)
        with self._conn() as conn:
            conn.execute(
                "INSERT INTO sessions (id, started_at, last_active_at, ended_at) VALUES (?, ?, ?, NULL)",
                (record.session_id, now, now),
            )
        return record

    def get(self, session_id: str) -> Optional[SessionRecord]:
        with self._conn() as conn:
            record = self._load(conn, session_id)
        if record is None or record.ended_at is not None or record.expired():
            return None
        return record

    def append_turn(self, session_id: str, turn: SessionTurn) -> bool:
        with self._conn() as conn:
            record = self._load(conn, session_id)
            if record is None or record.ended_at is not None or record.expired():
                return False
            conn.execute(
                "INSERT INTO turns (session_id, timestamp, target_description, hint, thumbnail_b64) "
                "VALUES (?, ?, ?, ?, ?)",
                (session_id, turn.timestamp, turn.target_description, turn.hint, turn.thumbnail_b64),
            )
            conn.execute(
                "UPDATE sessions SET last_active_at = ? WHERE id = ?", (time.time(), session_id)
            )
        return True

    def end(self, session_id: str) -> Optional[SessionRecord]:
        with self._conn() as conn:
            record = self._load(conn, session_id)
            if record is None or record.expired():
                return None
            if record.ended_at is None:
                record.ended_at = time.time()
                conn.execute(
                    "UPDATE sessions SET ended_at = ? WHERE id = ?",
                    (record.ended_at, session_id),
                )
        return record


@lru_cache(maxsize=1)
def get_store() -> SessionStore:
    backend = os.environ.get("TUTOR_SESSION_STORE", "memory").lower()
    if backend == "sqlite":
        return SqliteSessionStore(os.environ.get("TUTOR_SESSION_DB", "sessions.db"))
    return InMemorySessionStore()
