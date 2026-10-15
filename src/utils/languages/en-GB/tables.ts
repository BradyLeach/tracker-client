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
    },

    experiments:
    {
        columns:
        {
            title: "Experiment",
            hypothesis: "Hypothesis",
            status: "Status",
            windowEnd: "Ends",
            decision: "Decision"
        }
    },
    learnings:
    {
        columns:
        {
            body: "Learning",
            experiment: "Experiment",
            createdAt: "Recorded"
        }
    },
    metrics:
    {
        columns:
        {
            key: "Key",
            label: "Metric",
            aggregation: "Aggregation",
            measurementName: "Measurement"
        }
    },
    formulas:
    {
        columns:
        {
            key: "Key",
            label: "Formula",
            expression: "Expression",
            outputUnit: "Unit"
        }
    },
    sources:
    {
        columns:
        {
            key: "Key",
            label: "Source",
            sourceType: "Delivers",
            allowedMeasurementNames: "Measurements"
        }
    },
    measurements:
    {
        columns:
        {
            name: "Measurement",
            occurredAt: "When",
            value: "Value",
            campaignKey: "Campaign"
        }
    },
    connections:
    {
        columns:
        {
            connectorName: "Connector",
            label: "Label",
            isActive: "Scheduled",
            pulledThrough: "Pulled through"
        }
    },
    connectorRuns:
    {
        columns:
        {
            kind: "Run",
            status: "Status",
            measurementCount: "Written",
            startedAt: "Started"
        }
    },
    ingestKeys:
    {
        columns:
        {
            label: "Key",
            keyType: "Type",
            keyPrefix: "Starts with",
            revokedAt: "Revoked"
        }
    }
} as const;

export default tables;
