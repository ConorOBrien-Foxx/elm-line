module Main exposing (main)

import Interact

-- header
-- end header

-- code
fibo n =
  if n == 0 || n == 1 then n
  else fibo(n - 1) + fibo(n - 2)
-- end code
-- footer
main = Interact.onInts fibo
-- end footer
