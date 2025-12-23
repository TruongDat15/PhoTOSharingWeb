// components/UserList/UserList.jsx
import React, { useEffect, useState } from "react";
import { Link } from 'react-router-dom'; // 💡 Thêm import Link
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";

import "./styles.css";
import fetchModel from "../../lib/fetchModelData";


/**
 * Định nghĩa UserList, một component React.
 */
function UserList () {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetchModel('/api/user')
            .then(data => {
                if (!mounted) return;
                setUsers(Array.isArray(data) ? data : []);
            })
            .catch(err => {
                console.error('Failed to fetch user list', err);
                // fallback: empty list
                if (mounted) setUsers([]);
            })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);
    return (
      <div>
        <Typography variant="body1">
          <strong>Danh sách Người dùng</strong>
        </Typography>
        
        {loading ? (
          <Typography variant="body2">Đang tải danh sách người dùng...</Typography>
        ) : (
          <List component="nav">
            {users.map((user) => ( // Đổi tên biến sang 'user' cho dễ đọc
              <div key={user._id}>
                {/* Sử dụng ListItem với component={Link} để tạo liên kết điều hướng */}
                <ListItem
                  button
                  component={Link}
                  to={`/users/${user._id}`} // Liên kết tới trang chi tiết
                >
                  <ListItemText primary={`${user.first_name} ${user.last_name}`} />
                </ListItem>
                <Divider />
              </div>
            ))}
          </List>
        )}
      </div>
    );
}

export default UserList;