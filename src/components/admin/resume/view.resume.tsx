import { callUpdateResumeStatus } from "@/config/api";
import { IResume } from "@/types/backend";
import { Button, DatePicker, Descriptions, Drawer, Form, Input, InputNumber, Select, message, notification } from "antd";
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
const { Option } = Select;
const { TextArea } = Input;

interface IProps {
    onClose: (v: boolean) => void;
    open: boolean;
    dataInit: IResume | null | any;
    setDataInit: (v: any) => void;
    reloadTable: () => void;
}
const ViewDetailResume = (props: IProps) => {
    const [isSubmit, setIsSubmit] = useState<boolean>(false);
    const { onClose, open, dataInit, setDataInit, reloadTable } = props;
    const [form] = Form.useForm();

    const handleChangeStatus = async () => {
        setIsSubmit(true);
        const values = await form.validateFields();
        const res = await callUpdateResumeStatus({
            id: dataInit?.id,
            status: values.status,
            rating: values.rating,
            notes: values.notes,
            interviewDateTime: values.interviewDateTime ? values.interviewDateTime.toISOString() : undefined,
            interviewer: values.interviewer,
            meetingType: values.meetingType,
            meetingLink: values.meetingLink,
            meetingLocation: values.meetingLocation,
            interviewNote: values.interviewNote,
            interviewResult: values.interviewResult,
        })
        if (res.data) {
            message.success("Update Resume status thành công!");
            setDataInit(null);
            onClose(false);
            reloadTable();
        } else {
            notification.error({
                message: 'Có lỗi xảy ra',
                description: res.message
            });
        }

        setIsSubmit(false);
    }

    useEffect(() => {
        if (dataInit) {
            form.setFieldsValue({
                status: dataInit.status,
                rating: dataInit.rating,
                notes: dataInit.notes,
                interviewDateTime: dataInit.interviewDateTime ? dayjs(dataInit.interviewDateTime) : null,
                interviewer: dataInit.interviewer,
                meetingType: dataInit.meetingType,
                meetingLink: dataInit.meetingLink,
                meetingLocation: dataInit.meetingLocation,
                interviewNote: dataInit.interviewNote,
                interviewResult: dataInit.interviewResult,
            })
        }
        return () => form.resetFields();
    }, [dataInit])

    return (
        <>
            <Drawer
                title="Thông Tin Resume"
                placement="right"
                onClose={() => { onClose(false); setDataInit(null) }}
                open={open}
                width={"40vw"}
                maskClosable={false}
                destroyOnClose
                extra={

                    <Button loading={isSubmit} type="primary" onClick={handleChangeStatus}>
                        Change Status
                    </Button>

                }
            >
                <Descriptions title="" bordered column={2} layout="vertical">
                    <Descriptions.Item label="Email">{dataInit?.email}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Form form={form} layout="vertical">
                            <Form.Item name={"status"} rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}>
                                <Select style={{ width: "100%" }}>
                                    <Option value="PENDING">PENDING</Option>
                                    <Option value="REVIEWING">REVIEWING</Option>
                                    <Option value="SHORTLISTED">SHORTLISTED</Option>
                                    <Option value="INTERVIEW_SCHEDULED">INTERVIEW_SCHEDULED</Option>
                                    <Option value="INTERVIEWED">INTERVIEWED</Option>
                                    <Option value="OFFERED">OFFERED</Option>
                                    <Option value="HIRED">HIRED</Option>
                                    <Option value="APPROVED">APPROVED</Option>
                                    <Option value="REJECTED">REJECTED</Option>
                                    <Option value="WITHDRAWN">WITHDRAWN</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name={"rating"} label="Rating (1-5)">
                                <InputNumber min={1} max={5} style={{ width: "100%" }} />
                            </Form.Item>

                            <Form.Item name={"notes"} label="Ghi chú HR">
                                <TextArea rows={3} />
                            </Form.Item>

                            <Form.Item name={"interviewDateTime"} label="Lịch phỏng vấn">
                                <DatePicker showTime style={{ width: "100%" }} format="DD-MM-YYYY HH:mm:ss" />
                            </Form.Item>

                            <Form.Item name={"interviewer"} label="Người phỏng vấn">
                                <Input />
                            </Form.Item>

                            <Form.Item name={"meetingType"} label="Hình thức">
                                <Select allowClear>
                                    <Option value="ONLINE">ONLINE</Option>
                                    <Option value="OFFLINE">OFFLINE</Option>
                                    <Option value="HYBRID">HYBRID</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item name={"meetingLink"} label="Link họp">
                                <Input />
                            </Form.Item>

                            <Form.Item name={"meetingLocation"} label="Địa điểm">
                                <Input />
                            </Form.Item>

                            <Form.Item name={"interviewNote"} label="Ghi chú phỏng vấn">
                                <TextArea rows={3} />
                            </Form.Item>

                            <Form.Item name={"interviewResult"} label="Kết quả phỏng vấn">
                                <Input />
                            </Form.Item>
                        </Form>

                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Job">
                        {dataInit?.job?.name}

                    </Descriptions.Item>
                    <Descriptions.Item label="Tên Công Ty">
                        {dataInit?.companyName}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">{dataInit && dataInit.createdAt ? dayjs(dataInit.createdAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>
                    <Descriptions.Item label="Ngày sửa">{dataInit && dataInit.updatedAt ? dayjs(dataInit.updatedAt).format('DD-MM-YYYY HH:mm:ss') : ""}</Descriptions.Item>

                </Descriptions>
            </Drawer>
        </>
    )
}

export default ViewDetailResume;