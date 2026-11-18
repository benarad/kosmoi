// The gods of the Timaeus, for the margin: what Timaeus calls each, where,
// what he says of it, and how it is disputed. Pure data, so that the tests can
// read it. The grounds for every name in a `dispute` are in
// reference/notes/timaeus-model.md.
//
// `greek` is a phrase of Burnet's text, letter for letter, and `called` is
// what it says. `at` is the step of the sequence (by its place in the text) in
// which the making of the god is told; `from`, where it differs, is the step
// from which the god is already there in the telling. `lit` is what a row
// picks out in the picture of the heaven, where there is anything to pick out,
// and `dot` the colour of its mark.

export const GOD_GROUPS = {
  made: 'The gods he made',
  us: 'In us',
};

export const GODS = [
  {
    id: 'maker', group: null, name: 'The maker', called: 'maker and father of this All',
    greek: 'ποιητὴν καὶ πατέρα τοῦδε τοῦ παντὸς', ref: '28c', at: 'Timaeus 28c–29a', lit: null, dot: null,
    says: 'Timaeus calls him the maker and father of this All, hard to find and impossible to declare to everyone (28c). He also calls him the craftsman and the best of causes (29a), the god who always is (34a), and the father who begot the world (37c). He is good, and because the good has no envy he wanted everything to be as like himself as it could be (29e). He looks to an eternal model and makes the world’s soul and body and the gods within it, and he leaves the mortal kinds to those gods (41c). He has not come to be. He is not in the picture, because he is not in the world.',
    dispute: 'Who or what he is is one of the two great disputes about the dialogue. Menn and Broadie take him to be an intelligence that exists apart from the world and from its soul, and Broadie argues that the account needs him to be apart. Cornford holds that he is not a creator distinct from the world and stands for a divine reason at work in it, and Carone takes him to be a figure for the reason of the world’s soul. Ferrari takes him to be the model itself in its active aspect. Johansen puts the weight on the craft more than on a craftsman.',
  },
  {
    id: 'world', group: 'made', name: 'The world', called: 'he begot it a blessed god',
    greek: 'εὐδαίμονα θεὸν αὐτὸν ἐγεννήσατο', ref: '34b', at: 'Timaeus 34a–c', lit: 'world', dot: 'ink',
    says: 'The whole heaven is one living thing with soul and intelligence (30b), and it is the only one of its kind (31b). Timaeus calls it the god that was one day to be, and says that the maker begot it a blessed god, able to keep its own company and in need of nothing else (34a–b). Its soul begins a divine life of thought that never stops (36e). The last sentence of the dialogue calls it a perceptible god, the likeness of the intelligible (92c).',
    dispute: 'Broadie argues that the world is the principal god for us. It is the god Timaeus prays to at the opening of the Critias, and the one whose motions we are told to study and grow like (47b–c, 90c–d), whereas the maker, as Cornford had said, is never offered as an object of worship.',
  },
  {
    id: 'seven', group: 'made', name: 'The Sun, the Moon and five others', called: 'instruments of time',
    greek: 'ὄργανα χρόνου', ref: '38c', at: 'Timaeus 38c–d', lit: 'seven', dot: 'zodiacal',
    says: 'They came to be so that there might be time, to mark off its numbers and to keep them (38c). The maker made a body for each and set them in the seven circles of the Different. Bound with bonds of soul, they became living things and learned their task (38e). Timaeus names the Moon, the Sun, the Morning Star and the star sacred to Hermes, and leaves the other three unnamed. He counts all seven among the visible gods that have come to be (40d), and calls them the instruments of time (42d).',
    dispute: 'Cornford gives each of them a motion of its own, by which it can speed up, slow down and turn back. Vlastos and Petrucci deny this. On their reading the soul’s two circuits carry the seven, and what the stars’ own souls add is not said. Petrucci also argues that the wanderers make the world more like its model than the fixed stars do, because the model has a complex life and their motions are complex and still ordered.',
  },
  {
    id: 'stars', group: 'made', name: 'The fixed stars', called: 'living things, divine and everlasting',
    greek: 'ζῷα θεῖα ὄντα καὶ ἀίδια', ref: '40b', at: 'Timaeus 39e–40b', lit: 'stars', dot: 'star',
    says: 'They are the heavenly kind of gods, the first of the four kinds of living thing (39e). The maker made them mostly of fire and round, set them in the intelligence of the Same, and spread them over the whole heaven as its true adornment (40a). Each turns in its own place, always thinking the same thoughts about the same things, and each is carried forward by the Same (40a–b).',
    dispute: 'Nothing is said of a sphere in which they are fastened. Gregory takes them to keep their places because each has intelligence. Cornford takes them to be set in the motion of the Same, for which the surface of the sphere stands.',
  },
  {
    id: 'earth', group: 'made', name: 'The Earth', called: 'first and eldest of the gods within the heaven',
    greek: 'πρώτην καὶ πρεσβυτάτην θεῶν ὅσοι ἐντὸς οὐρανοῦ γεγόνασιν', ref: '40c', at: 'Timaeus 40b–c', from: 'Timaeus 38c–d', lit: 'earth', dot: 'earth',
    says: 'Timaeus calls the Earth our nurse, and the guardian and maker of night and day (40b–c). It is the first and eldest of the gods that have come to be within the heaven, although he comes to it after the stars. The circles of the seven were placed by it (38d), and souls are sown in it (42d).',
    dispute: 'The word used of the Earth at 40b is read in two ways. Cornford takes it to say that the Earth turns about the axis, against the Same, and for that reason stands still, and Petrucci adopts this. Boeckh and Heath read it as ‘packed’ round the axis and take the Earth to be at rest. Aristotle reports the Timaeus as giving the Earth a motion (On the Heavens II 13).',
  },
  {
    id: 'poets', group: 'made', name: 'The gods of the poets', called: 'the other divinities',
    greek: 'τῶν ἄλλων δαιμόνων', ref: '40d', at: 'Timaeus 40d–41a', lit: null, dot: null,
    says: 'These are Earth and Heaven, Ocean and Tethys, Phorkys, Cronus and Rhea, Zeus and Hera, and their brothers, sisters and descendants (40e–41a). Timaeus says that their birth is beyond our knowing and that we must trust those who claimed to be their children, though they give no likely or necessary proof (40d–e). In his next sentence he sets them, as gods who show themselves only so far as they wish, beside those who go round in plain sight (41a). They are not in the picture.',
    dispute: 'Whether this is said with irony is disputed. Fronterotta finds irony, and Petrucci finds some, while holding that the passage is serious about what counts as proof. Ferrari calls it a concession to tradition. Karfík and O’Meara find no irony.',
  },
  {
    id: 'soul', group: 'us', name: 'The immortal part of each human soul', called: 'called divine',
    greek: 'θεῖον λεγόμενον', ref: '41c', at: 'Timaeus 41d–42b', lit: null, dot: 'curve',
    says: 'The maker makes this part himself, from what was left in the bowl in which he mixed the soul of the whole (41d). It is to be called divine and to rule in those who are willing to follow justice and the gods (41c). There are as many of these souls as there are stars, and each has a star of its own, to which a good life returns it (41d–42b). Later Timaeus says that god has given it to each of us as a guardian spirit (90a).',
    dispute: 'Petrucci, following Broadie, holds that these souls are not parts of the world’s soul, and that their home is among the stars and not among the Forms. He takes the bowl to hold what was left of the ingredients and not of the first mixture.',
  },
];
