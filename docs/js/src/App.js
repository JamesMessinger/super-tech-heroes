import React from 'react';
import axios from 'axios';
import { getQueryParam } from './util';
import CharacterList from './CharacterList';
import EditCharacter from './EditCharacter';

/**
 * The entire Super Tech Heroes app
 */
export default class App extends React.Component {
  constructor (props) {
    super(props);

    // Create an Axios instance that's setup for the Super Tech Heroes API
    this.request = axios.create({
      baseURL: getQueryParam('API_ROOT', 'https://api.heroes.bigstickcarpet.com'),
      headers: {
        'X-API-Key': getQueryParam('API_KEY', 'DEMO'),
      },
    });

    // Bind methods to this instance, so they can be called as standalone functions
    this.selectCharacter = this.selectCharacter.bind(this);
    this.errorHandler = this.errorHandler.bind(this);

    this.state = {
      // The last error that occurred
      error: null,

      // The array of all characters
      characters: [],

      // The character that is currently selected for editing
      selectedCharacter: null,

      // Expose app methods as standalone functions
      request: this.request,
      selectCharacter: this.selectCharacter,
      errorHandler: this.errorHandler,
    };
  }

  /**
   * Immediately populates the full list of characters when the app is mounted
   */
  componentDidMount () {
    this.request('/characters')
      .then(response => {
        this.setState({ characters: response.data });
      })
      .catch(this.errorHandler);
  }

  /**
   * Renders the entire app
   */
  render () {
    return [
      <ErrorMessage key="1" error={this.state.error} />,
      <CharacterList key="2" { ...this.state } />,
      <EditCharacter key="3" { ...this.state } />
    ];
  }

  /**
   * Sets the `selectedCharacter` state
   *
   * @param {object} [selectedCharacter] - The selected character, or null to clear the selection
   */
  selectCharacter (character) {
    if (character) {
      console.log(`${character.name} was selected`);
    }
    else {
      console.log('No character is selected');
    }

    // this.setState({ selectedCharacter: character });
  }

  /**
   * Handles errors by setting the `error` state to the appropriate message
   *
   * @param {Error} error
   */
  errorHandler (error) {
    let errorCode, errorMessage;

    if (error.response && error.response.data && error.response.data.message) {
      errorCode = error.response.data.error;
      errorMessage = error.response.data.message;
    }
    else if (error.response && error.response) {
      errorCode = error.response.status;
      errorMessage = error.response.statusText;
    }
    else {
      errorCode = error.name || error.type || 'Error';
      errorMessage = error.message || 'Unknown error';
    }

    this.setState({ error: `${errorCode}: ${errorMessage}` });
  }
}

/**
 * Renders the error message
 *
 * @param {string} error - The error message to show
 */
function ErrorMessage ({ error }) {
  return error
    ? <div className="error-message">{ error }</div>
    : null;
}
