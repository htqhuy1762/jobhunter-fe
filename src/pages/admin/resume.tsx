import DataTable from "@/components/client/data-table";
import { IResume } from "@/types/backend";
import { ActionType, ProColumns, ProFormSelect } from '@ant-design/pro-components';
import { Space } from "antd";
import { useState, useRef } from 'react';
import dayjs from 'dayjs';
import queryString from 'query-string';
import ViewDetailResume from "@/components/admin/resume/view.resume";
import { ALL_PERMISSIONS } from "@/config/permissions";
import Access from "@/components/share/access";
import { sfIn } from "spring-filter-query-builder";
import { EditOutlined } from "@ant-design/icons";
import { useResumes, useDeleteResume } from "@/hooks/useResumeQuery";

// Helper function
const buildQuery = (params: any, sort: any, filter: any) => {
    const clone = { ...params };

    if (clone?.status?.length) {
        clone.filter = sfIn("status", clone.status).toString();
        delete clone.status;
    }

    clone.page = clone.current;
    clone.size = clone.pageSize;

    delete clone.current;
    delete clone.pageSize;

    let temp = queryString.stringify(clone);

    let sortBy = "";
    if (sort && sort.status) {
        sortBy = sort.status === 'ascend' ? "sort=status,asc" : "sort=status,desc";
    }

    if (sort && sort.createdAt) {
        sortBy = sort.createdAt === 'ascend' ? "sort=createdAt,asc" : "sort=createdAt,desc";
    }
    if (sort && sort.updatedAt) {
        sortBy = sort.updatedAt === 'ascend' ? "sort=updatedAt,asc" : "sort=updatedAt,desc";
    }

    //mặc định sort theo updatedAt
    if (Object.keys(sortBy).length === 0) {
        temp = `${temp}&sort=updatedAt,desc`;
    } else {
        temp = `${temp}&${sortBy}`;
    }

    return temp;
}

const ResumePage = () => {
    const [dataInit, setDataInit] = useState<IResume | null>(null);
    const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
    const [queryParams, setQueryParams] = useState({ current: 1, pageSize: 10 });
    const [sortParams, setSortParams] = useState({});
    const [filterParams, setFilterParams] = useState({});

    const tableRef = useRef<ActionType>();

    // TanStack Query
    const query = buildQuery(queryParams, sortParams, filterParams);
    const { data, isLoading, refetch } = useResumes(query);
    const deleteResumeMutation = useDeleteResume();

    // Extract data
    const resumes = data?.result || [];
    const meta = data?.meta || { page: 1, pageSize: 10, total: 0 };

    const handleDeleteResume = async (id: string | undefined) => {
        if (id) {
            await deleteResumeMutation.mutateAsync(id);
        }
    }

    const reloadTable = () => {
        refetch();
    }

    const columns: ProColumns<IResume>[] = [
        {
            title: 'Id',
            dataIndex: 'id',
            width: 50,
            render: (text, record, index, action) => {
                return (
                    <a href="#" onClick={() => {
                        setOpenViewDetail(true);
                        setDataInit(record);
                    }}>
                        {record.id}
                    </a>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'Trạng Thái',
            dataIndex: 'status',
            sorter: true,
            renderFormItem: (item, props, form) => (
                <ProFormSelect
                    showSearch
                    mode="multiple"
                    allowClear
                    valueEnum={{
                        PENDING: 'PENDING',
                        REVIEWING: 'REVIEWING',
                        SHORTLISTED: 'SHORTLISTED',
                        INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
                        INTERVIEWED: 'INTERVIEWED',
                        OFFERED: 'OFFERED',
                        HIRED: 'HIRED',
                        APPROVED: 'APPROVED',
                        REJECTED: 'REJECTED',
                        WITHDRAWN: 'WITHDRAWN',
                    }}
                    placeholder="Chọn trạng thái"
                />
            ),
        },

        {
            title: 'Job',
            dataIndex: ["job", "name"],
            hideInSearch: true,
        },
        {
            title: 'Company',
            dataIndex: "companyName",
            hideInSearch: true,
        },

        {
            title: 'createdAt',
            dataIndex: 'createdAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.createdAt ? dayjs(record.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {
            title: 'updatedAt',
            dataIndex: 'updatedAt',
            width: 200,
            sorter: true,
            render: (text, record, index, action) => {
                return (
                    <>{record.updatedAt ? dayjs(record.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</>
                )
            },
            hideInSearch: true,
        },
        {

            title: 'Actions',
            hideInSearch: true,
            width: 100,
            render: (_value, entity, _index, _action) => (
                <Space>
                    <EditOutlined
                        style={{
                            fontSize: 20,
                            color: '#ffa500',
                        }}
                        type=""
                        onClick={() => {
                            setOpenViewDetail(true);
                            setDataInit(entity);
                        }}
                    />

                    {/* <Popconfirm
                        placement="leftTop"
                        title={"Xác nhận xóa resume"}
                        description={"Bạn có chắc chắn muốn xóa resume này ?"}
                        onConfirm={() => handleDeleteResume(entity.id)}
                        okText="Xác nhận"
                        cancelText="Hủy"
                    >
                        <span style={{ cursor: "pointer", margin: "0 10px" }}>
                            <DeleteOutlined
                                style={{
                                    fontSize: 20,
                                    color: '#ff4d4f',
                                }}
                            />
                        </span>
                    </Popconfirm> */}
                </Space>
            ),

        },
    ];

    return (
        <div>
            <Access
                permission={ALL_PERMISSIONS.RESUMES.GET_PAGINATE}
            >
                <DataTable<IResume>
                    actionRef={tableRef}
                    headerTitle="Danh sách Resumes"
                    rowKey="id"
                    loading={isLoading}
                    columns={columns}
                    dataSource={resumes}
                    manualRequest={true}
                    scroll={{ x: true }}
                    pagination={
                        {
                            current: meta.page,
                            pageSize: meta.pageSize,
                            showSizeChanger: true,
                            total: meta.total,
                            onChange: (page, pageSize) => {
                                setQueryParams({ current: page, pageSize });
                            },
                            showTotal: (total, range) => { return (<div> {range[0]}-{range[1]} trên {total} rows</div>) }
                        }
                    }
                    rowSelection={false}
                    toolBarRender={(_action, _rows): any => {
                        return (
                            <></>
                        );
                    }}
                />
            </Access>
            <ViewDetailResume
                open={openViewDetail}
                onClose={setOpenViewDetail}
                dataInit={dataInit}
                setDataInit={setDataInit}
                reloadTable={reloadTable}
            />
        </div >
    )
}

export default ResumePage;