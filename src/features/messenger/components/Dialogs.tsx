import React, { useState, useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Drawer from '@material-ui/core/Drawer';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem';
import PublicIcon from '@material-ui/icons/Public';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ForumIcon from '@material-ui/icons/Forum';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import Link from '@material-ui/core/Link';
import { green } from '@material-ui/core/colors';

import { Link as RouterLink, useHistory } from 'react-router-dom';

import clsx from 'clsx';

import { useFormik } from 'formik';

import * as yup from 'yup';

import axios, { AxiosResponse } from 'axios';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getPrivateDialogs } from '../slice';
import { getUsers } from '../../users/slice';

import DialogComponent from './Dialog';

import { User } from '../../../models/user';
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
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    boxShadow: 'none',
  },
  searchInput: {
    fontSize: '.9rem',
  },
  publicDialogLink: {
    display: 'flex',
    alignItems: 'center',
  },
  publicDialogListItem: {
    maxWidth: '0',
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchResult: {
    '&:hover $startDialog': {
      color: green[500],
    },
  },
  startDialog: {},
}));

const validationSchema = yup.object({
  query: yup
    .string()
    .required('Query is required')
});

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

  let history = useHistory();

  const formik = useFormik({
    initialValues: {
      query: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values) => {
      let q = values.query;

      let response: AxiosResponse | undefined;

      try {
        response = await axios.get(
          '/api/users/search',
          {
            params: {
              q
            },
          }
        );
      } catch (err) {
        console.error(err);
      }

      let results = response!.data as User[];

      setSearchResults(results);
    }
  });

  let [ isSearching, setIsSearching ] = useState(false);

  let [ searchResults, setSearchResults ] = useState([] as User[]);

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

  useEffect(() => {
    setIsSearching(formik.dirty && !!formik.submitCount);

    // reset form after erased field
    if (!formik.dirty && !!formik.submitCount) {
      formik.resetForm();
    }
  }, [formik.dirty && !!formik.submitCount]);

  async function onDialogStart(id: string) {
    let response: AxiosResponse | undefined;

    try {
      response = await axios.post(
        '/api/messenger/dialog/private',
        null,
        {
          params: {
            id
          },
          headers: {
            Authorization: `Bearer ${ user!.hash }`
          }
        }
      );
    } catch (err) {
      console.error(err);
    }

    let dialog = response!.data as Dialog;

    history.replace(`/dialog/${ dialog.id }`);
  }

  const dialogList = (
    <>
      <List>
        <Link
          component={ RouterLink }
          to="/"
          color="inherit"
          className={ classes.publicDialogLink }
        >
          <ListItem button>
              <ListItemIcon><PublicIcon /></ListItemIcon>

              { isOpen ? <ListItemText primary="Public Dialog" /> : null }
          </ListItem>
        </Link>
      </List>

      <Divider />

      <List>
        {
          dialogs.map((dialog: Dialog) => (
            <Link
              component={ RouterLink }
              to={ `/dialog/${ dialog.id }` }
              color="inherit"
              key={ dialog.id }
            >
              <ListItem button>
                  <DialogComponent dialog={ dialog } />
              </ListItem>
            </Link>
          ))
        }
      </List>
    </>
  );

  const searchResultList = (
    <>
      <List>
        {
          searchResults.map((user: User) => (
            <ListItem
              onClick={ () => { onDialogStart(user.id) } }
              button
              key={ user.id }
              className={ classes.searchResult }
            >
              <ListItemText primary={ user.name } className={ classes.name } />
              <ListItemIcon>
                <ForumIcon
                  className={ classes.startDialog }
                />
              </ListItemIcon>
            </ListItem>
          ))
        }
      </List>
    </>
  );

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: clsx(classes.drawerPaper, !isOpen && classes.drawerPaperClose),
      }}
      open={ isOpen }
    >
      <div className={ classes.toolbar } >
        <form className={ classes.searchForm } onSubmit={ formik.handleSubmit } >
          <InputBase
            id="query"
            name="query"
            value={ formik.values.query }
            onChange={ formik.handleChange }
            placeholder="Search for users..."
            className={ classes.searchInput }
          />
          <IconButton aria-label="search" type="submit">
            <SearchIcon />
          </IconButton>
        </form>

        <Divider orientation="vertical" />

        <IconButton onClick={ handleDialogsClose }>
          <ChevronLeftIcon />
        </IconButton>
      </div>

      <Divider />

      {
        !isSearching
          ? dialogList
          : searchResultList
      }
    </Drawer>
  );
}
