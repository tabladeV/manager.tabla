import UIKit
import Capacitor
import FirebaseCore
import FirebaseMessaging
import UserNotifications

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?
    private let fallbackNotificationBody = "You have a new notification."

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        
        // Configure Firebase
        FirebaseApp.configure()
        
        // Set Firebase Messaging delegate
        Messaging.messaging().delegate = self
        
        // Register for remote notifications
        let authOptions: UNAuthorizationOptions = [.alert, .badge, .sound]
        UNUserNotificationCenter.current().requestAuthorization(
            options: authOptions,
            completionHandler: { _, _ in }
        )
        
        application.registerForRemoteNotifications()
        
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }
    
    func application(_ application: UIApplication, didReceiveRemoteNotification userInfo: [AnyHashable : Any], fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void) {
        handleDataOnlyRemoteNotification(userInfo: userInfo, applicationState: application.applicationState)
        completionHandler(.newData)
    }
    
    // Push notification registration callbacks
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        // Pass to Firebase for FCM token
        Messaging.messaging().apnsToken = deviceToken

        print("[AppDelegate] didRegisterForRemoteNotificationsWithDeviceToken")
        
        // Also notify Capacitor about the device token
        NotificationCenter.default.post(
            name: NSNotification.Name.capacitorDidRegisterForRemoteNotifications,
            object: deviceToken
        )
        
        // Get FCM token
        Messaging.messaging().token(completion: { (token, error) in
            if let error = error {
                print("Error fetching FCM registration token: \(error)")
            } else if let token = token {
                print("FCM registration token: \(token)")
                // Send FCM token to Capacitor
                NotificationCenter.default.post(
                    name: NSNotification.Name.capacitorDidRegisterForRemoteNotifications,
                    object: token
                )
            }
        })
    }
    
    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register for remote notifications: \(error)")
    }

}

// MARK: - UNUserNotificationCenterDelegate
// MARK: - MessagingDelegate
extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        
        let dataDict: [String: String] = ["token": fcmToken ?? ""]
        NotificationCenter.default.post(
            name: Notification.Name("FCMToken"),
            object: nil,
            userInfo: dataDict
        )
        
        // Bridge FCM token to Capacitor Push Notifications
        if let token = fcmToken {
            // Notify Capacitor's Push Notification plugin about the token
            NotificationCenter.default.post(
                name: NSNotification.Name.capacitorDidRegisterForRemoteNotifications,
                object: token
            )
        }
    }
    
    private func handleDataOnlyRemoteNotification(userInfo: [AnyHashable: Any], applicationState: UIApplication.State) {
        guard applicationState != .active else { return }
        
        if let aps = userInfo["aps"] as? [String: Any], aps["alert"] != nil {
            // System will display notification payloads automatically.
            return
        }
        
        let payload = userInfo.reduce(into: [String: Any]()) { result, element in
            if let key = element.key as? String {
                result[key] = element.value
            }
        }

        let content = UNMutableNotificationContent()
        content.title = buildNotificationTitle(from: payload)
        content.body = buildNotificationBody(from: payload)
        content.sound = .default
        content.userInfo = userInfo
        
        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 1, repeats: false)
        let request = UNNotificationRequest(identifier: UUID().uuidString, content: content, trigger: trigger)
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("Failed to schedule notification for data-only push: \(error)")
            }
        }
    }
    
    private func buildNotificationTitle(from data: [String: Any]) -> String {
        let explicitTitle = coalesceStrings(from: data, keys: ["notificationTitle", "title"])
        if !explicitTitle.isEmpty {
            return explicitTitle
        }
        
        let reservationId = coalesceStrings(from: data, keys: ["reservation_id", "reservationId"])
        let restaurantName = coalesceStrings(from: data, keys: ["restaurant_name", "restaurant"])
        let action = formatAction(coalesceStrings(from: data, keys: ["action", "event_type", "status"]))
        
        var title = "Reservation"
        if !action.isEmpty {
            title += " \(action)"
        }
        if !reservationId.isEmpty {
            title += ": \(reservationId)"
        }
        if !restaurantName.isEmpty {
            title += " for \(restaurantName)"
        }
        
        if title != "Reservation" {
            return title
        }
        
        return Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ?? "Tabla Manager"
    }
    
    private func buildNotificationBody(from data: [String: Any]) -> String {
        let explicitBody = coalesceStrings(from: data, keys: ["notificationBody", "body", "message"])
        if !explicitBody.isEmpty {
            return explicitBody
        }
        
        let reservationId = coalesceStrings(from: data, keys: ["reservation_id", "reservationId"])
        let restaurantName = coalesceStrings(from: data, keys: ["restaurant_name", "restaurant"])
        let partySize = formatPartySize(coalesceStrings(from: data, keys: ["party_size", "covers", "guest_count", "number_of_people"]))
        let time = formatReservationTime(coalesceStrings(from: data, keys: ["reservation_time", "reservation_at", "reservation_datetime", "reservationDateTime", "reservationDate"]))
        let action = formatAction(coalesceStrings(from: data, keys: ["action", "status", "event_type"]))
        
        var description = "Reservation"
        
        if !reservationId.isEmpty {
            description += " for \(reservationId)"
        }
        
        if !partySize.isEmpty {
            description += " (\(partySize) guests)"
        }
        
        if !restaurantName.isEmpty {
            description += " at \(restaurantName)"
        }
        
        if !time.isEmpty {
            description += " on \(time)"
        }
        
        if !action.isEmpty {
            description += " has been \(action.lowercased())"
        }
        
        description = description.trimmingCharacters(in: .whitespacesAndNewlines)
        if !description.isEmpty && description != "Reservation" {
            if !description.hasSuffix(".") {
                description += "."
            }
            return description
        }
        
        if !reservationId.isEmpty {
            return "Reservation \(reservationId) updated."
        }
        
        return fallbackNotificationBody
    }
    
    private func coalesceStrings(from data: [String: Any], keys: [String]) -> String {
        for key in keys {
            if let value = data[key] as? String, !value.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                return value.trimmingCharacters(in: .whitespacesAndNewlines)
            }
        }
        return ""
    }
    
    private func formatPartySize(_ raw: String) -> String {
        guard !raw.isEmpty else { return "" }
        let digits = raw.trimmingCharacters(in: .whitespacesAndNewlines)
            .components(separatedBy: CharacterSet.decimalDigits.inverted)
            .joined()
        if !digits.isEmpty {
            return digits
        }
        return raw.trimmingCharacters(in: .whitespacesAndNewlines)
    }
    
    private func formatReservationTime(_ raw: String) -> String {
        guard !raw.isEmpty else { return "" }
        
        let patterns = [
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss'Z'",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd HH:mm:ss",
            "yyyy-MM-dd HH:mm"
        ]
        
        for pattern in patterns {
            let parser = DateFormatter()
            parser.dateFormat = pattern
            parser.locale = Locale(identifier: "en_US_POSIX")
            if pattern.contains("'Z'") {
                parser.timeZone = TimeZone(secondsFromGMT: 0)
            } else {
                parser.timeZone = TimeZone.current
            }
            
            if let parsed = parser.date(from: raw) {
                let formatter = DateFormatter()
                formatter.dateFormat = "yyyy-MM-dd HH:mm"
                formatter.timeZone = TimeZone.current
                return formatter.string(from: parsed)
            }
        }
        
        return raw
    }
    
    private func formatAction(_ raw: String) -> String {
        guard !raw.isEmpty else { return "" }
        let cleaned = raw.replacingOccurrences(of: "_", with: " ").trimmingCharacters(in: .whitespacesAndNewlines)
        guard !cleaned.isEmpty else { return "" }
        return cleaned.prefix(1).uppercased() + cleaned.dropFirst()
    }
}
