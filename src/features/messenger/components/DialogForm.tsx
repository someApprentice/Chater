import { useRef, useState, useEffect } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import SendIcon from '@material-ui/icons/Send';

import { useSelector } from 'react-redux';

import { useFormik } from 'formik';

import * as yup from 'yup';

import axios, { AxiosResponse } from 'axios';

import { RootState } from '../../../store';

import { Dialog } from '../../../models/dialog';

export type DialogFormParams = {
  dialog: Dialog,
  params?: {
    [key: string]: any
  }
}

const useStyles = makeStyles((theme: Theme) => createStyles({
  messageForm: {
    [theme.breakpoints.up('lg')]: {
      padding: theme.spacing(2),
    }
  },
  sendButtonWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  sendButton: {
    margin: '6px 0',
  },
  sendButtonText: {
    [theme.breakpoints.down('lg')]: {
      display: 'none',
    },
  }
}));

const validationSchema = yup.object({
  content: yup
    .string()
    .required('Content is required')
});

export default function DialogForm({ dialog, params = {} }: DialogFormParams) {
  const classes = useStyles();

  const formRef = useRef<HTMLFormElement>(null);

  let user = useSelector((state: RootState) => state.auth.user);

  let [ url, setUrl ] = useState('');

  useEffect(() => {
    if (dialog) {
      setUrl(`/api/messenger/message/${dialog.type}`);
    }
  }, [!!dialog]);

  const formik = useFormik({
    initialValues: {
      content: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { setFieldValue }) => {
      let response: AxiosResponse | undefined;

      try {
        response = await axios.post(
          url,
          {
            content: values.content
          },
          {
            headers: {
              Authorization: `Bearer ${ user!.hash }`
            },
            params,
            withCredentials: true
          }
        );
      } catch (err) {
        console.error(err);
      }

      setFieldValue('content', '', false);
    }
  }); 

  return (
    <form 
      ref={ formRef }
      aria-label="message-form"
      className={ classes.messageForm }
      onSubmit={ formik.handleSubmit }
      onKeyUp={ (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          formRef.current!.requestSubmit();
        }
      } }
    >
      <TextField
        id="content"
        name="content"
        value={ formik.values.content }
        onChange={ formik.handleChange }
        required
        multiline
        fullWidth
        maxRows={ 1 }
      />

      <div className={ classes.sendButtonWrapper }>
        <Button
          type="submit"
          variant="outlined"
          color="primary"
          className={ classes.sendButton }
          disabled={ !dialog || !formik.dirty || !formik.isValid }
        >
          <span className={ classes.sendButtonText }>Send</span><SendIcon />
        </Button>
      </div>
    </form>
  );
}
