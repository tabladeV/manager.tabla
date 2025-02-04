import { ArrowLeft, ArrowRight, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../header/SearchBar";
import { set } from "date-fns";
import { useList } from "@refinedev/core";

const Roles = () => {

    const {data : permissionsData, isLoading, error} = useList({
        resource: 'api/v1/bo/permissions',
        
    });

    console.log('permissions',permissionsData?.data)

    type PermissionType = {
        name: string;
        value: boolean;
    };

    const [permissions, setPermissions] = useState<PermissionType[]>([]);

    useEffect(() => {
        if (permissionsData?.data) {
            setPermissions(permissionsData.data as PermissionType[]);
        }
    }, [permissionsData]);

    console.log('asdas',permissions);

    const [isRoles, setIsRoles] = useState(true);
    const { t } = useTranslation();

    // State for available and affected permissions
    const [availablePermissions, setAvailablePermissions] = useState(permissions);
    useEffect(() => {
        setAvailablePermissions(permissions);
    }, [permissions]);
    const [affectedPermissions, setAffectedPermissions] = useState<Permission[]>([]);

    // State to track selected permissions
    const [selectedAvailable, setSelectedAvailable] = useState<{ name: string; value: boolean } | null>(null);
    const [selectedAffected, setSelectedAffected] = useState<{ name: string; value: boolean } | null>(null);


    // State for role name and saved roles
    const [roleName, setRoleName] = useState('');
    type Permission = {
        name: string;
        value: boolean;
    };
    
    type Role = {
        name: string;
        permissions: Permission[];
    };
    
    const [savedRoles, setSavedRoles] = useState<Role[]>([
        
    ]);
    
    
    // Function to save the role
    const saveRole = () => {
        if (roleName && affectedPermissions.length > 0) {
            setSavedRoles([...savedRoles, { name: roleName, permissions: affectedPermissions }]);
            setRoleName('');
            setAffectedPermissions([]);
            setAvailablePermissions(permissions);
        } else {
            alert('Please provide a role name and assign at least one permission.');
        }
    };
    
    
    
    const [searchAvailable, setSearchAvailable] = useState<Permission[]>(availablePermissions);
    const [searchAffected, setSearchAffected] = useState<Permission[]>(affectedPermissions);
    
    useEffect(() => {
        setSearchAvailable(availablePermissions);
        setSearchAffected(affectedPermissions);
    }, [availablePermissions, affectedPermissions]);

    const handleSearchAvailable = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword === '') {
            setSearchAvailable(availablePermissions);
        }else{
            setSearchAvailable(availablePermissions.filter(permission =>
                permission.name.toLowerCase().includes(keyword)
            ));
        }
        
    };

    const [permissionsAffectedForSearch, setPermissionsAffectedForSearch] = useState<Permission[]>(affectedPermissions);
    
    const handleSearchAffected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        if (keyword === '') {
            setSearchAffected(affectedPermissions);
        } else {
            setSearchAffected(affectedPermissions.filter(permission =>
                permission.name.toLowerCase().includes(keyword)
            ));
        }
    }
    // Function to handle moving to the right
    const moveRight = () => {
        if (selectedAvailable) {
            setAffectedPermissions([...affectedPermissions, selectedAvailable]);
            setAvailablePermissions(availablePermissions.filter(item => item !== selectedAvailable));
            setSelectedAvailable(null);
        }
    };

    // Function to handle moving to the left
    const moveLeft = () => {
        if (selectedAffected) {
            setAvailablePermissions([...availablePermissions, selectedAffected]);
            setAffectedPermissions(affectedPermissions.filter(item => item !== selectedAffected));
            setSelectedAffected(null);
        }
    };

    const deleteRole = (role: Role) => {
        alert('Are you sure you want to delete this role?');
        setSavedRoles(savedRoles.filter(item => item !== role));

    };
    
    return (
        <div className={`rounded-[10px] p-3 w-full ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme' : 'bg-white'}`}>
            <h2 className="text-center mb-3">{t('settingsPage.roles.title')}</h2>
            
            <div className="mt-4">
                <label className="text-[17px]">{t('settingsPage.roles.labels.roleName')}</label>
                <input
                    type="text"
                    id="roleName"
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder={t('settingsPage.roles.labels.roleName')}
                    className={`inputs ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : 'bg-white'}`}
                />

                <div className="mt-5 gap-4 flex justify-between w-full">
                    {/* Available Permissions */}
                    <div className="flex w-full flex-col">
                        <label className="text-[17px]">{t('settingsPage.roles.labels.permissionsavailable')}</label>
                        <SearchBar SearchHandler={handleSearchAvailable}/>
                        <div className={`rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : 'bg-softgreytheme'}`}>
                            {searchAvailable.map((permission, index) => (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center cursor-pointer hover:opacity-80 ${selectedAvailable === permission ? 'bg-softgreentheme' : ''}`}
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
                            className={`btn-primary px-2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : ''}`}
                            onClick={moveRight}
                        >
                            <ArrowRight size={20} />
                        </button>
                        <button
                            className={`btn-primary px-2 ${localStorage.getItem('darkMode') === 'true' ? 'bg-darkthemeitems' : ''}`}
                            onClick={moveLeft}
                        >
                            <ArrowLeft size={20} />
                        </button>
                    </div>

                    {/* Affected Permissions */}
                    <div className="flex w-full flex-col">
                        <label className="text-[17px]">{t('settingsPage.roles.labels.permissionsaffected')}</label>
                        <SearchBar SearchHandler={handleSearchAffected}/>
                        <div className={`rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : 'bg-softgreytheme'}`}>
                            {searchAffected.map((permission, index) => (
                                <div
                                    key={index}
                                    className={`flex justify-between items-center cursor-pointer hover:opacity-80 ${selectedAffected === permission ? 'bg-softgreentheme' : ''}`}
                                    onClick={() => setSelectedAffected(permission)}
                                >
                                    <div>{permission.name}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Save Role Button */}
                <button
                    className="btn-primary mt-4"
                    onClick={saveRole}
                >
                    {t('settingsPage.roles.buttons.saveRole')}
                </button>

                {/* Display Saved Roles */}
                <div className="mt-6">
                    <h3 className="text-[20px] mb-3">{t('settingsPage.roles.labels.savedRoles')}</h3>
                    <div className={`rounded-md p-3 ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : 'bg-white'}`}>
                        {savedRoles.length === 0 ? (
                            <p>{t('settingsPage.roles.labels.noRolesSaved')}</p>
                        ) : (
                            savedRoles.map((role, index) => (
                                <div key={index} className="mb-3 border-b-2 pb-2" >
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-bold">{role.name}</h4>
                                        <Trash size={30} className="cursor-pointer text-redtheme bg-softredtheme p-2 rounded-md " onClick={()=>{deleteRole(role)}} />
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
