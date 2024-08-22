import {
  Refine,
  GitHubBanner,
  WelcomePage,
  Authenticated,
  AuthPage,
  ErrorComponent,
} from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";


import dataProvider from "@refinedev/simple-rest";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import routerBindings, {
  NavigateToResource,
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import "./index.css";
import RootLayout from "./_root/RootLayout";
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

function App() {
  return (
    <BrowserRouter>
      
      <RefineKbarProvider>
        <DevtoolsProvider>
          <Refine
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
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
                  <Route path='/payment' element={<PaymentPage />} />
                  <Route path='/clients' element={<ClientsPage />} />
                  <Route path='/support' element={<SupportPage />} />
                  <Route path='/settings' element={<SettingsPage />} />
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
  );
}

export default App;
