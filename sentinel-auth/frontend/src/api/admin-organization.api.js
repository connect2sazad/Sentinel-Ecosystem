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

const getRequests =
    async (
        status = "pending"
    ) => {
        const response =
            await apiClient.get(
                "/admin/organization-requests",
                {
                    params: {
                        status
                    }
                }
            );

        return extractData(
            response
        );
    };

const getRequestById =
    async (
        id
    ) => {
        const response =
            await apiClient.get(
                `/admin/organization-requests/${id}`
            );

        return extractData(
            response
        );
    };

const approveRequest =
    async (
        id
    ) => {
        const response =
            await apiClient.post(
                `/admin/organization-requests/${id}/approve`
            );

        return extractData(
            response
        );
    };

const rejectRequest =
    async (
        id,
        reason
    ) => {
        const response =
            await apiClient.post(
                `/admin/organization-requests/${id}/reject`,
                {
                    reason
                }
            );

        return extractData(
            response
        );
    };

const adminOrganizationApi = {
    getRequests,
    getRequestById,
    approveRequest,
    rejectRequest
};

export default adminOrganizationApi;