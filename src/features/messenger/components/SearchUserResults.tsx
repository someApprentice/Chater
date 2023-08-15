import React from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ForumIcon from '@material-ui/icons/Forum';
import Typography from '@material-ui/core/Typography';
import { green } from '@material-ui/core/colors';

import { useHistory } from 'react-router-dom';

import axios, { AxiosResponse } from 'axios';

import { useSelector } from 'react-redux';

import { RootState } from '../../../store';

import { User } from '../../../models/user';
import { Dialog } from '../../../models/dialog';

const CREATE_PRIVATE_DIALOG_URL = '/api/messenger/dialog/private';

const useStyles = makeStyles((theme: Theme) => createStyles({
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  searchResult: {
    '&:hover $startDialog': {
      color: green[500],
    },
  },
  notFound: {
    padding: '16px'
  },
  startDialog: {},
}));

export type SearchUserResultsProps = {
  results: User[]
};

export default function SearchUserResults({
  results
}: SearchUserResultsProps) {
  const classes = useStyles();

  let history = useHistory();

  let user = useSelector((state: RootState) => state.auth.user);

  async function createPrivateDialog(id: string) {
    let response: AxiosResponse | undefined;

    try {
      response = await axios.post(
        CREATE_PRIVATE_DIALOG_URL,
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

  return (
    <>
      {
        results.length > 0
          ? <List>
            {
              results.map((user: User) => (
                <ListItem
                  onClick={ () => { createPrivateDialog(user.id) } }
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
        : <Typography className={ classes.notFound }>No Users found.</Typography>
      }
    </>
  );
}
