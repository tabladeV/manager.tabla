// Dummy notifications data
export const dummyNotifications = [
  {
    "user_notification_id": 21,
    "notification_id": 4,
    "restaurant_id": 1,
    "restaurant_name": "La Pizza Italiana",
    "notification_type": "RESERVATION",
    "title": "Reservation Created: 417 for La Pizza Italiana",
    "message": "Reservation for 417 (2 guests) at La Pizza Italiana on 2025-05-15 12:15 has been created.",
    "data": {
      "action": "created",
      "status": "APPROVED",
      "event_type": "reservation_created_lifecycle",
      "reservation_id": "417",
      "restaurant_name": "La Pizza Italiana",
      "restaurant_id_payload": "1"
    },
    "created_at": "2025-05-12T21:36:10.489309Z",
    "is_read": false,
    "read_at": null
  },
  {
    "user_notification_id": 22,
    "notification_id": 5,
    "restaurant_id": 1,
    "restaurant_name": "La Pizza Italiana",
    "notification_type": "RESERVATION",
    "title": "Reservation Updated: 417 for La Pizza Italiana",
    "message": "Reservation for 417 (2 guests) at La Pizza Italiana on 2025-05-15 12:15 has been updated.",
    "data": {
      "action": "updated",
      "status": "PENDING",
      "event_type": "reservation_updated_lifecycle",
      "reservation_id": "417",
      "restaurant_name": "La Pizza Italiana",
      "restaurant_id_payload": "1"
    },
    "created_at": "2025-05-12T22:36:10.489309Z",
    "is_read": true,
    "read_at": "2025-05-12T22:40:10.489309Z"
  }
];

export type NotificationType = typeof dummyNotifications[0];
