import {  AuthProvider, Refine } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";


import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import Billing from "./components/settings/Billing";
import Widget from "./components/settings/Widget";
import Permissions from "./components/settings/Permissions";
import Services from "./components/settings/Services";
import { DateProvider } from "./context/DateContext";
import ClientInterface from "./components/clients/ClientInterface";
import IndexSettings from "./components/settings/IndexSettings";
import { PowerProvider } from "./context/PowerContext";


import 'leaflet/dist/leaflet.css';
import { DarkProvider } from "./context/DarkContext";
import Roles from "./components/settings/Roles";
import Reviews from "./_root/pages/Reviews";
import Profile from "./_root/pages/Profile";
import ReviewPage from "./_plugin/pages/ReviewPage";
import WidgetPage from "./_plugin/pages/WidgetPage";
import authProvider from "./components/auth/authProvider";
import DesignPlacesIndex from "./_root/pages/DesignPlacesIndex";




function App() {

  const authProvider: AuthProvider = {
    login: async ({ providerName, email }) => {
      if (providerName === "google") {
        window.location.href = "https://accounts.google.com/o/oauth2/v2/auth";
        return {
          success: true,
        };
      }

      if (providerName === "github") {
        window.location.href = "https://github.com/login/oauth/authorize";
        return {
          success: true,
        };
      }

      if (email) {
        localStorage.setItem("email", email);
        return {
          success: true,
          redirectTo: "/",
        };
      }

      return {
        success: false,
        error: {
          message: "Login failed",
          name: "Invalid email or password",
        },
      };
    },
    register: async ({ email, password }) => {
      if (email && password) {
        localStorage.setItem("email", email);
        return {
          success: true,
          redirectTo: "/",
        };
      }
      return {
        success: false,
        error: {
          message: "Register failed",
          name: "Invalid email or password",
        },
      };
    },
    updatePassword: async ({ password }) => {
      if (password) {
        //we can update password here
        return {
          success: true,
          redirectTo: "/login",
        };
      }
      return {
        success: false,
        error: {
          message: "Update password failed",
          name: "Invalid password",
        },
      };
    },
    forgotPassword: async ({ email }) => {
      if (email) {
        //we can send email with forgot password link here
        return {
          success: true,
          redirectTo: "/login",
        };
      }
      return {
        success: false,
        error: {
          message: "Forgot password failed",
          name: "Invalid email",
        },
      };
    },
    logout: async () => {
      localStorage.removeItem("email");
      return {
        success: true,
        redirectTo: "/",
      };
    },
    onError: async (error) => {
      if (error.response?.status === 401) {
        return {
          logout: true,
        };
      }

      return { error };
    },
    check: async () => {
      return localStorage.getItem("email")
        ? { authenticated: true }
        : {
            authenticated: false,
            redirectTo: "/login",
            error: {
              message: "Check failed",
              name: "Not authenticated",
            },
          };
    },
    getPermissions: async () => ["admin"],
    getIdentity: async () => ({
      id: 1,
      name: "Jane Doe",
      avatar:
        "https://unsplash.com/photos/IWLOvomUmWU/download?force=true&w=640",
    }),
  };

  
  return (
    <PowerProvider>
      <DarkProvider>
        <DateProvider >
          <BrowserRouter>
            
            <RefineKbarProvider>
              <DevtoolsProvider>
                <Refine
                  authProvider={authProvider}
                  dataProvider={dataProvider("https://api.dev.tabla.ma")}
                  routerProvider={routerBindings}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "dNe3Q8-sf9Qqi-OD7CQc",
                  }}
                >
                  
                  
                  <Routes>

                    {/*Public Routes */}

                    <Route element={<Plugins />}>
                      <Route path='/widget/r/:restaurant' element={<WidgetPage />} />
                      <Route path='/review/r/:restaurant' element={<ReviewPage />} />
                    </Route>


                    <Route element={<AuthLayout />}>
                      <Route path='/sign-in' element={<LogIn />} />
                      <Route path='/sign-up' element={<LogIn />} /> {/*will be implemented later*/}
                    </Route>


                    {/*Private Routes */}
                    <Route element={<RootLayout />}>
                        <Route index element={<Home />} />
                        <Route path='/reservations' element={<ReservationsPage />} />
                        <Route path='/places' element={<PlacesPage />} />
                        <Route path='/places/design' element={<DesignPlacesIndex />} >
                          <Route path='/places/design/:roofId' element={<DesignPlaces />} />
                        </Route>
                        <Route path='/agenda' element={<AgendaPage />} />
                        <Route path='/agenda/grid' element={<GridPage />} />
                        <Route path='/payment' element={<PaymentPage />} />
                        <Route path='/reviews' element={<Reviews />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path='/clients' element={<ClientsPage />} >
                          <Route path='/clients/:id' element={<ClientInterface />} />
                        </Route>
                        <Route path='/support' element={<SupportPage />} />
                        <Route path='/settings' element={<SettingsPage />} >
                          <Route index element={<IndexSettings />} />
                          <Route path="/settings/general" element={<General />} />
                          <Route path="/settings/availability" element={<Availability />} />
                          <Route path="/settings/tags" element={<Tags />} />
                          <Route path="/settings/messaging" element={<Messaging />} />
                          <Route path="/settings/features" element={<Features />} />
                          <Route path="/settings/users" element={<Users />} />
                          <Route path="/settings/billing" element={<Billing />} />
                          <Route path="/settings/widget" element={<Widget />} />
                          <Route path="/settings/permissions" element={<Permissions />} />
                          <Route path="/settings/services" element={<Services />} />
                          <Route path="/settings/roles" element={<Roles />} />
                          <Route path="/settings/menu" element={<Menu />} />
                          <Route path="/settings/photos" element={<Photos />} />
                        </Route>
                    </Route>

                  </Routes>
                  
                  <RefineKbar />
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
