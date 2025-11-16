package com.tabla.tablamanager;

import android.app.PendingIntent;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.AdaptiveIconDrawable;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.text.TextUtils;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import com.capacitorjs.plugins.pushnotifications.MessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TimeZone;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Custom Firebase messaging service that converts data-only FCM payloads into
 * visible system notifications so pushes arrive even when the JS runtime is stopped.
 */
public class TablaFirebaseMessagingService extends MessagingService {

    private static final String TAG = "TablaFcmService";
    private static final AtomicInteger notificationCounter = new AtomicInteger(0);

    @Override
    public void onMessageReceived(@NonNull RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);

        if (remoteMessage.getNotification() != null) {
            // Let FCM display notification payloads automatically.
            Log.d(TAG, "Received notification payload, letting FCM display it.");
            return;
        }

        Map<String, String> data = remoteMessage.getData();
        if (data == null || data.isEmpty()) {
            Log.d(TAG, "Received data message without payload; skipping.");
            return;
        }

        MainActivity.ensureNotificationChannel(getApplicationContext());
        showNotification(remoteMessage);
    }

    private void showNotification(RemoteMessage remoteMessage) {
        Map<String, String> data = remoteMessage.getData();
        String title = buildNotificationTitle(data);
        String body = buildNotificationBody(data);

        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);

        if (remoteMessage.getMessageId() != null) {
            intent.putExtra("google.message_id", remoteMessage.getMessageId());
        }
        for (Map.Entry<String, String> entry : data.entrySet()) {
            intent.putExtra(entry.getKey(), entry.getValue());
        }

        int notificationId = notificationCounter.incrementAndGet();
        int pendingFlags = PendingIntent.FLAG_ONE_SHOT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            pendingFlags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
            this,
            notificationId,
            intent,
            pendingFlags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, MainActivity.NOTIFICATION_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setColor(ContextCompat.getColor(this, R.color.tabla_notification_accent))
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body));

        Bitmap largeIcon = getLargeIconBitmap();
        if (largeIcon != null) {
            builder.setLargeIcon(largeIcon);
        }

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(this);
        notificationManager.notify(notificationId, builder.build());
        Log.d(TAG, "Displayed notification for data payload=" + data);
    }

    private Bitmap getLargeIconBitmap() {
        try {
            Drawable drawable = ContextCompat.getDrawable(this, R.mipmap.ic_launcher);
            if (drawable == null) {
                return null;
            }

            if (drawable instanceof BitmapDrawable) {
                Bitmap bitmap = ((BitmapDrawable) drawable).getBitmap();
                if (bitmap != null) {
                    return bitmap;
                }
            }

            int width = getResources().getDimensionPixelSize(android.R.dimen.notification_large_icon_width);
            int height = getResources().getDimensionPixelSize(android.R.dimen.notification_large_icon_height);

            Bitmap bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888);
            Canvas canvas = new Canvas(bitmap);

            if (drawable instanceof AdaptiveIconDrawable) {
                drawable.setBounds(0, 0, width, height);
                drawable.draw(canvas);
            } else {
                drawable.setBounds(0, 0, width, height);
                drawable.draw(canvas);
            }

            return bitmap;
        } catch (Exception e) {
            Log.w(TAG, "Failed to convert launcher icon to bitmap", e);
            return null;
        }
    }

    private String buildNotificationTitle(Map<String, String> data) {
        String explicitTitle = coalesce(data, "notificationTitle", "title");
        if (!TextUtils.isEmpty(explicitTitle)) {
            return explicitTitle;
        }

        String reservationId = coalesce(data, "reservation_id", "reservationId");
        String restaurantName = coalesce(data, "restaurant_name", "restaurant");
        String action = formatAction(coalesce(data, "action", "event_type", "status"));

        List<String> pieces = new ArrayList<>();
        pieces.add("Reservation");
        if (!TextUtils.isEmpty(action)) {
            pieces.add(action);
        }

        StringBuilder titleBuilder = new StringBuilder(TextUtils.join(" ", pieces));

        if (!TextUtils.isEmpty(reservationId)) {
            titleBuilder.append(": ").append(reservationId);
        }

        if (!TextUtils.isEmpty(restaurantName)) {
            titleBuilder.append(" for ").append(restaurantName);
        }

        if (titleBuilder.length() > 0) {
            return titleBuilder.toString();
        }

        return getString(R.string.app_name);
    }

    private String buildNotificationBody(Map<String, String> data) {
        String explicitBody = coalesce(data, "notificationBody", "body", "message");
        if (!TextUtils.isEmpty(explicitBody)) {
            return explicitBody;
        }

        String reservationId = coalesce(data, "reservation_id", "reservationId");
        String restaurantName = coalesce(data, "restaurant_name", "restaurant");
        String partySize = formatPartySize(coalesce(data, "party_size", "covers", "guest_count", "number_of_people"));
        String time = formatReservationTime(coalesce(data, "reservation_time", "reservation_at", "reservation_datetime", "reservationDateTime", "reservationDate"));
        String action = formatAction(coalesce(data, "action", "status", "event_type"));

        StringBuilder bodyBuilder = new StringBuilder();
        bodyBuilder.append("Reservation");

        if (!TextUtils.isEmpty(reservationId)) {
            bodyBuilder.append(" for ").append(reservationId);
        }

        if (!TextUtils.isEmpty(partySize)) {
            bodyBuilder.append(" (").append(partySize).append(" guests)");
        }

        if (!TextUtils.isEmpty(restaurantName)) {
            bodyBuilder.append(" at ").append(restaurantName);
        }

        if (!TextUtils.isEmpty(time)) {
            bodyBuilder.append(" on ").append(time);
        }

        if (!TextUtils.isEmpty(action)) {
            bodyBuilder.append(" has been ").append(action.toLowerCase(Locale.getDefault()));
        }

        String body = bodyBuilder.toString().trim();
        if (!body.endsWith(".")) {
            body += ".";
        }

        if (body.length() > "Reservation.".length()) {
            return body;
        }

        return fallbackReservationBody(reservationId);
    }

    private String fallbackReservationBody(String reservationId) {
        if (!TextUtils.isEmpty(reservationId)) {
            return getString(R.string.default_reservation_notification, reservationId);
        }
        return getString(R.string.default_notification_message);
    }

    private String coalesce(Map<String, String> data, String... keys) {
        if (data == null || keys == null) return "";
        for (String key : keys) {
            if (data.containsKey(key)) {
                String value = data.get(key);
                if (!TextUtils.isEmpty(value)) {
                    return value.trim();
                }
            }
        }
        return "";
    }

    private String formatPartySize(String raw) {
        if (TextUtils.isEmpty(raw)) return "";
        String digitsOnly = raw.replaceAll("[^0-9]", "");
        if (digitsOnly.isEmpty()) {
            digitsOnly = raw.trim();
        }
        return digitsOnly;
    }

    private String formatReservationTime(String raw) {
        if (TextUtils.isEmpty(raw)) {
            return "";
        }

        String[] patterns = new String[] {
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm"
        };

        for (String pattern : patterns) {
            try {
                SimpleDateFormat parser = new SimpleDateFormat(pattern, Locale.US);
                if (pattern.contains("'Z'")) {
                    parser.setTimeZone(TimeZone.getTimeZone("UTC"));
                } else {
                    parser.setTimeZone(TimeZone.getDefault());
                }
                Date parsed = parser.parse(raw);
                if (parsed != null) {
                    SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault());
                    formatter.setTimeZone(TimeZone.getDefault());
                    return formatter.format(parsed);
                }
            } catch (ParseException ignored) {
            }
        }
        return raw;
    }

    private String formatStatus(String raw) {
        if (TextUtils.isEmpty(raw)) return "";
        String cleaned = raw.replace('_', ' ').trim().toLowerCase(Locale.US);
        if (cleaned.isEmpty()) return "";
        return cleaned.substring(0, 1).toUpperCase(Locale.getDefault()) + cleaned.substring(1);
    }

    private String formatAction(String raw) {
        if (TextUtils.isEmpty(raw)) return "";
        String cleaned = raw.replace('_', ' ').trim();
        if (cleaned.isEmpty()) return "";
        return cleaned.substring(0, 1).toUpperCase(Locale.getDefault()) + cleaned.substring(1);
    }

    private String formatType(String raw) {
        if (TextUtils.isEmpty(raw)) return "";
        String lower = raw.trim().toLowerCase(Locale.US);
        if ("reservation".equals(lower)) {
            return "Reservation";
        }
        return raw.substring(0, 1).toUpperCase(Locale.getDefault()) + raw.substring(1);
    }
}
