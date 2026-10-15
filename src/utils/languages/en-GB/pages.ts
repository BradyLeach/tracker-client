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
        },
        experiments:
        {
            title: "Experiments",
            description: "Plan, run and conclude traction experiments",
            searchPlaceholder: "Search experiments",
            addButton: "New Experiment",
            openButton: "Open experiment",
            emptyState:
            {
                headline: "No experiments yet",
                subtext: "State a falsifiable hypothesis, choose what to measure and set a threshold.",
                addButton: "Plan an experiment"
            }
        },
        experiment:
        {
            title: "Experiment",
            description: "Design, results and conclusion of one experiment",
            overview: "Experiment",
            section:
            {
                design: "Design",
                variants: "Control and Variants",
                measures: "Measures",
                results: "Results",
                learnings: "Learnings"
            },
            design:
            {
                hypothesis: "Hypothesis",
                threshold: "Success threshold",
                window: "Window",
                notSet: "Not set",
                atLeast: "at least",
                atMost: "at most",
                lockedRunning: "The hypothesis, threshold and window are locked while the experiment runs.",
                lockedTerminal: "This experiment is finished and can no longer change.",
                editButton: "Edit design"
            },
            actions:
            {
                start: "Start",
                conclude: "Conclude",
                abandon: "Abandon",
                abandonConfirm: "Abandon this experiment? It stops without a conclusion and cannot be restarted."
            },
            deleteConfirm:
            {
                title: "Delete experiment?",
                body: "{{title}} and its variants, measures and learnings will be permanently deleted. This cannot be undone."
            },
            variants:
            {
                addButton: "Add variant",
                control: "Control",
                noAttribution: "Counts nothing yet — add attribution for a source.",
                emptyState:
                {
                    headline: "No control yet",
                    subtext: "Every experiment needs one control. Add variants to compare against it."
                }
            },
            measures:
            {
                addButton: "Add measure",
                primary: "Primary",
                emptyState:
                {
                    headline: "Nothing measured yet",
                    subtext: "Add the primary measure the threshold is judged against, and anything else to track."
                }
            },
            results:
            {
                groupBy: "Group by",
                day: "Day",
                week: "Week",
                month: "Month",
                frozen: "Frozen at conclusion",
                live: "Live",
                timeZone: "Times in {{timeZone}}",
                value: "Value",
                lift: "Lift",
                significance: "p-value",
                status: "Threshold",
                pass: "Pass",
                fail: "Fail",
                inconclusive: "Inconclusive",
                unknown: "—",
                threshold: "Threshold",
                noPrimary: "Add a primary measure to see results.",
                emptyState:
                {
                    headline: "No results yet",
                    subtext: "Results appear once the experiment has a primary measure and variants."
                }
            },
            learnings:
            {
                emptyState:
                {
                    headline: "No learnings yet",
                    subtext: "Concluding records what this experiment showed."
                }
            }
        },
        learnings:
        {
            title: "Learnings",
            description: "What every experiment showed",
            searchPlaceholder: "Search learnings",
            emptyState:
            {
                headline: "No learnings yet",
                subtext: "Each concluded experiment leaves a learning here."
            }
        },
        metrics:
        {
            title: "Metrics",
            description: "Metrics and formulas over your measurements",
            searchPlaceholder: "Search metrics",
            addButton: "New Metric",
            addFormulaButton: "New Formula",
            formulasTitle: "Formulas",
            value: "Current value",
            window: "Last {{days}} days",
            allTime: "All time",
            emptyState:
            {
                headline: "No metrics yet",
                subtext: "A metric counts, sums or counts distinct values of one measurement from a source."
            },
            formulaEmptyState:
            {
                headline: "No formulas yet",
                subtext: "Combine metrics with + - * / and min, max, abs."
            }
        },
        sources:
        {
            title: "Sources",
            description: "Where measurements come from, and what each source may send",
            searchPlaceholder: "Search sources",
            addButton: "New Source",
            enterButton: "Enter measurements",
            measurements: "Recent measurements",
            emptyState:
            {
                headline: "No sources yet",
                subtext: "Create a push source for your website or app and a manual source for offline channels."
            }
        },
        connections:
        {
            title: "Connections",
            description: "Pull measurements from the tools you already use",
            addButton: "Connect",
            testButton: "Test",
            pullButton: "Pull now",
            runs: "Runs",
            testOk: "Connection works.",
            testFailed: "Connection failed: {{message}}",
            emptyState:
            {
                headline: "No connections yet",
                subtext: "Connecting a tool backfills its history and keeps pulling on a schedule."
            }
        },
        ingestKeys:
        {
            title: "Ingest Keys",
            description: "Keys for pushing events from your website, apps and servers",
            addButton: "New Key",
            revokeButton: "Revoke",
            revoked: "Revoked",
            revokeConfirm: "Revoke this key? Anything using it stops sending events at once.",
            keyShownOnce: "Copy this key now. It is shown once and cannot be shown again.",
            emptyState:
            {
                headline: "No ingest keys yet",
                subtext: "A public key is safe in client code; a secret key stays on your server."
            }
        },
        bullseye:
        {
            title: "Bullseye",
            description: "Brainstorm across all 19 channels, test the promising ones, focus on what works",
            addButton: "New Idea",
            channelsTitle: "Channel Library",
            rings:
            {
                outer: "Outer ring — what might work",
                middle: "Middle ring — worth a cheap test",
                inner: "Inner ring — focus"
            },
            moveTo: "Move to {{ring}}",
            emptyRing: "No ideas in this ring."
        },
        calculators:
        {
            title: "Calculators",
            description: "Every built-in marketing calculator, standalone",
            runButton: "Calculate",
            result: "Result",
            unknown: "Cannot be known from these inputs."
        }
    } as const;

export default pages;
