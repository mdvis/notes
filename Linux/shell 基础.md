## Getting Started
### hello.sh
```
#!/bin/bash
VAR="world"
echo "Hello $VAR!" # => Hello world!
```
Execute the script
```
$ bash hello.sh
```
### Variables
```
NAME="John"
echo ${NAME}    # => John (Variables)
echo $NAME      # => John (Variables)
echo "$NAME"    # => John (Variables)
echo '$NAME'    # => $NAME (Exact string)
echo "${NAME}!" # => John! (Variables)
NAME = "John"   # => Error (about space)
```
### Comments
```
# This is an inline Bash comment.
```
```
: '
This is a
very neat comment
in bash
'
```
Multi-line comments use `:'` to open and `'` to close
### Arguments {.row-span-2}

|Expression|Description|
|---|---|
|`$1` … `$9`|Parameter 1 ... 9|
|`$0`|Name of the script itself|
|`$1`|First argument|
|`${10}`|Positional parameter 10|
|`$#`|Number of arguments|
|`$$`|Process id of the shell|
|`$*`|All arguments|
|`$@`|All arguments, starting from first|
|`$-`|Current options|
|`$_`|Last argument of the previous command|
See: [Special parameters](http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables "http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables")
### Functions
```
get_name() {
    echo "John"
}
echo "You are $(get_name)"
```
See: [Functions](#bash-functions "#bash-functions")
### Conditionals {#conditionals-example}
```
if [[ -z "$string" ]]; then
    echo "String is empty"
elif [[ -n "$string" ]]; then
    echo "String is not empty"
fi
```
See: [Conditionals](#bash-conditionals "#bash-conditionals")
### Brace expansion
```
echo {A,B}.js
```
---

|Expression|Description|
|---|---|
|`{A,B}`|Same as `A B`|
|`{A,B}.js`|Same as `A.js B.js`|
|`{1..5}`|Same as `1 2 3 4 5`|
See: [Brace expansion](http://wiki.bash-hackers.org/syntax/expansion/brace "http://wiki.bash-hackers.org/syntax/expansion/brace")
### Shell execution
```
# => I'm in /path/of/current
echo "I'm in $(PWD)"
# Same as:
echo "I'm in `pwd`"
```
See: [Command substitution](http://wiki.bash-hackers.org/syntax/expansion/cmdsubst "http://wiki.bash-hackers.org/syntax/expansion/cmdsubst")
## Bash Parameter expansions
### Syntax {.row-span-2}

|Code|Description|
|---|---|
|`${FOO%suffix}`|Remove suffix|
|`${FOO#prefix}`|Remove prefix|
|`${FOO%%suffix}`|Remove long suffix|
|`${FOO##prefix}`|Remove long prefix|
|`${FOO/from/to}`|Replace first match|
|`${FOO//from/to}`|Replace all|
|`${FOO/%from/to}`|Replace suffix|
|`${FOO/#from/to}`|Replace prefix|
#### Substrings

|Expression|Description|
|---|---|
|`${FOO:0:3}`|Substring _(position, length)_|
|`${FOO:(-3):3}`|Substring from the right|
#### Length

|Expression|Description|
|---|---|
|`${#FOO}`|Length of `$FOO`|
#### Default values

|Expression|Description|
|---|---|
|`${FOO:-val}`|`$FOO`, or `val` if unset|
|`${FOO:=val}`|Set `$FOO` to `val` if unset|
|`${FOO:+val}`|`val` if `$FOO` is set|
|`${FOO:?message}`|Show message and exit if `$FOO` is unset|
### Substitution
```
echo ${food:-Cake}  #=> $food or "Cake"
```
```
STR="/path/to/foo.cpp"
echo ${STR%.cpp}    # /path/to/foo
echo ${STR%.cpp}.o  # /path/to/foo.o
echo ${STR%/*}      # /path/to
echo ${STR##*.}     # cpp (extension)
echo ${STR##*/}     # foo.cpp (basepath)
echo ${STR#*/}      # path/to/foo.cpp
echo ${STR##*/}     # foo.cpp
echo ${STR/foo/bar} # /path/to/bar.cpp
```
### String case conversion
```
STR="hello world"
echo ${STR^}     # => Hello world
echo ${STR^^}    # => HELLO WORLD
echo ${STR,}     # => hello world
echo ${STR,,}    # => HELLO WORLD
```
### String pattern matching
```
STR="path/to/file.txt"
[[ $STR == *.txt ]] && echo "Text file"   # True
[[ $STR == */* ]]   && echo "Has path"    # True
[[ $STR == f* ]]    && echo "Starts with f"# True
```
### String trimming
```
# Remove leading whitespace
var="   hello   "
echo "${var#"${var%%[![:space:]]*}"}"  # => hello

# Remove trailing whitespace
echo "${var%"${var##*[![:space:]]}"}"   # => hello

# Remove both
trimmed="${var#"${var%%[![:space:]]*}"}"
trimmed="${trimmed%"${trimmed##*[![:space:]]}"}"
echo "$trimmed"  # => hello
```
### String length
```
STR="Hello"
echo ${#STR}      # => 5

# Array length
arr=(a b c)
echo ${#arr[@]}   # => 3
echo ${#arr}      # => 1 (length of first element)
```
### Character class matching
```
[[ $STR =~ [a-z] ]] && echo "Contains lowercase"
[[ $STR =~ [A-Z] ]] && echo "Contains uppercase"
[[ $STR =~ [0-9] ]] && echo "Contains numbers"
[[ $STR =~ ^[A-Z] ]] && echo "Starts with uppercase"
[[ $STR =~ [A-Z]$ ]] && echo "Ends with uppercase"
```
### Slicing
```
name="John"
echo ${name}           # => John
echo ${name:0:2}       # => Jo
echo ${name::2}        # => Jo
echo ${name::-1}       # => Joh
echo ${name:(-1)}      # => n
echo ${name:(-2)}      # => hn
echo ${name:(-2):2}    # => hn
length=2
echo ${name:0:length}  # => Jo
```
See: [Parameter expansion](http://wiki.bash-hackers.org/syntax/pe "http://wiki.bash-hackers.org/syntax/pe")
### basepath & dirpath
```
SRC="/path/to/foo.cpp"
```
```
BASEPATH=${SRC##*/}
echo $BASEPATH  # => "foo.cpp"
DIRPATH=${SRC%$BASEPATH}
echo $DIRPATH   # => "/path/to/"
```
### Transform
```
STR="HELLO WORLD!"
echo ${STR,}   # => hELLO WORLD!
echo ${STR,,}  # => hello world!
STR="hello world!"
echo ${STR^}   # => Hello world!
echo ${STR^^}  # => HELLO WORLD!
ARR=(hello World)
echo "${ARR[@],}" # => hello world
echo "${ARR[@]^}" # => Hello World
```
## Bash Arrays
### Defining arrays
```
Fruits=('Apple' 'Banana' 'Orange')
Fruits[0]="Apple"
Fruits[1]="Banana"
Fruits[2]="Orange"
ARRAY1=(foo{1..2}) # => foo1 foo2
ARRAY2=({A..D})    # => A B C D
# Merge => foo1 foo2 A B C D
ARRAY3=(${ARRAY1[@]} ${ARRAY2[@]})
# declare construct
declare -a Numbers=(1 2 3)
Numbers+=(4 5) # Append => 1 2 3 4 5
```
### Indexing
|-|-|
|---|---|
|`${Fruits[0]}`|First element|
|`${Fruits[-1]}`|Last element|
|`${Fruits[*]}`|All elements|
|`${Fruits[@]}`|All elements|
|`${#Fruits[@]}`|Number of all|
|`${#Fruits}`|Length of 1st|
|`${#Fruits[3]}`|Length of nth|
|`${Fruits[@]:3:2}`|Range|
|`${!Fruits[@]}`|Keys of all|
### Iteration
```
Fruits=('Apple' 'Banana' 'Orange')
for e in "${Fruits[@]}"; do
    echo $e
done
```
#### With index
```
for i in "${!Fruits[@]}"; do
  printf "%s\t%s\n" "$i" "${Fruits[$i]}"
done
```
### Operations {.col-span-2}
```
Fruits=("${Fruits[@]}" "Watermelon")     # Push
Fruits+=('Watermelon')                   # Also Push
Fruits=( ${Fruits[@]/Ap*/} )             # Remove by regex match
unset Fruits[2]                          # Remove one item
Fruits=("${Fruits[@]}")                  # Duplicate
Fruits=("${Fruits[@]}" "${Veggies[@]}")  # Concatenate
lines=(`cat "logfile"`)                  # Read from file
```
### Arrays as arguments
```
function extract()
{
    local -n myarray=$1
    local idx=$2
    echo "${myarray[$idx]}"
}
Fruits=('Apple' 'Banana' 'Orange')
extract Fruits 2     # => Orangle
```
## Bash Dictionaries
### Defining
```
declare -A sounds
```
```
sounds[dog]="bark"
sounds[cow]="moo"
sounds[bird]="tweet"
sounds[wolf]="howl"
```
### Working with dictionaries
```
echo ${sounds[dog]} # Dog's sound
echo ${sounds[@]}   # All values
echo ${!sounds[@]}  # All keys
echo ${#sounds[@]}  # Number of elements
unset sounds[dog]   # Delete dog
```
### Iteration
```
for val in "${sounds[@]}"; do
    echo $val
done
```
---
```
for key in "${!sounds[@]}"; do
    echo $key
done
```
## Bash Conditionals
### Integer conditions
|Condition|Description|
|---|---|
|`[[ NUM -eq NUM ]]`|Equal|
|`[[ NUM -ne NUM ]]`|Not equal|
|`[[ NUM -lt NUM ]]`|Less than|
|`[[ NUM -le NUM ]]`|Less than or equal|
|`[[ NUM -gt NUM ]]`|Greater than|
|`[[ NUM -ge NUM ]]`|Greater than or equal|
|`(( NUM < NUM ))`|Less than|
|`(( NUM <= NUM ))`|Less than or equal|
|`(( NUM > NUM ))`|Greater than|
|`(( NUM >= NUM ))`|Greater than or equal|
### String conditions
|Condition|Description|
|---|---|
|`[[ -z STR ]]`|Empty string|
|`[[ -n STR ]]`|Not empty string|
|`[[ STR == STR ]]`|Equal|
|`[[ STR = STR ]]`|Equal (Same above)|
|`[[ STR < STR ]]`|Less than _(ASCII)_|
|`[[ STR > STR ]]`|Greater than _(ASCII)_|
|`[[ STR != STR ]]`|Not Equal|
|`[[ STR =~ STR ]]`|Regexp|
### Example {.row-span-3}
#### String
```
if [[ -z "$string" ]]; then
    echo "String is empty"
elif [[ -n "$string" ]]; then
    echo "String is not empty"
else
    echo "This never happens"
fi
```
#### Combinations
```
if [[ X && Y ]]; then
    ...
fi
```
#### Equal
```
if [[ "$A" == "$B" ]]; then
    ...
fi
```
#### Regex
```
if [[ '1. abc' =~ ([a-z]+) ]]; then
    echo ${BASH_REMATCH[1]}
fi
```
#### Smaller
```
if (( $a < $b )); then
   echo "$a is smaller than $b"
fi
```
#### Exists
```
if [[ -e "file.txt" ]]; then
    echo "file exists"
fi
```
### File conditions {.row-span-2}
|Condition|Description|
|---|---|
|`[[ -e FILE ]]`|Exists|
|`[[ -d FILE ]]`|Directory|
|`[[ -f FILE ]]`|File|
|`[[ -h FILE ]]`|Symlink|
|`[[ -s FILE ]]`|Size is > 0 bytes|
|`[[ -r FILE ]]`|Readable|
|`[[ -w FILE ]]`|Writable|
|`[[ -x FILE ]]`|Executable|
|`[[ f1 -nt f2 ]]`|f1 newer than f2|
|`[[ f1 -ot f2 ]]`|f2 older than f1|
|`[[ f1 -ef f2 ]]`|Same files|
### More conditions
| Condition | Description |  
| -------------------- | -------------------- | ----- | --- |  
| `[[ -o noclobber ]]` | If OPTION is enabled |  
| `[[ ! EXPR ]]` | Not |  
| `[[ X && Y ]]` | And |  
| `[[ X | | Y ]]` | Or |
### logical and, or
```
if [ "$1" = 'y' -a $2 -gt 0 ]; then
    echo "yes"
fi
if [ "$1" = 'n' -o $2 -lt 0 ]; then
    echo "no"
fi
```
## Bash Loops
### Basic for loop
```
for i in /etc/rc.*; do
    echo $i
done
```
### C-like for loop
```
for ((i = 0 ; i < 100 ; i++)); do
    echo $i
done
```
### Ranges {.row-span-2}
```
for i in {1..5}; do
    echo "Welcome $i"
done
```
#### With step size
```
for i in {5..50..5}; do
    echo "Welcome $i"
done
```
### Auto increment
```
i=1
while [[ $i -lt 4 ]]; do
    echo "Number: $i"
    ((i++))
done
```
### Auto decrement
```
i=3
while [[ $i -gt 0 ]]; do
    echo "Number: $i"
    ((i--))
done
```
### Continue
```
for number in $(seq 1 3); do
    if [[ $number == 2 ]]; then
        continue;
    fi
    echo "$number"
done
```
### Break
```
for number in $(seq 1 3); do
    if [[ $number == 2 ]]; then
        # Skip entire rest of loop.
        break;
    fi
    # This will only print 1
    echo "$number"
done
```
### Until
```
count=0
until [ $count -gt 10 ]; do
    echo "$count"
    ((count++))
done
```
### Forever
```
while true; do
    # here is some code.
done
```
### Forever (shorthand)
```
while :; do
    # here is some code.
done
```
### Reading lines
```
cat file.txt | while read line; do
    echo $line
done
```
## Bash Process Management
### Process control
```
# Run in background
command &

# Process ID
echo $!  # PID of last background process

# Wait for process
wait $PID

# Kill process
kill $PID           # SIGTERM
kill -9 $PID        # SIGKILL
kill -15 $PID       # SIGTERM (default)
```
### Job control
```
# Suspend current job
Ctrl+Z

# List jobs
jobs

# Bring job to foreground
fg %1

# Send job to background
bg %1
```
### Process substitution
```
# Process as file
diff <(sort file1.txt) <(sort file2.txt)

# Process as array
files=($(ls))
```
### Parallel execution
```
# Run commands in parallel
{
    command1 &
    command2 &
    command3 &
    wait
}

# xargs for parallel
find . -name "*.txt" | xargs -P4 -I{} grep "pattern" {}
```
### Signal handling
```
trap 'echo "Signal received"' SIGINT SIGTERM

# Custom cleanup function
cleanup() {
    echo "Cleaning up..."
    # Cleanup code here
}
trap cleanup EXIT
```
## Bash Functions
### Defining functions
```
myfunc() {
    echo "hello $1"
}
```
```
# Same as above (alternate syntax)
function myfunc() {
    echo "hello $1"
}
```
```
myfunc "John"
```
### Returning values
```
myfunc() {
    local myresult='some value'
    echo $myresult
}
```
```
result="$(myfunc)"
```
### Raising errors
```
myfunc() {
    return 1
}
```
```
if myfunc; then
    echo "success"
else
    echo "failure"
fi
```
## Bash Options {.cols-2}
### Options
```
# Avoid overlay files
# (echo "hi" > foo)
set -o noclobber
# Used to exit upon error
# avoiding cascading errors
set -o errexit
# Unveils hidden failures
set -o pipefail
# Exposes unset variables
set -o nounset
```
### Glob options
```
# Non-matching globs are removed
# ('*.foo' => '')
shopt -s nullglob
# Non-matching globs throw errors
shopt -s failglob
# Case insensitive globs
shopt -s nocaseglob
# Wildcards match dotfiles
# ("*.sh" => ".foo.sh")
shopt -s dotglob
# Allow ** for recursive matches
# ('lib/**/*.rb' => 'lib/a/b/c.rb')
shopt -s globstar
```
## Bash Configuration Files
### Configuration file order
```bash
# Interactive login shells (in order):
/etc/profile          # System-wide settings
~/.bash_profile       # User-specific settings (if exists)
~/.bash_login         # Fallback to ~/.bash_profile
~/.profile            # Fallback if neither above exist

# Interactive non-login shells:
/etc/bash.bashrc      # System-wide rc
~/.bashrc             # User-specific rc

# Non-interactive shells:
/etc/bash.bashrc      # System-wide rc
~/.bashrc             # User-specific rc
```
### Common .bashrc configurations
```bash
# Aliases
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'
alias grep='grep --color=auto'

# Environment variables
export EDITOR=vim
export PAGER=less
export PS1='\u@\h:\w\$ '

# History settings
export HISTCONTROL=ignoredups:erasedups  # No duplicates
export HISTSIZE=10000
export HISTFILESIZE=20000
shopt -s histappend  # Append to history, don't overwrite

# Better completion
bind '"\e[A": history-search-backward'
bind '"\e[B": history-search-forward'

# Colored man pages
man() {
    LESS_TERMCAP_md=$'\e[01;31m' \
    LESS_TERMCAP_me=$'\e[0m' \
    LESS_TERMCAP_se=$'\e[0m' \
    LESS_TERMCAP_so=$'\e[01;33m' \
    LESS_TERMCAP_ue=$'\e[0m' \
    LESS_TERMCAP_us=$'\e[01;32m' \
    command man "$@"
}
```
### Shell startup functions
```bash
# Function to add to PATH
add_to_path() {
    if [[ -d "$1" ]] && [[ ":$PATH:" != *":$1:"* ]]; then
        PATH="$1${PATH:+:$PATH}"
    fi
}

# Function to load completion
load_completion() {
    if [[ -f "$1/completion.bash" ]]; then
        source "$1/completion.bash"
    fi
}

# Example usage
add_to_path "$HOME/.local/bin"
add_to_path "$HOME/.rbenv/bin"
load_completion "$HOME/.completions"
```
### Shell types
```bash
# Check shell type
echo $0                    # Current shell name
echo $SHELL                # Default shell
ps -p $$ -o comm=          # Current shell process name

# Switch shell
bash -l                    # Start login shell
bash -c "echo 'non-interactive'"  # Non-interactive
zsh                        # Switch to zsh (if installed)
```
## Bash History {.cols-2}
### Commands
|Command|Description|
|---|---|
|`history`|Show history|
|`sudo !!`|Run the previous command with sudo|
|`shopt -s histverify`|Don't execute expanded result immediately|
### Expansions
|Expression|Description|
|---|---|
|`!$`|Expand last parameter of most recent command|
|`!*`|Expand all parameters of most recent command|
|`!-n`|Expand `n`th most recent command|
|`!n`|Expand `n`th command in history|
|`!<command>`|Expand most recent invocation of command `<command>`|
### Operations
|Code|Description|
|---|---|
|`!!`|Execute last command again|
|`!!:s/<FROM>/<TO>/`|Replace first occurrence of `<FROM>` to `<TO>` in most recent command|
|`!!:gs/<FROM>/<TO>/`|Replace all occurrences of `<FROM>` to `<TO>` in most recent command|
|`!$:t`|Expand only basename from last parameter of most recent command|
|`!$:h`|Expand only directory from last parameter of most recent command|
`!!` and `!$` can be replaced with any valid expansion.
### Slices
|Code|Description|
|---|---|
|`!!:n`|Expand only `n`th token from most recent command (command is `0`; first argument is `1`)|
|`!^`|Expand first argument from most recent command|
|`!$`|Expand last token from most recent command|
|`!!:n-m`|Expand range of tokens from most recent command|
|`!!:n-$`|Expand `n`th token to last from most recent command|
`!!` can be replaced with any valid expansion i.e. `!cat`, `!-2`, `!42`, etc.
## Miscellaneous
### Numeric calculations
```
$((a + 200))      # Add 200 to $a
```
```
$(($RANDOM%200))  # Random number 0..199
```
### Subshells
```
(cd somedir; echo "I'm now in $PWD")
pwd # still in first directory
```
### Inspecting commands
```
command -V cd
#=> "cd is a function/alias/whatever"
```
### Redirection {.row-span-2 .col-span-2}
```
python hello.py > output.txt   # stdout to (file)
python hello.py >> output.txt  # stdout to (file), append
python hello.py 2> error.log   # stderr to (file)
python hello.py 2>&1           # stderr to stdout
python hello.py 2>/dev/null    # stderr to (null)
python hello.py &>/dev/null    # stdout and stderr to (null)
```
```
python hello.py < foo.txt      # feed foo.txt to stdin for python
```
### Advanced redirection
```
# Tee - read from stdin and write to stdout and files
command | tee output.txt          # stdout to file and screen
command | tee -a output.txt       # append to file
command | tee file1.txt file2.txt # write to multiple files

# Redirect only stderr to screen, stdout to file
command 2>&1 >/dev/null

# Swap stdout and stderr
command 3>&1 1>&2 2>&3-

# Here documents
cat <<EOF
This is a here document
Multiple lines
EOF

# Here strings
cmd <<< "input string"

# Process file line by line
while IFS= read -r line; do
    echo "Processing: $line"
done < input.txt
```
### Redirection with file descriptors
```
# Save file descriptors
exec 3>&1  # Save stdout to fd 3
exec 1>output.txt  # Redirect stdout to file
echo "This goes to file"  # Goes to output.txt
exec 1>&3  # Restore stdout
echo "This goes to screen"  # Goes to screen

# Named pipes
mkfifo my_pipe
command1 > my_pipe &
command2 < my_pipe &
```
### Source relative
```
source "${0%/*}/../share/foo.sh"
```
### Directory of script
```
DIR="${0%/*}"
```
### Case/switch
```
case "$1" in
    start | up)
    vagrant up
    ;;
    *)
    echo "Usage: $0 {start|stop|ssh}"
    ;;
esac
```
### Debugging options
```
# Enable debugging
set -x              # Print commands as they are executed
set -v              # Print shell input lines as they are read
set -n              # Read commands but don't execute them

# Debug specific function
debug_function() {
    local func_name="$1"
    shift
    bash -xvc "source '$0'; $func_name $*"
}
```
### Error handling strategies
```
# Strict mode (recommended for production)
set -euo pipefail
IFS=$'\n\t'

# Custom error handler
error_handler() {
    local exit_code=$?
    local line_number=$1
    echo "Error on line $line_number with exit code $exit_code" >&2
    echo "Command failed: $(history 1 | sed -e 's/^[ ]*//;s/[ ]*$//')" >&2
    exit $exit_code
}
trap 'error_handler $LINENO' ERR

# Validate required variables
check_required_vars() {
    local var
    for var in "$@"; do
        if [[ -z "${!var}" ]]; then
            echo "Error: Required variable '$var' is not set" >&2
            exit 1
        fi
    done
}

# Example usage
check_required_vars DB_HOST DB_USER DB_PASS
```
### Logging
```
# Simple logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2
}

# Logging with levels
log_level=INFO

log_with_level() {
    local level="$1"
    shift
    if [[ $level == $log_level ]] || [[ $level == "ERROR" ]]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $*" >&2
    fi
}

log_with_level "INFO" "Starting script"
log_with_level "DEBUG" "Debug information"
log_with_level "ERROR" "Something went wrong"
```
### Assertion
```
assert() {
    local condition="$1"
    local message="$2"
    if ! eval "$condition"; then
        echo "Assertion failed: $message" >&2
        echo "Condition: $condition" >&2
        exit 1
    fi
}

# Usage
assert "$count -gt 0" "Count must be positive"
assert "[[ -f '$file' ]]" "File must exist"
```
### Trap errors {.col-span-2}
```
trap 'echo Error at about $LINENO' ERR
```
or
```
traperr() {
    echo "ERROR: ${BASH_SOURCE[1]} at about ${BASH_LINENO[0]}"
}
set -o errtrace
trap traperr ERR
```
### printf
```
printf "Hello %s, I'm %s" Sven Olga
#=> "Hello Sven, I'm Olga
printf "1 + 1 = %d" 2
#=> "1 + 1 = 2"
printf "Print a float: %f" 2
#=> "Print a float: 2.000000"
```
### Getting options {.col-span-2}
```
while [[ "$1" =~ ^- && ! "$1" == "--" ]]; do case $1 in
    -V | --version )
    echo $version
    exit
    ;;
    -s | --string )
    shift; string=$1
    ;;
    -f | --flag )
    flag=1
    ;;
esac; shift; done
if [[ "$1" == '--' ]]; then shift; fi
```
### Check for command's result {.col-span-2}
```
if ping -c 1 google.com; then
    echo "It appears you have a working internet connection"
fi
```
### Special variables {.row-span-2}
|Expression|Description|
|---|---|
|`$?`|Exit status of last task|
|`$!`|PID of last background task|
|`$$`|PID of shell|
|`$0`|Filename of the shell script|
See [Special parameters](http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables "http://wiki.bash-hackers.org/syntax/shellvars#special_parameters_and_shell_variables").
### Grep check {.col-span-2}
```
if grep -q 'foo' ~/.bash_history; then
    echo "You appear to have typed 'foo' in the past"
fi
```
### Backslash escapes {.row-span-2}
- !
- "
- #
- &
- '
- (
- )
- ,
- ;
- <
- >
- [
- |
- \
- ]
- ^
- {
- }
- `
- $
- *
- ?
{.cols-4 .marker-none}
Escape these special characters with `\`
### Heredoc
```
cat <<END
hello world
END
```
### Go to previous directory
```
pwd # /home/user/foo
cd bar/
pwd # /home/user/foo/bar
cd -
pwd # /home/user/foo
```
### Reading input
```
echo -n "Proceed? [y/n]: "
read ans
echo $ans
```
```
read -n 1 ans    # Just one character
```
### Conditional execution
```
git commit && git push
git commit || echo "Commit failed"
```
### Strict mode
```
set -euo pipefail
IFS=$'\n\t'
```
See: [Unofficial bash strict mode](http://redsymbol.net/articles/unofficial-bash-strict-mode/ "http://redsymbol.net/articles/unofficial-bash-strict-mode/")
### Optional arguments
```
args=("$@")
args+=(foo)
args+=(bar)
echo "${args[@]}"
```
Put the arguments into an array and then append
### Practical Shell Tips
### File operations
```
# Safe copy with progress
cp -v source.txt dest.txt

# Find and delete files older than 30 days
find /path -name "*.log" -mtime +30 -delete

# Create directory with parent directories
mkdir -p /path/to/directory

# Create archive with progress
tar -czf archive.tar.gz --verbose /path/to/directory/

# Show disk usage sorted by size
du -sh * | sort -rh
```
### Text processing
```
# Remove duplicate lines, keeping order
sort -u file.txt > file_unique.txt

# Count lines, words, characters
wc -l file.txt  # lines
wc -w file.txt  # words
wc -c file.txt  # characters

# Extract columns
cut -d',' -f2,4 data.csv

# Replace text in files
sed -i 's/old/new/g' file.txt

# Convert text to uppercase
tr '[:lower:]' '[:upper:]' < input.txt
```
### System monitoring
```
# Monitor system resources
top -b -n 1 | head -20

# Show network connections
netstat -tuln

# Show open files
lsof -i :8080

# Monitor filesystem usage
df -h

# Show recent system logs
tail -f /var/log/syslog
```
### Time operations
```
# Measure command execution time
time command

# Sleep with countdown
for i in {10..1}; do echo -n "$i "; sleep 1; done; echo "GO!"

# Date calculations
date +%Y%m%d_%H%M%S  # Timestamp format

# Calculate age of file
file="test.txt"
if [[ -f $file ]]; then
    age=$(( $(date +%s) - $(stat -f %m "$file") ))
    echo "File is $age seconds old"
fi
```
### Quick calculations
```
# Convert units
echo "1024" | numfmt --to=iec       # 1.0K
echo "1K" | numfmt --from=iec --to=bytes  # 1024

# Calculate percentages
awk '{printf "%.2f%%\n", $1/$2*100}' <(echo 75) <(echo 100)

# Math operations
echo "scale=2; 10/3" | bc  # 3.33

# Random number
echo $((RANDOM % 100 + 1))
```
### Conditional shortcuts
```
# Check if command exists
command -v git >/dev/null && echo "Git installed"

# Check if port is open
nc -z localhost 8080 && echo "Port 8080 is open"

# Check if string contains substring
[[ "hello world" == *"world"* ]] && echo "Contains"

# Check if array contains element
arr=(a b c)
if [[ " ${arr[@]} " =~ " b " ]]; then
    echo "Array contains b"
fi
```
### Path operations
```
# Get absolute path
realpath relative/path

# Get directory of current script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Get filename without extension
filename="archive.tar.gz"
basename="${filename##*/}"
echo "${basename%.*}"  # archive.tar

# Join path parts
printf -v joined "%s/%s" "/path/to" "file.txt"
echo $joined  # /path/to/file.txt
```
## Also see {.cols-1}
- [Devhints](https://devhints.io/bash "https://devhints.io/bash") _(devhints.io)_
- [Bash-hackers wiki](http://wiki.bash-hackers.org/ "http://wiki.bash-hackers.org/") _(bash-hackers.org)_
- [Shell vars](http://wiki.bash-hackers.org/syntax/shellvars "http://wiki.bash-hackers.org/syntax/shellvars") _(bash-hackers.org)_
- [Learn bash in y minutes](https://learnxinyminutes.com/docs/bash/ "https://learnxinyminutes.com/docs/bash/") _(learnxinyminutes.com)_
- [Bash Guide](http://mywiki.wooledge.org/BashGuide "http://mywiki.wooledge.org/BashGuide") _(mywiki.wooledge.org)_
- [ShellCheck](https://www.shellcheck.net/ "https://www.shellcheck.net/") _(shellcheck.net)_
- [shell - Standard Shell](https://devmanual.gentoo.org/tools-reference/bash/index.html "https://devmanual.gentoo.org/tools-reference/bash/index.html") _(devmanual.gentoo.org)_