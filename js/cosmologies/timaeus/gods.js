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
    id: 'maker', group: null, name: 'The maker', called: 'maker and father of this universe',
    greek: 'ποιητὴν καὶ πατέρα τοῦδε τοῦ παντὸς', ref: '28c', at: 'Timaeus 28c–29a', lit: null, dot: null,
    says: 'Timaeus calls him the maker and father of this universe, and says that he is hard to find and that it would be impossible to explain him to everyone (28c). He is usually called the Demiurge, from the Greek word for a craftsman, which Timaeus uses of him as well (29a). Timaeus also calls him the best of causes (29a), the god who always exists (34a) and the father who begot the world (37c). He is good, and since a good being is never jealous, he wanted everything to be as much like himself as possible (29e). He looks to an eternal model when he makes the soul and body of the world and the gods inside it, and he leaves the making of mortal creatures to those gods (41c). Unlike the other gods he never came to be. He does not appear in the picture because he is not part of the world.',
    dispute: 'Scholars disagree deeply about who or what the maker is. Menn and Broadie hold that he is an intelligence which exists apart from the world and from the world’s soul, and Broadie argues that the account requires him to be separate. Cornford denies that he is a creator distinct from the world, and takes him to stand for a divine reason that is at work in it. Carone takes him to represent the reason of the world’s soul. According to Ferrari he is the eternal model itself, considered as something active. Johansen stresses the craft more than the craftsman, without denying that there is one.',
  },
  {
    id: 'world', group: 'made', name: 'The world', called: 'he begot it as a blessed god',
    greek: 'εὐδαίμονα θεὸν αὐτὸν ἐγεννήσατο', ref: '34b', at: 'Timaeus 34a–c', lit: 'world', dot: 'ink',
    says: 'The heaven as a whole is a single living thing that has a soul and intelligence (30b), and there is no other like it (31b). Timaeus calls it the god who was going to exist one day. He says that the maker begot it as a blessed god, which is able to keep itself company and needs nothing else (34a–b). Its soul begins a divine life of thought that will never end (36e). In the last sentence of the dialogue Timaeus calls the world a god that can be perceived by the senses, made in the image of what can only be grasped by thought (92c).',
    dispute: 'Broadie argues that for human beings the world is the most important god in the dialogue. It is the god Timaeus prays to at the beginning of the Critias, and it is the god whose motions we are told to study and imitate (47b–c, 90c–d). As Cornford had pointed out, Plato never suggests that anyone should worship the maker.',
  },
  {
    id: 'seven', group: 'made', name: 'The Sun, the Moon and the five planets', called: 'instruments of time',
    greek: 'ὄργανα χρόνου', ref: '38c', at: 'Timaeus 38c–d', lit: 'seven', dot: 'zodiacal',
    says: 'The maker made these seven so that there would be time, and their task is to mark out the numbers of time and preserve them (38c). He made a body for each and placed the bodies in the seven circles of the Different. Once their bodies had been bound to them with bonds of soul, they became living things and learned what they had to do (38e). Timaeus names only the Moon, the Sun, the Morning Star and the star sacred to Hermes. He includes all seven among the visible gods that have come to be (40d), and he calls them the instruments of time (42d).',
    dispute: 'Cornford thinks that each planet has a motion of its own in addition to the two it is given, which allows it to speed up, slow down and turn back. Vlastos and Petrucci disagree. They think the planets are carried by the two circuits of the world’s soul, and that Plato does not say what the planets’ own souls contribute. Petrucci also argues that the planets do more than the fixed stars to make the world resemble its model, because the model has a complex life and the planets’ motions are both complex and orderly.',
  },
  {
    id: 'stars', group: 'made', name: 'The fixed stars', called: 'living things, divine and everlasting',
    greek: 'ζῷα θεῖα ὄντα καὶ ἀίδια', ref: '40b', at: 'Timaeus 39e–40b', lit: 'stars', dot: 'star',
    says: 'The fixed stars belong to the heavenly kind of gods, which is the first of the four kinds of living thing (39e). The maker made them mostly out of fire and made them round. He placed them in the intelligence of the Same and distributed them over the whole heaven so that they adorn it (40a). Each star rotates on the spot, always thinking the same thoughts about the same things, and is also carried forward by the Same (40a–b).',
    dispute: 'Timaeus does not mention a sphere to which the stars are attached. Gregory’s explanation is that they keep their places because each of them has intelligence. According to Cornford they are placed in the motion of the Same, and the surface of the sphere is a way of representing that motion.',
  },
  {
    id: 'earth', group: 'made', name: 'The Earth', called: 'first and oldest of the gods inside the heaven',
    greek: 'πρώτην καὶ πρεσβυτάτην θεῶν ὅσοι ἐντὸς οὐρανοῦ γεγόνασιν', ref: '40c', at: 'Timaeus 40b–c', from: 'Timaeus 38c–d', lit: 'earth', dot: 'earth',
    says: 'Timaeus calls the Earth our nurse and the guardian and maker of night and day (40b–c). He says that it is the first and oldest of the gods that have come to be inside the heaven, although he describes it after the stars. The circles of the planets are described by their distance from it (38d), and souls are sown in it (42d).',
    dispute: 'The word that Timaeus uses of the Earth at 40b is interpreted in two ways. Cornford thinks it means that the Earth rotates on the axis in the opposite direction to the Same, so that it stays still, and Petrucci agrees. Boeckh and Heath think it means that the Earth is packed round the axis and is at rest. Aristotle reports that the Timaeus gives the Earth a motion (On the Heavens II 13).',
  },
  {
    id: 'poets', group: 'made', name: 'The gods of the poets', called: 'the other divinities',
    greek: 'τῶν ἄλλων δαιμόνων', ref: '40d', at: 'Timaeus 40d–41a', lit: null, dot: null,
    says: 'The gods of the poets are Earth and Heaven, Ocean and Tethys, Phorkys, Cronus and Rhea, Zeus and Hera, and their brothers, sisters and descendants (40e–41a). Timaeus says that we cannot know how they came to be, and that we have to believe the people who claimed to be their children, even though those people offer no likely or necessary proof (40d–e). In the next sentence he describes them as the gods who show themselves only as far as they wish, in contrast to the gods who revolve in plain view (41a). They do not appear in the picture.',
    dispute: 'Fronterotta thinks that Timaeus is being ironic here. Petrucci detects some irony too, but holds that the passage is serious about what counts as proof. Ferrari calls it a concession to tradition, and Karfík and O’Meara do not think it is ironic at all.',
  },
  {
    id: 'soul', group: 'us', name: 'The immortal part of each human soul', called: 'called divine',
    greek: 'θεῖον λεγόμενον', ref: '41c', at: 'Timaeus 41d–42b', lit: null, dot: 'curve',
    says: 'The maker makes this part of the soul himself, out of what was left in the bowl in which he had mixed the soul of the universe (41d). He says that it deserves to be called divine, and that it rules in people who are willing to follow justice and the gods (41c). There are as many of these souls as there are stars. Each of them has its own star, and a soul that has lived well returns to it (41d–42b). Later in the dialogue Timaeus says that god has given this part of the soul to each of us as a guardian spirit (90a).',
    dispute: 'Petrucci follows Broadie in denying that these souls are parts of the world’s soul. He thinks that their true home is among the stars, and that Plato does not place it among the Forms. He also argues that the bowl contained leftover ingredients, and that it did not contain any of the first mixture.',
  },
];
