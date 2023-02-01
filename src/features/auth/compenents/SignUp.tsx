import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';

import { Link as RouterLink } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import { useFormik } from 'formik';

import * as yup from 'yup';

import { RootState } from '../../../store';
import { registrate } from '../slice';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
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
  name: yup
    .string()
    .required('Name is required'),
  password: yup
    .string()
    .required('Password is required'),
  retryPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must mutch')
    .required('Retry password is required')
});

export default function SignUp() {
  const classes = useStyles();

  let dispatch = useDispatch();

  let isPending = useSelector((state: RootState) => state.auth.isPending);
  let error = useSelector((state: RootState) => state.auth.error);

  const formik = useFormik({
    initialValues: {
      email: '',
      name: '',
      password: '',
      retryPassword: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setFieldValue }): Promise<void> => {
      let email = values.email;
      let name = values.name;
      let password = values.password;

      await dispatch(registrate({ email, name, password }));

      if (error) {
        setFieldValue('password', '', false);
        setFieldValue('retryPassword', '', false);
      }
    }
  }); 

  useEffect(() => {
    if (!isPending && !!error) {
      formik.setFieldError('email', error.data);
    }
  }, [isPending, error]);

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign Up
        </Typography>
        <form className={classes.form} noValidate onSubmit={ formik.handleSubmit }>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                autoComplete="fname"
                name="name"
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Name"
                value={ formik.values.name }
                onChange={ formik.handleChange }
                onBlur={ formik.handleBlur }
                error={ formik.touched.name && !!formik.errors.name }
                helperText={ formik.touched.name && formik.errors.name }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
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
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="retryPassword"
                label="Retry Password"
                type="password"
                id="retryPassword"
                autoComplete="current-password"
                value={ formik.values.retryPassword }
                onChange={ formik.handleChange }
                onBlur={ formik.handleBlur }
                error={ formik.touched.retryPassword && !!formik.errors.retryPassword }
                helperText={ formik.touched.retryPassword && formik.errors.retryPassword }
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            disabled={ !formik.dirty || !formik.isValid }
          >
            { isPending ? <CircularProgress size={ 24 } color="inherit"/> : 'Sign Up' }
          </Button>
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link component={ RouterLink } to="/login" variant="body2">
                Already have an account? Sign In
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
