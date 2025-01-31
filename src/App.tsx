import {  Refine } from "@refinedev/core";
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
import IndexSettings from "./components/settings/indexSettings";
import { PowerProvider } from "./context/PowerContext";


import 'leaflet/dist/leaflet.css';
import { DarkProvider } from "./context/DarkContext";
import Roles from "./components/settings/Roles";
import Reviews from "./_root/pages/Reviews";
import Profile from "./_root/pages/Profile";
import ReviewPage from "./_plugin/pages/ReviewPage";
import WidgetPage from "./_plugin/pages/WidgetPage";




function App() {

  
  return (
    <PowerProvider>
      <DarkProvider>
        <DateProvider >
          <BrowserRouter>
            
            <RefineKbarProvider>
              <DevtoolsProvider>
                <Refine
                  dataProvider={dataProvider("http://128.199.50.127")}
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
                        <Route path='/places/design' element={<DesignPlaces />} />
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
