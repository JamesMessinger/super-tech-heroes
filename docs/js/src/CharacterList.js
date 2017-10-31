import React from 'react';
import { findByUrl, getSlug } from './util';

/**
 * Renders the list of heroes and their sidekicks and/or nemesis
 */
export default function CharacterList (props) {
  try {
    let { characters } = props;

    if (characters.length === 0) {
      return (
        <ul className="unstyled character-list">
          <li className="loading">Loading characters...</li>
        </ul>
      );
    }
    else {
      let heroes = characters.filter(char => char.type === 'hero');

      return (
        <ul className="unstyled character-list">
          { heroes.map(hero => <RelatedCharacters key={ hero.links.self } hero={ hero } { ...props } />) }
        </ul>
      );
    }
  }
  catch (error) {
    props.errorHandler(error);
    return null;
  }
}

/**
 * Renders a hero an its related sidekick and/or nemesis
 */
function RelatedCharacters (props) {
  let { hero, selectCharacter, characters } = props;

  // Get the related characters, if any
  let sidekick = findByUrl(characters, hero.links.sidekick);
  let nemesis = findByUrl(characters, hero.links.nemesis);

  // Get the character's slug (e.g. "wonderwoman")
  let slug = getSlug(hero.links.self);

  return (
    <li>
      <ul className="unstyled related-characters">
        <li className="hero not-empty" title={ hero.bio } onClick={ () => selectCharacter(hero) }>
          <img className="avatar" src={ `img/avatars/${slug}.gif` } />
          <div className="info">
            <div className="name">{ hero.name }</div>
            <div className="powers">
              {
                hero.powers.length === 0
                  ? 'none'
                  : hero.powers.length === 1
                    ? hero.powers[0]
                    : hero.powers[0] + ', ...'
              }
            </div>
            <div className="weakness">{ hero.weakness || 'none' }</div>
          </div>
        </li>
        <RelatedCharacter type="sidekick" character={ sidekick } { ...props } />
        <RelatedCharacter type="nemesis" character={ nemesis } { ...props } />
      </ul>
    </li>
  );
}

/**
 * Renders a related character (sidekick or villain)
 */
function RelatedCharacter (props) {
  let { type, character, selectCharacter } = props;

  // Use placeholder values if there is no related character
  let slug = character ? getSlug(character.links.self) : 'anonymous';
  let clickHandler = character ? () => selectCharacter(character) : () => true;
  let name = character ? character.name : 'none';
  let bio = character ? character.bio : '';

  return (
    <li className={ `${type} ${character ? 'not-empty' : 'empty'}` } title={ bio } onClick={ clickHandler }>
      <img className="avatar" src={ `img/avatars/${slug}.gif` } />
      <div className="name">{ name }</div>
    </li>
  );
}
