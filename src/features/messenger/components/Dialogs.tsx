import React, { useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem';
import PublicIcon from '@material-ui/icons/Public';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Link from '@material-ui/core/Link';
import { Link as RouterLink } from 'react-router-dom';

import clsx from 'clsx';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getPrivateDialogs } from '../slice';
import { getUsers } from '../../users/slice';

import DialogComponent from './Dialog';

import { Dialog } from '../../../models/dialog';

export const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => createStyles({
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    [theme.breakpoints.down('lg')]: {
      position: 'absolute',
    },
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(9),
    [theme.breakpoints.down('lg')]: {
      width: 0,
    },
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  publicDialogLink: {
    display: 'flex',
    alignItems: 'center',
  },
  publicDialogListItem: {
    maxWidth: '0',
  }
}));

export type DialogsProps = {
  isOpen: boolean,
  handleDialogsClose: () => void
};

export default function Dialogs({
  isOpen,
  handleDialogsClose
}: DialogsProps) {
  const classes = useStyles();

  let dispatch = useDispatch();

  let user = useSelector((state: RootState) => state.auth.user);

  let dialogs = useSelector((state: RootState) => {
    return state
      .messenger
      .dialogs
      .filter((dialog: Dialog) => dialog.type === 'private')
      .slice()
      .sort((a: Dialog, b: Dialog) => b.updated_at - a.updated_at);
  });

  let privateDialogsPartyIds = dialogs.reduce((acc, cur: Dialog) => {
    let id = cur.party!.find((id: string) => id !== user?.id)!;

    acc.push(id);

    return acc;
  }, [] as string[]);

  useEffect(() => {
    if (!dialogs.length) {
      dispatch(getPrivateDialogs());
    }
  }, [!dialogs.length]);

  useEffect(() => {
    dispatch(getUsers({ ids: privateDialogsPartyIds }));
  }, [JSON.stringify(privateDialogsPartyIds)]);

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !isOpen && classes.drawerPaperClose),
      }}
      open={ isOpen }
    >
      <div className={ classes.toolbar } >
        <IconButton onClick={ handleDialogsClose }>
          <ChevronLeftIcon />
        </IconButton>
      </div>

      <Divider />

      <List>
        <ListItem button>
          <Link
            component={ RouterLink }
            to="/"
            color="inherit"
            className={ classes.publicDialogLink }
          >
            <ListItemIcon><PublicIcon /></ListItemIcon>

            { isOpen ? <ListItemText primary="Public Dialog" /> : null }
          </Link>
        </ListItem>
      </List>

      <Divider />

      <List>
        {
          dialogs.map((dialog: Dialog) => (
            <ListItem button>
              <Link
                key={ dialog.id }
                component={ RouterLink }
                to={ `/dialog/${ dialog.id }` }
                color="inherit"
              >
                <DialogComponent dialog={ dialog } />
              </Link>
            </ListItem>
          ))
        }
      </List>
    </Drawer>
  );
}
