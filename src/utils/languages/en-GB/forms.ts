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
        }
    } as const;

export default forms;