import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Button from '@material-ui/core/Button';

import clsx from 'clsx';

import { Link as RouterLink } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { RootState } from '../../store';

import { drawerWidth } from '../messenger/components/Dialogs';

import LogOut from '../auth/compenents/LogOut';

const useStyles = makeStyles((theme: Theme) => createStyles({
  title: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 12,
  },
  menuButtonHidden: {
    display: 'none',
  }
}));

export type HeaderParams = {
  isDialogsOpen: boolean,
  handleDialogsOpen: () => void,
};

export default function Header({ isDialogsOpen, handleDialogsOpen }: HeaderParams) {
  const classes = useStyles();

  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
      <AppBar
        position="absolute"
        className={ clsx(classes.appBar, (isAuthenticated && isDialogsOpen) && classes.appBarShift) }
      >
        <Toolbar>
          { isAuthenticated
            ? <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={ handleDialogsOpen }
                className={ clsx(classes.menuButton, isDialogsOpen && classes.menuButtonHidden) }
              >
                <MenuIcon />
              </IconButton>
            : null
          }

          <Link
            component={ RouterLink }
            to="/" color="inherit"
            className={ classes.title }
          >
            <Typography variant="h6" className={ classes.title }>Chater</Typography>
          </Link>

          { !isAuthenticated
            ? <Link
                component={ RouterLink }
                to="/login"
                color="inherit"
              >
                <Button color="inherit">Login</Button>
              </Link>
            : null 
          }
          
          { !isAuthenticated
            ? <Link
                component={ RouterLink }
                to="/registration"
                color="inherit"
              >
                <Button color="inherit">Registration</Button>
              </Link>
            : null
          }

          { isAuthenticated
            ? <LogOut />
            :null
          }
        </Toolbar>
      </AppBar>
  );
}
