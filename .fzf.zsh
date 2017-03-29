# Setup fzf
# ---------
if [[ ! "$PATH" == */home/helplessman/.fzf/bin* ]]; then
  export PATH="$PATH:/home/helplessman/.fzf/bin"
fi

# Auto-completion
# ---------------
[[ $- == *i* ]] && source "/home/helplessman/.fzf/shell/completion.zsh" 2> /dev/null

# Key bindings
# ------------
source "/home/helplessman/.fzf/shell/key-bindings.zsh"

