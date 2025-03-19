import { Refine, Authenticated, CanAccess, useUpdate } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import dataProvider from "@refinedev/simple-rest";
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
import SettingsPage from "./_root/pages/SettingsPage";
import AuthLayout from "./_auth/AuthLayout";
import LogIn from "./_auth/pages/LogIn";
import DesignPlaces from "./_root/pages/DesignPlaces";
import GridPage from "./_root/pages/GridPage";
import General from "./components/settings/General";
import Photos from "./components/settings/Photos";
import Menu from "./components/settings/Menu";
import Availability from "./components/settings/Availability";
import Tags from "./components/settings/Tags";
import Messaging from "./components/settings/Messaging";
import Features from "./components/settings/Features";
import Users from "./components/settings/Users";
import Occasions from "./components/settings/Occasions";
import Billing from "./components/settings/Billing";
import Widget from "./components/settings/Widget";
import Permissions from "./components/settings/Permissions";
import Services from "./components/settings/Services";
import { DateProvider } from "./context/DateContext";
import ClientInterface from "./components/clients/ClientInterface";
import IndexSettings from "./components/settings/IndexSettings";
import { PowerProvider } from "./context/PowerContext";
import "leaflet/dist/leaflet.css";
import { DarkProvider } from "./context/DarkContext";
import Roles from "./components/settings/Roles";
import Reviews from "./_root/pages/Reviews";
import Profile from "./_root/pages/Profile";
import ReviewPage from "./_plugin/pages/ReviewPage";
import ModifyPage from "./_plugin/pages/ModifyPage";
import WidgetPage from "./_plugin/pages/WidgetPage";
import DesignPlacesIndex from "./_root/pages/DesignPlacesIndex";
import ErrorPage from "./_root/pages/ErrorPage";

import customAxiosInstance from "./providers/axiosInstance";
import authProvider from "./providers/authProvider";
import accessControlProvider from "./providers/accessControl";
import { useEffect } from "react";
import ReviewWidget from "./components/settings/ReviewWidget";
import { ToastContainer } from "react-toastify";
import { getSubdomain } from "./utils/getSubdomain";
import "react-toastify/dist/ReactToastify.css";
import { notificationProvider } from "./providers/notificationProvider";
import MessagesPage from "./_root/pages/MessagesPage";
import RestaurantSelection from "./components/settings/RestaurantSelection";
import BlankLayout from "./_root/BlankLayout";
const API_HOST = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : "https://api.dev.tabla.ma";
function App() {

  useEffect(() => {
    document.title = "Tabla | Taste Morocco's best ";
  }, []);

  const subdomain = getSubdomain();
  const isManager = subdomain === "manager";
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
    <PowerProvider>
      <DarkProvider>
        <DateProvider>
          <BrowserRouter>
            <RefineKbarProvider>
              <DevtoolsProvider>
                <Refine
                  authProvider={authProvider}
                  dataProvider={dataProvider(API_HOST, customAxiosInstance)}
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


                    <Routes>
                      <Route
                        element={
                          <div>
                            <Outlet />
                            <ToastContainer
                              position="bottom-right"
                              autoClose={5000}
                              hideProgressBar={false}
                              newestOnTop
                              closeOnClick
                              rtl={false}
                              stacked
                              pauseOnFocusLoss
                              draggable
                              pauseOnHover
                              theme="light" // or "dark" based on your isDarkMode
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
                                resource="restaurant"
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


                          {/* Settings */}
                          <Route path="/settings" element={
                            <CanAccess
                              resource="restaurant"
                              action="view"
                              fallback="You don't have access to Settings"
                            >
                              <SettingsPage />
                            </CanAccess>
                            }>
                            <Route index element={<IndexSettings />} />
                            <Route path="/settings/general" element={
                              <CanAccess
                                resource="restaurant"
                                action="view"
                                fallback="You don't have access to General info"
                              >
                                <General />
                              </CanAccess>

                            } />
                            <Route path="/settings/availability" element={
                              <CanAccess
                                resource="availabilityday"
                                action="view"
                                fallback="You don't have access to Tags"
                              >
                                <Availability />
                              </CanAccess>
                            } />
                            <Route path="/settings/tags" element={
                              <CanAccess
                                resource="tag"
                                action="view"
                                fallback="You don't have access to Tags"
                              >
                                <Tags />
                              </CanAccess>
                            } />
                            <Route path="/settings/messaging" element={
                              <CanAccess
                                resource="message"
                                action="view"
                                fallback="You don't have access to message"
                              >
                                <Messaging />
                              </CanAccess>
                            } />
                            <Route path="/settings/features" element={<Features />} />
                            <Route path="/settings/users" element={
                              <CanAccess
                                resource="customuser"
                                action="view"
                                fallback="You don't have access to users"
                              >
                                <Users />
                              </CanAccess>
                            } />
                            <Route path="/settings/occasions" element={
                              <CanAccess
                                resource="occasion"
                                action="view"
                                fallback="You don't have access"
                              >
                              <Occasions />
                              </CanAccess>
                              
                              } />
                            <Route path="/settings/billing" element={<Billing />} />
                            <Route path="/settings/widget/reservation" element={
                              <CanAccess
                                resource="widget"
                                action="view"
                                fallback="You don't have access"
                              >
                              <Widget />
                              </CanAccess>
                              
                              } />
                            <Route path="/settings/widget/review" element={
                              <CanAccess
                                resource="reviewwidget"
                                action="view"
                                fallback="You don't have access"
                              >
                              <ReviewWidget />
                              </CanAccess>
                              
                              } />
                            <Route path="/settings/permissions" element={<Permissions />} />
                            <Route path="/settings/services" element={<Services />} />
                            <Route path="/settings/roles" element={
                              <CanAccess
                                resource="role"
                                action="view"
                                fallback="You don't have access to Roles"
                              >
                                <Roles />
                              </CanAccess>
                            } />
                            <Route path="/settings/menu" element={<Menu />} />
                            <Route path="/settings/photos" element={<Photos />} />
                          </Route>
                        </Route>
                        <Route path="*" element={<ErrorPage />} />
                      </Route>
                    </Routes>
                  ) : (
                    <Routes>
                      <Route element={<Plugins />}>
                        <Route path="/make/reservation" element={<WidgetPage />} />
                        <Route path="/make/review/:token" element={<ReviewPage />} />
                        <Route path="/make/modification/:token" element={<ModifyPage />} />
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
  );
}

export default App;
