import { ArrowLeft, ArrowRight, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../header/SearchBar";
import { BaseKey, useList, useCreate, useDelete } from "@refinedev/core";

interface PermissionType {
    id: number;
    name: string;
    value: boolean;
}

interface RoleType {
    id: BaseKey;
    name: string;
    permissions: PermissionType[];
}

const Roles = () => {
    const { data: permissionsData, isLoading, error } = useList({
        resource: "api/v1/bo/permissions",
    });

    const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useList({
        resource: "api/v1/bo/roles/",
        meta: {
            headers: {
                "X-Restaurant-ID": 1,
            },
        },
    });

    console.log('rolesData', rolesData);

    const { mutate: createRole } = useCreate();
    const { mutate: deleteRole } = useDelete();

    const [roles, setRoles] = useState<RoleType[]>([]);
    const [permissions, setPermissions] = useState<PermissionType[]>([]);
    const [isRoles, setIsRoles] = useState(true);
    const { t } = useTranslation();

    // State for available and affected permissions
    const [availablePermissions, setAvailablePermissions] = useState<PermissionType[]>([]);
    const [affectedPermissions, setAffectedPermissions] = useState<PermissionType[]>([]);

    // State to track selected permissions
    const [selectedAvailable, setSelectedAvailable] = useState<PermissionType | null>(null);
    const [selectedAffected, setSelectedAffected] = useState<PermissionType | null>(null);

    // State for role name and saved roles
    const [roleName, setRoleName] = useState("");
    const [savedRoles, setSavedRoles] = useState<RoleType[]>([]);

    useEffect(() => {
        if (rolesData?.data) {
            setRoles(rolesData.data as RoleType[]);
        }
    }, [rolesData]);

    useEffect(() => {
        if (permissionsData?.data) {
            setPermissions(permissionsData.data as PermissionType[]);
            setAvailablePermissions(permissionsData.data as PermissionType[]);
        }
    }, [permissionsData]);

    useEffect(() => {
        if (roles) {
            setSavedRoles(roles);
        }
    }, [roles]);

    // Search functionality
    const [searchAvailable, setSearchAvailable] = useState<PermissionType[]>([]);
    const [searchAffected, setSearchAffected] = useState<PermissionType[]>([]);

    useEffect(() => {
        setSearchAvailable(availablePermissions);
    }, [availablePermissions]);

    useEffect(() => {
        setSearchAffected(affectedPermissions);
    }, [affectedPermissions]);

    const handleSearchAvailable = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword === "") {
            setSearchAvailable(availablePermissions);
        } else {
            setSearchAvailable(
                availablePermissions.filter((permission) =>
                    permission.name.toLowerCase().includes(keyword)
                )
            );
        }
    };

    const handleSearchAffected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword === "") {
            setSearchAffected(affectedPermissions);
        } else {
            setSearchAffected(
                affectedPermissions.filter((permission) =>
                    permission.name.toLowerCase().includes(keyword)
                )
            );
        }
    };

    // Function to handle moving to the right
    const moveRight = () => {
        if (selectedAvailable) {
            setAffectedPermissions([...affectedPermissions, selectedAvailable]);
            setAvailablePermissions(availablePermissions.filter((item) => item !== selectedAvailable));
            setSelectedAvailable(null);
        }
    };

    // Function to handle moving to the left
    const moveLeft = () => {
        if (selectedAffected) {
            setAvailablePermissions([...availablePermissions, selectedAffected]);
            setAffectedPermissions(affectedPermissions.filter((item) => item !== selectedAffected));
            setSelectedAffected(null);
        }
    };

    // Function to save the role
    const saveRole = () => {
        if (roleName && affectedPermissions.length > 0) {
            const newRole: RoleType = {
                id: savedRoles.length + 1, // Generate a unique ID (replace with a proper ID generation logic if needed)
                name: roleName,
                permissions: affectedPermissions,
            };
            const permissionsToBeSent = newRole.permissions.map((perm) => perm.id);

            console.log('permissionsToBeSent', permissionsToBeSent);

            // Use the `useCreate` hook to send a POST request
            createRole({
                resource: "api/v1/bo/roles/",
                values: {
                    name: newRole.name,
                    permissions: permissionsToBeSent,
                },
                meta: {
                    headers: {
                        "X-Restaurant-ID": 1,
                    },
                },
            });

            // Update local state
            setSavedRoles([...savedRoles, newRole]);
            setRoleName("");
            setAffectedPermissions([]);
            setAvailablePermissions(permissions);

            // window.location.reload();
        } else {
            alert("Please provide a role name and assign at least one permission.");
        }
    };

    // Function to delete a role
    const handleDeleteRole = (role: RoleType) => {
        if (window.confirm("Are you sure you want to delete this role?")) {
            // Use the `useDelete` hook to send a DELETE request
            
            deleteRole(
                {
                    resource: `api/v1/bo/roles`, // Correct resource for roofs
                    id: role.id+'/',
                    meta: {
                        headers: {
                            "X-Restaurant-ID": 1,
                        },
                    },
                },
                {
                    onSuccess: () => {
                        
                        console.log("Roof deleted successfully!");
                    },
                    onError: (error) => {
                        console.error("Error deleting roof:", error);
                        alert("Failed to delete roof. Please try again.");
                    },
                }
            );

            // Update local state
            setSavedRoles(savedRoles.filter((item) => item.id !== role.id));
        }
    };

    return (
        <div
            className={`rounded-[10px] p-3 w-full ${
                localStorage.getItem("darkMode") === "true" ? "bg-bgdarktheme" : "bg-white"
            }`}
        >
            <h2 className="text-center mb-3">{t("settingsPage.roles.title")}</h2>

            <div className="mt-4">
                <label className="text-[17px]">{t("settingsPage.roles.labels.roleName")}</label>
                <input
                    type="text"
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder={t("settingsPage.roles.labels.roleName")}
                    className={`inputs ${
                        localStorage.getItem("darkMode") === "true" ? "bg-darkthemeitems" : "bg-white"
                    }`}
                />

                <div className="mt-5 gap-4 flex justify-between w-full">
                    {/* Available Permissions */}
                    <div className="flex w-full flex-col">
                        <label className="text-[17px]">{t("settingsPage.roles.labels.permissionsavailable")}</label>
                        <SearchBar SearchHandler={handleSearchAvailable} />
                        <div
                            className={`rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto ${
                                localStorage.getItem("darkMode") === "true" ? "bg-bgdarktheme2" : "bg-softgreytheme"
                            }`}
                        >
                            {searchAvailable.map((permission, index) => (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center cursor-pointer hover:opacity-80 ${
                                        selectedAvailable?.id === permission.id ? "bg-softgreentheme" : ""
                                    }`}
                                    onClick={() => setSelectedAvailable(permission)}
                                >
                                    <div>{permission.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Move Buttons */}
                    <div className="flex flex-col gap-3 mt-10">
                        <button
                            className={`btn-primary px-2 ${
                                localStorage.getItem("darkMode") === "true" ? "bg-darkthemeitems" : ""
                            }`}
                            onClick={moveRight}
                        >
                            <ArrowRight size={20} />
                        </button>
                        <button
                            className={`btn-primary px-2 ${
                                localStorage.getItem("darkMode") === "true" ? "bg-darkthemeitems" : ""
                            }`}
                            onClick={moveLeft}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    {/* Affected Permissions */}
                    <div className="flex w-full flex-col">
                        <label className="text-[17px]">{t("settingsPage.roles.labels.permissionsaffected")}</label>
                        <SearchBar SearchHandler={handleSearchAffected} />
                        <div
                            className={`rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto ${
                                localStorage.getItem("darkMode") === "true" ? "bg-bgdarktheme2" : "bg-softgreytheme"
                            }`}
                        >
                            {searchAffected.map((permission, index) => (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center cursor-pointer hover:opacity-80 ${
                                        selectedAffected?.id === permission.id ? "bg-softgreentheme" : ""
                                    }`}
                                    onClick={() => setSelectedAffected(permission)}
                                >
                                    <div>{permission.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Role Button */}
                <button className="btn-primary mt-4" onClick={saveRole}>
                    {t("settingsPage.roles.buttons.saveRole")}
                </button>

                {/* Display Saved Roles */}
                <div className="mt-6">
                    <h3 className="text-[20px] mb-3">{t("settingsPage.roles.labels.savedRoles")}</h3>
                    <div
                        className={`rounded-md p-3 ${
                            localStorage.getItem("darkMode") === "true" ? "bg-bgdarktheme2" : "bg-white"
                        }`}
                    >
                        {savedRoles.length === 0 ? (
                            <p>{t("settingsPage.roles.labels.noRolesSaved")}</p>
                        ) : (
                            savedRoles.map((role, index) => (
                                <div key={index} className="mb-3 border-b-2 pb-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold">{role.name}</h4>
                                        <Trash
                                            size={30}
                                            className="cursor-pointer text-redtheme bg-softredtheme p-2 rounded-md"
                                            onClick={() => handleDeleteRole(role)}
                                        />
                                    </div>
                                    <ul className="list-disc ml-5">
                                        {role.permissions.map((perm, idx) => (
                                            <li key={idx}>{perm.name}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roles;