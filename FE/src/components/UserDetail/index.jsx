import React, { useState, useEffect } from "react";
import { Typography, Paper, Grid, Button, Divider } from "@mui/material"; 
import { useParams, Link } from "react-router-dom"; 

// 💡 Import file CSS riêng của bạn
import "./styles.css"; 

import fetchModel from "../../lib/fetchModelData";

function UserDetail() {
    const { userId } = useParams();
    const [user, setUser] = useState(null); 
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        setIsLoading(true);
        let mounted = true;
        if (!userId) {
            setUser(null);
            setIsLoading(false);
            return () => { mounted = false; };
        }

        fetchModel(`/api/user/${userId}`)
            .then(data => {
                if (!mounted) return;
                setUser(data || null);
            })
            .catch(err => {
                console.error('Failed to fetch user detail', err);
                if (mounted) setUser(null);
            })
            .finally(() => { if (mounted) setIsLoading(false); });

        return () => { mounted = false; };
    }, [userId]);

    if (isLoading) {
        return <Typography variant="h5">Đang tải...</Typography>;
    }

    if (!user) {
        return <Typography variant="h5">Không tìm thấy người dùng (ID: {userId}).</Typography>;
    }

    return (
        // 💡 Áp dụng class CSS cho container chính
        <Paper elevation={3} className="user-detail-container"> 
            <Typography variant="h4" gutterBottom className="user-detail-heading">
                Trang cá nhân : {user.first_name} {user.last_name}
            </Typography>
            
            <Divider style={{ margin: '15px 0' }} />

            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        <span className="user-detail-label">Vị trí:</span> {user.location}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        <span className="user-detail-label">Nghề nghiệp:</span> {user.occupation}
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body1">
                        <span className="user-detail-label">Mô tả:</span> {user.description}
                    </Typography>
                </Grid>
            </Grid>
            
            <Divider style={{ margin: '15px 0' }} />

            <Button 
                variant="contained" 
                color="primary" 
                component={Link} 
                to={`/photos/${user._id}`}
                // 💡 Áp dụng class CSS cho nút bấm
                className="photos-link-button" 
            >
                Xem Ảnh của {user.first_name}
            </Button>
        </Paper>
    );
}

export default UserDetail;