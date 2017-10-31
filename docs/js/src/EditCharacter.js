import React from 'react';
import { getSlug } from './util';

/**
 * Renders the edit forms for the currently-selected character(s)
 */
export default function EditCharacter (props) {
  try {
    let { selectedCharacter } = props;

    if (!selectedCharacter) {
      return null;
    }

    // Get the character's slug (e.g. "wonderwoman")
    let slug = getSlug(selectedCharacter.links.self);

    return (
      <article className="character-modal">
        <header className="character-modal-header">
          <h1 className="name">{ selectedCharacter.name }</h1>
        </header>
        <div className="character-modal-body">
          <img className="avatar" src={ `img/avatars/${slug}.gif` } />
          <div className="info">
            <div className="name">{ selectedCharacter.name }</div>
            <div className="powers">
              {
                hero.powers.length === 0
                  ? 'none'
                  : hero.powers.join(', ')
              }
            </div>
            <div className="weakness">{ selectedCharacter.weakness || 'none' }</div>
            <div className="bio">{ selectedCharacter.bio || 'none' }</div>
          </div>
        </div>
      </article>
    );
  }
  catch (error) {
    props.errorHandler(error);
    return null;
  }
}
