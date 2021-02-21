import React from 'react';

import { withCookies, ReactCookieProps } from 'react-cookie';

import { Helmet } from 'react-helmet';

import { Switch, Route, Link } from 'react-router-dom';

import './App.css';

const TITLE = process.env.TITLE;

type Props = {} & ReactCookieProps;

function App(props: Props) {
  return (
    <>
      <Helmet>
        <title>{ TITLE }</title>
      </Helmet>

      <h1>Chater</h1>

      <Switch>

      </Switch>
    </>
  );
}

export default withCookies(App);
