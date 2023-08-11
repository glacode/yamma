$c formula |- ( ) $.

$v x y z w $.
xf $f formula x $.
yf $f formula y $.
zf $f formula z $.
wf $f formula w $.
combo $a formula ( x y ) $.
${
  $d x y $.
  ax-1 $a |- ( x y ) $.
$}

${
  $d x y $.
  $d z w $.
  almostgood $p |- ( ( x y ) ( z w ) ) $=
    xf yf combo zf wf combo ax-1 $.
$}
