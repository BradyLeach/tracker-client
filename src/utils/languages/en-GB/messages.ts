const messages = {
    auth:
    {
        invalidCredentials: "Invalid email or password"
    },
    verification:
    {
        invalid: "The {{field}} you provided was invalid.",
        expired: "The {{field}} you provided has expired.",
        maxAttempts: "You exceeded the maximum attempts to verify."
    },
    resource:
    {
        noexist: "The {{field}} could not be found.",
        exists: "The {{field}} already exists.",
        invalid: "{{field}} is invalid.",
        unauthorized: "You don't have permission to access this."
    },
    permission:
    {
        denied: "You don't have permission to perform this action.",
        tooManyRequests: "Too many requests. Please try again later."
    },
    info:
    {
        noAddressOnFile: "No address on file.",
        noMembersFound: "No members found."
    },
    error:
    {
        unknown: "An unknown error occurred.",
        confirmPassword: "Passwords do not match.",
        passwordWeak: "Password is too weak. Please choose a stronger password.",
        tokenExpired: "Your session has expired.",
        tokenInvalid: "Invalid token. Please try again.",
        networkError: "Network error. Please check your connection.",
        fileUpload: "File upload failed. Please try again.",
        mixed:
        {
            default: "Invalid value {{value}}",
            required: "This field is required.",
            notType: "Must be a valid {{type}}.",
            notNull: "Cannot be null.",
            oneOf: "Must be one of {{values}}",
            isJson: "Must be valid JSON."
        },
        number:
        {
            min: "Must be at least {{min}}.",
            max: "Must be at most {{max}}.",
            positive: "Must be a positive number.",
            integer: "Must be an integer.",
            moreThan: "Must be more than {{more}}."
        },
        string:
        {
            min: "Must be at least {{min}} characters.",
            max: "Must be at most {{max}} characters.",
            handle: "The @handle can only contain letters, numbers, and underscores.",
            password: "The password must contain mixed case alpha numeric characters and symbols.",
            matches: "Does not match the required format.",
            email: "Must be a valid email address.",
            url: "Must be a valid URL.",
            uuid: "Must be a valid UUID.",
            date: "Must be a valid date (UTC ISO 8601 format).",
            verificationCode: "{{field}} must be exactly 6 digits",
            notUnique: "The {{field}} is already in use."

        },
        date:
        {
            min: "Must be after {{min}}.",
            max: "Must be before {{max}}.",
            format: "Must be a valid date.",
            utc: "Must be a valid UTC date.",
            validDob:
            {
                tooYoung: "You must be at least {{minAge}} years old.",
                tooOld: "You must be under {{maxAge}} years old."
            }
        },
        array:
        {
            required: "At least one item is required.",
            min: "Must contain at least {{min}} items.",
            max: "Must contain at most {{max}} items."
        },
        boolean:
        {
            notType: "Must be true or false.",
            mustAccept: "You must accept the {{field}}.",
            mustConfirm: "You must confirm to continue."
        }
    }
} as const;

export default messages;