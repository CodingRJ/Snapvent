# API Documentation - Group Gallery Project

## 1. Authentication
Handles user onboarding and session management.

| Method | Endpoint             | Description       | Request Body                                               | Success Response (200/201)    |
| :----- | :------------------- | :---------------- | :--------------------------------------------------------- | :---------------------------- |
| `POST` | `/api/auth/register` | Create new user   | `{"username": "str", "email": "str", "password": "str"}` | `{"message": "User created"}` |
| `POST` | `/api/auth/login`    | User login        | `{"username": "str", "password": "str"}`                 | `{"token": "TOKEN_String"}`   |

---

## 2. Group Management
Handles group creation, membership, and QR code invites.

| Method   | Endpoint                             | Description                  | Request Body                 | Success Response (200)                     |
| :------- | :----------------------------------- | :--------------------------- | :--------------------------- | :----------------------------------------- |
| `POST`   | `/api/groups`                        | Create a group               | `{"name": "Group Name"}`     | `{"group_id": "uuid", "owner_id": "uuid"}` |
| `GET`    | `/api/groups`                        | List user's groups           | N/A                          | `[{"id": "uuid", "name": "str"}]`          |
| `DELETE` | `/api/groups/{id}`                   | Delete a group (only owner)  | N/A                          | `{"message": "Deleted"}`                   |
| `GET`    | `/api/groups/{id}/qr-data`           | Get join-token for QR        | N/A                          | `{"invite_code": "ABC-123"}`               |
| `POST`   | `/api/groups/join`                   | Join via QR scan             | `{"invite_code": "ABC-123"}` | `{"group_id": "uuid", "status": "joined"}` |
| `DELETE` | `/api/groups/{id}/members/{user_id}` | Remove member                | N/A                          | `{"message": "Member removed"}`            |

---

## 3. Gallery & Pictures
Handles S3 upload URLs and retrieval of thumbnails vs full images.

| Method   | Endpoint                      | Description                                     | Request Body              | Success Response (200)                                        |
| :------- | :---------------------------- | :---------------------------------------------- | :------------------------ | :------------------------------------------------------------ |
| `POST`   | `/api/groups/{id}/pictures`   | Get S3 Upload URL                               | `{"filename": "img.jpg"}` | `{"upload_url": "s3...", "picture_id": "uuid"}`               |
| `GET`    | `/api/groups/{id}/thumbnails` | Get all group thumbs                            | N/A                       | `[{"id": "uuid", "thumb_url": "s3..."}]`                      |
| `GET`    | `/api/pictures/{id}`          | Get full-res metadata                           | N/A                       | `{"id": "uuid", "full_url": "s3...", "uploader": "username"}` |
| `DELETE` | `/api/pictures/{id}`          | Delete a picture (only group owner and creator) | N/A                       | `{"message": "Deleted"}`                                      |



Vorschlag von Lukas:

Upload-Workflow: 
1. Bild aufnehmen.
2. Request an /api/groups/{id}/pictures.
3. Backend speichert Ersteller, Gruppe und Bild-URL in der Datenbank.
4. Backend antwortet mit einer temporären Upload-URL ([S3 Presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/PresignedUrlUploadObject.html)).
5. Image-Upload vom Frontend zu S3.
6. Lambda-Funktion wird getriggert und erstellt ein Thumbnail.

Workflow: Bilder anzeigen:
1. Gruppengalerie öffnen.
2. Frontend-Request an /api/groups/{id}/thumbnails.
3. Backend liefert ein Array mit temporären Download-URLs der Thumbnails zurück.
4. Ein Bild anklicken, um die Detailansicht zu öffnen.
5. Request an /api/pictures/{id}.
6. Backend liefert die temporäre Download-URL für das Originalbild (Full-size Image) zurück.
---

