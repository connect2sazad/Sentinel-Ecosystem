import {
    apiClient
} from "./api.client.js";

const extractData = (
    response
) => {
    return (
        response?.data?.data ??
        response?.data ??
        null
    );
};

const requestOrganization =
    async (
        payload
    ) => {
        const response =
            await apiClient.post(
                "/organizations/requests",
                payload
            );

        return extractData(
            response
        );
    };

const getMyRequests =
    async () => {
        const response =
            await apiClient.get(
                "/organizations/requests/me"
            );

        return extractData(
            response
        );
    };

const acceptInvitation =
    async (
        token
    ) => {
        const response =
            await apiClient.post(
                "/organizations/invitations/accept",
                {
                    token
                }
            );

        return extractData(
            response
        );
    };

const organizationApi = {
    requestOrganization,
    getMyRequests,
    acceptInvitation
};

export default organizationApi;