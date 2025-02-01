  $( con3d has a wrong proof, but pm3.2im does not depend on it $)
  $c ( $.  
  $c ) $.  
  $c -> $. 
  $c -. $. 
  $c wff $. 
  $c |- $.
  $v ph $.  
  $v ps $.  
  $v ch $.  

  wph $f wff ph $.
  
  wps $f wff ps $.
  
  wch $f wff ch $.
  
  wn $a wff -. ph $.
  
  wi $a wff ( ph -> ps ) $.
  ${
    
    min $e |- ph $.
    
    maj $e |- ( ph -> ps ) $.
    
    ax-mp $a |- ps $.
  $}
  
  ax-1 $a |- ( ph -> ( ps -> ph ) ) $.
  
  ax-2 $a |- ( ( ph -> ( ps -> ch ) ) -> ( ( ph -> ps ) -> ( ph -> ch ) ) ) $.
  
  ${
    a1i.1 $e |- ph $.
    
    a1i $p |- ( ps -> ph ) $=
      ( wi ax-1 ax-mp ) ABADCABEF $.
  $}
  ${
    a2i.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    a2i $p |- ( ( ph -> ps ) -> ( ph -> ch ) ) $=
      ? $.
  $}
  ${
    mpd.1 $e |- ( ph -> ps ) $.
    mpd.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mpd $p |- ( ph -> ch ) $=
      ( wi a2i ax-mp ) ABFACFDABCEGH $.
  $}
  ${
    
    syl.1 $e |- ( ph -> ps ) $.
    
    syl.2 $e |- ( ps -> ch ) $.
    
    syl $p |- ( ph -> ch ) $=
      ( wi a1i mpd ) ABCDBCFAEGH $.
  $}
