"use strict";

const apiGateway = require("../fixtures/apiGateway");
const testData = require("../fixtures/testData");
const assert = require("../fixtures/assert");

describe("Find characters", () => {

  // Create a unique User ID for each test, so we know there aren't any existing characters
  let user;
  beforeEach(() => user = `${Date.now()}`);

  it("returns sample characters for the demo user if no characters exist", () => {
    return apiGateway
      .auth("DEMO")
      .get("/characters")
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(33);
        characters.forEach(assert.isValidCharacter);
        characters.should.satisfy(list => list.find(character => character.name === "The Fantastic Four Spaces"));
        characters.should.satisfy(list => list.find(character => character.name === "The Feature Creep"));
        characters.should.satisfy(list => list.find(character => character.name === "The Incredible MVP"));
      });
  });

  it("returns an empty array if no characters exist for a non-demo user", () => {
    return apiGateway
      .auth(user)
      .get("/characters")
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(0);
      });
  });

  it("returns all of the user's characters", () => {
    let spiderman = { name: "Spider Man", type: "hero" };
    let batman = { name: "Bat Man", type: "hero" };

    return testData.create(user, [spiderman, batman])
      .then(() => apiGateway.auth(user).get("/characters"))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [spiderman, batman]);
      });
  });

  it("returns an empty array if no characters match the criteria", () => {
    let superman = { name: "Superman", type: "hero" };
    let batman = { name: "Batman", type: "hero" };
    let joker = { name: "Joker", type: "villain" };

    return testData.create(user, [superman, batman, joker])
      .then(() => apiGateway.auth(user).get("/characters?type=sidekick"))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(0);
      });
  });

  it("returns only the characters match the name criteria", () => {
    let superman = { name: "Superman", type: "hero" };
    let batman = { name: "Batman", type: "hero" };
    let hulk = { name: "The Incredible Hulk", type: "hero" };
    let wonderWoman = { name: "Wonder Woman", type: "hero" };

    return testData.create(user, [superman, batman, hulk, wonderWoman])
      .then(() => apiGateway.auth(user).get("/characters?name=man"))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(3);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [superman, batman, wonderWoman]);
      });
  });

  it("returns only the characters match the type criteria", () => {
    let batman = { name: "Batman", type: "hero" };
    let robin = { name: "Robin", type: "sidekick" };
    let joker = { name: "Joker", type: "villain" };
    let hulk = { name: "The Incredible Hulk", type: "hero" };

    return testData.create(user, [batman, robin, joker, hulk])
      .then(() => apiGateway.auth(user).get("/characters?type=hero"))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [batman, hulk]);
      });
  });

  it("returns only the characters match both criteria", () => {
    let batman = { name: "Batman", type: "hero" };
    let robin = { name: "Robin", type: "sidekick" };
    let joker = { name: "Joker", type: "villain" };
    let hulk = { name: "The Incredible Hulk", type: "hero" };

    return testData.create(user, [batman, robin, joker, hulk])
      .then(() => apiGateway.auth(user).get("/characters?name=k&type=villain"))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(1);
        characters.forEach(assert.isValidCharacter);
        assert.matchesTestData(characters, [joker]);
      });
  });

  it("searches top-level and related characters", () => {
    let robin = { name: "Robin", type: "sidekick" };
    let joker = { name: "Joker", type: "villain" };
    let batman = { name: "Batman", type: "hero", sidekick: robin, nemesis: joker };

    return testData.create(user, [batman])
      .then(() => apiGateway.auth(user).get("/characters?name=b"))
      .then(res => {
        let characters = assert.isSuccessfulResponse(res, 200);
        characters.should.be.an("array").with.lengthOf(2);
        characters.forEach(assert.isValidCharacter);

        // Make sure Batman has links to BOTH Robin and Joker, even though Joker was not returned
        let batmanResponse = characters.find(character => character.name === "Batman");
        batmanResponse.links.should.have.keys("self", "sidekick", "nemesis");
        batmanResponse.links.sidekick.should.equal("http://localhost/characters/robin");
        batmanResponse.links.nemesis.should.equal("http://localhost/characters/joker");
      });
  });

});
