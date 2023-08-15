import React, { useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem';
import PublicIcon from '@material-ui/icons/Public';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';

import { Link as RouterLink } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { RootState } from '../../../store';
import { getPrivateDialogs } from '../slice';
import { getUsers } from '../../users/slice';

import DialogComponent from './Dialog';

import { Dialog } from '../../../models/dialog';

const useStyles = makeStyles((theme: Theme) => createStyles({
  publicDialogLink: {
    display: 'flex',
    alignItems: 'center',
  }
}));


export type DialogListProps = {
  isOpen: boolean,
};

export default function DialogList({
  isOpen,
}: DialogListProps) {
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
    <>
      <List>
        <Link
          component={ RouterLink }
          to="/"
          color="inherit"
          className={ classes.publicDialogLink }
        >
          <ListItem button>
              <ListItemIcon>
                <PublicIcon />
              </ListItemIcon>

              { isOpen ? <ListItemText primary="Public" /> : null }
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
              <DialogComponent dialog={ dialog } displayNames={ isOpen } />
            </Link>
          ))
        }
      </List>
    </>
  );
}
