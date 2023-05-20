import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import { Switch, Route, RouteComponentProps } from 'react-router-dom';

import { UnauthenticatedRoute, AuthenticatedRoute, RouteWithStatus } from '../../utils/router';

import SignIn from '../auth/compenents/SignIn';
import SignUp from '../auth/compenents/SignUp';

import PublicDialog from '../messenger/components/PublicDialog';
import PrivateDialog from '../messenger/components/PrivateDialog';


const useStyles = makeStyles((theme: Theme) => createStyles({
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  appBarSpacer: theme.mixins.toolbar,
}));

export default function Main() {
  const classes = useStyles();

  return (
    <main className={ classes.content  }>
      <div className={ classes.appBarSpacer } /> 

      <Switch>
        <Route exact path="/">
          <PublicDialog />
        </Route>

        <AuthenticatedRoute
          exact
          path="/dialog/:id"
          render={
            (props: RouteComponentProps) => {
            let { id } = props.match.params as { id: string };

            return <PrivateDialog id={ id } />
          }
          }
        />

        <UnauthenticatedRoute path='/login'>
          <SignIn />
        </UnauthenticatedRoute>

        <UnauthenticatedRoute path='/registration'>
          <SignUp />
        </UnauthenticatedRoute>

        <RouteWithStatus status={ 404 }>
          <h2>404 Not Found</h2>
        </RouteWithStatus>
      </Switch>
    </main>
  );
}
