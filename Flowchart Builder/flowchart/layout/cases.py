"""Select Case, and the lane each branch gets."""
import math

from .. import settings
from ..layout import blocks
from ..layout.blocks import (
    Block, label_beside, label_clear, label_run, layout_seq, node_block,
    shift)
from ..measure import text_w
from ..parse.nodes import Node


def layout_select(item):
    """Case structure: one diamond, one branch per Case, all merging below."""
    dia = node_block(Node("diamond", item.expr))
    if not item.branches:
        return dia
    branches = []
    for label, items in item.branches:
        b = layout_seq(items)
        # room for the label beside the line, and a little after it
        need = label_clear() + text_w(label, bold=True) + settings.LABEL_PAD / 2.0
        if b.w - b.axis < need:
            b = Block(b.axis + need, b.h, b.axis, b.elems, b.terminal)
        branches.append((label, b))

    # branches side by side, their axes spread under the diamond
    axes, x = [], 0.0
    for i, (label, b) in enumerate(branches):
        if i:
            x += settings.HGAP
        axes.append(x + b.axis)
        x += b.w
    span = x
    center = span / 2.0
    bus_y = dia.h + settings.VGAP / 2.0
    top = dia.h + settings.VGAP + settings.GRID_STEP
    # Each case's line down from the bus is long enough for its word to
    # stand beside it, clear of the bus above and the branch below --
    # further, in whole grid steps, where the words are set big.
    short = bus_y + label_run(*(label for label, _ in branches)) - top
    if short > 0:
        step = settings.GRID_STEP if settings.GRID_STEP > 0 else short
        top += math.ceil(short / step - 0.001) * step
    tallest = max(b.h for _, b in branches)
    all_end = all(b.terminal for _, b in branches)
    merge = top + tallest + (0 if all_end else settings.VGAP)

    elems = shift(dia.elems, center - dia.axis, 0)
    elems.append(("line", center, dia.h, center, bus_y, len(axes) > 1))
    # The line the cases hang from spreads out from under the diamond, each
    # way, rather than running across as one line the stem arrives at.  One
    # line across reads as a line the stem is joining, and a line joining
    # another gets a head -- on a stem half a step long, a head pushed up
    # into the point of the diamond.  Nothing is joined here; it all goes out.
    for end in sorted({min(axes), max(axes)}):
        if abs(end - center) > 0.5:
            elems.append(("line", center, bus_y, end, bus_y, False))
    x = 0.0
    for i, (label, b) in enumerate(branches):
        if i:
            x += settings.HGAP
        ax = axes[i]
        elems.append(label_beside(ax, bus_y, label, 1, top - bus_y))
        if b.h == 0:                              # empty Case: one plain line
            if not all_end:
                elems.append(("line", ax, bus_y, ax, merge, False))
        else:
            elems.append(("line", ax, bus_y, ax, top, True))
            elems += shift(b.elems, x, top)
            if not b.terminal:
                elems.append(("line", ax, top + b.h, ax, merge, False))
        x += b.w
    # And they come home the way they went out, mirrored: each outside case
    # comes down and turns in towards the middle, the way the two sides of
    # an If do.  It was one line straight across, which the cases at either
    # end only ran into -- a line coming down that stops where another one
    # starts is two lines, not one line turning, so the corners at the
    # foot of the chart stayed square while the ones at its head were
    # rounded off.  Down and in is one line with a bend in it, and a bend
    # is rounded.
    if not all_end:
        live = [axes[i] for i, (_, b) in enumerate(branches) if not b.terminal]
        for end in sorted({min(live + [center]), max(live + [center])}):
            if abs(end - center) > 0.5:
                elems.append(("line", end, merge, center, merge, False))

    left = max(center, dia.w / 2.0)
    width = max(span, dia.w)
    return Block(width, merge, left, shift(elems, left - center, 0), all_end)


blocks.LAYOUTS["select"] = layout_select
