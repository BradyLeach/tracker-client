const shared = {
    buttons:
    {
        login: "Login",
        logout: "Logout",
        continue: "Continue",
        save: "Save",
        cancel: "Cancel",
        delete: "Delete",
        deletePermanently: "Delete Permanently",
        remove: "Remove",
        emptyTrash: "Empty Trash",
        moreActions: "More actions",
        restore: "Restore",
        viewTrash: "View Trash",
        refresh: "Refresh",
        edit: "Edit",
        create: "Create",
        close: "Close",
        openFullPage: "Open full page",
        back: "Back",
        next: "Next",
        submit: "Submit",
        verify: "Verify",
    },
    status:
    {
        active: "Active",
        inactive: "Inactive",
        pending: "Pending",
        locked: "Locked",
        disabled: "Disabled"
    },
    verificationStatus:
    {
        unverified: "Unverified",
        pending: "Verification Pending",
        verified: "Verified",
        expired: "Verification Expired",
        rejected: "Verification Rejected",
        revoked: "Verification Revoked"
    },
    labels:
    {
        verificationStatus: "Verification Status",
        status: "Account Status",
        addressLine1: "Address Line 1",
        addressLine2: "Address Line 2",
        city: "City",
        state: "State",
        postalCode: "Postal Code",
        country: "Country",
        subdivision: "Subdivision"
    },
    iconPicker:
    {
        choose: "Choose an icon",
    },
    // Icon picker group headings, keyed by the icon registry's categories.
    iconCategory:
    {
        interface: "Interface",
        people: "People",
        places: "Places",
        commerce: "Commerce",
        shipping: "Shipping",
        ingredients: "Ingredients",
        production: "Production",
    },
    notProvided: "Not provided",
    applyTransition: "Change Status",
    selectTransition: "Select an action...",
    interactions:
    {
        loading: "Loading...",
        saving: "Saving...",
        success: "Successfully {{action}}",
        uploading: "Uploading...",
        processing: "Processing..."
    }
} as const;

export default shared;