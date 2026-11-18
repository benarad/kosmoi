// "The argument": from eternal motion to the unmoved movers, in fourteen steps
// across Metaphysics Lambda 6, 7, 8 and 10. It is the short way through; the
// reading of Lambda 8 clause by clause is in lambda8-text.js.
//
// Greek: Ross's text (Oxford, 1924) as digitised by the Perseus Digital Library
// (CC BY-SA 4.0), unaltered: square brackets, angle brackets and obeli are
// Ross's. Where a step leaves words out, the gap is marked " … ". A test checks
// every piece against the copies in reference/texts. English: W. D. Ross's
// Oxford translation, a placeholder like the rest: replace any `en` freely.
// `say` tells the viewer what to look at. `dispute`, where there is one, says
// in a line or two how the passage is contested; the sources for those lines
// are in reference/notes/lambda-8-model.md under "Recent scholarship".
// `movers: false` leaves the movers out of the margin for that step, and
// `tethers: 'all'` draws every sphere's line to its mover at once.

export const ARGUMENT = [
  {
    "title": "Motion never began",
    "ref": "Metaphysics Λ 6, 1071b3–11",
    "scene": "arg-night",
    "el": "… περὶ ταύτης λεκτέον ὅτι ἀνάγκη εἶναι ἀΐδιόν τινα οὐσίαν ἀκίνητον. … ἀλλʼ ἀδύνατον κίνησιν ἢ γενέσθαι ἢ φθαρῆναι (ἀεὶ γὰρ ἦν), οὐδὲ χρόνον. … κίνησις δʼ οὐκ ἔστι συνεχὴς ἀλλʼ ἢ ἡ κατὰ τόπον, καὶ ταύτης ἡ κύκλῳ.",
    "en": "… regarding the latter we must assert that it is necessary that there should be an eternal unmovable substance. … But it is impossible that movement should either have come into being or cease to be (for it must always have existed), or that time should. … And there is no continuous movement except movement in place, and of this only that which is circular is continuous.",
    "say": "The picture shows the night sky over Athens, which turns once a day. Aristotle starts from this motion and argues that it cannot ever have begun. His reason is that time cannot have a beginning, since there could be no “before” if there were no time, and that motion must be as continuous as time is. He adds that the only motion which can continue without interruption is motion in a circle.",
    "lit": []
  },
  {
    "title": "A substance whose being is activity",
    "ref": "Metaphysics Λ 6, 1071b12–22",
    "scene": "arg-night",
    "el": "ἀλλὰ μὴν εἰ ἔστι κινητικὸν ἢ ποιητικόν, μὴ ἐνεργοῦν δέ τι, οὐκ ἔσται κίνησις· ἐνδέχεται γὰρ τὸ δύναμιν ἔχον μὴ ἐνεργεῖν. … δεῖ ἄρα εἶναι ἀρχὴν τοιαύτην ἧς ἡ οὐσία ἐνέργεια. ἔτι τοίνυν ταύτας δεῖ τὰς οὐσίας εἶναι ἄνευ ὕλης· ἀϊδίους γὰρ δεῖ, εἴπερ γε καὶ ἄλλο τι ἀΐδιον.",
    "en": "But if there is something which is capable of moving things or acting on them, but is not actually doing so, there will not necessarily be movement; for that which has a potency need not exercise it. … There must, then, be such a principle, whose very essence is actuality. Further, then, these substances must be without matter; for they must be eternal, if anything is eternal.",
    "say": "If the cause of this motion only had the capacity to cause it, the motion might sometimes fail, because a capacity does not have to be exercised. Aristotle therefore concludes that the cause must be something whose whole being consists in activity and which contains nothing that is merely potential. He infers that it has no matter. In this passage he already speaks of such substances in the plural.",
    "lit": []
  },
  {
    "title": "The first heaven and its mover",
    "ref": "Metaphysics Λ 7, 1072a21–26",
    "scene": "arg-first",
    "lit": [
      "stars"
    ],
    "el": "… καὶ ἔστι τι ἀεὶ κινούμενον κίνησιν ἄπαυστον, αὕτη δʼ ἡ κύκλῳ (καὶ τοῦτο οὐ λόγῳ μόνον ἀλλʼ ἔργῳ δῆλον), ὥστʼ ἀΐδιος ἂν εἴη ὁ πρῶτος οὐρανός. ἔστι τοίνυν τι καὶ ὃ κινεῖ. ἐπεὶ δὲ τὸ κινούμενον καὶ κινοῦν [καὶ] μέσον, †τοίνυν† ἔστι τι ὃ οὐ κινούμενον κινεῖ, ἀΐδιον καὶ οὐσία καὶ ἐνέργεια οὖσα.",
    "en": "There is, then, something which is always moved with an unceasing motion, which is motion in a circle; and this is plain not in theory only but in fact. Therefore the first heaven must be eternal. There is therefore also something which moves it. And since that which moves and is moved is intermediate, there is something which moves without being moved, being eternal, substance, and actuality.",
    "say": "Here the same daily turning is seen from outside. The outermost sphere carries the fixed stars round once a day, and Aristotle calls it the first heaven. Since it is moved, and in turn moves what is inside it, he infers that something moves it without being moved itself. That mover has no size and is not located anywhere, so it cannot be drawn in the picture. It is shown as a point in the margin on the right, under the mark that stands for its sphere."
  },
  {
    "title": "It moves as something loved",
    "ref": "Metaphysics Λ 7, 1072a26–b4",
    "scene": "arg-first",
    "lit": [
      "stars"
    ],
    "el": "κινεῖ δὲ ὧδε τὸ ὀρεκτὸν καὶ τὸ νοητόν· κινεῖ οὐ κινούμενα. … κινεῖ δὴ ὡς ἐρώμενον, κινούμενα δὲ τἆλλα κινεῖ.",
    "en": "And the object of desire and the object of thought move in this way; they move without being moved. … The final cause, then, produces motion as being loved, but all other things move by being moved.",
    "say": "Aristotle explains how something can cause motion while remaining unmoved by comparing it to an object of desire or of thought, which moves us without being affected itself. The first mover moves the heaven in that way, as something loved. That is why the line in the picture runs from the sphere to its mover. The sphere is drawn towards the mover, while the mover itself does not change.",
    "dispute": "Scholars disagree about how literally to take this. On the usual reading, which Judson defends, the mover is a separate being, and the sphere is alive, is aware of the mover and imitates its perfection by turning for ever. Broadie, Kosman and Berti argue that the mover is the form or soul of the sphere and has no separate existence, and some of them think that the language of love is metaphorical."
  },
  {
    "title": "What the first mover is",
    "ref": "Metaphysics Λ 7, 1072b13–27",
    "scene": "arg-first",
    "lit": [
      "stars"
    ],
    "el": "ἐκ τοιαύτης ἄρα ἀρχῆς ἤρτηται ὁ οὐρανὸς καὶ ἡ φύσις. … εἰ οὖν οὕτως εὖ ἔχει, ὡς ἡμεῖς ποτέ, ὁ θεὸς ἀεί, θαυμαστόν· εἰ δὲ μᾶλλον, ἔτι θαυμασιώτερον. ἔχει δὲ ὧδε. καὶ ζωὴ δέ γε ὑπάρχει· ἡ γὰρ νοῦ ἐνέργεια ζωή, ἐκεῖνος δὲ ἡ ἐνέργεια·",
    "en": "On such a principle, then, depend the heavens and the world of nature. … If, then, God is always in that good state in which we sometimes are, this compels our wonder; and if in a better this compels it yet more. And God is in a better state. And life also belongs to God; for the actuality of thought is life, and God is that actuality",
    "say": "Up to this point Aristotle has described this substance only by what it does for the heaven. He now says what it is in itself, which is the activity of thinking. Thinking is the best kind of life, and we can enjoy it only for short periods, whereas this substance enjoys it always. Aristotle says that this being is god.",
    "dispute": "Bordt and Menn both emphasise this. In their view the phrase “unmoved mover” describes god only in relation to the heaven, and it does not tell us what god is."
  },
  {
    "title": "One such substance, or more?",
    "ref": "Metaphysics Λ 8, 1073a14–b3",
    "scene": "arg-planets",
    "el": "πότερον δὲ μίαν θετέον τὴν τοιαύτην οὐσίαν ἢ πλείους, καὶ πόσας, δεῖ μὴ λανθάνειν … φανερὸν τοίνυν ὅτι τοσαύτας τε οὐσίας ἀναγκαῖον εἶναι τήν τε φύσιν ἀϊδίους καὶ ἀκινήτους καθʼ αὑτάς, καὶ ἄνευ μεγέθους διὰ τὴν εἰρημένην αἰτίαν πρότερον. … —ὅτι μὲν οὖν εἰσὶν οὐσίαι, καὶ τούτων τις πρώτη καὶ δευτέρα κατὰ τὴν αὐτὴν τάξιν ταῖς φοραῖς τῶν ἄστρων, φανερόν·",
    "en": "But we must not ignore the question whether we have to suppose one such substance or more than one, and if the latter, how many … Evidently, then, there must be substances which are of the same number as the movements of the stars, and in their nature eternal, and in themselves unmovable, and without magnitude, for the reason before mentioned. … That the movers are substances, then, and that one of these is first and another second according to the same order as the movements of the stars, is evident.",
    "say": "Chapter 8 asks whether there is one such substance or several. In addition to the daily turning of the whole heaven, the Sun, the Moon and the five planets each move in their own way against the fixed stars, and these motions are eternal as well. Aristotle argues that every eternal motion needs an eternal, unmoved substance to cause it, so that there must be as many of these substances as there are motions. He adds that they have an order, first, second and so on, which follows the order of the motions.",
    "dispute": "Jaeger and Ross thought that this plurality of movers contradicted chapters 6 and 7 and must reflect a later change of mind. Most scholars now reject that view, because those chapters argue only that there is at least one unmoved mover and never claim that there is exactly one. Judson raises a different difficulty, which is that Aristotle does not show why a single mover could not be the cause of several motions.",
    "lit": []
  },
  {
    "title": "What the astronomers say",
    "ref": "Metaphysics Λ 8, 1073b10–32",
    "scene": "arg-saturn",
    "lit": [
      "saturn:*"
    ],
    "el": "πόσαι δʼ αὗται τυγχάνουσιν οὖσαι, νῦν μὲν ἡμεῖς ἃ λέγουσι τῶν μαθηματικῶν τινὲς ἐννοίας χάριν λέγομεν, ὅπως ᾖ τι τῇ διανοίᾳ πλῆθος ὡρισμένον ὑπολαβεῖν",
    "en": "But as to the actual number of these movements, we now—to give some notion of the subject—quote what some of the mathematicians say, that our thought may have some definite number to grasp",
    "say": "To find out how many motions there are, Aristotle turns to the astronomers. Eudoxus had explained the path of each wandering star by a set of spheres placed one inside another. Each sphere turns at a constant speed about an axis that is fixed in the sphere outside it, and the star is carried by the innermost one. He used three spheres for the Sun, three for the Moon and four for each of the five planets. The picture shows the four for Saturn, which together carry it round the zodiac and make it turn back for a while every thirteen months. Callippus later added seven more spheres to the system."
  },
  {
    "title": "One heaven of fifty-five spheres",
    "ref": "Metaphysics Λ 8, 1073b38–1074a12",
    "scene": "arg-whole",
    "lit": [
      "*:unwinding"
    ],
    "movers": false,
    "el": "ἀναγκαῖον δέ, εἰ μέλλουσι συντεθεῖσαι πᾶσαι τὰ φαινόμενα ἀποδώσειν, καθʼ ἕκαστον τῶν πλανωμένων ἑτέρας σφαίρας μιᾷ ἐλάττονας εἶναι τὰς ἀνελιττούσας … ὁ δὴ ἁπασῶν ἀριθμὸς τῶν τε φερουσῶν καὶ τῶν ἀνελιττουσῶν ταύτας πεντήκοντά τε καὶ πέντε.",
    "en": "But it is necessary, if all the spheres combined are to explain the observed facts, that for each of the planets there should be other spheres (one fewer than those hitherto assigned) which counteract those already mentioned … therefore the number of all the spheres—both those which move the planets and those which counteract these—will be fifty-five.",
    "say": "If these sets are placed one inside another to make a single heaven, each planet is carried along by all the motions of the planets above it. Jupiter, for example, would share every motion of Saturn. To prevent this, further spheres are placed below each set. They turn in the opposite direction and cancel the motions of that set before the next one begins. These unwinding spheres are drawn with broken lines and are highlighted here. With them the total comes to fifty-five spheres below the sphere of the fixed stars.",
    "dispute": "The unwinding spheres have usually been regarded as Aristotle’s own contribution to the astronomy. Golitsis (2024) argues that they were already part of Callippus’ theory and that Aristotle is only reporting them. Aristotle also gives a lower total for the case in which Callippus’ additions for the Sun and Moon are left out. The manuscripts have 47, which is usually corrected to 49, as Sosigenes first proposed."
  },
  {
    "title": "As many movers as spheres",
    "ref": "Metaphysics Λ 8, 1074a14–17",
    "scene": "arg-whole",
    "tethers": "all",
    "el": "—τὸ μὲν οὖν πλῆθος τῶν σφαιρῶν ἔστω τοσοῦτον, ὥστε καὶ τὰς οὐσίας καὶ τὰς ἀρχὰς τὰς ἀκινήτους [καὶ τὰς αἰσθητὰς] τοσαύτας εὔλογον ὑπολαβεῖν (τὸ γὰρ ἀναγκαῖον ἀφείσθω τοῖς ἰσχυροτέροις λέγειν)·",
    "en": "Let this, then, be taken as the number of the spheres, so that the unmovable substances and principles also may probably be taken as just so many; the assertion of necessity must be left to more powerful thinkers.",
    "say": "Aristotle concludes that there are as many unmoved movers as there are spheres. Each of the fifty-five spheres has its own mover, and with the mover of the sphere of the fixed stars that makes fifty-six. They are shown in the margin as points that do not move, in the same order as their spheres, and in this step every sphere is joined by a line to its own mover. If you point at a mark in the margin, the sphere it stands for is highlighted in the picture.",
    "dispute": "Aristotle calls this number reasonable and leaves the question of necessity to others. Judson takes him to mean that he accepts the number but cannot prove it, since he has no proof that the astronomers have counted the spheres correctly. Charles interprets passages like this one differently. He thinks Aristotle is offering a plausible account without claiming that it is true.",
    "lit": []
  },
  {
    "title": "For the sake of the stars",
    "ref": "Metaphysics Λ 8, 1074a17–31",
    "scene": "arg-whole",
    "lit": [
      "jupiter:*",
      "jupiter:u*"
    ],
    "el": "… εἰ γὰρ πᾶν τὸ φέρον τοῦ φερομένου χάριν πέφυκε καὶ φορὰ πᾶσα φερομένου τινός ἐστιν, οὐδεμία φορὰ αὑτῆς ἂν ἕνεκα εἴη οὐδʼ ἄλλης φορᾶς, ἀλλὰ τῶν ἄστρων ἕνεκα.",
    "en": "… if everything that moves is for the sake of that which is moved, and every movement belongs to something that is moved, no movement can be for the sake of itself or of another movement, but all the movements must be for the sake of the stars.",
    "say": "Aristotle then argues that there cannot be more movers than this. Every motion in the heaven contributes to the motion of some star and exists for the sake of that star, and a substance of this kind must be the goal of some motion, so there are no further motions and no further movers. In the picture each sphere has the colour of the star it serves. The seven spheres that belong to Jupiter are highlighted. Four of them carry it and the other three cancel their motions.",
    "dispute": "Scholars disagree about how this fits with the rest of the theory. Lloyd points out that on the usual account a sphere achieves its good simply by turning evenly, which would make the planet it carries “in a way, an irrelevance”. Judson replies that helping to produce the orderly and beautiful path of the star is itself part of the sphere’s perfection. Menn distinguishes two senses of “for the sake of”, so that the mover is the goal at which the motion aims and the star is what benefits from it."
  },
  {
    "title": "One heaven",
    "ref": "Metaphysics Λ 8, 1074a31–38",
    "scene": "arg-whole",
    "el": "ὅτι δὲ εἷς οὐρανός, φανερόν. εἰ γὰρ πλείους οὐρανοὶ ὥσπερ ἄνθρωποι, ἔσται εἴδει μία ἡ περὶ ἕκαστον ἀρχή, ἀριθμῷ δέ γε πολλαί. ἀλλʼ ὅσα ἀριθμῷ πολλά, ὕλην ἔχει … τὸ δὲ τί ἦν εἶναι οὐκ ἔχει ὕλην τὸ πρῶτον· ἐντελέχεια γάρ.",
    "en": "Evidently there is but one heaven. For if there are many heavens as there are many men, the moving principles, of which each heaven will have one, will be one in form but in number many. But all things that are many in number have matter … But the primary essence has not matter; for it is complete reality.",
    "say": "Aristotle next rules out the possibility of other heavens besides this one. Each of them would need a first mover of its own, and these movers would be the same in kind and differ only in number. But things of the same kind can be many only if they have matter, as individual human beings do, and the first mover has no matter. It follows that there is only one first mover and therefore only one heaven.",
    "dispute": "This argument seems to create a problem for the fifty-six movers, since they have no matter either. The usual answer, given by Ross, Wolfson and Judson, is that the movers are not many of one kind, because each differs from the others in its essence. Judson suggests that they may differ in what they think. White (2022) argues that neither this nor any other answer succeeds.",
    "lit": []
  },
  {
    "title": "What the ancients handed down",
    "ref": "Metaphysics Λ 8, 1074a38–b10",
    "scene": "arg-whole-daily",
    "el": "παραδέδοται δὲ παρὰ τῶν ἀρχαίων καὶ παμπαλαίων ἐν μύθου σχήματι καταλελειμμένα τοῖς ὕστερον ὅτι θεοί τέ εἰσιν οὗτοι καὶ περιέχει τὸ θεῖον τὴν ὅλην φύσιν. τὰ δὲ λοιπὰ μυθικῶς ἤδη προσῆκται πρὸς τὴν πειθὼ τῶν πολλῶν καὶ πρὸς τὴν εἰς τοὺς νόμους καὶ τὸ συμφέρον χρῆσιν· … ὧν εἴ τις χωρίσας αὐτὸ λάβοι μόνον τὸ πρῶτον, ὅτι θεοὺς ᾤοντο τὰς πρώτας οὐσίας εἶναι, θείως ἂν εἰρῆσθαι νομίσειεν",
    "en": "Our forefathers in the most remote ages have handed down to their posterity a tradition, in the form of a myth, that these bodies are gods, and that the divine encloses the whole of nature. The rest of the tradition has been added later in mythical form with a view to the persuasion of the multitude and to its legal and utilitarian expediency … But if one were to separate the first point from these additions and take it alone—that they thought the first substances to be gods, one must regard this as an inspired utterance",
    "say": "The chapter ends with a comment on traditional religion. Aristotle says that a very old tradition, handed down in the form of myth, held that these are gods and that the divine encloses the whole of nature. He regards the rest of the myths, including gods in human or animal form, as later additions made to persuade people and to support the laws. If those additions are set aside, he thinks that the original belief was an inspired one.",
    "dispute": "It is not certain what “these” refers to. Judson thinks it means the unmoved movers and Lloyd thinks it means the heavenly bodies. Ross’s translation, “these bodies”, follows Lloyd’s view. It is also unclear whether Aristotle approves of the use of myth to persuade the many or is criticising it. Segev argues that he thought traditional religion false but necessary for political life.",
    "lit": []
  },
  {
    "title": "One ruler",
    "ref": "Metaphysics Λ 10, 1075a11–15, 1076a3–4",
    "scene": "arg-whole-daily",
    "el": "ἐπισκεπτέον δὲ καὶ ποτέρως ἔχει ἡ τοῦ ὅλου φύσις τὸ ἀγαθὸν καὶ τὸ ἄριστον, πότερον κεχωρισμένον τι καὶ αὐτὸ καθʼ αὑτό, ἢ τὴν τάξιν. ἢ ἀμφοτέρως ὥσπερ στράτευμα; καὶ γὰρ ἐν τῇ τάξει τὸ εὖ καὶ ὁ στρατηγός, καὶ μᾶλλον οὗτος· οὐ γὰρ οὗτος διὰ τὴν τάξιν ἀλλʼ ἐκείνη διὰ τοῦτόν ἐστιν. … τὰ δὲ ὄντα οὐ βούλεται πολιτεύεσθαι κακῶς. οὐκ ἀγαθὸν πολυκοιρανίη· εἷς κοίρανος ἔστω.",
    "en": "We must consider also in which of two ways the nature of the universe contains the good, and the highest good, whether as something separate and by itself, or as the order of the parts. Probably in both ways, as an army does; for its good is found both in its order and in its leader, and more in the latter; for he does not depend on the order but it depends on him. … but the world refuses to be governed badly. ‘The rule of many is not good; one ruler let there be.’",
    "say": "At the end of Book Λ Aristotle insists that the world is a unity. He compares it to an army, whose good lies partly in its order and even more in its general, and he quotes Homer against thinkers who give the world several unconnected principles. This suggests that he does not regard the many movers of chapter 8 as independent of one another, although he does not explain how they are related to the first mover.",
    "dispute": "The only thing Aristotle says on the subject is that the movers are ranked in the same order as their spheres (1073b1–3). Judson observes that he has not shown that they form a hierarchy by nature.",
    "lit": []
  },
  {
    "title": "From the first heaven to the seasons",
    "ref": "Metaphysics Λ 6, 1072a9–12",
    "scene": "noons",
    "el": "εἰ δὴ τὸ αὐτὸ ἀεὶ περιόδῳ, δεῖ τι ἀεὶ μένειν ὡσαύτως ἐνεργοῦν. εἰ δὲ μέλλει γένεσις καὶ φθορὰ εἶναι, ἄλλο δεῖ εἶναι ἀεὶ ἐνεργοῦν ἄλλως καὶ ἄλλως.",
    "en": "If, then, there is a constant cycle, something must always remain, acting in the same way. And if there is to be generation and destruction, there must be something else which is always acting in different ways.",
    "say": "For the last step we go back to chapter 6 and look at the world below the Moon. Because the first heaven always turns in the same way, it is the cause of everything that stays constant, such as the regular succession of day and night. The Sun also moves along a circle that is slanted relative to the daily turning, so that over the course of a year it comes closer to us and then moves away again. Aristotle makes this the cause of the seasons, and therefore of things coming to be and passing away. You can see this in more detail in the sequence called Below the Moon.",
    "lit": []
  }
];
