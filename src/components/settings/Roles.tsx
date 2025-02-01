import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import SearchBar from "../header/SearchBar";

const Roles = () => {
    const [isRoles, setIsRoles] = useState(true);
    const { t } = useTranslation();

    // State for available and affected permissions
    const [availablePermissions, setAvailablePermissions] = useState([
        { name: 'Manage Tables', value: false },
        { name: 'Manage reservations', value: false },
        { name: 'Manage Grid', value: false },
        { name: 'Manage Timeline', value: false },
    ]);
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
        { name: 'Admin', permissions: [{ name: 'Manage Tables', value: false }] },
        { name: 'Manager', permissions: [{ name: 'Manage reservations', value: false }] },
    ]);
    
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

    // Function to save the role
    const saveRole = () => {
        if (roleName && affectedPermissions.length > 0) {
            setSavedRoles([...savedRoles, { name: roleName, permissions: affectedPermissions }]);
            setRoleName('');
            setAffectedPermissions([]);
            setAvailablePermissions([
                { name: 'Manage Tables', value: false },
                { name: 'Manage reservations', value: false },
                { name: 'Manage Grid', value: false },
                { name: 'Manage Timeline', value: false },
            ]);
        } else {
            alert('Please provide a role name and assign at least one permission.');
        }
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const keyword = e.target.value.toLowerCase();
        const filteredPermissions = availablePermissions.filter(permission => 
            permission.name.toLowerCase().includes(keyword)
        );
        setAvailablePermissions(filteredPermissions);
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
                        <SearchBar SearchHandler={handleSearch}/>
                        <div className={`rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : 'bg-softgreytheme'}`}>
                            {availablePermissions.map((permission, index) => (
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
                        <SearchBar SearchHandler={handleSearch}/>
                        <div className={`rounded-md p-3 flex flex-col gap-2 h-[10em] overflow-y-auto ${localStorage.getItem('darkMode') === 'true' ? 'bg-bgdarktheme2' : 'bg-softgreytheme'}`}>
                            {affectedPermissions.map((permission, index) => (
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
                                <div key={index} className="mb-3">
                                    <h4 className="font-bold">{role.name}</h4>
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
