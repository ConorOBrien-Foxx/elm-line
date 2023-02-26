# elm-line

A simple wrapper for Elm that takes Elm scripts and runs them as a command line program.

## Example Usage

```js
$ cat test.elm
main = Interact.onInts (\x -> x * x)
$ node . test.elm
15              // input line
225
532             // input line
283024
```