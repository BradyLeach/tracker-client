const navbar = {
    brand: {
        text: "Tracker",
    },
    search: {
        label: "Search",
        placeholder: "Search for anything...",
        button: "Search",
    },
    actions: {
        notifications: "Notifications",
        profile: "Profile Menu",
        mobileMenu: "Menu",
    },
    profile: {
        title: "User Profile",
        menu: {
            notifications: "Notifications",
            profile: "Profile",
            accountSettings: "Account Settings",
            themeSettings: "Theme Settings",
            language: "Language",
            currency: "Currency",
            country: "Country",
            switchProfile: "Switch Profile",
            logout: "Logout",
        },
    },
    nav: {
        sections: {
            business: "Business",
        },
    },
    drawer: {
        title: "Navigation",
        home: "Home",
        partnerships: "Partners",
        team: "Team",
        close: "Close Menu",
    },
} as const;

export default navbar;
