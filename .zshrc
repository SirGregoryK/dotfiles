# Lines configured by zsh-newuser-install
HISTFILE=~/.histfile
HISTSIZE=3072
SAVEHIST=3072
setopt appendhistory autocd beep extendedglob nomatch notify
bindkey -e
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '/home/helplessman/.zshrc'

autoload -Uz compinit
compinit
# End of lines added by compinstall

# [config]
	# [variables]
		PROMPT='%B[%2~]:%b'
		RPROMPT='%B[%?][%#][%*]%b'
	# [sources]
		source ~/.zplug/init.zsh
		source /etc/profile.d/cnf.sh
	# [autoexec]
	# [zplug]
		# [plugins]
			zplug 		"zsh-users/zsh-syntax-highlighting", defer:2
		 	zplug 		"zsh-users/zsh-autosuggestions"
			zplug 		"zsh-users/zsh-history-substring-search"

			zplug 		"plugins/git", from:oh-my-zsh
			zplug 		"plugins/pip", from:oh-my-zsh
			zplug 		"plugins/sublime", from:oh-my-zsh
			zplug 		"plugins/sudo", from:oh-my-zsh
			zplug 		"plugins/svn-fast-info", from:oh-my-zsh
			zplug 		"plugins/systemd", from:oh-my-zsh
			zplug 		"plugins/web-search", from:oh-my-zsh
			zplug 		"plugins/wd", from:oh-my-zsh

			zplug 		"modules/archive", from:prezto
		# [themes]
		# [autoload]
			zplug 		load
	# [bindings]
		# [plugins]
			#[zsh-history-substring-search]
				bindkey '^[[A' history-substring-search-up
  				bindkey '^[[B' history-substring-search-down
  		# [begin/end of line]
  			bindkey "${terminfo[khome]}" beginning-of-line
			bindkey "${terminfo[kend]}" end-of-line
		# [forward delete]
			bindkey    "^[[3~"          delete-char
	# [aliases]
		eval "$(thefuck --alias)"
		eval "$(thefuck --alias FUCK)"
		eval "$(thefuck --alias wtf)"
		eval "$(thefuck --alias WTF)"

		alias whereami=display_info
		alias grep='grep --color'

		alias ll='LC_COLLATE=C ls -AFhl --color=auto --group-directories-first'
		alias ldot='LC_COLLATE=C ls -AFdhl --color=auto *'

		alias vim='nvim'
		alias vi='nvim'

		alias grep='grep -i'

		alias rm='rm -i'
		alias cp='cp -i'
		alias mv='mv -i'

		alias vega_ip='echo 193.41.142.106'
		alias ip_vega='echo 193.41.142.106'

		alias scrot-sshot='scrot -q 100 ~/Изображения/.screenshots/scrot/%Y%m%d%H%M%S.png'
		alias scrot-select='scrot -q 100 -s ~/Изображения/.screenshots/scrot/%Y%m%d%H%M%S.png'
		alias scrot-window='scrot -q 100 -u ~/Изображения/.screenshots/scrot/%Y%m%d%H%M%S.png'


