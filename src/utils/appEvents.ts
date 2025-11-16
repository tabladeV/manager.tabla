export const AUTH_STATE_EVENT = "tabla:auth-state-change";
export const RESTAURANT_STATE_EVENT = "tabla:restaurant-change";

export const dispatchAppEvent = (eventName: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(eventName));
};
