$[ included1.mm $]
  $c -> $.
  $c -. $.
  $c wff $.
  $c |- $.
  $v ph $.
  $v ps $.
  $v ch $.

$( this should be skipped because in comment $[ incomment.mm $] $)

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

$[ included2.mm $]

  ${
    
    syl.1 $e |- ( ph -> ps ) $.
    
    syl.2 $e |- ( ps -> ch ) $.
    
    syl $p |- ( ph -> ch ) $=
      ( wi a1i mpd ) ABCDBCFAEGH $.
  $}
