import React, { useEffect } from 'react';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import CircularProgress from '@material-ui/core/CircularProgress';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { Link as RouterLink } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { useFormik } from 'formik';

import * as yup from 'yup';

import { RootState } from '../../../store';
import { login } from '../slice';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

export default function SignIn() {
  const classes = useStyles();

  let dispatch = useDispatch();

  let isPending = useSelector((state: RootState) => state.auth.isPending);
  let error = useSelector((state: RootState) => state.auth.error);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setFieldValue }): Promise<void> => {
      let email = values.email;
      let password = values.password;

      await dispatch(login({ email, password }));

      setFieldValue('password', '', false);
    }
  }); 

  useEffect(() => {
    if (!isPending && !!error) {
      formik.setFieldError('password', error.data);
    }
  }, [isPending, error]);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign In
        </Typography>
        <form className={classes.form} noValidate onSubmit={ formik.handleSubmit }>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={ formik.values.email }
            onChange={ formik.handleChange }
            onBlur={ formik.handleBlur }
            error={ formik.touched.email && !!formik.errors.email }
            helperText={ formik.touched.email && formik.errors.email }
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={ formik.values.password }
            onChange={ formik.handleChange }
            onBlur={ formik.handleBlur }
            error={ formik.touched.password && !!formik.errors.password }
            helperText={ formik.touched.password && formik.errors.password }
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={ !formik.dirty || !formik.isValid }
          >
            { isPending ? <CircularProgress size={ 24 } color="inherit"/> : 'Sign In' }
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Link component={ RouterLink } to="/registration" variant="body2">
                Don't have an account? Sign Up
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
