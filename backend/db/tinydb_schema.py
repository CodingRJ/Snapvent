"""
TinyDB schema and helper functions representing the ERD provided.
Tables: users, groups, group_members, images

Install: pip install tinydb

This module intentionally enforces uniqueness and simple referential integrity
through helper functions because TinyDB is schemaless.
"""
from tinydb import TinyDB, Query, where
import uuid
from datetime import datetime
from typing import Optional
from ..config import get_settings

settings = get_settings()

DB_PATH = settings.db_path

db = TinyDB(DB_PATH)
sessions = db.table("sessions")
users = db.table("users")
groups = db.table("groups")
group_members = db.table("group_members")
images = db.table("images")

Q = Query()

# -- Utilities ---------------------------------------------------------------
def _now_iso():
    return datetime.now().isoformat() + "Z"

def _new_uuid():
    return str(uuid.uuid4())

# -- Sessions ----------------------------------------------------------------
def create_session(user_id: str) -> str:
    """Creates a session record in the database."""
    session_id = _new_uuid()
    session = {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": _now_iso()
    }
    sessions.insert(session)
    return session_id

# -- Users ------------------------------------------------------------------
def create_user(username: str, user_email: str, password_hash: str) -> dict:
    """Create a user and enforce a unique email (and username if needed).
    Returns the created user dict.
    Raises ValueError on uniqueness or validation errors.
    """
    if users.contains(Q.user_email == user_email):
        raise ValueError(f"Email already exists")
    if users.contains(Q.username == username):
        raise ValueError(f"Username already exists")

    user = {
        "user_id": _new_uuid(),
        "username": username,
        "user_email": user_email,
        "password_hash": password_hash,
        "profile_image_url": None,
        "storage_used": 0,
        "is_premium": False,
        "premium_expires_at": None,
        "created_at": _now_iso(),
    }
    users.insert(user)
    return user

def get_user_by_id(user_id: str) -> Optional[dict]:
    return users.get(Q.user_id == user_id)

def get_user_by_username(username: str) -> Optional[dict]:
    return users.get(Q.username == username)

# -- Groups -----------------------------------------------------------------
def create_group(organizer_id: str, name: str, description: Optional[str] = None,
                 join_code: Optional[str] = None) -> dict:
    """Create a group. join_code must be unique if provided; otherwise generated.
    Organizer must exist.
    """
    if get_user_by_id(organizer_id) is None:
        raise ValueError(f"organizer not found: {organizer_id}")

    if join_code is None:
        join_code = uuid.uuid4().hex[:8]

    if groups.contains(Q.join_code == join_code):
        raise ValueError(f"join_code already exists: {join_code}")

    group = {
        "group_id": _new_uuid(),
        "organizer_id": organizer_id,
        "name": name,
        "description": description,
        "join_code": join_code,
        "created_at": _now_iso(),
    }
    groups.insert(group)
    # add organizer to group_members as organizer
    add_member(user_id=organizer_id, group_id=group["group_id"], role="organizer")
    return group

def get_group_by_id(group_id: str) -> Optional[dict]:
    return groups.get(Q.group_id == group_id)

# -- Group Members ----------------------------------------------------------
VALID_ROLES = {"organizer", "member"}

def add_member(user_id: str, group_id: str, role: str = "member") -> dict:
    """Add a user to a group. Enforces that user and group exist and role is valid.
    If user is already a member, returns existing record.
    """
    if role not in VALID_ROLES:
        raise ValueError(f"invalid role: {role}")
    if get_user_by_id(user_id) is None:
        raise ValueError(f"user not found: {user_id}")
    if get_group_by_id(group_id) is None:
        raise ValueError(f"group not found: {group_id}")

    existing = group_members.get((Q.user_id == user_id) & (Q.group_id == group_id))
    if existing:
        return existing

    member = {
        "membership_id": _new_uuid(),
        "user_id": user_id,
        "group_id": group_id,
        "role": role,
        "joined_at": _now_iso(),
    }
    group_members.insert(member)
    return member

def list_group_members(group_id: str):
    return group_members.search(Q.group_id == group_id)

# -- Images -----------------------------------------------------------------
def add_image(group_id: str, uploader_id: str, image_url: str, file_size_bytes: int) -> dict:
    """Add an image. Ensures group and uploader exist and uploader is member of group.
    """
    if get_group_by_id(group_id) is None:
        raise ValueError(f"group not found: {group_id}")
    if get_user_by_id(uploader_id) is None:
        raise ValueError(f"uploader not found: {uploader_id}")

    # optional: ensure uploader is a member of the group
    if not group_members.contains((Q.user_id == uploader_id) & (Q.group_id == group_id)):
        raise ValueError("uploader is not a member of the group")

    image = {
        "image_id": _new_uuid(),
        "group_id": group_id,
        "uploader_id": uploader_id,
        "image_url": image_url,
        "file_size_bytes": int(file_size_bytes),
        "created_at": _now_iso(),
    }
    images.insert(image)
    # update uploader storage usage
    users.update_increment("storage_used", file_size_bytes, Q.user_id == uploader_id)
    return image

# -- Convenience / Introspection --------------------------------------------
def reset_db():
    """Clear all tables. Useful for tests."""
    users.truncate()
    groups.truncate()
    group_members.truncate()
    images.truncate()

def dump_all():
    return {
        "users": users.all(),
        "groups": groups.all(),
        "group_members": group_members.all(),
        "images": images.all(),
    }

# Small example demonstrating usage when run as script
if __name__ == "__main__":
    # Simple demo creating an organizer, group, member and image
    print("Demo init...\n")
    reset_db()
    u = create_user("alice", "alice@example.com")
    g = create_group(u["user_id"], "Hiking Club", "Group for weekend hikes")
    bob = create_user("bob", "bob@example.com")
    add_member(bob["user_id"], g["group_id"], role="member")
    img = add_image(g["group_id"], bob["user_id"], "https://example.com/photo.jpg", 123456)
    print(dump_all())
