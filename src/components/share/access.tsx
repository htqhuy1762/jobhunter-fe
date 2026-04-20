import { useEffect, useState } from 'react';
import { Result, Spin } from "antd";
import { useAppSelector } from '@/redux/hooks';
import { hasAdminAccess } from '@/config/utils';

interface IProps {
    hideChildren?: boolean;
    children: React.ReactNode;
    permission: { method: string, apiPath: string, module: string };
}

const MODULE_ALIASES: Record<string, string> = {
    USERS: 'USER',
    ROLES: 'ROLE',
    PERMISSIONS: 'PERMISSION',
    COMPANIES: 'COMPANY',
    JOBS: 'JOB',
    SKILLS: 'SKILL',
    RESUMES: 'RESUME',
    FILES: 'FILE',
    SUBSCRIBERS: 'SUBSCRIBER',
};

const normalizeModule = (module?: string) => {
    const value = module?.toUpperCase().trim();
    if (!value) return '';
    return MODULE_ALIASES[value] ?? value;
};

const normalizePath = (path?: string) => {
    return (path ?? '')
        .replace(/\/(\*|\*\*)$/, '')
        .replace(/\/\{[^}]+\}$/, '');
};

const Access = (props: IProps) => {
    const { permission, hideChildren = false } = props;

    // ⚡ FIX: Thêm isChecking để tránh flash "403"
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [allow, setAllow] = useState<boolean>(false);

    const permissions = useAppSelector(state => state.account.user.role.permissions);
    const userRole = useAppSelector(state => state.account.user.role.name);

    useEffect(() => {
        // ⚡ Bắt đầu check
        setIsChecking(true);

        // ✅ Admin có full quyền, bypass permission check
        if (hasAdminAccess(userRole)) {
            setAllow(true);
            setIsChecking(false);
            return;
        }

        // ✅ Kiểm tra permissions array (dù empty hay không)
        if (!permissions || permissions.length === 0) {
            setAllow(false);
            setIsChecking(false);
            return;
        }

        // ✅ Flexible permission matching
        const check = permissions.find(item => {
            // Case-insensitive comparison
            const methodMatch = item.method?.toUpperCase() === permission.method?.toUpperCase();
            const moduleMatch = normalizeModule(item.module) === normalizeModule(permission.module);

            // Flexible API path matching để handle backend trả về khác format
            // Backend có thể trả: /api/v1/companies/* hoặc /api/v1/companies/{id}
            const normalizedItemPath = normalizePath(item.apiPath);
            const normalizedPermPath = normalizePath(permission.apiPath);

            const apiPathMatch =
                item.apiPath === permission.apiPath  // Exact match
                || normalizedItemPath === normalizedPermPath;  // Normalized match

            return methodMatch && moduleMatch && apiPathMatch;
        });

        setAllow(!!check);
        setIsChecking(false);

    }, [permissions, userRole, permission]);

    // Check ACL setting (có thể tắt ACL trong development)
    const aclDisabled = import.meta.env.VITE_ACL_ENABLE === 'false';

    // ⚡ Hiện loading khi đang check permissions (tránh flash "403")
    if (isChecking) {
        return hideChildren ? null : (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                width: '100%'
            }}>
                <Spin size="large">
                    <div style={{ padding: '50px' }} />
                </Spin>
            </div>
        );
    }

    return (
        <>
            {(allow || aclDisabled) ?
                <>{props.children}</>
                :
                <>
                    {hideChildren === false ?
                        <Result
                            status="403"
                            title="Truy cập bị từ chối"
                            subTitle="Xin lỗi, bạn không có quyền hạn (permission) truy cập thông tin này"
                        />
                        :
                        null
                    }
                </>
            }
        </>
    );
};

export default Access;