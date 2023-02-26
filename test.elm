-- type R a=I a|L(List(R a))
-- z v u=case(v,u)of
--  (I x,I y)->I(x,y)
--  (L x,L y)->L(List.map2 z x y)
--  (_,L y)->L(List.map(z v)y)
--  (L x,_)->L(List.map(\n->z n u)x)

-- fibo n =
--   if n == 0 || n == 1 then n
--   else fibo(n - 1) + fibo(n - 2)
-- main = Interact.onInts fibo

main = Interact.onInts (\x -> x * x)
