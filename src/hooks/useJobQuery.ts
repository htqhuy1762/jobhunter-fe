import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { callCreateJob, callDeleteJob, callFetchJob, callFetchJobById, callUpdateJob } from '@/config/api';
import { IJob } from '@/types/backend';
import { message, notification } from 'antd';
import { assertBackendSuccess } from './mutation-helpers';

// Query keys factory
export const jobKeys = {
    all: ['jobs'] as const,
    lists: () => [...jobKeys.all, 'list'] as const,
    list: (query: string) => [...jobKeys.lists(), query] as const,
    details: () => [...jobKeys.all, 'detail'] as const,
    detail: (id: string) => [...jobKeys.details(), id] as const,
};

// Fetch jobs with pagination
export const useJobs = (query: string) => {
    return useQuery({
        queryKey: jobKeys.list(query),
        queryFn: async () => {
            const res = await callFetchJob(query);
            return res.data;
        },
        // ⚡ Jobs thay đổi thường xuyên → staleTime ngắn hơn (3 phút)
        staleTime: 3 * 60 * 1000,
    });
};

// Fetch single job by ID
export const useJob = (id: string) => {
    return useQuery({
        queryKey: jobKeys.detail(id),
        queryFn: () => callFetchJobById(id),
        enabled: !!id,
    });
};

// Create job mutation
export const useCreateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (job: IJob) => {
            const res = await callCreateJob(job);
            return assertBackendSuccess(res, 'Không thể tạo job');
        },
        onSuccess: () => {
            message.success('Tạo mới Job thành công');
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể tạo job',
            });
        },
    });
};

// Update job mutation
export const useUpdateJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ job, id }: { job: IJob; id: string }) => {
            const res = await callUpdateJob(job, id);
            return assertBackendSuccess(res, 'Không thể cập nhật job');
        },
        onSuccess: () => {
            message.success('Cập nhật Job thành công');
            queryClient.invalidateQueries({ queryKey: jobKeys.all });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể cập nhật job',
            });
        },
    });
};

// Delete job mutation
export const useDeleteJob = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const res = await callDeleteJob(id);
            return assertBackendSuccess(res, 'Không thể xóa job');
        },
        onSuccess: () => {
            message.success('Xóa Job thành công');
            queryClient.invalidateQueries({ queryKey: jobKeys.lists() });
        },
        onError: (error: any) => {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: error?.message || 'Không thể xóa job',
            });
        },
    });
};
