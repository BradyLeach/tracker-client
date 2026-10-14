const rule = {
    LIMIT:
    {
        block:
        {
            title: "{{service}} Limit Reached",
            description: "You've created {{current}} out of {{max}} {{service}}s. Upgrade your plan to create more.",
            action: "Upgrade Plan",
            program:
            {
                title: "Program Limit Reached",
                description: "You've created {{current}} out of {{max}} programs. Upgrade to create unlimited programs.",
                action: "Upgrade Plan"
            },
            participant:
            {
                title: "Participant Limit Reached",
                description: "You've added {{current}} out of {{max}} participants. Upgrade to add more participants.",
                action: "Upgrade Plan"
            }
        },
        warning:
        {
            title: "Approaching {{service}} Limit",
            description: "You have {{remaining}} {{service}}(s) remaining ({{current}}/{{max}}). Consider upgrading soon.",
            action: "Dismiss",
            program:
            {
                title: "Approaching Program Limit",
                description: "You've created {{current}} out of {{max}} programs. Consider upgrading to avoid interruptions.",
                action: "Dismiss"
            }
        },
        generic:
        {
            title: "Resource Limit",
            description: "You've reached a resource limit. Please upgrade your plan.",
            action: "Upgrade Plan"
        }
    },
    VERIFICATION:
    {
        block:
        {
            title: "Verification Required",
            description: "This action requires verification. Please complete the required verification steps.",
            action: "Verify Now",
            age:
            {
                title: "Age Verification Required",
                description: "You must be at least {{minAge}} years old to {{operation}} {{service}}s in your region. Your current age: {{actual}}.",
                action: "Update Profile"
            },
            email:
            {
                title: "Email Verification Required",
                description: "Please verify your email address to {{operation}} {{service}}s.",
                action: "Verify Email"
            },
            identity:
            {
                title: "Identity Verification Required",
                description: "Please verify your identity to {{operation}} {{service}}s. Current status: {{identityVerificationStatus}}.",
                action: "Verify Identity"
            }
        },
        generic:
        {
            title: "Verification Required",
            description: "Verification is required to complete this action.",
            action: "Verify Now"
        }
    },
    FEATURE:
    {
        block:
        {
            title: "Premium Feature",
            description: "This feature is only available on premium plans.",
            action: "Upgrade Now",
            program:
            {
                title: "Premium {{service}} Feature",
                description: "Advanced {{service}} features are only available on premium plans. Upgrade to unlock unlimited potential.",
                action: "Upgrade Now"
            }
        },
        generic:
        {
            title: "Premium Feature",
            description: "This feature requires a premium plan.",
            action: "Upgrade Now"
        }
    },
    COMPLIANCE:
    {
        block:
        {
            title: "Action Not Allowed",
            description: "This action is blocked due to compliance requirements.",
            action: "Learn More",
            retention:
            {
                title: "Data Retention Rule",
                description: "Cannot {{operation}} this {{service}} - it must be retained for {{minRetentionDays}} days. Current record age: {{recordAge}} days.",
                action: "Learn More"
            },
            suspended:
            {
                title: "Account Suspended",
                description: "Your account has been suspended. Please contact support for assistance.",
                action: "Contact Support"
            }
        },
        generic:
        {
            title: "Compliance Block",
            description: "This action is blocked due to regulatory or compliance requirements.",
            action: "Learn More"
        }
    },
    generic:
    {
        title: "Action Restricted",
        description: "This action cannot be completed at this time. Please contact support if you need assistance.",
        action: "Close"
    },
    actions:
    {
        upgrade: "Upgrade Plan",
        dismiss: "Not Now",
        close: "Close",
        verify: "Verify Now",
        learnMore: "Learn More",
        contactSupport: "Contact Support",
        updateProfile: "Update Profile"
    }

} as const;

export default rule;