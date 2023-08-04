export const presentationDefinition = {
    id: "32f54163-7166-48f1-93d8-ff217bdb0653",
    input_descriptors: [
        {
            id: "course-id",
            constraints: {
                fields: [
                    {
                        path: ["$.type"],
                        filter: {
                            type: "array",
                            contains: {
                                type: "string",
                                pattern: "wa_driving_license",
                            },
                        },
                    },
                ],
            },
        },
    ],
};
