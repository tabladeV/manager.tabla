import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation } from "react-router-dom";
import { CanAccess } from "@refinedev/core";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  // Base CSS classes (unchanged)
  const normalMenuClass =
    "hover:underline font-[500] text-[17px] text-left py-2";
  const navigatedMenuClass =
    "text-greentheme underline font-[500] text-[17px] py-2";

  return (
    <div>
      <div>
        <h1>{t("settingsPage.title")}</h1>
      </div>
      <div className="flex gap-4">
        <div
          className={`h-[calc(100vh-160px)] overflow-y-auto flex flex-col w-1/5 rounded-[10px] px-6 py-4 gap-4 lt-sm:w-full lt-sm:h-fit ${
            localStorage.getItem("preferredLanguage") === "ar"
              ? "text-right"
              : ""
          } ${pathname === "/settings" ? "" : "lt-sm:hidden"} ${
            localStorage.getItem("darkMode") === "true"
              ? "text-white bg-bgdarktheme"
              : "text-[#1E1E1E99] bg-white"
          }`}
        >
          {/* General - no permission yet, so left open */}
          <Link
            to="/settings/general"
            className={`${
              pathname === "/settings/general"
                ? navigatedMenuClass
                : normalMenuClass
            }`}
          >
            {t("settingsPage.menuItems.general")}
          </Link>

          {/* Availability - check for view_availabilityday */}
          <CanAccess
            resource="availabilityday"
            action="view"
          >
            <Link
              to="/settings/availability"
              className={`${
                pathname === "/settings/availability"
                  ? navigatedMenuClass
                  : normalMenuClass
              }`}
            >
              {t("settingsPage.menuItems.availability")}
            </Link>
          </CanAccess>

          {/* General - no permission yet, so left open*/}
          <Link
            to="/settings/users"
            className={`${pathname === "/settings/users"
                ? navigatedMenuClass
                : normalMenuClass
              }`}
          >
            {t("settingsPage.menuItems.users")}
          </Link>

          {/* Widget - not restricted */}
          <Link
            to="/settings/widget"
            className={`${
              pathname === "/settings/widget"
                ? navigatedMenuClass
                : normalMenuClass
            }`}
          >
            {t("settingsPage.menuItems.widget")}
          </Link>

          {/* Roles - check for view_role */}
          <CanAccess
            resource="role"
            action="view"
          >
            <Link
              to="/settings/roles"
              className={`${
                pathname === "/settings/roles"
                  ? navigatedMenuClass
                  : normalMenuClass
              }`}
            >
              {t("settingsPage.menuItems.roles")}
            </Link>
          </CanAccess>

          {/* 
            Other links such as tags, menu, photos, messaging, features, billing,
            permissions, and services are commented out until their permissions are defined.
          */}
        </div>
        <div className={`w-full overflow-y-scroll ${pathname === '/settings' ? 'lt-sm:hidden': ''}`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
