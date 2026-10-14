const tables = {
    order:
    {
        columns:
        {
            reference: "Reference",
            ordered: "Ordered",
            status: "Status",
            total: "Total",
        }
    },
    location:
    {
        columns:
        {
            name: "Location",
            address: "Address",
            type: "Type",
            description: "Description",
        }
    },
    supply:
    {
        columns:
        {
            item: "Item",
            relationship: "Relationship",
            lastSupplied: "Last supplied",
        }
    },
    companies:
    {
        columns:
        {
            name: "Company",
            website: "Website",
            taxIdentifier: "Tax ID",
            types: "Partnership Types",
            status: "Status",
        }
    },
    partnerships:
    {
        group:
        {
            company: "Company",
            partnerships: "Partnerships",
        },
        columns:
        {
            company: "Company",
            partnershipType: "Type",
            contactName: "Contact Name",
            contactEmail: "Contact Email",
            contactPhone: "Contact Phone",
            rating: "Rating",
            currentState: "Status",
        }
    }
} as const;

export default tables;
