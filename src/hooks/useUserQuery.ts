import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { callCreateUser, callDeleteUser, callFetchUser, callUpdateUser } from '@/config/api';
import { IUser } from '@/types/backend';
import { message, notification } from 'antd';
import { assertBackendSuccess } from './mutation-helpers';

// Query key factory - để quản lý cache dễ dàng
export const userKeys = {
    all: ['users'] as const,
    lists: () => [...userKeys.all, 'list'] as const,
    list: (query: string) => [...userKeys.lists(), query] as const,
    details: () => [...userKeys.all, 'detail'] as const,
    detail: (id: string) => [...userKeys.details(), id] as const,
};

/**
 * Hook để fetch danh sách users với pagination
 */
export const useUsers = (query: string) => {
    return useQuery({
        queryKey: userKeys.list(query),
        queryFn: async () => {
            const res = await callFetchUser(query);
            return res.data;
        },
        staleTime: 5 * 60 * 1000, // 5 phút
    });
};

/**
 * Hook để create user
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (user: IUser) => {
            const res = await callCreateUser(user);
            return assertBackendSuccess(res, 'Không thể tạo user');
        },
        onSuccess: () => {
            // Invalidate và refetch danh sách users
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            message.success('Tạo mới User thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo user'
            });
        }
    });
};

/**
 * Hook để update user
 */
export const useUpdateUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (user: IUser) => {
            const res = await callUpdateUser(user);
            return assertBackendSuccess(res, 'Không thể cập nhật user');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
            message.success('Cập nhật User thành công');
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật user'
            });
        }
    });
};

/**
 * Hook để delete user với optimistic update
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await callDeleteUser(id);
            return assertBackendSuccess(res, 'Không thể xóa user');
        },
        // ⚡ Optimistic update: Xóa ngay trong UI trước khi API response
        onMutate: async (deletedId) => {
            // Cancel ongoing queries
            await queryClient.cancelQueries({ queryKey: userKeys.lists() });

            // Snapshot previous value
            const previousData = queryClient.getQueriesData({ queryKey: userKeys.lists() });

            // Optimistically update cache
            queryClient.setQueriesData({ queryKey: userKeys.lists() }, (old: any) => {
                if (!old?.result) return old;
                return {
                    ...old,
                    result: old.result.filter((user: any) => user.id !== deletedId),
                    meta: { ...old.meta, total: old.meta.total - 1 }
                };
            });

            return { previousData };
        },
        onSuccess: () => {
            message.success('Xóa User thành công');
        },
        onError: (error: any, deletedId, context) => {
            // Rollback on error
            if (context?.previousData) {
                context.previousData.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa user'
            });
        },
        onSettled: () => {
            // Refetch để đảm bảo sync với server
            queryClient.invalidateQueries({ queryKey: userKeys.lists() });
        }
    });
};
