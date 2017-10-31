import React from 'react';
import { getSlug } from './util';

/**
 * Renders the detailed view of the currently-selected character
 */
export default function CharacterDetails (props) {
  try {
    let { character } = props;

    // Get the character's slug (e.g. "wonderwoman")
    let slug = getSlug(character.links.self);

    return (
      <article className="character-details">
        <img className="avatar" src={ `img/avatars/${slug}.gif` } />
        <div className="info">
          <h1 className="name">{ character.name }</h1>
          <ul className="powers">
            {
              character.powers.length === 0
                ? <li className="power none">none</li>
                : character.powers.map(power => <li key={ power } className="power">{ power }</li>)
            }
          </ul>
          <ul className="weakness">
            <li className={ character.weakness ? '' : 'none' }>
              { character.weakness || 'none' }
            </li>
          </ul>
        </div>
        <div className="bio">{ character.bio || 'none other info' }</div>
      </article>
    );
  }
  catch (error) {
    props.errorHandler(error);
    return null;
  }
}
