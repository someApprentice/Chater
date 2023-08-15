import React, { useState } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import clsx from 'clsx';

import SearchUserForm from './SearchUserForm';
import DialogList from './DialogList';
import SearchUserResults from './SearchUserResults';

import { User } from '../../../models/user';

export const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) => createStyles({
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    '&::-webkit-scrollbar': {
      height: 0,
      opacity: 0,
      width: '0.375rem',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.2)',
      borderRadius: '10px',
      maxHeight: '12.5rem',
      minHeight: '5rem',
      opacity: 1,
    },
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

  let [ isSearching, setIsSearching ] = useState(false);

  let [ searchResults, setSearchResults ] = useState([] as User[]);

  function onSearchResults(users: User[]) {
    setSearchResults(users);
  }

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !isOpen && classes.drawerPaperClose),
      }}
      open={ isOpen }
    >
      <div className={ classes.toolbar } >
        <SearchUserForm setIsSearching={ setIsSearching } onSearchResults={ onSearchResults } />

        <Divider orientation="vertical" />

        <IconButton onClick={ handleDialogsClose }>
          <ChevronLeftIcon />
        </IconButton>
      </div>

      <Divider />

      {
        !isSearching
          ? <DialogList isOpen={ isOpen } />
          : <SearchUserResults results={ searchResults } />
      }
    </Drawer>
  );
}
