import { Route, RouteProps, Redirect, RedirectProps, RouteComponentProps } from 'react-router-dom';

import { useSelector } from 'react-redux';

import { RootState } from '../store';

export function AuthenticatedRoute(props: RouteProps) {
  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { render, children, ...rest } = props;

  return (
    <Route
      { ...rest }
      render={
        (p: RouteComponentProps) => (
          isAuthenticated
            ? (render ? render(p) : children)
            : (
                <RedirectWithStatus
                  status={ 302 }
                  to={
                    {
                      pathname: '/',
                      state: { from: p.location }
                    }
                  }
                  { ...p }
                />
              )
        )
      }
    />
  );
}

export function UnauthenticatedRoute(props: RouteProps) {
  let isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const { render, children, ...rest } = props;

  return (
    <Route
      { ...rest }
      render={
          (p: RouteComponentProps) => (
            !isAuthenticated
              ? (render ? render(p) : children)
              : (
                  <RedirectWithStatus
                    status={ 302 }
                    to={
                      {
                        pathname: '/',
                        state: { from: p.location }
                      }
                    }
                    { ...p }
                  />
               )
          )
      }
    />
  );
}

export type RedirectWithStatusProps = { status: number } & RouteComponentProps & RedirectProps;

export function RedirectWithStatus(props: RedirectWithStatusProps) {
  if (props.staticContext)
    props.staticContext.statusCode = props.status;

  return (
    <Redirect from={ props.from } to={ props.to } />
  );
}

export type RouteWithStatusProps = { status: number } & RouteProps;

export function RouteWithStatus(props: RouteWithStatusProps) {
  const { render, children, status, ...rest } = props;

  return (
    <Route
      { ...rest }
      render={
        (p: RouteComponentProps) => {
          if (p.staticContext)
            p.staticContext.statusCode = status;

          return children;
        }
      }
    />
  );
}
