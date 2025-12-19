import { Divider, Row, Col, Statistic } from 'antd';
import { UserOutlined, TrophyOutlined, RocketOutlined, TeamOutlined } from '@ant-design/icons';
import styles from 'styles/client.module.scss';
import SearchClient from '@/components/client/search.client';
import JobCard from '@/components/client/card/job.card';
import CompanyCard from '@/components/client/card/company.card';

const HomePage = () => {
    return (
        <div className={styles["home-page"]}>
            {/* Hero Section with Gradient Background */}
            <div className={styles["hero-section"]}>
                <div className={styles["container"]}>
                    <div className={styles["hero-content"]}>
                        <h1 className={styles["hero-title"]}>
                            Tìm Việc Làm IT Mơ Ước Của Bạn
                        </h1>
                        <p className={styles["hero-subtitle"]}>
                            Kết nối với hàng nghìn công ty công nghệ hàng đầu Việt Nam
                        </p>
                        <div className={styles["search-wrapper"]}>
                            <SearchClient />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className={styles["stats-section"]}>
                <div className={styles["container"]}>
                    <Row gutter={[24, 24]}>
                        <Col xs={12} sm={6}>
                            <div className={styles["stat-card"]}>
                                <RocketOutlined className={styles["stat-icon"]} />
                                <Statistic title="Việc Làm" value={10000} suffix="+" />
                            </div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div className={styles["stat-card"]}>
                                <TrophyOutlined className={styles["stat-icon"]} />
                                <Statistic title="Công Ty" value={500} suffix="+" />
                            </div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div className={styles["stat-card"]}>
                                <UserOutlined className={styles["stat-icon"]} />
                                <Statistic title="Ứng Viên" value={50000} suffix="+" />
                            </div>
                        </Col>
                        <Col xs={12} sm={6}>
                            <div className={styles["stat-card"]}>
                                <TeamOutlined className={styles["stat-icon"]} />
                                <Statistic title="Tuyển Dụng" value={1000} suffix="+/tháng" />
                            </div>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Main Content */}
            <div className={`${styles["container"]} ${styles["home-section"]}`}>
                <CompanyCard />
                <div style={{ margin: 50 }}></div>
                <Divider />
                <JobCard />
            </div>
        </div>
    )
}

export default HomePage;