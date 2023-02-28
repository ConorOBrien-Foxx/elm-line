# elm-line

A simple wrapper for Elm that takes Elm scripts and runs them as a command line program.

## Example Usage

```hs
$ cat square.ielm
main = Interact.onInts (\x -> x * x)

$ elm-line square.ielm
> 15
225
> 532
283024
> ^C

$ cat tac.ielm
-- a simple program which reverses each line
-- !woem --
main = Interact.onLines String.reverse

$ elm-line tac.ielm <tac.ielm
enil hcae sesrever hcihw margorp elpmis a --
-- meow! --
esrever.gnirtS seniLno.tcaretnI = niam

$ cat paren-words.ielm
onWords : (String -> String) -> Interact.Interactor
onWords fn =
  Interact.onLines (String.split " " >> List.map fn >> String.join " ")
main = onWords (\word -> "(" ++ word ++ ")")

$ elm-line paren-words.ielm
> hello there
(hello) (there)
> what is a word
(what) (is) (a) (word)
> ^C
```
