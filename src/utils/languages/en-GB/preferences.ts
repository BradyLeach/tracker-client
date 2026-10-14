const preferences = {
    language: {
        title: 'Select Language',
        error: 'Failed to load languages'
    },
    currency: {
        title: 'Select Currency',
        error: 'Failed to load currencies'
    },
    country: {
        title: 'Select Country',
        error: 'Failed to load countries'
    }
} as const;

export default preferences;
