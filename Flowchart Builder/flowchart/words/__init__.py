"""Everything it says, in each language it says it in.

Reading this reads every language, which is how they come to be in the
table: each one registers itself at the foot of its own file.  A language
left out of this line is a language nothing ever reads.
"""
import importlib
import os

from . import lookup                                     # noqa: F401
from . import de, en, es, fr                             # noqa: F401

LANGUAGES = (de, en, es, fr)


def _when(module):
    try:
        return os.path.getmtime(module.__file__)
    except (OSError, TypeError):
        return None


_READ = {module.__name__: _when(module) for module in LANGUAGES}


def reread():
    """Read any language file again that has changed since it was read.

    The studio's --serve server pours the page's script together afresh for
    every page it hands out, but read these files once, when it started.
    Left running while the words were changed, it handed out the new
    programs with the old words beside them -- the examples in US English
    with their names still in pounds and pence.  A file read again
    registers itself again, into the same table, so everything holding the
    table sees the new words."""
    changed = False
    for module in LANGUAGES:
        now = _when(module)
        if now is not None and now != _READ.get(module.__name__):
            importlib.reload(module)
            _READ[module.__name__] = now
            changed = True
    if changed:
        lookup.apply_language(lookup.LANGUAGE)   # the chart's own words too
    return changed
