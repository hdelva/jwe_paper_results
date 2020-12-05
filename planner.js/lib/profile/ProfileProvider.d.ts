import Profile from "../profile/Profile";
export default class ProfileProvider {
    private travelModeProfiles;
    private profiles;
    private activeProfile;
    constructor();
    setActiveProfile(profile: Profile): void;
    setActiveProfileID(profileId: string): void;
    getActiveProfile(): Profile;
    addProfile(profile: Profile): void;
    getProfile(profileId: string): Profile;
    getProfiles(): Profile[];
}
