import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import PhoneIcon from '@mui/icons-material/Phone';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

export default function Sidebar() {
  const navigate = useNavigate();
  const drawerWidth = 240;

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Businesses', icon: <BusinessIcon />, path: '/businesses' },
    { text: 'Call Logs', icon: <PhoneIcon />, path: '/calls' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' }
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          marginTop: '64px'
        },
      }}
    >
      <List>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
}