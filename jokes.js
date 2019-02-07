class Jokes {
  constructor() {
    this.jokes = [
      'In Soviet Russia, Pikachu catches you.',
      'In Soviet Russia, kitten adopts you.',
      'In Soviet Russia, Big Brother watch you.',
      'In Soviet Russia, joke laughs at you.',
      'In Soviet Russia, Waldo find you.',
      'In Soviet Russia, presents open you.',
      'In Soviet Russia, Chuck Norris _still_ kicks your ass.',
      'In Soviet Russia, car drives you.',
      'In Soviet Russia, it _is_ lupus.',
      'In Soviet Russia, damsel distresses you.',
      'In Soviet Mordor, Boromir walks into you.',
      'In Soviet Russia, Mudkip lieks u',
      'Do Russians have "In capitalist America" jokes?',
      'Roses are red, violets are blue, in Soviet Russia, poem write you.',
      'In Soviet Russia, you arm bears.',
      'In Soviet Russia, law breaks you.',
      'In Soviet Russia, the joke gets you!'
    ];
  }

  getJoke() {
    const jokeIndex = Math.floor(Math.random() * this.jokes.length);
    return this.jokes[jokeIndex];
  }
}

module.exports = new Jokes();