import React, { useState, useContext } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { AuthContext } from '../../AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginRegister() {
  const { login } = useContext(AuthContext);
  const [loginName, setLoginName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError(null);
    try {
      const data = await login(loginName, password);
      // Nếu login thành công, điều hướng tới trang chi tiết người dùng
      if (data && data._id) {
        navigate(`/users/${data._id}`);
      } else {
        // fallback: về trang users
        navigate('/users');
      }
    } catch (e) {
      setError(e.message || 'Login failed');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5">Please Login</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
        <TextField label="Login Name" value={loginName} onChange={(e) => setLoginName(e.target.value)} />
        <TextField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <Typography color="error">{error}</Typography>}
        <Button variant="contained" onClick={handleLogin}>Login</Button>
      </Box>
    </Box>
  );
}

export default LoginRegister;
