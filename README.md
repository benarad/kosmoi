# Kosmoi

Animated models of ancient cosmologies, for teaching.

Open it at https://benarad.github.io/kosmoi/

- **Aristotle.** The heaven of *Metaphysics* Λ: an eternal turning heaven, a sphere for
  every motion, and an unmoved mover for every sphere. The argument of Λ 6, 7, 8 and 10 is
  gone through step by step, with the Greek and English of each passage beside the picture.
  The astronomy behind it (Eudoxus, Callippus, and the rival reconstructions) is behind
  one button.
- **Plato's *Timaeus*.** The making of the world and its gods as Timaeus tells it, in
  thirty steps from 27d to 42e, with the Greek and English beside the picture. Nothing is
  on stage before the step that makes it. The margin lists the gods of the dialogue, each
  with what Timaeus calls it.

On both pages a line under each contested passage says how it is contested and by whom.
Those lines are summaries of the scholarship, written for teaching, and they are no
substitute for the works they name.

The pictures are schematic. Sizes and distances are for legibility, and a number that is
not in an ancient source is marked as such on the page.

This repository holds only the published pages, which are plain HTML, CSS and JavaScript
modules with no build step. To run them on your own machine, serve the folder
(`python3 -m http.server`) and open the address it prints, because browsers will not load
JavaScript modules from a file.

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

The Greek is unaltered. In Bury's English a few slips of the digitised copy have been put
right:

- a space before a punctuation mark was removed at 36c, 36d, 37c, 39e and 42d;
- a doubled full stop at 38c was made single;
- "he fourth portion" was corrected to "the fourth portion" at 35c;
- the quotation mark before "immortal" at 41c was turned the right way;
- a comma before the dash was removed at 32b;
- quotation marks were restored round "is", "was" and "will be" at 37e–38a, where
  Perseus' file marks them up.

The English on the Aristotle page is W. D. Ross's Oxford translation, which is in the
public domain in the United States. Both translations stand in until others are supplied.

Also used:

- the Yale Bright Star Catalogue, 5th edition (public domain), for the fixed stars, each
  carried back to where it stood in 350 BC;
- [three.js](https://threejs.org/) 0.187.0, under the MIT licence, a copy of which is in
  `vendor/three/LICENSE`.
