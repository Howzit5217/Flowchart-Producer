"""Every keyword the pseudocode may use."""
import re


# ---------------------------------------------------------- statement forms --
R_MODULE = re.compile(r"^(module|function|sub|procedure|def|method|subroutine)\s+(.+)$", re.I)
R_ENDMOD = re.compile(r"^end[ -]?(module|function|sub|procedure|def|method|main|subroutine)\b", re.I)
R_ENDIF = re.compile(r"^(end[ -]?if|fi)$", re.I)
R_ENDSEL = re.compile(r"^end[ -]?(select|case|switch)$", re.I)
R_ENDLOOP = re.compile(r"^(end[ -]?(while|for|loop|do|repeat|until)|wend|loop|next(\s+\S+)?|done|od)$", re.I)
R_LOOPCOND = re.compile(r"^loop\s+(while|until)\s+(.+)$", re.I)
R_ENDANY = re.compile(r"^end[ -]\w+$", re.I)
R_ELSEIF = re.compile(r"^(else\s*if|elseif|elif|otherwise\s+if)\s+(.+)$", re.I)
R_ELSE = re.compile(r"^(else|otherwise)$", re.I)
R_CASE = re.compile(r"^(case\s+(.+)|default|case\s+else)$", re.I)
R_SELECT = re.compile(r"^(select\s+case|select|switch)\s+(.+)$", re.I)
R_IF = re.compile(r"^if\b\s*(.*)$", re.I)
R_WHILE = re.compile(r"^while\b\s*(.*)$", re.I)
R_DO = re.compile(r"^do(\s+(while|until)\s+(.+))?$", re.I)
R_REPEAT = re.compile(r"^repeat$", re.I)
R_UNTIL = re.compile(r"^until\s+(.+)$", re.I)
R_FOR = re.compile(r"^for\b\s*(.*)$", re.I)
R_FOR_TO = re.compile(r"^([\w\[\]\.]+)\s*(?:=|:=|<-)\s*(.+?)\s+(to|downto)\s+(.+?)(?:\s+step\s+(.+))?$", re.I)
R_FOR_C = re.compile(r"^\(\s*(.*?)\s*;\s*(.*?)\s*;\s*(.*?)\s*\)$")
R_RETURN = re.compile(r"^return\b", re.I)
R_CALL = re.compile(r"^call\b", re.I)
R_OUT = re.compile(r"^(display|print|output|write|echo|println|printf|puts|writeline)\b", re.I)
R_IN = re.compile(r"^(input|read|get|enter|scan|prompt|accept|readline)\b", re.I)
R_DECL = re.compile(r"^(declare|constant|const)\b", re.I)
# Something that takes time: "Wait 2 seconds", "Pause 500 ms", "Delay
# random(1, 3) seconds".  How long is an expression like any other, so the
# program can decide it as it goes -- and the runner has a pace that listens
# to what it decided rather than keeping a constant time of its own.
#
# "Wait until the queue is empty" is not one of these.  It reads like a wait
# and there is no length of time anywhere in it, so it is left to be read as
# whatever else it turns out to be.
R_WAIT = re.compile(r"^(?:wait|sleep|pause|delay)\b(?:\s+|\s*(?=\())(.+)$", re.I)
R_NOT_A_WAIT = re.compile(r"^(?:until|while|till|for\s+(?:each|every))\b", re.I)
# The unit written on the end of it, where one is: seconds unless it says
# otherwise.  It has to be a word of its own or sit against the number --
# "2 s", "500ms" -- or a name ending in s would be read as a wait in seconds.
R_WAIT_UNIT = re.compile(
    r"^(.*?)(?:\s+|(?<=[\d)]))(ms|millisecs?|milliseconds?|s|secs?|seconds?)$", re.I)
R_START = re.compile(r"^((start|begin)(\s+program)?|main)$", re.I)
R_END = re.compile(r"^(end|stop|halt|end\s+program|exit\s+program)$", re.I)
R_CLOSER = re.compile(r"^(end[ -]?\w*|endif|endwhile|endfor|endselect|fi|wend|loop\b.*|"
                      r"next\b.*|until\s.*|done|od)$", re.I)
R_THEN = re.compile(r"\bthen\b", re.I)
R_ELSE_INLINE = re.compile(r"\belse\b", re.I)


