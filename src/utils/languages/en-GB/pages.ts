const pages =
    {
        login:
        {
            title: "Welcome back to Tracker",
            subtitle: "Enter your email and password to login.",
            needAccount: "Don't have an Account?",
            register: "Create an account"
        },
        registration:
        {
            title: "Create Account",
            subtitle: "Join our community",
            alreadyHaveAccount: "Already have an Account?"
        },
        verifyEmail:
        {
            dialogs:
            {
                verificationSuccess: "Congratulations, your email has been verified.",
                resendSuccess: "A new verification code has been sent to the registered email."
            },
            provideCode:
            {
                title: "Check your email",
                subtitle: "We've sent a verification link to",
                clickToResendText: "Didn't receive the email?",
                clickToResendLink: "Click to resend."
            },
            provideEmail:
            {
                title: "Enter email",
                subtitle: "Please provide your email to proceed with the verification",
                clickToResendText: "Didn't receive the email?",
                clickToResendLink: "Click to resend."
            }
        },
        landing:
        {
            title: "Find Your Traction.",
            subtitle: "Plan, run and measure traction experiments for your business"
        },
        userSettings:
        {
            title: "User Settings",
            description: "Manage your personal settings",
            tabs:
            {
                identity: "Identity",
                notifications: "Notifications",
                security: "Security"
            },
            section:
            {
                accountStatus: "Account Status",
                security: "Security",
                securityDescription: "Manage your password and authentication settings."
            },
            actions:
            {
                resetPassword: "Reset Password",
                verifyRecoveryEmail: "Verify Recovery Email"
            },
            placeholders:
            {
                notifications: "Notification preferences coming soon.",
                security: "Security settings coming soon."
            }
        },
        accountSettings:
        {
            title: "Account Settings",
            description: "Manage your account, address, and team members",
            sections:
            {
                overview: "Overview",
                address: "Address",
                members: "Members",
                billing: "Billing"
            },
            billing:
            {
                placeholder: "Billing is managed via Stripe. Configuration coming soon."
            }
        },
        partnerships:
        {
            title: "Partners",
            description: "View and manage your partner relationships",
            addButton: "Add Partner",
            searchPlaceholder: "Search companies",
            emptyState:
            {
                headline: "No partners yet",
                subtext: "Add your first supplier, vendor, or partner to get started",
                addButton: "Add Partner",
            },
            trash:
            {
                title: "Partner Trash",
                description: "Deleted partners, kept until you restore them",
                searchPlaceholder: "Search trash",
                emptyState:
                {
                    headline: "Trash is empty",
                    subtext: "Companies you delete are kept here until you restore them",
                }
            }
        },
        company:
        {
            title: "Company",
            description: "Company profile",
            overview: "Company Overview",
            editButton: "Edit Company",
            relationshipStatus: "Relationship: {{status}}",
            deleteConfirm:
            {
                title: "Delete company?",
                body: "{{name}} and its partnerships will be moved to the trash. You can restore them later."
            },
            hardDeleteConfirm:
            {
                title: "Delete permanently?",
                body: "{{name}} will be permanently deleted. This cannot be undone.",
                bodyBulk: "{{count}} companies will be permanently deleted. This cannot be undone.",
                progress: "Deleting {{completed}} of {{total}}…"
            },
            section:
            {
                location: "Locations",
                partner: "Partners",
                comment: "Comments"
            },
            location:
            {
                empty: "No mapped addresses",
                summary: "{{addressCount}} addresses · {{locationCount}} locations",
                addButton: "Add Location",
                emptyState:
                {
                    headline: "No locations yet",
                    subtext: "Add a location to organise this company's addresses."
                },
                moreAddresses: "(+{{count}} more)",
                addresses: "Addresses",
                addAddressButton: "Add Address",
                noAddresses: "No addresses recorded",
                addressTitle: "Address",
                removeAddress: "Remove address",
                removeAddressConfirm:
                {
                    title: "Remove address?",
                    body: "{{address}} will be removed from this location."
                },
                deleteConfirm:
                {
                    title: "Delete location?",
                    body: "{{name}} will be permanently deleted. This cannot be undone."
                }
            },
            partner:
            {
                addButton: "Add Partnership",
                emptyState:
                {
                    headline: "No partnerships yet",
                    subtext: "Add a partnership to track your contacts at this company."
                },
                deleteConfirm:
                {
                    title: "Delete partnership?",
                    body: "The partnership with {{name}} will be permanently deleted. This cannot be undone."
                }
            },
        },
        error:
        {
            title: "Hmmm, something went wrong",
            subtitle: "Well, this is embarrassing...",
            retry: "Retry",
            code: "Error Code"
        },
        initialising:
        {
            title: "Getting things ready",
            subtitle: "Loading your workspace..."
        }
    } as const;

export default pages;
