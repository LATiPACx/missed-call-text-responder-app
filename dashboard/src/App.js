import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Businesses from './pages/Businesses';
import CallLogs from './pages/CallLogs';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Navbar />
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/calls" element={<CallLogs />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;