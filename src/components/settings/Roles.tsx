import { ArrowLeft, ArrowRight, Edit, Pen, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../header/SearchBar";
import { useDarkContext } from "../../context/DarkContext";

import { BaseKey, useList, useCreate, useDelete, CanAccess, BaseRecord } from "@refinedev/core";
import Pagination from "../reservation/Pagination";
import ActionPopup from "../popup/ActionPopup";
import RoleModal from "../roles/RoleModal";
import CreateRoleModal from "../roles/CreateRoleModal";


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
    const { darkMode } = useDarkContext();
    
  useEffect(() => {
    document.title = 'Roles | Tabla'
  }, [])
    const { data: permissionsData, isLoading, error } = useList({
        resource: "api/v1/bo/permissions",
        
        queryOptions:{
            onSuccess(data){
                setPermissions(data.data as PermissionType[]);
                setAvailablePermissions(data.data as PermissionType[]);
            }
        },
        errorNotification(error, values, resource) {
            return {
              type: 'error',
              message: error?.formattedMessage,
            };
          },
    });
    interface RolesType {
        
        results: BaseRecord[]
        count: number
        
      }

      const [rolesAPIInfo, setRolesAPIInfo] =useState<RolesType>()

    const [size, setSize] = useState<number>(10)
    const [count, setCount] = useState<number>(0)
    const [page, setPage] = useState<number>(1)

    const { data: rolesData, isLoading: rolesLoading, error: rolesError } = useList<RolesType>({
        resource: "api/v1/bo/roles/",
        filters: [
            {
              field: "page_size",
              operator: "eq",
              value: size
            },
            {
              field: "page",
              operator: "eq",
              value: page
            },
          ],
          queryOptions:{
            onSuccess(data) {
                setRolesAPIInfo(data.data as unknown as  RolesType);
            },
          },
          errorNotification(error, values, resource) {
            return {
              type: 'error',
              message: error?.formattedMessage,
            };
          },
    });

    useEffect(() => {
        if (rolesAPIInfo) {
            setRoles(rolesAPIInfo.results as RoleType[]);
            setCount(rolesAPIInfo.count);
        }
    }, [rolesAPIInfo]);

    const { mutate: createRole } = useCreate({
        errorNotification(error, values, resource) {
            return {
              type: 'error',
              message: error?.formattedMessage,
            };
          },
    });
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

            // Use the `useCreate` hook to send a POST request
            createRole({
                resource: "api/v1/bo/roles/",
                values: {
                    name: newRole.name,
                    permissions: permissionsToBeSent,
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

    const [showPopup, setShowPopup] = useState(false);
    const [action, setAction] = useState<'delete' | 'update' | 'create' | 'confirm'>('delete');
    const [message, setMessage] = useState<string>('');

    const [roleToDelete, setRoleToDelete] = useState<BaseKey | undefined>(undefined);

    const handleDeleteRequest = (role: RoleType) => {
        setAction('delete');
        setRoleToDelete(role.id);
        setMessage(`Are you sure you want to delete the role: ${role.name}`);
        setShowPopup(true);
    }

    // Function to delete a role
    const handleDeleteRole = () => {
        // if (window.confirm("Are you sure you want to delete this role?")) {
            // Use the `useDelete` hook to send a DELETE request
            
            deleteRole(
                {
                    resource: `api/v1/bo/roles`, // Correct resource for roofs
                    id: roleToDelete+'/',
                },
                {
                    onSuccess: () => {
                        console.log("Roof deleted successfully!");
                        setSavedRoles(savedRoles.filter((item) => item.id !== roleToDelete));
                    },
                    onError: (error) => {
                        console.error("Error deleting roof:", error);
                        alert("Failed to delete roof. Please try again.");
                    },
                }
            );

            // Update local state
        // }
    };


    const [showCreateRoleModal, setShowCreateRoleModal] = useState(false);
    const [focusedRole, setFocusedRole] = useState<RoleType | null>(null);
    const [showRoleModal, setShowRoleModal] = useState(false);

    return (
        <div className="rounded-[10px] p-3 w-full bg-white dark:bg-bgdarktheme">
            {showRoleModal && 
                <div >
                    <div className="overlay " onClick={()=>setShowRoleModal(false)}/>
                    <RoleModal role={focusedRole} availablePermissions={availablePermissions}  onClose={()=>setShowRoleModal(false)}/>
                </div>
            }
            {
                showCreateRoleModal &&
                <div>
                    <div className="overlay " onClick={()=>setShowCreateRoleModal(false)}/>
                    <CreateRoleModal availablePermissions={availablePermissions} onClose={()=>setShowCreateRoleModal(false)}/>                
                </div>
            }
            <ActionPopup
                action={action}
                message={message}
                actionFunction={handleDeleteRole}
                showPopup={showPopup}
                setShowPopup={setShowPopup}
            />
            <h2 className="text-center mb-3">{t("settingsPage.roles.title")}</h2>
            <div className="flex justify-center items-center">
                <CanAccess resource="role" action="create">
                <button className="btn-primary flex items-center" onClick={() => setShowCreateRoleModal(true)}>
                    {t("settingsPage.roles.buttons.createRole")}
                </button>
                </CanAccess>
            </div>
            <div className="mt-4">

            {/*
                <label className="text-[17px]">{t("settingsPage.roles.labels.roleName")}</label>
                <CanAccess resource="role" action="create">
                    <input
                        type="text"
                        id="roleName"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder={t("settingsPage.roles.labels.roleName")}
                        className="inputs bg-white dark:bg-darkthemeitems"
                    />
                </CanAccess>

                <div className="mt-5 gap-4 flex justify-between w-full">
                    <div className="flex w-full flex-col">
                        <label className="text-[17px]">{t("settingsPage.roles.labels.permissionsavailable")}</label>
                        <SearchBar SearchHandler={handleSearchAvailable} />
                        <div className="rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto bg-softgreytheme dark:bg-bgdarktheme2">
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

                    <CanAccess resource="role" action="create">
                    <div className="flex flex-col gap-3 mt-10">
                        <button
                            className="btn-primary flex justify-center px-2 dark:bg-darkthemeitems"
                            onClick={moveRight}
                        >
                            <ArrowRight size={20} />
                        </button>
                        <button
                            className="btn-primary flex items-center px-2 dark:bg-darkthemeitems"
                            onClick={()=>{setAffectedPermissions((prev) => [...prev, ...availablePermissions]);setAvailablePermissions([])}}
                        >
                            All <ArrowRight size={20}/>
                        </button>
                        <button
                            className="btn-primary flex justify-center px-2 dark:bg-darkthemeitems"
                            onClick={moveLeft}
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <button
                            className="btn-primary flex items-center px-2 dark:bg-darkthemeitems"
                            onClick={()=>{setAvailablePermissions((prev) => [...prev, ...affectedPermissions]); setAffectedPermissions([])}}
                        >
                            <ArrowLeft size={20}/> All 
                        </button>
                    </div>
                    <div className="flex w-full flex-col">
                        <label className="text-[17px]">{t("settingsPage.roles.labels.permissionsaffected")}</label>
                        <SearchBar SearchHandler={handleSearchAffected} />
                        <div className="rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto bg-softgreytheme dark:bg-bgdarktheme2">
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
                    </CanAccess>

                </div>

                <CanAccess resource="role" action="create">
                <button className="btn-primary mt-4" onClick={saveRole}>
                    {t("settingsPage.roles.buttons.saveRole")}
                </button>
                </CanAccess>
                */}
                

                {/* Display Saved Roles */}
                <div className="mt-6">
                    <h3 className="text-[20px] mb-3">{t("settingsPage.roles.labels.savedRoles")}</h3>
                    <div className="rounded-md p-3 bg-white dark:bg-bgdarktheme2">
                        {savedRoles.length === 0 ? (
                            <p>{t("settingsPage.roles.labels.noRolesSaved")}</p>
                        ) : (
                            savedRoles.map((role, index) => (
                                <div key={index} className="mb-3 border-b-2 dark:border-[#ffffff30] pb-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold">{role.name}</h4>
                                        <div className="flex gap-2">
                                            <CanAccess resource="role" action="delete">
                                                <Trash
                                                    size={30}
                                                    className="cursor-pointer text-redtheme bg-softredtheme p-2 rounded-md"
                                                    onClick={() => handleDeleteRequest(role)}
                                                />
                                            </CanAccess>
                                            <CanAccess resource="role" action="update">
                                                <Edit 
                                                    onClick={() => {
                                                        setFocusedRole(role);
                                                        setIsRoles(false);
                                                        setAvailablePermissions(permissions);
                                                        setAffectedPermissions(role.permissions);
                                                        setRoleName(role.name);
                                                        setShowRoleModal(true);
                                                    }
                                                    }
                                                    size={30}
                                                    className="cursor-pointer btn-primary p-2 rounded-md"
                                                />
                                            </CanAccess>
                                        </div>
                                    </div>
                                    <ul className="list-none flex flex-wrap gap-2 ml-5">
                                        {role.permissions.slice(0,10).map((perm, idx) => (
                                            <li className="py-1 px-2 bg-softgreytheme dark:bg-darkthemeitems rounded-md" key={idx}>{perm.name}</li>
                                        ))}
                                        {role.permissions.length > 10 && <li className="py-1 px-2 bg-softgreytheme dark:bg-darkthemeitems rounded-md">{`+${role.permissions.length - 10} more`}</li>}
                                    </ul>
                                </div>
                            ))
                        )}
                        {savedRoles.length > 0 && 
                            <Pagination setPage={(page:number)=>{setPage(page)}} size={size} count={count} />

                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Roles;