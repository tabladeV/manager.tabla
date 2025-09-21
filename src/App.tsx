import { Refine, Authenticated, CanAccess } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import createDataProvider from "./providers/dataProvider";
import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import routerBindings, {
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import "./index.css";
import RootLayout from "./_root/RootLayout";
import Plugins from "./_plugin/Plugins";
import { Home } from "./_root/pages";
import ReservationsPage from "./_root/pages/ReservationsPage";
import AgendaPage from "./_root/pages/AgendaPage";
import PaymentPage from "./_root/pages/PaymentPage";
import ClientsPage from "./_root/pages/ClientsPage";
import PlacesPage from "./_root/pages/PlacesPage";
import SupportPage from "./_root/pages/SupportPage";
import AuthLayout from "./_auth/AuthLayout";
import LogIn from "./_auth/pages/LogIn";
import DesignPlaces from "./_root/pages/DesignPlaces";
import GridPage from "./_root/pages/GridPage";
import { DateProvider } from "./context/DateContext";
import ClientInterface from "./components/clients/ClientInterface";
import { PowerProvider } from "./context/PowerContext";
import "leaflet/dist/leaflet.css";
import { DarkProvider } from "./context/DarkContext";
import Reviews from "./_root/pages/Reviews";
import Profile from "./_root/pages/Profile";
import ReviewPage from "./_plugin/pages/ReviewPage";
import ModifyPage from "./_plugin/pages/ModifyPage";
import WidgetPage from "./_plugin/pages/WidgetPage";
import DesignPlacesIndex from "./_root/pages/DesignPlacesIndex";
import ErrorPage from "./_root/pages/ErrorPage";

import authProvider from "./providers/authProvider";
import accessControlProvider from "./providers/accessControl";
import { useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { getSubdomain } from "./utils/getSubdomain";
import "react-toastify/dist/ReactToastify.css";
import { notificationProvider } from "./providers/notificationProvider";
import MessagesPage from "./_root/pages/MessagesPage";
import RestaurantSelection from "./components/settings/RestaurantSelection";
import BlankLayout from "./_root/BlankLayout";
import FAQPage from "./_root/pages/FAQPage";
import TermsAndConditions from "./_root/pages/TermsAndConditions";
import CalendarGrid from "./_root/pages/CalendarGrid";
// import NotificationsProvider from "./providers/NotificationsProvider";
import SelectSettings from "./_root/pages/SelectSettings";
import UnifiedSettings from "./components/settings/UnifiedSettings";
import WorkingHours from "./components/settings/WorkingHours";
import NotificationsProviderV2 from "./providers/NotificationsProviderV2";
import Areas from "./components/settings/Areas";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializeStatusBar } from "./utils/statusBarConfig";

const API_HOST = import.meta.env.VITE_API_URL || "https://api.dev.tabla.ma";

function App() {
  useEffect(() => {
    document.title = "Tabla | Taste Morocco's best ";
    // Initialize StatusBar for mobile platforms
    initializeStatusBar();
  }, []);



  const subdomain = getSubdomain();
  const isManager = true; //subdomain === "manager" || true;
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLogedIn") === "true";
    const refreshToken = localStorage.getItem("refresh");
    if (isLoggedIn && refreshToken && authProvider.refresh) {
      authProvider
        .refresh()
        .then(() => {
          console.log("Token refreshed on app load");
        })
        .catch((error) => {
          console.error("Token refresh on app load failed", error);
        });
    }
  }, []);



  return (
    <ErrorBoundary>
      <PowerProvider>
        <DarkProvider>
          <DateProvider>
            <BrowserRouter>
              <RefineKbarProvider>
                  <DevtoolsProvider>
                  <Refine
                  authProvider={authProvider}
                  dataProvider={createDataProvider(API_HOST)}
                  routerProvider={routerBindings}
                  accessControlProvider={accessControlProvider}
                  notificationProvider={notificationProvider}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "dNe3Q8-sf9Qqi-OD7CQc",
                  }}
                >
                  {isManager ? (
                  <NotificationsProviderV2>
                    <Routes>
                      <Route
                        element={
                          <div>
                            <Outlet />
                            <ToastContainer
                              position="bottom-right"
                              autoClose={2000}
                              hideProgressBar={false}
                              newestOnTop
                              closeOnClick
                              rtl={false}
                              stacked
                              pauseOnFocusLoss
                              draggable
                              pauseOnHover
                              theme={localStorage.getItem('darkMode')==='true' ? "dark":"light"} // or "dark" based on your isDarkMode
                            />
                          </div>
                        }
                      >

                        {/* Public Routes */}

                        <Route element={<BlankLayout />}>
                          <Route path="/select-restaurant" element={
                            <Authenticated key="*" redirectOnFail="/sign-in">
                              <RestaurantSelection />
                            </Authenticated>
                          } />
                        </Route>
                        <Route element={<AuthLayout />}>
                          <Route path="/sign-in" element={<LogIn />} />
                          <Route path="/sign-up" element={<LogIn />} />
                        </Route>
                        {/* Private Routes */}
                        <Route
                          element={
                            <div>
                              <Outlet />
                              <ToastContainer
                                position="bottom-right"
                                autoClose={2000}
                                hideProgressBar={false}
                                newestOnTop
                                closeOnClick
                                rtl={false}
                                stacked
                                pauseOnFocusLoss
                                draggable
                                pauseOnHover
                                theme={localStorage.getItem('darkMode') === 'true' ? "dark" : "light"} // or "dark" based on your isDarkMode
                              />
                            </div>
                          }
                        >

                          {/* Public Routes */}

                          <Route element={<BlankLayout />}>
                            <Route path="/select-restaurant" element={
                              <Authenticated key="*" redirectOnFail="/sign-in">
                                <RestaurantSelection />
                              </Authenticated>
                            } />
                          </Route>
                          <Route element={<AuthLayout />}>
                            <Route path="/sign-in" element={<LogIn />} />
                            <Route path="/sign-up" element={<LogIn />} />
                          </Route>
                          {/* Private Routes */}
                          <Route
                            element={
                              <Authenticated key="*" redirectOnFail="/sign-in">
                                <RootLayout />
                              </Authenticated>
                            }
                          >
                            <Route index element={
                              <CanAccess
                                resource="dashboard"
                                action="view"
                                fallback="You don't have access to view dashboard"
                              >
                                <Home />
                              </CanAccess>
                            } />

                            {/* Reservations */}
                            <Route
                              path="/reservations"
                              element={
                                <CanAccess
                                  resource="reservation"
                                  action="view"
                                  fallback="You don't have access to this page"
                                >
                                  <ReservationsPage />
                                </CanAccess>
                              }
                            />

                            {/* Places */}
                            <Route
                              path="/places"
                              element={
                                <CanAccess
                                  resource="floor"
                                  action="view"
                                  fallback="You don't have access to places"
                                >
                                  <PlacesPage />
                                </CanAccess>
                              }
                            />
                            <Route
                              path="/places/design"
                              element={
                                <CanAccess
                                  resource="floor"
                                  action="view"
                                  fallback="You don't have access to design places"
                                >
                                  <DesignPlacesIndex />
                                </CanAccess>
                              }
                            >
                              <Route
                                path="/places/design/:roofId"
                                element={
                                  <CanAccess
                                    resource="table"
                                    action="view"
                                    fallback="You don't have access to design places"
                                  >
                                    <DesignPlaces />
                                  </CanAccess>
                                }
                              />
                            </Route>

                            <Route path="/agenda" element={
                              <CanAccess resource="reservation"
                                action="view"
                                fallback="You don't have access to this page"
                              >
                                <AgendaPage />
                              </CanAccess>
                            } />
                            <Route path="/agenda/calendar" element={
                              <CanAccess resource="reservation"
                                action="view"
                                fallback="You don't have access to this page"
                              >
                                <CalendarGrid />
                              </CanAccess>
                            } />
                            <Route path="/agenda/grid" element={
                              <CanAccess resource="reservation"
                                action="view"
                                fallback="You don't have access to this page"
                              >
                                <GridPage />
                              </CanAccess>
                            } />

                            {/* Payment - not restricted */}
                            <Route path="/payment" element={<PaymentPage />} />


                            {/* Reviews */}
                            <Route
                              path="/reviews"
                              element={
                                <CanAccess
                                  resource="review"
                                  action="view"
                                  fallback="You don't have access to reviews"
                                >
                                  <Reviews />
                                </CanAccess>
                              }
                            />

                            {/* Profile - left unprotected */}
                            <Route path="/profile" element={<Profile />} />

                            {/* Clients */}
                            <Route
                              path="/clients"
                              element={
                                <CanAccess
                                  resource="customer"
                                  action="view"
                                  fallback="You don't have access to clients"
                                >
                                  <ClientsPage />
                                </CanAccess>
                              }
                            >
                              <Route path="/clients/:id" element={
                                <CanAccess
                                  resource="customer"
                                  action="view"
                                  fallback="You don't have access to clients"
                                >
                                  <ClientInterface />
                                </CanAccess>
                              } />
                            </Route>

                            <Route path="/change-restaurant" element={<RestaurantSelection showLogo={false} />} />

                            {/* Messages - not restricted yet */}
                            <Route path="/messages" element={
                              <CanAccess
                                resource="message"
                                action="view"
                                fallback="You don't have access to Messaging"
                              >
                                <MessagesPage />
                              </CanAccess>
                            }
                            />

                            {/* Support - not restricted */}
                            <Route path="/support" element={<SupportPage />} />

                            {/* FAQ - not restricted */}
                            <Route path="/faq" element={<FAQPage />} />

                            {/* Design Places - not restricted */}

                            {/* Choice of settings */}

                            <Route path="/select-settings" element={
                              <CanAccess
                                resource="restaurant"
                                action="view"
                                fallback="You don't have access to Settings"
                              >
                                <SelectSettings />
                              </CanAccess>
                            } />

                            {/* Settings - Unified */}
                            <Route path="/settings" element={
                              <CanAccess
                                resource="restaurant"
                                action="view"
                                fallback="You don't have access to Settings"
                              >
                                <UnifiedSettings />
                              </CanAccess>
                            } />

                          </Route>
                          <Route path="*" element={<ErrorPage />} />
                        </Route>
                        <Route path="*" element={<ErrorPage />} />
                      </Route>
                    </Routes>
                    </NotificationsProviderV2>
                  ) : (
                    <Routes>
                      <Route element={<Plugins />}>
                        <Route path="/make/reservation" element={<WidgetPage />} />
                        <Route path="/make/review/:token" element={<ReviewPage />} />
                        <Route path="/make/modification/:token" element={<ModifyPage />} />

                        {/* Terms and Conditions - not restricted */}
                        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                      </Route>

                    </Routes>

                  )
                  }

                  < RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </RefineKbarProvider>
          </BrowserRouter>
        </DateProvider>
      </DarkProvider>
    </PowerProvider>
    </ErrorBoundary>
  );
}

export default App;
