import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

export default function Navbar() {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          Business Dashboard
        </Typography>
      </Toolbar>
    </AppBar>
  );
}