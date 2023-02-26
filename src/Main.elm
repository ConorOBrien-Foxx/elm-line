module Main exposing (main)

import Interact

main = Interact.onInts (\x -> x * x)
