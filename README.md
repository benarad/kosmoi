# Kosmoi

Kosmoi is a set of animated models of ancient cosmologies, made for teaching.

Open it at https://benarad.github.io/kosmoi/

There are two pages so far.

The Aristotle page shows the heaven of *Metaphysics* Λ, an eternally turning heaven in
which every motion has a sphere and every sphere has an unmoved mover. It goes through the
argument of Λ 6, 7, 8 and 10 step by step, with the Greek and English of each passage beside
the picture. The astronomy behind the picture, which includes the systems of Eudoxus and
Callippus and the rival modern reconstructions, is kept behind a single button.

The page on Plato's *Timaeus* shows the making of the world and its gods as Timaeus tells
it, in thirty steps that run from 27d to 42e, with the Greek and English beside the picture.
Each thing appears in the picture only at the step in which it is made. The margin lists the
gods of the dialogue and gives what Timaeus calls each of them.

On both pages, where scholars disagree about a passage, a paragraph under it, headed *What
scholars say*, gives the disagreement and who holds each view. These paragraphs summarise the
scholarship for teaching and are no substitute for the works they name.

Each page opens on its sequence at the first step, and the address keeps the place, so that a
link such as `https://benarad.github.io/kosmoi/timaeus.html#making/12` leads to a particular
step. The *Present* button in the corner of the picture opens a view for a classroom, with a
larger picture and the step's text in larger type.

The pictures are schematic. Sizes and distances are chosen so that things can be seen, and
any number that does not come from an ancient source is marked as such on the page.

This repository holds only the published pages, which are plain HTML, CSS and JavaScript
modules with no build step. To run them on your own machine, serve the folder (for example
with `python3 -m http.server`) and open the address it prints. Browsers will not load
JavaScript modules from a file, so opening the HTML files directly does not work.

## Texts and licences

The Greek on both pages and the English on the *Timaeus* page come from the
[Perseus Digital Library](https://www.perseus.tufts.edu/), which makes them available
under the Creative Commons Attribution-ShareAlike licence
([CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)). The passages on the
pages are excerpts, and they remain under that licence.

| Text | Edition | Perseus file |
|---|---|---|
| Aristotle, *Metaphysics* Λ 6, 7, 8 and 10, in Greek | W. D. Ross (Oxford, 1924) | [tlg0086.tlg025.perseus-grc2](https://github.com/PerseusDL/canonical-greekLit/blob/master/data/tlg0086/tlg025/tlg0086.tlg025.perseus-grc2.xml) |
| Plato, *Timaeus* 27d–42e, in Greek | J. Burnet, *Platonis Opera* (Oxford) | [tlg0059.tlg031.perseus-grc2](https://github.com/PerseusDL/canonical-greekLit/blob/master/data/tlg0059/tlg031/tlg0059.tlg031.perseus-grc2.xml) |
| Plato, *Timaeus* 27d–42e, in English | R. G. Bury (Loeb Classical Library, 1929) | [tlg0059.tlg031.perseus-eng2](https://github.com/PerseusDL/canonical-greekLit/blob/master/data/tlg0059/tlg031/tlg0059.tlg031.perseus-eng2.xml) |

The Greek is unaltered. In Bury's English a few slips of the digitised copy have been
corrected.

- A space before a punctuation mark was removed at 36c, 36d, 37c, 39e and 42d.
- A doubled full stop at 38c was made single.
- At 35c "he fourth portion" was corrected to "the fourth portion".
- The quotation mark before "immortal" at 41c was turned the right way.
- A comma before the dash was removed at 32b.
- Quotation marks were restored round "is", "was" and "will be" at 37e–38a, where the
  Perseus file marks them up.

The English on the Aristotle page is W. D. Ross's Oxford translation, which is in the
public domain in the United States. Both translations are placeholders until others are
supplied.

The fixed stars come from the Yale Bright Star Catalogue, 5th edition, which is in the
public domain, and each star has been moved back to its position in 350 BC. The pages use
[three.js](https://threejs.org/) 0.187.0 under the MIT licence, and a copy of the licence
is in `vendor/three/LICENSE`.
