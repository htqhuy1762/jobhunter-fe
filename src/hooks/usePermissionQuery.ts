import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetchPermission, callFetchPermissionById, callCreatePermission, callUpdatePermission, callDeletePermission } from '@/config/api';
import { IPermission } from '@/types/backend';
import { message, notification } from 'antd';
import { assertBackendSuccess } from './mutation-helpers';

// Query keys factory
export const permissionKeys = {
    all: ['permissions'] as const,
    lists: () => [...permissionKeys.all, 'list'] as const,
    list: (query: string) => [...permissionKeys.lists(), query] as const,
    details: () => [...permissionKeys.all, 'detail'] as const,
    detail: (id: string) => [...permissionKeys.details(), id] as const,
};

// Fetch permissions with pagination
export const usePermissions = (query: string) => {
    return useQuery({
        queryKey: permissionKeys.list(query),
        queryFn: async () => {
            const res = await callFetchPermission(query);
            return res.data;
        },
        // ⚡ Permissions ít thay đổi → staleTime dài hơn (15 phút)
        staleTime: 15 * 60 * 1000,
        gcTime: 30 * 60 * 1000, // 30 phút cache
    });
};

// Fetch single permission by ID
export const usePermission = (id: string) => {
    return useQuery({
        queryKey: permissionKeys.detail(id),
        queryFn: () => callFetchPermissionById(id),
        enabled: !!id,
    });
};

// Create permission mutation
export const useCreatePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (permission: IPermission) => {
            const res = await callCreatePermission(permission);
            return assertBackendSuccess(res, 'Không thể tạo permission');
        },
        onSuccess: () => {
            message.success('Tạo mới Permission thành công');
            queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo permission',
            });
        },
    });
};

// Update permission mutation
export const useUpdatePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ permission, id }: { permission: IPermission; id: string }) => {
            const res = await callUpdatePermission(permission, id);
            return assertBackendSuccess(res, 'Không thể cập nhật permission');
        },
        onSuccess: () => {
            message.success('Cập nhật Permission thành công');
            queryClient.invalidateQueries({ queryKey: permissionKeys.all });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật permission',
            });
        },
    });
};

// Delete permission mutation
export const useDeletePermission = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await callDeletePermission(id);
            return assertBackendSuccess(res, 'Không thể xóa permission');
        },
        onSuccess: () => {
            message.success('Xóa Permission thành công');
            queryClient.invalidateQueries({ queryKey: permissionKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa permission',
            });
        },
    });
};
