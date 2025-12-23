import './App.css';

import React from "react";
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import LoginRegister from "./components/LoginRegister";
import { AuthProvider, AuthContext } from './AuthContext';

function RequireAuth({ children }) {
  const { user, checked } = React.useContext(AuthContext);
  if (!checked) return null; // or a loading indicator
  return user ? children : <Navigate to="/login" replace />;
}

function MainLayout() {
  const location = useLocation();
  const { user, checked } = React.useContext(AuthContext);

  // If user is navigating to /login, show a simplified layout with only TopBar and the LoginRegister view
  if (location.pathname === '/login') {
    return (
      <div>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TopBar />
          </Grid>
          <div className="main-topbar-buffer" />
          <Grid item xs={12}>
            <Paper className="main-grid-item">
              <Routes>
                <Route path="/login" element={<LoginRegister />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }

  // Default protected layout: show sidebar only when logged in
  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TopBar />
        </Grid>
        <div className="main-topbar-buffer" />
        {user ? (
          <Grid item sm={3}>
            <Paper className="main-grid-item">
              <UserList />
            </Paper>
          </Grid>
        ) : null}
        <Grid item sm={user ? 9 : 12}>
          <Paper className="main-grid-item">
            <Routes>
              <Route path="/users/:userId" element={<RequireAuth><UserDetail /></RequireAuth>} />
              <Route path="/photos/:userId" element={<RequireAuth><UserPhotos /></RequireAuth>} />
              <Route path="/users" element={<RequireAuth><UserList /></RequireAuth>} />
              <Route path="/" element={<Navigate to="/users" replace />} />
            </Routes>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <MainLayout />
      </Router>
    </AuthProvider>
  );
}

export default App;
