" An example for a vimrc file.
"
" Maintainer:	Bram Moolenaar <Bram@vim.org>
" Last change:	2016 Jul 28
"
" To use it, copy it to
"     for Unix and OS/2:  ~/.vimrc
"	      for Amiga:  s:.vimrc
"  for MS-DOS and Win32:  $VIM\_vimrc
"	    for OpenVMS:  sys$login:.vimrc

" When started as "evim", evim.vim will already have done these settings.
if v:progname =~? "evim"
  finish
endif

" Get the defaults that most users want.
source $VIMRUNTIME/defaults.vim

if has("vms")
  set nobackup		" do not keep a backup file, use versions instead
else
  set backup		" keep a backup file (restore to previous version)
  if has('persistent_undo')
    set undofile	" keep an undo file (undo changes after closing)
  endif
endif

if &t_Co > 2 || has("gui_running")
  " Switch on highlighting the last used search pattern.
  set hlsearch
endif

" Only do this part when compiled with support for autocommands.
if has("autocmd")

  " Put these in an autocmd group, so that we can delete them easily.
  augroup vimrcEx
  au!

  " For all text files set 'textwidth' to 78 characters.
  autocmd FileType text setlocal textwidth=78

  augroup END

else

  set autoindent		" always set autoindenting on

endif " has("autocmd")

" Add optional packages.
"
" The matchit plugin makes the % command work better, but it is not backwards
" compatible.
if has('syntax') && has('eval')
  packadd matchit
endif

" =====================================================================================
" =====================================================================================
" =====================================================================================

call plug#begin('~/.vim/plugged')

Plug 'lilydjwg/colorizer'
Plug 'raimondi/delimitmate'
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'shougo/neocomplete.vim'
Plug 'scrooloose/nerdcommenter'
Plug 'scrooloose/nerdtree'
Plug 'xuyuanp/nerdtree-git-plugin'
Plug 'talek/obvious-resize'
Plug 'elentok/plaintasks.vim'
Plug 'ervandew/supertab'
Plug 'scrooloose/syntastic'
Plug 'godlygeek/tabular'
Plug 'easymotion/vim-easymotion'
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'terryma/vim-multiple-cursors'
Plug 'jistr/vim-nerdtree-tabs'
Plug 'powerman/vim-plugin-ruscmd'
Plug 'tpope/vim-surround'
Plug 'bronson/vim-trailing-whitespace'

Plug 'flazz/vim-colorschemes'

call plug#end()


let myterm = $TERM
if has('gui_running')
    " With GUI
    colorscheme twilight256
    hi Normal guibg=NONE ctermbg=NONE
elseif myterm=~'linux'
    " TTY
    colorscheme desert
else
    " Without GUI and not in TTY
    colorscheme twilight256
    hi Normal guibg=NONE ctermbg=NONE
endif

" Called once right before you start selecting multiple cursors
function! Multiple_cursors_before()
  if exists(':NeoCompleteLock')==2
    exe 'NeoCompleteLock'
  endif
endfunction

" Called once only when the multiple selection is canceled (default <Esc>)
function! Multiple_cursors_after()
  if exists(':NeoCompleteUnlock')==2
    exe 'NeoCompleteUnlock'
  endif
endfunction

let g:neocomplete#enable_at_startup = 1
