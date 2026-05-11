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
from config import get_settings

class DatabaseError(Exception):
    """Base class for database exceptions."""
    pass

class ResourceNotFoundError(DatabaseError):
    """Raised when a requested resource does not exist."""
    pass

class PermissionDeniedError(DatabaseError):
    """Raised when a user lacks permission for an action."""
    pass

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


def list_user_groups(user_id: str):
    """Returns all groups a user is a member of."""
    memberships = group_members.search(Q.user_id == user_id)
    if not memberships:
        return []

    roles_lookup = {m["group_id"]: m["role"] for m in memberships}

    user_groups = groups.search(Q.group_id.one_of(list(roles_lookup.keys())))

    for group in user_groups:
        group["role"] = roles_lookup.get(group["group_id"])

    return user_groups

# -- Groups -----------------------------------------------------------------
def create_group(organizer_id: str, name: str, description: Optional[str] = None,
                 join_code: Optional[str] = None) -> dict:
    """Create a group. join_code must be unique if provided; otherwise generated.
    Organizer must exist.
    """
    if get_user_by_id(organizer_id) is None:
        raise ResourceNotFoundError(f"organizer not found: {organizer_id}")

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
        "group_image_url": "",
        "created_at": _now_iso(),
    }
    groups.insert(group)
    # add organizer to group_members as organizer
    add_member(user_id=organizer_id, group_id=group["group_id"], role="group-admin")
    return group

def get_group_by_id(group_id: str) -> Optional[dict]:
    return groups.get(Q.group_id == group_id)

def get_group_by_join_code(join_code: str) -> Optional[dict]:
    """Find a group by its join code (for QR code joining)."""
    return groups.get(Q.join_code == join_code)

def update_group(group_id: str, requesting_user_id: str, name: Optional[str] = None, description: Optional[str] = None) -> dict:
    """
    Updates a group's name and/or description.
    Only the group organizer or a group-admin can perform this action.
    """
    group = get_group_by_id(group_id)
    if not group:
        raise ResourceNotFoundError("Group not found")

    requester_membership = group_members.get(
        (Q.group_id == group_id) & (Q.user_id == requesting_user_id)
    )
    if not requester_membership:
        raise PermissionDeniedError("You are not a member of this group")

    is_creator = (group["organizer_id"] == requesting_user_id)
    is_co_organizer = (requester_membership["role"] == "group-admin")

    if not (is_creator or is_co_organizer):
        raise PermissionDeniedError("Not authorized to update this group")

    update_data = {}
    if name is not None:
        update_data["name"] = name
    if description is not None:
        update_data["description"] = description

    if update_data:
        groups.update(update_data, Q.group_id == group_id)
        return get_group_by_id(group_id)
    return group

def delete_group(group_id: str, requesting_user_id: str) -> list[str]:
    """
    Deletes a group, all its members, and all its images.
    Only the group creator can perform this action.
    """
    group = groups.get(Q.group_id == group_id)
    if not group:
        raise ResourceNotFoundError("Group not found")

    if group["organizer_id"] != requesting_user_id:
        raise PermissionDeniedError("Only the group creator can delete the group")

    group_images = images.search(Q.group_id == group_id)
    gcs_paths_to_delete = []
    storage_to_refund = 0

    for img in group_images:
        gcs_paths_to_delete.append(img["gcs_path"])
        if img.get("status") == "ready":
            storage_to_refund += img.get("file_size_bytes", 0)

    if storage_to_refund > 0:
        owner = users.get(Q.user_id == requesting_user_id)
        if owner:
            new_total = max(0, owner.get("storage_used", 0) - storage_to_refund)
            users.update({"storage_used": new_total}, Q.user_id == requesting_user_id)

    images.remove(Q.group_id == group_id)
    group_members.remove(Q.group_id == group_id)
    groups.remove(Q.group_id == group_id)

    return gcs_paths_to_delete

# -- Group Members ----------------------------------------------------------
VALID_ROLES = {"group-admin", "member"}

def add_member(user_id: str, group_id: str, role: str = "member") -> dict:
    """Add a user to a group. Enforces that user and group exist and role is valid.
    If user is already a member, returns existing record.
    """
    if role not in VALID_ROLES:
        raise ValueError(f"invalid role: {role}")
    if get_user_by_id(user_id) is None:
        raise ResourceNotFoundError(f"user not found: {user_id}")
    if get_group_by_id(group_id) is None:
        raise ResourceNotFoundError(f"group not found: {group_id}")

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


def list_group_members_with_details(group_id: str):
    """Returns a list of members with their user details for a given group."""
    memberships = group_members.search(Q.group_id == group_id)
    
    user_ids = [m['user_id'] for m in memberships]
    
    group_users = users.search(Q.user_id.one_of(user_ids))
    
    users_by_id = {u['user_id']: u for u in group_users}
    
    members_with_details = []
    for membership in memberships:
        user_details = users_by_id.get(membership['user_id'])
        if user_details:
            members_with_details.append({
                "user_id": user_details['user_id'],
                "username": user_details['username'],
            })
            
    return members_with_details

def remove_member(group_id: str, member_to_remove_id: str, requesting_user_id: str):
    """
    Removes a member if the requester is the organizer OR
    the member is removing themselves.
    """
    group = get_group_by_id(group_id)
    if not group:
        raise ResourceNotFoundError("Group not found")

    requester_membership = group_members.get(
        (Q.group_id == group_id) & (Q.user_id == requesting_user_id)
    )
    if not requester_membership:
        raise PermissionDeniedError("You are not a member of this group")

    is_creator = (group["organizer_id"] == requesting_user_id)
    is_co_organizer = (requester_membership["role"] == "group-admin")
    is_self_removal = (member_to_remove_id == requesting_user_id)

    if not (is_creator or is_co_organizer or is_self_removal):
        raise PermissionDeniedError("Not authorized to remove this member")

    if member_to_remove_id == group["organizer_id"]:
        raise PermissionDeniedError("The group creator cannot be removed.")

    group_members.remove((Q.group_id == group_id) & (Q.user_id == member_to_remove_id))

def verify_membership(user_id: str, group_id: str):
    if not group_members.contains((Q.user_id == user_id) & (Q.group_id == group_id)):
        raise PermissionDeniedError("User is not a member of this group")

# -- Images -----------------------------------------------------------------
def add_image(group_id: str, uploader_id: str, image_url: str) -> dict:
    """Add an image. Ensures group and uploader exist and uploader is member of group.
    """
    if get_group_by_id(group_id) is None:
        raise ResourceNotFoundError(f"group not found: {group_id}")
    if get_user_by_id(uploader_id) is None:
        raise ResourceNotFoundError(f"uploader not found: {uploader_id}")

    if not group_members.contains((Q.user_id == uploader_id) & (Q.group_id == group_id)):
        raise PermissionDeniedError("uploader is not a member of the group")

    image = {
        "image_id": _new_uuid(),
        "group_id": group_id,
        "uploader_id": uploader_id,
        "gcs_path": image_url,
        "file_size_bytes": 0,
        "status": "pending",
        "created_at": _now_iso(),
    }
    images.insert(image)
    return image


def confirm_image_upload(image_id: str, file_size_bytes: int):
    """Called when Cloud Function confirms the file is in GCS."""
    img = images.get(Q.image_id == image_id)
    if not img:
        raise ResourceNotFoundError(f"Image not found: {image_id}")

    if img.get("status") == "ready":
        return

    images.update({
        "status": "ready",
        "file_size_bytes": int(file_size_bytes)
    }, Q.image_id == image_id)

    group = groups.get(Q.group_id == img["group_id"])
    if group:
        # If this is the first image in the group, use it as the group cover.
        # Store the raw GCS object path (same format as images.gcs_path).
        if not group.get("group_image_url"):
            groups.update({"group_image_url": img["gcs_path"]}, Q.group_id == img["group_id"])

        owner_id = group["organizer_id"]
        owner = users.get(Q.user_id == owner_id)
        if owner:
            new_total = owner.get("storage_used", 0) + int(file_size_bytes)
            users.update({"storage_used": new_total}, Q.user_id == owner_id)

def get_images_by_group(group_id: str):
    """Returns all images for a group that are 'ready'."""
    return images.search((Q.group_id == group_id) & (Q.status == "ready"))

def get_image_by_id(image_id: str):
    return images.get(Q.image_id == image_id)

def get_image_by_gcs_path(gcs_path: str):
    """Finds an image using its Google Cloud Storage path."""
    return images.get(Q.gcs_path == gcs_path)

def delete_image(image_id: str, requesting_user_id: str) -> str:
    """
    Deletes an image if the requester is the original uploader
    OR the organizer of the group. Returns the gcs_path for cloud cleanup.
    """
    img = images.get(Q.image_id == image_id)
    if not img:
        raise ResourceNotFoundError(f"Image not found: {image_id}")

    group = groups.get(Q.group_id == img["group_id"])
    if not group:
        raise ResourceNotFoundError("Associated group not found")

    is_uploader = (img["uploader_id"] == requesting_user_id)
    is_organizer = (group["organizer_id"] == requesting_user_id)

    if not (is_uploader or is_organizer):
        raise PermissionDeniedError("Not authorized to delete this picture")

    if img.get("status") == "ready":
        owner_id = group["organizer_id"]
        owner = users.get(Q.user_id == owner_id)
        if owner:
            file_size = img.get("file_size_bytes", 0)
            # Ensure storage never accidentally drops below zero
            new_total = max(0, owner.get("storage_used", 0) - file_size)
            users.update({"storage_used": new_total}, Q.user_id == owner_id)

    gcs_path = img["gcs_path"]

    images.remove(Q.image_id == image_id)

    return gcs_path

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

    alice = create_user("alice", "alice@example.com", "hash123")
    bob = create_user("bob", "bob@example.com", "hash456")

    hiking_group = create_group(alice["user_id"], "Hiking Club", "Weekend hikes in Zug")
    add_member(bob["user_id"], hiking_group["group_id"], role="member")

    new_img = add_image(hiking_group["group_id"], bob["user_id"], "originals/mount-rigi.png")
    print(f"Image created with status: {new_img['status']}")
    confirm_image_upload(new_img["image_id"], 5242880)  # 5MB

    print("\n--- Current DB State ---")
    print(dump_all())