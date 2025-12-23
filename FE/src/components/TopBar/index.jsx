import React, { useContext } from "react";
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../AuthContext";

const MY_NAME = "PhotoShare Web";

function TopBar () {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);

    const handleLogout = async () => {
      try {
        await logout();
        navigate('/users');
      } catch (e) {
        console.error('Logout failed', e);
      }
    };

    const handleLoginClick = () => {
      navigate('/login');
    };

    const handleHiClick = () => {
      if (user && user._id) navigate(`/users/${user._id}`);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
                    {MY_NAME}
                </Typography>

                {/* 2. Bên Phải: Ngữ cảnh Ứng dụng */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {user ? (
                    <>
                      <Typography variant="subtitle1" onClick={handleHiClick} sx={{ cursor: 'pointer' }} title={`Xem thông tin ${user.first_name}`}>
                        Hi {user.first_name}
                      </Typography>
                      <Button color="inherit" onClick={handleLogout}>Logout</Button>
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1">Please Login</Typography>
                      <Button color="inherit" onClick={handleLoginClick}>Login</Button>
                    </>
                  )}

                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
