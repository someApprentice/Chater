import React, { useState, useRef } from 'react';

import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';

import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import axios, { AxiosResponse } from 'axios';

import { useDebouncedEffect } from '../../../hooks/useDebouncedEffect';

import { User } from '../../../models/user';

const SEARCH_URL = '/api/users/search';

const useStyles = makeStyles((theme: Theme) => createStyles({
  searchForm: {
    display: 'flex',
    alignItems: 'center',
    boxShadow: 'none',
  },
  searchInput: {
    fontSize: '.9rem',
  },
}));

export type SearchUserFormProps = {
  setIsSearching: (isSearching: boolean) => void,
  onSearchResults: (users: User[]) => void
}

export default function SearchUserForm({
  setIsSearching,
  onSearchResults
}: SearchUserFormProps) {
  const classes = useStyles();

  let [ query, setQuery ] = useState('');

  let [isLoading, setIsLoading] = useState(false);

  // https://github.com/facebook/react/issues/14010#issuecomment-433788147
  const isLoadingRef = useRef(isLoading);
  isLoadingRef.current = isLoading;

  useDebouncedEffect(() => {
    let controller = new AbortController();

    if (query) {
      setIsSearching(true);

      search(query, controller) 
    } else {
      setIsSearching(false);
      onSearchResults([] as User[]);
    }

    return () => {
      if (isLoadingRef.current) {
        controller.abort();
      }
    };
  }, [query], 333);

  async function search(q: string, controller: AbortController) {
      setIsLoading(true);

      let response: AxiosResponse | undefined;

      try {
        response = await axios.get(
          SEARCH_URL,
          {
            params: {
              q
            },
            signal: controller.signal
          }
        );
      } catch (err) {
        console.error(err);
      }

      let results = response!.data as User[];

      setIsLoading(false);

      onSearchResults(results);
  }

  return (
    <div className={ classes.searchForm } >
      <InputBase
        id="query"
        name="query"
        value={ query }
        onChange={ (e) => setQuery(e.target.value) }
        placeholder="Search for users..."
        className={ classes.searchInput }
      />
      <IconButton aria-label="search" type="submit">
        <SearchIcon />
      </IconButton>
    </div>
  );
}
