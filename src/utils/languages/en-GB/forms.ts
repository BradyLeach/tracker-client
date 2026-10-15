const forms =
    {
        login:
        {
            rememberMe: "Remember for 30 days",
            forgotPassword: "Forgot your password?",
            loginButton: "Login",
            googleButton: "Log in with Google",
            fields:
            {
                email: "Email Address",
                emailPlaceholder: "Enter your email address",
                password: "Password",
                passwordPlaceholder: "Choose a secure password"
            }
        },
        provideEmail:
        {
            title: "Enter Email",
            subtitle: "Please provide your email to proceed with the verification",
            fields:
            {
                email: "Email Address",
                emailPlaceholder: "Enter your email address"
            }
        },
        provideCode:
        {
            title: "Enter verification code",
            subtitle: "We've sent a verification link to",
            fields:
            {
                code: "Verification Code",
                codePlaceholder: "000000"
            }
        },
        registration:
        {
            registerButton: "Register",
            title: "Yo Momma a Ho",
            subtitle: "i am the sub title bitch",
            sections:
            {
                personalDetails: "Personal Deets",
                personalSubtitle: "Please enter your personal details",
                profileDetails: "Profile Details",
                accessDetails: "Access Details",
                legalDetails: "Legal Details"
            },
            fields:
            {
                firstname: "First Name",
                firstnamePlaceholder: "Enter your first name",
                lastname: "Last Name",
                lastnamePlaceholder: "Enter your last name",
                email: "Email Address",
                emailPlaceholder: "Enter your email address",
                password: "Password",
                passwordPlaceholder: "Choose a secure password",
                passwordConfirm: "Confirm Password",
                passwordConfirmPlaceholder: "Confirm your password",
                handle: "Handle",
                handlePlaceholder: "Choose your @handle",
                name: "display name",
                namePlaceholder: "Choose your display name",
                sex: "Sex at Birth",
                sexPlaceholder: "Select your sex",
                height: "Height (cm)",
                heightPlaceholder: "Select your height",
                dob: "Date of Birth",
                dobPlaceholder: "Select your date of birth",
                countryId: "Country",
                countryIdPlaceholder: "Search for your country",
                acknowledgedTerms: "I agree to the ",
                acknowledgedTermsLink: "terms & conditions.",
                acknowledgedAge: "The date of birth provided is correct.",
                acknowledgedAgePlaceholder: "The age I have provided is accurate."
            },
            options:
            {
                sexMale: "Male",
                sexFemale: "Female",
                sexOther: "Other"
            },
            footer:
            {
                prefaceText: "Already have an Account?",
                linkText: "Sign In"
            }
        },
        identity:
        {
            sections:
            {
                status: "Status",
                personalDetails: "Personal Details",
                contactDetails: "Contact Details"
            },
            fields:
            {
                email: "Email Address",
                emailPlaceholder: "Enter your email address",
                recoveryEmail: "Recovery Email",
                recoveryEmailPlaceholder: "Enter a recovery email address",
                firstname: "First Name",
                firstnamePlaceholder: "Enter your first name",
                lastname: "Last Name",
                lastnamePlaceholder: "Enter your last name",
                dob: "Date of Birth",
                dobPlaceholder: "Select your date of birth"
            }
        },
        company:
        {
            editTitle: "Edit Company",
            fields:
            {
                name: "Company Name",
                namePlaceholder: "Enter the company name",
                icon: "Icon",
                contactEmail: "Contact Email",
                contactEmailPlaceholder: "Enter a contact email",
                phoneNumber: "Phone Number",
                phoneNumberPlaceholder: "Enter a phone number",
                websiteUrl: "Website",
                websiteUrlPlaceholder: "Enter the website address",
                taxIdentifierType: "Tax ID Type",
                taxIdentifierTypePlaceholder: "Select a tax ID type",
                taxIdentifier: "Tax ID",
                taxIdentifierPlaceholder: "Enter the tax identifier"
            },
            options:
            {
                abn: "ABN",
                ein: "EIN",
                vat: "VAT",
                gst: "GST",
                company_number: "Company Number"
            }
        },
        partnership:
        {
            title: "Add Partnership",
            editTitle: "Edit Partnership",
            submitButton: "Add Partnership",
            fields:
            {
                partnershipTypeId: "Partnership Type",
                partnershipTypeIdPlaceholder: "Select a type",
                contactName: "Contact Name",
                contactNamePlaceholder: "Enter a contact name",
                contactEmail: "Contact Email",
                contactEmailPlaceholder: "Enter a contact email",
                contactPhone: "Contact Phone",
                contactPhonePlaceholder: "Enter a contact phone number",
                rating: "Rating",
                ratingPlaceholder: "1 – 5"
            }
        },
        location:
        {
            title: "Add Location",
            editTitle: "Edit Location",
            submitButton: "Add Location",
            fields:
            {
                companyId: "Company",
                companyIdPlaceholder: "Select a company",
                label: "Name",
                labelPlaceholder: "Enter a location name",
                locationTypeId: "Location Type",
                locationTypeIdPlaceholder: "Select a type",
                description: "Description",
                descriptionPlaceholder: "Enter a description"
            }
        },
        address:
        {
            fields:
            {
                line1: "Address Line 1",
                line1Placeholder: "Enter the street address",
                line2: "Address Line 2",
                line2Placeholder: "Apartment, suite, unit (optional)",
                city: "City",
                cityPlaceholder: "Enter a city",
                postalCode: "Postal Code",
                postalCodePlaceholder: "Enter a postal code",
                countryId: "Country",
                countryIdPlaceholder: "Select a country"
            }
        },
        locationAddress:
        {
            fields:
            {
                addressTypeId: "Address Type",
                addressTypeIdPlaceholder: "Select an address type"
            }
        },
        shared:
        {
            validation:
            {
                required: "Required",
                optional: "Optional"
            }
        },

        experiment:
        {
            title: "New Experiment",
            editTitle: "Edit Experiment Design",
            submitButton: "Create Experiment",
            fields:
            {
                title: "Title",
                titlePlaceholder: "e.g. Newsletter sponsorship test",
                hypothesis: "Hypothesis",
                hypothesisPlaceholder: "A falsifiable statement: what will happen, and by how much",
                thresholdValue: "Success threshold",
                thresholdValuePlaceholder: "In the primary measure's unit — 250 is 2.50% for a rate",
                thresholdDirection: "Success means the primary measure is",
                thresholdDirectionPlaceholder: "Select a direction",
                windowStart: "Window start",
                windowStartPlaceholder: "Select a start date",
                windowEnd: "Window end",
                windowEndPlaceholder: "Select an end date"
            },
            options:
            {
                atLeast: "At least the threshold",
                atMost: "At most the threshold"
            }
        },
        conclusion:
        {
            title: "Conclude Experiment",
            submitButton: "Conclude",
            fields:
            {
                decision: "Decision",
                decisionPlaceholder: "Persevere, pivot or kill",
                learning: "Learning",
                learningPlaceholder: "What did this experiment show?"
            },
            options:
            {
                persevere: "Persevere",
                pivot: "Pivot",
                kill: "Kill"
            }
        },
        experimentVariant:
        {
            title: "Add Variant",
            editTitle: "Edit Variant",
            submitButton: "Add Variant",
            attributionTitle: "Attribution",
            attributionSubtitle: "A measurement counts toward this variant only through these filters, per source.",
            addSource: "Add source",
            fields:
            {
                label: "Label",
                labelPlaceholder: "e.g. Long-form landing page",
                isControl: "This is the control"
            }
        },
        experimentMeasure:
        {
            title: "Add Measure",
            submitButton: "Add Measure",
            inputsTitle: "Calculator inputs",
            inputsSubtitle: "Bind each input to one of your metrics.",
            fields:
            {
                measureType: "Measure",
                measureTypePlaceholder: "Metric, formula or calculator",
                metricId: "Metric",
                metricIdPlaceholder: "Select a metric",
                formulaId: "Formula",
                formulaIdPlaceholder: "Select a formula",
                calculatorKey: "Calculator",
                calculatorKeyPlaceholder: "Select a calculator",
                label: "Label",
                labelPlaceholder: "Optional",
                isPrimary: "Primary measure — judged against the threshold"
            },
            options:
            {
                metric: "Metric",
                formula: "Formula",
                calculator: "Calculator"
            }
        },
        metric:
        {
            title: "New Metric",
            editTitle: "Edit Metric",
            submitButton: "Create Metric",
            filtersTitle: "Filters",
            filtersSubtitle: "A measurement counts only when it matches every filter.",
            fields:
            {
                key: "Key",
                keyPlaceholder: "Letters, digits and _ — formulas use this name",
                label: "Label",
                labelPlaceholder: "e.g. Newsletter signups",
                measurementSourceId: "Source",
                measurementSourceIdPlaceholder: "Select a source",
                measurementName: "Measurement",
                measurementNamePlaceholder: "Select a measurement",
                aggregation: "Aggregation",
                aggregationPlaceholder: "Sum, count or unique",
                uniqueDimensionKey: "Count distinct values of",
                uniqueDimensionKeyPlaceholder: "Select a dimension",
                windowDays: "Rolling window (days)",
                windowDaysPlaceholder: "Blank for all time"
            },
            options:
            {
                sum: "Sum of values",
                count: "Count of measurements",
                unique: "Count of distinct values"
            }
        },
        dimensionFilter:
        {
            addFilter: "Add filter",
            target: "Match",
            dimension: "Dimension",
            campaignKey: "Campaign key",
            dimensionKey: "Dimension key",
            operator: "Operator",
            equals: "equals",
            in: "is one of",
            values: "Values"
        },
        formula:
        {
            title: "New Formula",
            editTitle: "Edit Formula",
            submitButton: "Create Formula",
            fields:
            {
                key: "Key",
                keyPlaceholder: "Letters, digits and _",
                label: "Label",
                labelPlaceholder: "e.g. Blended CAC",
                expression: "Expression",
                expressionPlaceholder: "e.g. ( ad_spend + tooling ) / customers",
                outputUnit: "Result unit",
                outputUnitPlaceholder: "Select a unit"
            },
            options:
            {
                count: "Count",
                money: "Money",
                rate: "Rate",
                multiple: "Multiple"
            }
        },
        measurementSource:
        {
            title: "New Source",
            editTitle: "Edit Source",
            submitButton: "Create Source",
            fields:
            {
                key: "Key",
                keyPlaceholder: "push, manual, or a connector name",
                label: "Label",
                labelPlaceholder: "e.g. Website events",
                sourceType: "Delivers",
                sourceTypePlaceholder: "Events or buckets",
                bucketSize: "Bucket size",
                bucketSizePlaceholder: "Hour or day",
                allowedMeasurementNames: "Allowed measurement names",
                allowedMeasurementNamesPlaceholder: "Type a name and press Enter",
                allowedDimensionKeys: "Allowed dimension keys",
                allowedDimensionKeysPlaceholder: "Type a key and press Enter"
            },
            options:
            {
                event: "One measurement per event",
                bucket: "One total per bucket",
                hour: "Hour",
                day: "Day"
            }
        },
        manualEntry:
        {
            title: "Enter Measurements",
            submitButton: "Save",
            fields:
            {
                name: "Measurement",
                namePlaceholder: "Select a measurement",
                occurredAt: "When",
                occurredAtPlaceholder: "Select a date",
                value: "Value",
                valuePlaceholder: "1 for a single event",
                campaignKey: "Campaign key",
                campaignKeyPlaceholder: "Optional"
            }
        },
        connection:
        {
            title: "Connect a Tool",
            editTitle: "Edit Connection",
            submitButton: "Connect",
            fields:
            {
                connectorName: "Connector",
                connectorNamePlaceholder: "Select a connector",
                label: "Label",
                labelPlaceholder: "Optional",
                isActive: "Pull on a schedule",
                pullIntervalMinutes: "Pull every (minutes)",
                pullIntervalMinutesPlaceholder: "At least 15"
            }
        },
        ingestKey:
        {
            title: "New Ingest Key",
            submitButton: "Create Key",
            keyTitle: "Your new key",
            fields:
            {
                label: "Label",
                labelPlaceholder: "e.g. Marketing site",
                keyType: "Type",
                keyTypePlaceholder: "Public or secret",
                permittedMeasurementNames: "Events this key may send",
                permittedMeasurementNamesPlaceholder: "Public keys only"
            },
            options:
            {
                public: "Public — safe in client code, limited to chosen events",
                secret: "Secret — server-side, every event the push source allows"
            }
        },
        channelIdea:
        {
            title: "New Idea",
            editTitle: "Edit Idea",
            submitButton: "Add Idea",
            fields:
            {
                channelId: "Channel",
                channelIdPlaceholder: "Select a traction channel",
                title: "Idea",
                titlePlaceholder: "e.g. Sponsor two niche newsletters",
                description: "Notes",
                descriptionPlaceholder: "Why it might work, and how to test it cheaply",
                ring: "Ring",
                ringPlaceholder: "Select a ring"
            },
            options:
            {
                outer: "Outer",
                middle: "Middle",
                inner: "Inner"
            }
        },
        reportingDefaults:
        {
            title: "Reporting",
            submitButton: "Save",
            fields:
            {
                timeZone: "Time zone",
                timeZonePlaceholder: "e.g. Australia/Perth"
            }
        },
        calculator:
        {
            fields: {}
        }
    } as const;

export default forms;