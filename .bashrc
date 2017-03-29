#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
#PS1='[\u@\h \W]\$ '
 PS1="[\W]:\[$(tput sgr0)\]"

# custom stuff
alias ll='ls -alF --color=auto'

eval $(thefuck --alias)
eval $(thefuck --alias FUCK)

