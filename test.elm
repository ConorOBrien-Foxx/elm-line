type R a=I a|L(List(R a))
z v u=case(v,u)of
 (I x,I y)->I(x,y)
 (L x,L y)->L(List.map2 z x y)
 (_,L y)->L(List.map(z v)y)
 (L x,_)->L(List.map(\n->z n u)x)
 