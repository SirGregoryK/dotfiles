#!/bin/sh

userresources=$HOME/.Xresources
usermodmap=$HOME/.Xmodmap
sysresources=/etc/X11/xinit/.Xresources
sysmodmap=/etc/X11/xinit/.Xmodmap

# merge in defaults and keymaps

if [ -f $sysresources ]; then







    xrdb -merge $sysresources

fi

if [ -f $sysmodmap ]; then
    xmodmap $sysmodmap
fi

if [ -f "$userresources" ]; then







    xrdb -merge "$userresources"

fi

if [ -f "$usermodmap" ]; then
    xmodmap "$usermodmap"
fi

# start some nice programs

if [ -d /etc/X11/xinit/xinitrc.d ] ; then
 for f in /etc/X11/xinit/xinitrc.d/?*.sh ; do
  [ -x "$f" ] && . "$f"
 done
 unset f
fi

# enviroment variables section
# =====================
	export TERMINAL=termite
	export EDITOR=nvim
	export BROWSER=vivaldi-stable
# autorun section
# =====================
# xrandr for nvidia
xrandr --setprovideroutputsource modesetting NVIDIA-0
xrandr --auto

# session selection script
# =====================

session=${1:-i3}

case $session in
	i3|i3wm		)	exec	i3;;
	ob|openbox	)	exec openbox-session;;
	*		)	exec	$1;;
esac
