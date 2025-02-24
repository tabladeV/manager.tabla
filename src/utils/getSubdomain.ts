// utils/getSubdomain.ts
export const getSubdomain = (): string | null => {
    const host = window.location.hostname; // e.g., manager.tabla.ma or tenantname.tabla.ma
    const parts = host.split(".");
    // Assuming your domain is tabla.ma (two parts), anything extra is a subdomain.

    console.log(parts)
    if (parts.length = 2) {
        return parts[0];
    }
    else if (parts.length == 3) {
        return parts[1]
    }
    return null;
};
