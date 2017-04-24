
" An example for a vimrc file.
"
" To use it, copy it to
"     for Unix:     $HOME/.config/nvim/init.vim
"     for Windows:  %LOCALAPPDATA%\nvim\init.vim

set backup             " keep a backup file (restore to previous version)
set undofile           " keep an undo file (undo changes after closing)
set ruler              " show the cursor position all the time
set showcmd            " display incomplete commands

" Don't use Ex mode, use Q for formatting
noremap Q gq

" CTRL-U in insert mode deletes a lot.  Use CTRL-G u to first break undo,
" so that you can undo CTRL-U after inserting a line break.
inoremap <C-U> <C-G>u<C-U>

" Switch syntax highlighting on
syntax on

" Also switch on highlighting the last used search pattern.
set hlsearch

" I like highlighting strings inside C comments.
let c_comment_strings=1

" Enable file type detection.
" Use the default filetype settings, so that mail gets 'textwidth' set to 72,
" 'cindent' is on in C files, etc.
" Also load indent files, to automatically do language-dependent indenting.
filetype plugin indent on

" Put these in an autocmd group, so that we can delete them easily.
augroup vimrcEx
  autocmd!

  " For all text files set 'textwidth' to 78 characters.
  autocmd FileType text setlocal textwidth=78

  " When editing a file, always jump to the last known cursor position.
  " Don't do it when the position is invalid or when inside an event handler
  autocmd BufReadPost *
    \ if line("'\"") >= 1 && line("'\"") <= line("$") |
    \   execute "normal! g`\"" |
    \ endif

augroup END

" Convenient command to see the difference between the current buffer and the
" file it was loaded from, thus the changes you made.
" Only define it when not defined already.
if !exists(":DiffOrig")
  command DiffOrig vert new | set buftype=nofile | read ++edit # | 0d_ | diffthis
                 \ | wincmd p | diffthis
endif

" =====================================================================================
" =====================================================================================
" =====================================================================================

call plug#begin('~/.local/share/nvim/plugged')

Plug 'w0rp/ale'
Plug 'lilydjwg/colorizer'
Plug 'raimondi/delimitmate'
Plug 'shougo/deoplete.nvim', { 'do': ':UpdateRemotePlugins' }
Plug 'junegunn/fzf', { 'dir': '~/.fzf', 'do': './install --bin' }
Plug 'junegunn/fzf.vim'
Plug 'scrooloose/nerdcommenter'
Plug 'scrooloose/nerdtree'
Plug 'xuyuanp/nerdtree-git-plugin'
Plug 'talek/obvious-resize'
Plug 'elentok/plaintasks.vim'
Plug 'ervandew/supertab'
Plug 'godlygeek/tabular'
Plug 'majutsushi/tagbar'
Plug 'sirver/ultisnips'
Plug 'easymotion/vim-easymotion'
Plug 'tpope/vim-fugitive'
Plug 'airblade/vim-gitgutter'
Plug 'terryma/vim-multiple-cursors'
Plug 'jistr/vim-nerdtree-tabs'
Plug 'tpope/vim-repeat'
Plug 'powerman/vim-plugin-ruscmd'
Plug 'honza/vim-snippets'
Plug 'tpope/vim-surround'
Plug 'bronson/vim-trailing-whitespace'
Plug 'thaerkh/vim-workspace'

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

nnoremap <leader>tw :ToggleWorkspace<CR>

set spelllang=en,ru

let g:deoplete#enable_at_startup = 1
let g:workspace_autosave_untrailspaces = 0
let g:workspace_autosave_ignore = ['gitcommit']
let g:workspace_session_name = 'Session.vim'
let g:SuperTabDefaultCompletionType = '<c-n>'
let g:UltiSnipExpandTrigger='<tab>'
let g:UltiSnipsJumpForwardTrigger='<c-b>'
let g:UltiSnipsJumpBackwardTrigger='<c-z>'
