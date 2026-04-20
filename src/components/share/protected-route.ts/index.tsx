import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/redux/hooks";
import NotPermitted from "./not-permitted";
import Loading from "../loading";
import { hasAdminAccess, hasBackofficeAccess } from "@/config/utils";

const RoleBaseRoute = (props: any) => {
    const user = useAppSelector(state => state.account.user);
    const userRole = user.role?.name;

    // Cho phép ROLE_ADMIN và ROLE_HR truy cập trang admin
    // ROLE_USER không có quyền (redirect về not-permitted)
    if (hasBackofficeAccess(userRole)) {
        return (<>{props.children}</>)
    } else {
        return (<NotPermitted />)
    }
}

export const AdminOnlyRoute = (props: any) => {
    const user = useAppSelector(state => state.account.user);
    const userRole = user.role?.name;

    if (hasAdminAccess(userRole)) {
        return (<>{props.children}</>)
    }

    return (<NotPermitted />)
}

// Component cho các trang yêu cầu đăng nhập nhưng không cần check role admin
// Ví dụ: change-password, manage-account
export const AuthenticatedRoute = (props: any) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
    const isLoading = useAppSelector(state => state.account.isLoading)

    return (
        <>
            {isLoading === true ?
                <Loading />
                :
                <>
                    {isAuthenticated === true ?
                        <>{props.children}</>
                        :
                        <Navigate to='/login' replace />
                    }
                </>
            }
        </>
    )
}

// Component cho các trang admin (yêu cầu đăng nhập + role admin/hr)
const ProtectedRoute = (props: any) => {
    const isAuthenticated = useAppSelector(state => state.account.isAuthenticated)
    const isLoading = useAppSelector(state => state.account.isLoading)

    return (
        <>
            {isLoading === true ?
                <Loading />
                :
                <>
                    {isAuthenticated === true ?
                        <>
                            <RoleBaseRoute>
                                {props.children}
                            </RoleBaseRoute>
                        </>
                        :
                        <Navigate to='/login' replace />
                    }
                </>
            }
        </>
    )
}

export default ProtectedRoute;