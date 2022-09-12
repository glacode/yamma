$( This file is the introductory formal system example described
   in Chapter 4 of the Metamath book, "Anatomy of a proof". $)

$( Declare the constant symbols we will use $)
$c ( ) -> wff $.
$( Declare the metavariables we will use $)
$v p q r s $.
$( Declare wffs $)
wp $f wff p $.
wq $f wff q $.
wr $f wff r $.
ws $f wff s $.
w2 $a wff ( p -> q ) $.

$( Prove a simple theorem. $)
wnew $p wff ( s -> ( r -> p ) ) $= ws wr wp w2 ws $.