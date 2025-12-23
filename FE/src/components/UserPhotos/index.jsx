import React, { useState, useEffect, useContext } from "react";
import { Link, useParams } from "react-router-dom"; // 💡 Thêm Link
import { 
    Typography, 
    Paper, 
    Grid, 
    Divider, 
    Card, 
    CardContent, 
    CardMedia,
    Box,
    TextField,
    Button
} from "@mui/material";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";
import { AuthContext } from '../../AuthContext';

// Hàm tiện ích để định dạng ngày tháng thân thiện hơn (Yêu cầu của Lab)
const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Không rõ ngày';
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateTimeString).toLocaleDateString('vi-VN', options);
};

/**
 * Define UserPhotos, component hiển thị tất cả ảnh và bình luận của người dùng.
 */
function UserPhotos () {
    // 1. Lấy userId từ URL
    const { userId } = useParams();
    const { user } = useContext(AuthContext);

    // State để lưu trữ dữ liệu ảnh và thông tin người dùng
    const [photos, setPhotos] = useState([]);
    const [userName, setUserName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [commentText, setCommentText] = useState({}); // map photoId -> text
    const [posting, setPosting] = useState({}); // map photoId -> bool
    const [commentError, setCommentError] = useState({});

    // 2. Tải dữ liệu khi userId thay đổi
    useEffect(() => {
        setIsLoading(true);
        let mounted = true;
        if (!userId) {
            setUserName('Người dùng không xác định');
            setPhotos([]);
            setIsLoading(false);
            return;
        }

        // Fetch user detail for heading
        fetchModel(`/api/user/${userId}`)
            .then(user => {
                if (!mounted) return;
                if (user) setUserName(`${user.first_name} ${user.last_name}`);
                else setUserName('Người dùng không xác định');
            })
            .catch(err => {
                console.error('Failed to fetch user for UserPhotos', err);
                if (mounted) setUserName('Người dùng không xác định');
            });

        // Fetch photos for the user. Backend expects /api/photo/photosOfUser/:id
        fetchModel(`/api/photo/photosOfUser/${userId}`)
            .then(data => {
                if (!mounted) return;
                const photosArr = Array.isArray(data) ? data : (data && data.photos) ? data.photos : [];
                setPhotos(photosArr || []);
            })
            .catch(err => {
                console.error('Failed to fetch photos for user', err);
                if (mounted) setPhotos([]);
            })
            .finally(() => { if (mounted) setIsLoading(false); });

        return () => { mounted = false; };

    }, [userId]); // Chạy lại khi userId thay đổi

    const handleCommentChange = (photoId, text) => {
      setCommentText(prev => ({ ...prev, [photoId]: text }));
    };

    const handlePostComment = async (photoId) => {
      // ensure user logged in
      if (!user || !user._id) {
        setCommentError(prev => ({ ...prev, [photoId]: 'Bạn cần đăng nhập để bình luận' }));
        return;
      }
      const text = (commentText[photoId] || '').trim();
      if (!text) {
        setCommentError(prev => ({ ...prev, [photoId]: 'Bình luận không được rỗng' }));
        return;
      }

      setPosting(prev => ({ ...prev, [photoId]: true }));
      setCommentError(prev => ({ ...prev, [photoId]: null }));

      try {
        const base = process.env.REACT_APP_API_BASE || '';
        const res = await fetch(`${base}/api/comment`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ photo_id: photoId, user_id: user._id, comment: text }),
        });
        if (!res.ok) {
          const t = await res.text();
          throw new Error(t || `HTTP ${res.status}`);
        }
        const newC = await res.json();

        // update local state: append comment to target photo
        setPhotos(prev => prev.map(p => {
          if (String(p._id) !== String(photoId)) return p;
          const comments = p.comments ? [...p.comments, newC] : [newC];
          return { ...p, comments };
        }));

        // clear input
        setCommentText(prev => ({ ...prev, [photoId]: '' }));
      } catch (err) {
        console.error('Post comment failed', err);
        setCommentError(prev => ({ ...prev, [photoId]: err.message || 'Lỗi khi gửi bình luận' }));
      } finally {
        setPosting(prev => ({ ...prev, [photoId]: false }));
      }
    };

    if (isLoading) {
        return <Typography variant="h5">Đang tải ảnh...</Typography>;
    }
    
    // Nếu không có ảnh
    if (photos.length === 0) {
        return <Typography variant="h5">Người dùng {userName} chưa có ảnh nào.</Typography>;
    }
    
    // 3. Hiển thị Ảnh và Bình luận lồng nhau
    return (
        <Paper elevation={3} style={{ padding: '20px' }}>
            <Typography variant="h4" gutterBottom>
                Ảnh của {userName}
            </Typography>

            <Divider style={{ margin: '15px 0' }} />

            <Grid container spacing={4}>
                {photos.map(photo => (
                    <Grid item xs={12} key={photo._id}>
                        <Card elevation={4}>
                            <CardContent>
                                <Typography variant="caption" color="textSecondary">
                                    Đăng vào: {formatDateTime(photo.date_time)}
                                </Typography>
                            </CardContent>

                            {/* Hiển thị Ảnh */}
                            <CardMedia
                                component="img"
                                image={`http://localhost:5000/images/${photo.file_name}` || `/images/${photo.file_name}`}
                                alt={`Ảnh của ${userName}`}
                                style={{ maxHeight: '500px', objectFit: 'contain' }}
                            />

                            {/* Hiển thị Bình luận */}
                            <CardContent>
                                <Typography variant="h6" component="div" style={{ marginTop: '10px' }}>
                                    Bình luận ({photo.comments ? photo.comments.length : 0})
                                </Typography>

                                {photo.comments && photo.comments.length > 0 ? (
                                    <Box style={{ paddingLeft: '10px', borderLeft: '3px solid #ccc' }}>
                                        {photo.comments.map(comment => (
                                            <Box key={comment._id} sx={{ mb: 1, p: 1, border: '1px dashed #eee' }}>
                                                <Typography variant="body2">
                                                    {comment.comment}
                                                </Typography>
                                                <Typography variant="caption" display="block">
                                                    Bởi:
                                                    {comment.user ? (
                                                      <Link to={`/users/${comment.user._id}`} style={{ marginLeft: '5px' }}>
                                                        {comment.user.first_name} {comment.user.last_name}
                                                      </Link>
                                                    ) : (
                                                      <span style={{ marginLeft: '5px' }}>Unknown</span>
                                                    )}
                                                </Typography>
                                                <Typography variant="caption" display="block" color="textSecondary">
                                                    Ngày: {formatDateTime(comment.date_time)}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Chưa có bình luận nào cho ảnh này.
                                    </Typography>
                                )}

                                {/* Comment input (only show when logged in) */}
                                {user ? (
                                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                                    <TextField
                                      size="small"
                                      fullWidth
                                      placeholder="Viết bình luận..."
                                      value={commentText[photo._id] || ''}
                                      onChange={(e) => handleCommentChange(photo._id, e.target.value)}
                                    />
                                    <Button variant="contained" onClick={() => handlePostComment(photo._id)} disabled={!!posting[photo._id]}>
                                      {posting[photo._id] ? 'Đang gửi...' : 'Gửi'}
                                    </Button>
                                  </Box>
                                ) : (
                                  <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                                    Vui lòng đăng nhập để viết bình luận.
                                  </Typography>
                                )}

                                {commentError[photo._id] && (
                                  <Typography color="error" variant="body2">{commentError[photo._id]}</Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Paper>
    );
}

export default UserPhotos;

