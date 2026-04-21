import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callCreateSkill, callDeleteSkill, callUpdateSkill } from '@/config/api';
import { message, notification } from 'antd';
import axios from '@/config/axios-customize';

const assertBackendSuccess = (res: any, fallbackMessage: string) => {
    if (!res || +res.statusCode >= 400) {
        throw new Error(res?.message || fallbackMessage);
    }
    return res;
};

// Query keys factory
export const skillKeys = {
    all: ['skills'] as const,
    lists: () => [...skillKeys.all, 'list'] as const,
    list: (query: string) => [...skillKeys.lists(), query] as const,
};

// Fetch skills with pagination
export const useSkills = (query: string) => {
    return useQuery({
        queryKey: skillKeys.list(query),
        queryFn: async () => {
            const res = await axios.get(`/api/v1/skills?${query}`);
            return res.data;
        },
    });
};

// Create skill mutation
export const useCreateSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (name: string) => {
            const res = await callCreateSkill(name);
            return assertBackendSuccess(res, 'Không thể tạo skill');
        },
        onSuccess: () => {
            message.success('Tạo mới Skill thành công');
            queryClient.invalidateQueries({ queryKey: skillKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo skill',
            });
        },
    });
};

// Update skill mutation
export const useUpdateSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, name }: { id: string; name: string }) => {
            const res = await callUpdateSkill(id, name);
            return assertBackendSuccess(res, 'Không thể cập nhật skill');
        },
        onSuccess: () => {
            message.success('Cập nhật Skill thành công');
            queryClient.invalidateQueries({ queryKey: skillKeys.all });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật skill',
            });
        },
    });
};

// Delete skill mutation
export const useDeleteSkill = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await callDeleteSkill(id);
            return assertBackendSuccess(res, 'Không thể xóa skill');
        },
        onSuccess: () => {
            message.success('Xóa Skill thành công');
            queryClient.invalidateQueries({ queryKey: skillKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa skill',
            });
        },
    });
};
