import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import ListItemText from '@material-ui/core/ListItemText';

import { useSelector } from 'react-redux';

import { RootState } from '../../../store';

import { User } from '../../../models/user';
import { Dialog } from '../../../models/dialog';

const useStyles = makeStyles((theme: Theme) => createStyles({
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

export type DialogProps = {
  dialog: Dialog
};

export default function Dialog({ dialog }: DialogProps) {
  const classes = useStyles();

  let user = useSelector((state: RootState) => state.auth.user);

  let partyId = dialog.party!.find((id: string) => id !== user!.id);

  let party = useSelector((state: RootState) => {
    return state
      .users
      .users
      .find((u: User) => u.id === partyId)
  });

  return (
    <ListItemText primary={ party ? party.name : "Unknown" }  className={ classes.name }/>
  );
}
