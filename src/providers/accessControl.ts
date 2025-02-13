// src/providers/accessControlProvider.ts
import { AccessControlProvider, CanParams, CanReturnType } from "@refinedev/core";

const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }: CanParams): Promise<CanReturnType> => {
    // Retrieve the permissions array from storage
    const stored = localStorage.getItem("permissions");
    // Check if the user is a manager (managers have all permissions)
    const isManager = localStorage.getItem("is_manager")? true : false;
    
    if (isManager) {
      return { can: true };
    }
    
    if (!stored) {
      return { can: false };
    }
    
    let permissions: string[] = [];
    try {
      permissions = JSON.parse(stored);
    } catch (error) {
      console.error("Error parsing permissions:", error);
      return { can: false };
    }

    // Define an action mapping so that refine actions map to our permission strings
    // For example, if refine passes "create", we map it to "add"
    const actionMapping: Record<string, string> = {
      create: "add",
      add: "add",
      update: "change",
      change: "change",
      delete: "delete",
      remove: "delete",
      read: "view",
      view: "view",
    };

    // Map the action; if no mapping is provided, default to the action itself
    const mappedAction = actionMapping[action] || action;

    // Construct the expected permission string.
    // It is assumed that your resource names match the permission model (e.g. "menu", "menucategory", etc.)
    if (!resource) {
      return { can: false };
    }
    const expectedPermission = `${mappedAction}_${resource.toLowerCase()}`;

    // Check if the expected permission string exists in the user's permissions
    const hasPermission = permissions.includes(expectedPermission);

    return { can: hasPermission };
  },
  options: {
    buttons: {
      enableAccessControl: true,
      hideIfUnauthorized: false,
    },
  },
};

export default accessControlProvider;
