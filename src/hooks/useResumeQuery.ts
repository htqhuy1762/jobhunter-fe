import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callFetchResume, callFetchResumeById, callDeleteResume } from '@/config/api';
import { message, notification } from 'antd';
import { assertBackendSuccess } from './mutation-helpers';

// Query keys factory
export const resumeKeys = {
    all: ['resumes'] as const,
    lists: () => [...resumeKeys.all, 'list'] as const,
    list: (query: string) => [...resumeKeys.lists(), query] as const,
    details: () => [...resumeKeys.all, 'detail'] as const,
    detail: (id: string) => [...resumeKeys.details(), id] as const,
};

// Fetch resumes with pagination
export const useResumes = (query: string) => {
    return useQuery({
        queryKey: resumeKeys.list(query),
        queryFn: async () => {
            const res = await callFetchResume(query);
            return res.data;
        },
        // ⚡ Resumes thay đổi thường xuyên → staleTime ngắn hơn (2 phút)
        staleTime: 2 * 60 * 1000,
    });
};

// Fetch single resume by ID
export const useResume = (id: string) => {
    return useQuery({
        queryKey: resumeKeys.detail(id),
        queryFn: () => callFetchResumeById(id),
        enabled: !!id,
    });
};

// Delete resume mutation
export const useDeleteResume = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await callDeleteResume(id);
            return assertBackendSuccess(res, 'Không thể xóa resume');
        },
        onSuccess: () => {
            message.success('Xóa Resume thành công');
            queryClient.invalidateQueries({ queryKey: resumeKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa resume',
            });
        },
    });
};
