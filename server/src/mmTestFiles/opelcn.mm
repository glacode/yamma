  
  $c ( $.  
  $c ) $.  
  $c -> $. 
  $c -. $. 
  $c wff $. 
  $c |- $.
  
  $v ph $.  
  $v ps $.  
  $v ch $.  
  $v th $.  
  $v ta $.  
  $v et $.  
  $v ze $.  
  $v si $.  
  $v rh $.  
  $v mu $.  
  $v la $.  
  $v ka $.
  
  wph $f wff ph $.
  
  wps $f wff ps $.
  
  wch $f wff ch $.
  
  wth $f wff th $.
  
  wta $f wff ta $.
  
  wet $f wff et $.
  
  wze $f wff ze $.
  
  wsi $f wff si $.
  
  wrh $f wff rh $.
  
  wmu $f wff mu $.
  
  wla $f wff la $.
  
  wka $f wff ka $.
  
  wn $a wff -. ph $.
  
  wi $a wff ( ph -> ps ) $.
  ${
    
    min $e |- ph $.
    
    maj $e |- ( ph -> ps ) $.
    
    ax-mp $a |- ps $.
  $}
  
  ax-1 $a |- ( ph -> ( ps -> ph ) ) $.
  
  ax-2 $a |- ( ( ph -> ( ps -> ch ) ) -> ( ( ph -> ps ) -> ( ph -> ch ) ) ) $.
  
  ax-3 $a |- ( ( -. ph -> -. ps ) -> ( ps -> ph ) ) $.
  ${
    mp2.1 $e |- ph $.
    mp2.2 $e |- ps $.
    mp2.3 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mp2 $p |- ch $=
      ( wi ax-mp ) BCEABCGDFHH $.
  $}
  ${
    a1i.1 $e |- ph $.
    
    a1i $p |- ( ps -> ph ) $=
      ( wi ax-1 ax-mp ) ABADCABEF $.
  $}
  ${
    a2i.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    a2i $p |- ( ( ph -> ps ) -> ( ph -> ch ) ) $=
      ( wi ax-2 ax-mp ) ABCEEABEACEEDABCFG $.
  $}
  ${
    mpd.1 $e |- ( ph -> ps ) $.
    mpd.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mpd $p |- ( ph -> ch ) $=
      ( wi a2i ax-mp ) ABFACFDABCEGH $.
  $}
  ${
    imim2i.1 $e |- ( ph -> ps ) $.
    
    imim2i $p |- ( ( ch -> ph ) -> ( ch -> ps ) ) $=
      ( wi a1i a2i ) CABABECDFG $.
  $}
  ${
    
    syl.1 $e |- ( ph -> ps ) $.
    
    syl.2 $e |- ( ps -> ch ) $.
    
    syl $p |- ( ph -> ch ) $=
      ( wi a1i mpd ) ABCDBCFAEGH $.
  $}
  ${
    3syl.1 $e |- ( ph -> ps ) $.
    3syl.2 $e |- ( ps -> ch ) $.
    3syl.3 $e |- ( ch -> th ) $.
    
    3syl $p |- ( ph -> th ) $=
      ( syl ) ACDABCEFHGH $.
  $}
  ${
    4syl.1 $e |- ( ph -> ps ) $.
    4syl.2 $e |- ( ps -> ch ) $.
    4syl.3 $e |- ( ch -> th ) $.
    4syl.4 $e |- ( th -> ta ) $.
    
    4syl $p |- ( ph -> ta ) $=
      ( 3syl syl ) ADEABCDFGHJIK $.
  $}
  ${
    mpi.1 $e |- ps $.
    mpi.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mpi $p |- ( ph -> ch ) $=
      ( a1i mpd ) ABCBADFEG $.
  $}
  
  id $p |- ( ph -> ph ) $=
    ( wi ax-1 mpd ) AAABZAAACAECD $.
  
  idd $p |- ( ph -> ( ps -> ps ) ) $=
    ( wi id a1i ) BBCABDE $.
  ${
    a1d.1 $e |- ( ph -> ps ) $.
    
    a1d $p |- ( ph -> ( ch -> ps ) ) $=
      ( wi ax-1 syl ) ABCBEDBCFG $.
  $}
  ${
    a2d.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    
    a2d $p |- ( ph -> ( ( ps -> ch ) -> ( ps -> th ) ) ) $=
      ( wi ax-2 syl ) ABCDFFBCFBDFFEBCDGH $.
  $}
  ${
    sylcom.1 $e |- ( ph -> ( ps -> ch ) ) $.
    sylcom.2 $e |- ( ps -> ( ch -> th ) ) $.
    
    sylcom $p |- ( ph -> ( ps -> th ) ) $=
      ( wi a2i syl ) ABCGBDGEBCDFHI $.
  $}
  ${
    syl5com.1 $e |- ( ph -> ps ) $.
    syl5com.2 $e |- ( ch -> ( ps -> th ) ) $.
    
    syl5com $p |- ( ph -> ( ch -> th ) ) $=
      ( a1d sylcom ) ACBDABCEGFH $.
  $}
  ${
    com12.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    com12 $p |- ( ps -> ( ph -> ch ) ) $=
      ( id syl5com ) BBACBEDF $.
  $}
  ${
    syl5.1 $e |- ( ph -> ps ) $.
    syl5.2 $e |- ( ch -> ( ps -> th ) ) $.
    
    syl5 $p |- ( ch -> ( ph -> th ) ) $=
      ( syl5com com12 ) ACDABCDEFGH $.
  $}
  ${
    syl6.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6.2 $e |- ( ch -> th ) $.
    
    syl6 $p |- ( ph -> ( ps -> th ) ) $=
      ( wi a1i sylcom ) ABCDECDGBFHI $.
  $}
  ${
    syl56.1 $e |- ( ph -> ps ) $.
    syl56.2 $e |- ( ch -> ( ps -> th ) ) $.
    syl56.3 $e |- ( th -> ta ) $.
    
    syl56 $p |- ( ch -> ( ph -> ta ) ) $=
      ( syl6 syl5 ) ABCEFCBDEGHIJ $.
  $}
  ${
    syl6com.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6com.2 $e |- ( ch -> th ) $.
    
    syl6com $p |- ( ps -> ( ph -> th ) ) $=
      ( syl6 com12 ) ABDABCDEFGH $.
  $}
  ${
    mpcom.1 $e |- ( ps -> ph ) $.
    mpcom.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mpcom $p |- ( ps -> ch ) $=
      ( com12 mpd ) BACDABCEFG $.
  $}
  ${
    syl2im.1 $e |- ( ph -> ps ) $.
    syl2im.2 $e |- ( ch -> th ) $.
    syl2im.3 $e |- ( ps -> ( th -> ta ) ) $.
    
    syl2im $p |- ( ph -> ( ch -> ta ) ) $=
      ( wi syl5 syl ) ABCEIFCDBEGHJK $.
  $}
  
  pm2.27 $p |- ( ph -> ( ( ph -> ps ) -> ps ) ) $=
    ( wi id com12 ) ABCZABFDE $.
  ${
    mpdd.1 $e |- ( ph -> ( ps -> ch ) ) $.
    mpdd.2 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    
    mpdd $p |- ( ph -> ( ps -> th ) ) $=
      ( wi a2d mpd ) ABCGBDGEABCDFHI $.
  $}
  ${
    syld.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syld.2 $e |- ( ph -> ( ch -> th ) ) $.
    
    syld $p |- ( ph -> ( ps -> th ) ) $=
      ( wi a1d mpdd ) ABCDEACDGBFHI $.
  $}
  ${
    pm2.43i.1 $e |- ( ph -> ( ph -> ps ) ) $.
    
    pm2.43i $p |- ( ph -> ps ) $=
      ( id mpd ) AABADCE $.
  $}
  
  pm2.43 $p |- ( ( ph -> ( ph -> ps ) ) -> ( ph -> ps ) ) $=
    ( wi pm2.27 a2i ) AABCBABDE $.
  ${
    imim2d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    imim2d $p |- ( ph -> ( ( th -> ps ) -> ( th -> ch ) ) ) $=
      ( wi a1d a2d ) ADBCABCFDEGH $.
  $}
  
  imim2 $p |- ( ( ph -> ps ) -> ( ( ch -> ph ) -> ( ch -> ps ) ) ) $=
    ( wi id imim2d ) ABDZABCGEF $.
  ${
    imim12i.1 $e |- ( ph -> ps ) $.
    imim12i.2 $e |- ( ch -> th ) $.
    
    imim12i $p |- ( ( ps -> ch ) -> ( ph -> th ) ) $=
      ( wi imim2i syl5 ) ABBCGDECDBFHI $.
  $}
  ${
    imim1i.1 $e |- ( ph -> ps ) $.
    
    imim1i $p |- ( ( ps -> ch ) -> ( ph -> ch ) ) $=
      ( id imim12i ) ABCCDCEF $.
  $}
  ${
    imim3i.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    imim3i $p |- ( ( th -> ph ) -> ( ( th -> ps ) -> ( th -> ch ) ) ) $=
      ( wi imim2i a2d ) DAFDBCABCFDEGH $.
  $}
  ${
    sylc.1 $e |- ( ph -> ps ) $.
    sylc.2 $e |- ( ph -> ch ) $.
    sylc.3 $e |- ( ps -> ( ch -> th ) ) $.
    
    sylc $p |- ( ph -> th ) $=
      ( syl2im pm2.43i ) ADABACDEFGHI $.
  $}
  ${
    syl6mpi.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6mpi.2 $e |- th $.
    syl6mpi.3 $e |- ( ch -> ( th -> ta ) ) $.
    
    syl6mpi $p |- ( ph -> ( ps -> ta ) ) $=
      ( mpi syl6 ) ABCEFCDEGHIJ $.
  $}
  ${
    syl6c.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6c.2 $e |- ( ph -> ( ps -> th ) ) $.
    syl6c.3 $e |- ( ch -> ( th -> ta ) ) $.
    
    syl6c $p |- ( ph -> ( ps -> ta ) ) $=
      ( wi syl6 mpdd ) ABDEGABCDEIFHJK $.
  $}
  ${
    syldd.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    syldd.2 $e |- ( ph -> ( ps -> ( th -> ta ) ) ) $.
    
    syldd $p |- ( ph -> ( ps -> ( ch -> ta ) ) ) $=
      ( wi imim2 syl6c ) ABDEHCDHCEHGFDECIJ $.
  $}
  ${
    syl5d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl5d.2 $e |- ( ph -> ( th -> ( ch -> ta ) ) ) $.
    
    syl5d $p |- ( ph -> ( th -> ( ps -> ta ) ) ) $=
      ( wi a1d syldd ) ADBCEABCHDFIGJ $.
  $}
  ${
    syl7.1 $e |- ( ph -> ps ) $.
    syl7.2 $e |- ( ch -> ( th -> ( ps -> ta ) ) ) $.
    
    syl7 $p |- ( ch -> ( th -> ( ph -> ta ) ) ) $=
      ( wi a1i syl5d ) CABDEABHCFIGJ $.
  $}
  ${
    syl6d.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    syl6d.2 $e |- ( ph -> ( th -> ta ) ) $.
    
    syl6d $p |- ( ph -> ( ps -> ( ch -> ta ) ) ) $=
      ( wi a1d syldd ) ABCDEFADEHBGIJ $.
  $}
  ${
    syl8.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    syl8.2 $e |- ( th -> ta ) $.
    
    syl8 $p |- ( ph -> ( ps -> ( ch -> ta ) ) ) $=
      ( wi a1i syl6d ) ABCDEFDEHAGIJ $.
  $}
  ${
    syl9.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl9.2 $e |- ( th -> ( ch -> ta ) ) $.
    
    syl9 $p |- ( ph -> ( th -> ( ps -> ta ) ) ) $=
      ( wi a1i syl5d ) ABCDEFDCEHHAGIJ $.
  $}
  ${
    imim12d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    imim12d.2 $e |- ( ph -> ( th -> ta ) ) $.
    
    imim12d $p |- ( ph -> ( ( ch -> th ) -> ( ps -> ta ) ) ) $=
      ( wi imim2d syl5d ) ABCCDHEFADECGIJ $.
  $}
  ${
    imim1d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    imim1d $p |- ( ph -> ( ( ch -> th ) -> ( ps -> th ) ) ) $=
      ( idd imim12d ) ABCDDEADFG $.
  $}
  
  imim1 $p |- ( ( ph -> ps ) -> ( ( ps -> ch ) -> ( ph -> ch ) ) ) $=
    ( wi id imim1d ) ABDZABCGEF $.
  ${
    com3.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    
    com23 $p |- ( ph -> ( ch -> ( ps -> th ) ) ) $=
      ( wi pm2.27 syl9 ) ABCDFCDECDGH $.
    
    com3r $p |- ( ch -> ( ph -> ( ps -> th ) ) ) $=
      ( wi com23 com12 ) ACBDFABCDEGH $.
    
    com3l $p |- ( ps -> ( ch -> ( ph -> th ) ) ) $=
      ( com3r ) CABDABCDEFF $.
  $}
  
  pm2.04 $p |- ( ( ph -> ( ps -> ch ) ) -> ( ps -> ( ph -> ch ) ) ) $=
    ( wi id com23 ) ABCDDZABCGEF $.
  ${
    pm2.86d.1 $e |- ( ph -> ( ( ps -> ch ) -> ( ps -> th ) ) ) $.
    
    pm2.86d $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( wi ax-1 syl5 com23 ) ACBDCBCFABDFCBGEHI $.
  $}
  
  con4 $p |- ( ( -. ph -> -. ps ) -> ( ps -> ph ) ) $=
    ( ax-3 ) ABC $.
  ${
    con4i.1 $e |- ( -. ph -> -. ps ) $.
    
    con4i $p |- ( ps -> ph ) $=
      ( wn wi con4 ax-mp ) ADBDEBAECABFG $.
  $}
  ${
    con4d.1 $e |- ( ph -> ( -. ps -> -. ch ) ) $.
    
    con4d $p |- ( ph -> ( ch -> ps ) ) $=
      ( wn wi con4 syl ) ABECEFCBFDBCGH $.
  $}
  ${
    pm2.21i.1 $e |- -. ph $.
    
    pm2.21i $p |- ( ph -> ps ) $=
      ( wn a1i con4i ) BAADBDCEF $.
  $}
  ${
    pm2.21d.1 $e |- ( ph -> -. ps ) $.
    
    pm2.21d $p |- ( ph -> ( ps -> ch ) ) $=
      ( wn a1d con4d ) ACBABECEDFG $.
  $}
  
  pm2.21 $p |- ( -. ph -> ( ph -> ps ) ) $=
    ( wn id pm2.21d ) ACZABFDE $.
  
  pm2.24 $p |- ( ph -> ( -. ph -> ps ) ) $=
    ( wn pm2.21 com12 ) ACABABDE $.
  
  pm2.18 $p |- ( ( -. ph -> ph ) -> ph ) $=
    ( wn wi pm2.21 a2i con4d pm2.43i ) ABZACZAIAIHAIBZAJDEFG $.
  ${
    pm2.18d.1 $e |- ( ph -> ( -. ps -> ps ) ) $.
    
    pm2.18d $p |- ( ph -> ps ) $=
      ( wn wi pm2.18 syl ) ABDBEBCBFG $.
  $}
  
  notnotr $p |- ( -. -. ph -> ph ) $=
    ( wn pm2.21 pm2.18d ) ABZBAEACD $.
  ${
    con2d.1 $e |- ( ph -> ( ps -> -. ch ) ) $.
    
    con2d $p |- ( ph -> ( ch -> -. ps ) ) $=
      ( wn notnotr syl5 con4d ) ABEZCIEBACEBFDGH $.
  $}
  ${
    mt2d.1 $e |- ( ph -> ch ) $.
    mt2d.2 $e |- ( ph -> ( ps -> -. ch ) ) $.
    
    mt2d $p |- ( ph -> -. ps ) $=
      ( wn con2d mpd ) ACBFDABCEGH $.
  $}
  ${
    nsyl3.1 $e |- ( ph -> -. ps ) $.
    nsyl3.2 $e |- ( ch -> ps ) $.
    
    nsyl3 $p |- ( ch -> -. ph ) $=
      ( wn wi a1i mt2d ) CABEABFGCDHI $.
  $}
  ${
    con2i.a $e |- ( ph -> -. ps ) $.
    
    con2i $p |- ( ps -> -. ph ) $=
      ( id nsyl3 ) ABBCBDE $.
  $}
  ${
    nsyl.1 $e |- ( ph -> -. ps ) $.
    nsyl.2 $e |- ( ch -> ps ) $.
    
    nsyl $p |- ( ph -> -. ch ) $=
      ( nsyl3 con2i ) CAABCDEFG $.
  $}
  
  notnot $p |- ( ph -> -. -. ph ) $=
    ( wn id con2i ) ABZAECD $.
  ${
    con1d.1 $e |- ( ph -> ( -. ps -> ch ) ) $.
    
    con1d $p |- ( ph -> ( -. ch -> ps ) ) $=
      ( wn notnot syl6 con4d ) ABCEZABECIEDCFGH $.
  $}
  ${
    mt3d.1 $e |- ( ph -> -. ch ) $.
    mt3d.2 $e |- ( ph -> ( -. ps -> ch ) ) $.
    
    mt3d $p |- ( ph -> ps ) $=
      ( wn con1d mpd ) ACFBDABCEGH $.
  $}
  ${
    nsyl2.1 $e |- ( ph -> -. ps ) $.
    nsyl2.2 $e |- ( -. ch -> ps ) $.
    
    nsyl2 $p |- ( ph -> ch ) $=
      ( wn wi a1i mt3d ) ACBDCFBGAEHI $.
  $}
  
  con1 $p |- ( ( -. ph -> ps ) -> ( -. ps -> ph ) ) $=
    ( wn wi id con1d ) ACBDZABGEF $.
  ${
    con1i.1 $e |- ( -. ph -> ps ) $.
    
    con1i $p |- ( -. ps -> ph ) $=
      ( wn id nsyl2 ) BDZBAGECF $.
  $}
  ${
    pm2.24i.1 $e |- ph $.
    
    pm2.24i $p |- ( -. ph -> ps ) $=
      ( wn a1i con1i ) BAABDCEF $.
  $}
  ${
    con3d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    con3d $p |- ( ph -> ( -. ch -> -. ps ) ) $=
      ( wn notnotr syl5 con1d ) ABEZCIEBACBFDGH $.
  $}
  
  con3 $p |- ( ( ph -> ps ) -> ( -. ps -> -. ph ) ) $=
    ( wi id con3d ) ABCZABFDE $.
  ${
    con3i.a $e |- ( ph -> ps ) $.
    
    con3i $p |- ( -. ps -> -. ph ) $=
      ( wn id nsyl ) BDZBAGECF $.
  $}
  ${
    con3rr3.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    con3rr3 $p |- ( -. ch -> ( ph -> -. ps ) ) $=
      ( wn con3d com12 ) ACEBEABCDFG $.
  $}
  ${
    nsyld.1 $e |- ( ph -> ( ps -> -. ch ) ) $.
    nsyld.2 $e |- ( ph -> ( ta -> ch ) ) $.
    
    nsyld $p |- ( ph -> ( ps -> -. ta ) ) $=
      ( wn con3d syld ) ABCGDGEADCFHI $.
  $}
  
  pm3.2im $p |- ( ph -> ( ps -> -. ( ph -> -. ps ) ) ) $=
    ( wn wi pm2.27 con2d ) AABCZDBAGEF $.
  ${
    impi.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    impi $p |- ( -. ( ph -> -. ps ) -> ch ) $=
      ( wn wi con3rr3 con1i ) CABEFABCDGH $.
  $}
  ${
    expi.1 $e |- ( -. ( ph -> -. ps ) -> ch ) $.
    
    expi $p |- ( ph -> ( ps -> ch ) ) $=
      ( wn wi pm3.2im syl6 ) ABABEFECABGDH $.
  $}
  
  simprim $p |- ( -. ( ph -> -. ps ) -> ps ) $=
    ( idd impi ) ABBABCD $.
  
  simplim $p |- ( -. ( ph -> ps ) -> ph ) $=
    ( wi pm2.21 con1i ) AABCABDE $.
  ${
    pm2.61d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    pm2.61d.2 $e |- ( ph -> ( -. ps -> ch ) ) $.
    
    pm2.61d $p |- ( ph -> ch ) $=
      ( wn con1d syld pm2.18d ) ACACFBCABCEGDHI $.
  $}
  ${
    pm2.61d1.1 $e |- ( ph -> ( ps -> ch ) ) $.
    pm2.61d1.2 $e |- ( -. ps -> ch ) $.
    
    pm2.61d1 $p |- ( ph -> ch ) $=
      ( wn wi a1i pm2.61d ) ABCDBFCGAEHI $.
  $}
  ${
    pm2.61d2.1 $e |- ( ph -> ( -. ps -> ch ) ) $.
    pm2.61d2.2 $e |- ( ps -> ch ) $.
    
    pm2.61d2 $p |- ( ph -> ch ) $=
      ( wi a1i pm2.61d ) ABCBCFAEGDH $.
  $}
  ${
    ja.1 $e |- ( -. ph -> ch ) $.
    ja.2 $e |- ( ps -> ch ) $.
    
    ja $p |- ( ( ph -> ps ) -> ch ) $=
      ( wi imim2i pm2.61d1 ) ABFACBCAEGDH $.
  $}
  ${
    pm2.61i.1 $e |- ( ph -> ps ) $.
    pm2.61i.2 $e |- ( -. ph -> ps ) $.
    
    pm2.61i $p |- ps $=
      ( wi id ja ax-mp ) AAEBAFAABDCGH $.
  $}
  ${
    pm2.61ii.1 $e |- ( -. ph -> ( -. ps -> ch ) ) $.
    pm2.61ii.2 $e |- ( ph -> ch ) $.
    pm2.61ii.3 $e |- ( ps -> ch ) $.
    
    pm2.61ii $p |- ch $=
      ( wn pm2.61d2 pm2.61i ) ACEAGBCDFHI $.
  $}
  ${
    pm2.61nii.1 $e |- ( ph -> ( ps -> ch ) ) $.
    pm2.61nii.2 $e |- ( -. ph -> ch ) $.
    pm2.61nii.3 $e |- ( -. ps -> ch ) $.
    
    pm2.61nii $p |- ch $=
      ( pm2.61d1 pm2.61i ) ACABCDFGEH $.
  $}
  ${
    pm2.01d.1 $e |- ( ph -> ( ps -> -. ps ) ) $.
    
    pm2.01d $p |- ( ph -> -. ps ) $=
      ( wn id pm2.61d1 ) ABBDZCGEF $.
  $}
  ${
    pm2.65i.1 $e |- ( ph -> ps ) $.
    pm2.65i.2 $e |- ( ph -> -. ps ) $.
    
    pm2.65i $p |- -. ph $=
      ( wn con2i con3i pm2.61i ) BAEABDFABCGH $.
  $}
  ${
    pm2.65d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    pm2.65d.2 $e |- ( ph -> ( ps -> -. ch ) ) $.
    
    pm2.65d $p |- ( ph -> -. ps ) $=
      ( nsyld pm2.01d ) ABABCBEDFG $.
  $}
  ${
    mto.1 $e |- -. ps $.
    mto.2 $e |- ( ph -> ps ) $.
    
    mto $p |- -. ph $=
      ( wn a1i pm2.65i ) ABDBEACFG $.
  $}
  ${
    mtod.1 $e |- ( ph -> -. ch ) $.
    mtod.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mtod $p |- ( ph -> -. ps ) $=
      ( wn a1d pm2.65d ) ABCEACFBDGH $.
  $}
  ${
    mtoi.1 $e |- -. ch $.
    mtoi.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    mtoi $p |- ( ph -> -. ps ) $=
      ( wn a1i mtod ) ABCCFADGEH $.
  $}
  
  $c <-> $.
  
  wb $a wff ( ph <-> ps ) $.
  
  df-bi $a |- -. ( ( ( ph <-> ps ) -> -. ( ( ph -> ps ) -> -. ( ps -> ph ) ) )
        -> -. ( -. ( ( ph -> ps ) -> -. ( ps -> ph ) ) -> ( ph <-> ps ) ) ) $.
  
  impbi $p |- ( ( ph -> ps ) -> ( ( ps -> ph ) -> ( ph <-> ps ) ) ) $=
    ( wi wb wn df-bi simprim ax-mp expi ) ABCZBACZABDZLJKECEZCZMLCZECEOABFNOGHI
    $.
  ${
    impbii.1 $e |- ( ph -> ps ) $.
    impbii.2 $e |- ( ps -> ph ) $.
    
    impbii $p |- ( ph <-> ps ) $=
      ( wi wb impbi mp2 ) ABEBAEABFCDABGH $.
  $}
  ${
    impbidd.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    impbidd.2 $e |- ( ph -> ( ps -> ( th -> ch ) ) ) $.
    
    impbidd $p |- ( ph -> ( ps -> ( ch <-> th ) ) ) $=
      ( wi wb impbi syl6c ) ABCDGDCGCDHEFCDIJ $.
  $}
  ${
    impbid21d.1 $e |- ( ps -> ( ch -> th ) ) $.
    impbid21d.2 $e |- ( ph -> ( th -> ch ) ) $.
    
    impbid21d $p |- ( ph -> ( ps -> ( ch <-> th ) ) ) $=
      ( wi a1i a1d impbidd ) ABCDBCDGGAEHADCGBFIJ $.
  $}
  ${
    impbid.1 $e |- ( ph -> ( ps -> ch ) ) $.
    impbid.2 $e |- ( ph -> ( ch -> ps ) ) $.
    
    impbid $p |- ( ph -> ( ps <-> ch ) ) $=
      ( wb impbid21d pm2.43i ) ABCFAABCDEGH $.
  $}
  
  dfbi1 $p |- ( ( ph <-> ps ) <-> -. ( ( ph -> ps ) -> -. ( ps -> ph ) ) ) $=
    ( wb wi wn df-bi simplim ax-mp impbi impi impbii ) ABCZABDZBADZEDEZLODZOLDE
    ZDEPABFPQGHMNLABIJK $.
  
  biimp $p |- ( ( ph <-> ps ) -> ( ph -> ps ) ) $=
    ( wb wi wn df-bi simplim ax-mp syl ) ABCZABDZBADEZDEZKJMDZMJDEZDENABFNOGHKL
    GI $.
  ${
    biimpi.1 $e |- ( ph <-> ps ) $.
    
    biimpi $p |- ( ph -> ps ) $=
      ( wb wi biimp ax-mp ) ABDABECABFG $.
  $}
  ${
    sylbi.1 $e |- ( ph <-> ps ) $.
    sylbi.2 $e |- ( ps -> ch ) $.
    
    sylbi $p |- ( ph -> ch ) $=
      ( biimpi syl ) ABCABDFEG $.
  $}
  ${
    sylib.1 $e |- ( ph -> ps ) $.
    sylib.2 $e |- ( ps <-> ch ) $.
    
    sylib $p |- ( ph -> ch ) $=
      ( biimpi syl ) ABCDBCEFG $.
  $}
  ${
    sylbb.1 $e |- ( ph <-> ps ) $.
    sylbb.2 $e |- ( ps <-> ch ) $.
    
    sylbb $p |- ( ph -> ch ) $=
      ( biimpi sylbi ) ABCDBCEFG $.
  $}
  
  biimpr $p |- ( ( ph <-> ps ) -> ( ps -> ph ) ) $=
    ( wb wi wn dfbi1 simprim sylbi ) ABCABDZBADZEDEJABFIJGH $.
  
  bicom1 $p |- ( ( ph <-> ps ) -> ( ps <-> ph ) ) $=
    ( wb biimpr biimp impbid ) ABCBAABDABEF $.
  
  bicom $p |- ( ( ph <-> ps ) <-> ( ps <-> ph ) ) $=
    ( wb bicom1 impbii ) ABCBACABDBADE $.
  ${
    bicomd.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    bicomd $p |- ( ph -> ( ch <-> ps ) ) $=
      ( wb bicom sylib ) ABCECBEDBCFG $.
  $}
  ${
    bicomi.1 $e |- ( ph <-> ps ) $.
    
    bicomi $p |- ( ps <-> ph ) $=
      ( wb bicom1 ax-mp ) ABDBADCABEF $.
  $}
  ${
    impbid1.1 $e |- ( ph -> ( ps -> ch ) ) $.
    impbid1.2 $e |- ( ch -> ps ) $.
    
    impbid1 $p |- ( ph -> ( ps <-> ch ) ) $=
      ( wi a1i impbid ) ABCDCBFAEGH $.
  $}
  ${
    impbid2.1 $e |- ( ps -> ch ) $.
    impbid2.2 $e |- ( ph -> ( ch -> ps ) ) $.
    
    impbid2 $p |- ( ph -> ( ps <-> ch ) ) $=
      ( impbid1 bicomd ) ACBACBEDFG $.
  $}
  ${
    impcon4bid.1 $e |- ( ph -> ( ps -> ch ) ) $.
    impcon4bid.2 $e |- ( ph -> ( -. ps -> -. ch ) ) $.
    
    impcon4bid $p |- ( ph -> ( ps <-> ch ) ) $=
      ( con4d impbid ) ABCDABCEFG $.
  $}
  ${
    biimpri.1 $e |- ( ph <-> ps ) $.
    
    biimpri $p |- ( ps -> ph ) $=
      ( bicomi biimpi ) BAABCDE $.
  $}
  ${
    biimpd.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    biimpd $p |- ( ph -> ( ps -> ch ) ) $=
      ( wb wi biimp syl ) ABCEBCFDBCGH $.
  $}
  ${
    mpbi.min $e |- ph $.
    mpbi.maj $e |- ( ph <-> ps ) $.
    
    mpbi $p |- ps $=
      ( biimpi ax-mp ) ABCABDEF $.
  $}
  ${
    mpbir.min $e |- ps $.
    mpbir.maj $e |- ( ph <-> ps ) $.
    
    mpbir $p |- ph $=
      ( biimpri ax-mp ) BACABDEF $.
  $}
  ${
    mpbid.min $e |- ( ph -> ps ) $.
    mpbid.maj $e |- ( ph -> ( ps <-> ch ) ) $.
    
    mpbid $p |- ( ph -> ch ) $=
      ( biimpd mpd ) ABCDABCEFG $.
  $}
  ${
    mpbii.min $e |- ps $.
    mpbii.maj $e |- ( ph -> ( ps <-> ch ) ) $.
    
    mpbii $p |- ( ph -> ch ) $=
      ( a1i mpbid ) ABCBADFEG $.
  $}
  ${
    sylibr.1 $e |- ( ph -> ps ) $.
    sylibr.2 $e |- ( ch <-> ps ) $.
    
    sylibr $p |- ( ph -> ch ) $=
      ( biimpri syl ) ABCDCBEFG $.
  $}
  ${
    sylbir.1 $e |- ( ps <-> ph ) $.
    sylbir.2 $e |- ( ps -> ch ) $.
    
    sylbir $p |- ( ph -> ch ) $=
      ( biimpri syl ) ABCBADFEG $.
  $}
  ${
    sylbbr.1 $e |- ( ph <-> ps ) $.
    sylbbr.2 $e |- ( ps <-> ch ) $.
    
    sylbbr $p |- ( ch -> ph ) $=
      ( biimpri sylibr ) CBABCEFDG $.
  $}
  ${
    sylibd.1 $e |- ( ph -> ( ps -> ch ) ) $.
    sylibd.2 $e |- ( ph -> ( ch <-> th ) ) $.
    
    sylibd $p |- ( ph -> ( ps -> th ) ) $=
      ( biimpd syld ) ABCDEACDFGH $.
  $}
  ${
    syl5bi.1 $e |- ( ph <-> ps ) $.
    syl5bi.2 $e |- ( ch -> ( ps -> th ) ) $.
    
    syl5bi $p |- ( ch -> ( ph -> th ) ) $=
      ( biimpi syl5 ) ABCDABEGFH $.
  $}
  ${
    syl5bir.1 $e |- ( ps <-> ph ) $.
    syl5bir.2 $e |- ( ch -> ( ps -> th ) ) $.
    
    syl5bir $p |- ( ch -> ( ph -> th ) ) $=
      ( biimpri syl5 ) ABCDBAEGFH $.
  $}
  ${
    syl5ib.1 $e |- ( ph -> ps ) $.
    syl5ib.2 $e |- ( ch -> ( ps <-> th ) ) $.
    
    syl5ib $p |- ( ch -> ( ph -> th ) ) $=
      ( biimpd syl5 ) ABCDECBDFGH $.
    
    syl5ibcom $p |- ( ph -> ( ch -> th ) ) $=
      ( syl5ib com12 ) CADABCDEFGH $.
  $}
  ${
    syl5ibr.1 $e |- ( ph -> th ) $.
    syl5ibr.2 $e |- ( ch -> ( ps <-> th ) ) $.
    
    syl5ibr $p |- ( ch -> ( ph -> ps ) ) $=
      ( bicomd syl5ib ) ADCBECBDFGH $.
    
    syl5ibrcom $p |- ( ph -> ( ch -> ps ) ) $=
      ( syl5ibr com12 ) CABABCDEFGH $.
  $}
  ${
    biimprd.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    biimprd $p |- ( ph -> ( ch -> ps ) ) $=
      ( id syl5ibr ) CBACCEDF $.
  $}
  ${
    biimpcd.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    biimprcd $p |- ( ch -> ( ph -> ps ) ) $=
      ( id syl5ibrcom ) CBACCEDF $.
  $}
  ${
    syl6ib.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6ib.2 $e |- ( ch <-> th ) $.
    
    syl6ib $p |- ( ph -> ( ps -> th ) ) $=
      ( biimpi syl6 ) ABCDECDFGH $.
  $}
  ${
    syl6ibr.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6ibr.2 $e |- ( th <-> ch ) $.
    
    syl6ibr $p |- ( ph -> ( ps -> th ) ) $=
      ( biimpri syl6 ) ABCDEDCFGH $.
  $}
  ${
    syl6bir.1 $e |- ( ph -> ( ch <-> ps ) ) $.
    syl6bir.2 $e |- ( ch -> th ) $.
    
    syl6bir $p |- ( ph -> ( ps -> th ) ) $=
      ( biimprd syl6 ) ABCDACBEGFH $.
  $}
  ${
    syl7bi.1 $e |- ( ph <-> ps ) $.
    syl7bi.2 $e |- ( ch -> ( th -> ( ps -> ta ) ) ) $.
    
    syl7bi $p |- ( ch -> ( th -> ( ph -> ta ) ) ) $=
      ( biimpi syl7 ) ABCDEABFHGI $.
  $}
  ${
    mpbird.min $e |- ( ph -> ch ) $.
    mpbird.maj $e |- ( ph -> ( ps <-> ch ) ) $.
    
    mpbird $p |- ( ph -> ps ) $=
      ( biimprd mpd ) ACBDABCEFG $.
  $}
  ${
    mpbiri.min $e |- ch $.
    mpbiri.maj $e |- ( ph -> ( ps <-> ch ) ) $.
    
    mpbiri $p |- ( ph -> ps ) $=
      ( a1i mpbird ) ABCCADFEG $.
  $}
  
  biid $p |- ( ph <-> ph ) $=
    ( id impbii ) AAABZDC $.
  
  biidd $p |- ( ph -> ( ps <-> ps ) ) $=
    ( wb biid a1i ) BBCABDE $.
  
  pm5.1im $p |- ( ph -> ( ps -> ( ph <-> ps ) ) ) $=
    ( ax-1 impbid21d ) ABABBACABCD $.
  ${
    ibi.1 $e |- ( ph -> ( ph <-> ps ) ) $.
    
    ibi $p |- ( ph -> ps ) $=
      ( biimpd pm2.43i ) ABAABCDE $.
  $}
  
  pm5.74 $p |- ( ( ph -> ( ps <-> ch ) ) <->
               ( ( ph -> ps ) <-> ( ph -> ch ) ) ) $=
    ( wb wi biimp imim3i biimpr impbid pm2.86d impbidd impbii ) ABCDZEZABEZACEZ
    DZNOPMBCABCFGMCBABCHGIQABCQABCOPFJQACBOPHJKL $.
  ${
    pm5.74i.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    pm5.74i $p |- ( ( ph -> ps ) <-> ( ph -> ch ) ) $=
      ( wb wi pm5.74 mpbi ) ABCEFABFACFEDABCGH $.
  $}
  ${
    pm5.74ri.1 $e |- ( ( ph -> ps ) <-> ( ph -> ch ) ) $.
    
    pm5.74ri $p |- ( ph -> ( ps <-> ch ) ) $=
      ( wb wi pm5.74 mpbir ) ABCEFABFACFEDABCGH $.
  $}
  ${
    pm5.74d.1 $e |- ( ph -> ( ps -> ( ch <-> th ) ) ) $.
    
    pm5.74d $p |- ( ph -> ( ( ps -> ch ) <-> ( ps -> th ) ) ) $=
      ( wb wi pm5.74 sylib ) ABCDFGBCGBDGFEBCDHI $.
  $}
  ${
    bitri.1 $e |- ( ph <-> ps ) $.
    bitri.2 $e |- ( ps <-> ch ) $.
    
    bitri $p |- ( ph <-> ch ) $=
      ( sylbb sylbbr impbii ) ACABCDEFABCDEGH $.
  $}
  ${
    bitr2i.1 $e |- ( ph <-> ps ) $.
    bitr2i.2 $e |- ( ps <-> ch ) $.
    
    bitr2i $p |- ( ch <-> ph ) $=
      ( bitri bicomi ) ACABCDEFG $.
  $}
  ${
    bitr3i.1 $e |- ( ps <-> ph ) $.
    bitr3i.2 $e |- ( ps <-> ch ) $.
    
    bitr3i $p |- ( ph <-> ch ) $=
      ( bicomi bitri ) ABCBADFEG $.
  $}
  ${
    bitr4i.1 $e |- ( ph <-> ps ) $.
    bitr4i.2 $e |- ( ch <-> ps ) $.
    
    bitr4i $p |- ( ph <-> ch ) $=
      ( bicomi bitri ) ABCDCBEFG $.
  $}
  ${
    bitrd.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    bitrd.2 $e |- ( ph -> ( ch <-> th ) ) $.
    
    bitrd $p |- ( ph -> ( ps <-> th ) ) $=
      ( wi pm5.74i bitri pm5.74ri ) ABDABGACGADGABCEHACDFHIJ $.
  $}
  ${
    bitr3d.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    bitr3d.2 $e |- ( ph -> ( ps <-> th ) ) $.
    
    bitr3d $p |- ( ph -> ( ch <-> th ) ) $=
      ( bicomd bitrd ) ACBDABCEGFH $.
  $}
  ${
    syl5bb.1 $e |- ( ph <-> ps ) $.
    syl5bb.2 $e |- ( ch -> ( ps <-> th ) ) $.
    
    syl5bb $p |- ( ch -> ( ph <-> th ) ) $=
      ( wb a1i bitrd ) CABDABGCEHFI $.
  $}
  ${
    syl5bbr.1 $e |- ( ps <-> ph ) $.
    syl5bbr.2 $e |- ( ch -> ( ps <-> th ) ) $.
    
    syl5bbr $p |- ( ch -> ( ph <-> th ) ) $=
      ( bicomi syl5bb ) ABCDBAEGFH $.
  $}
  ${
    syl6bb.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    syl6bb.2 $e |- ( ch <-> th ) $.
    
    syl6bb $p |- ( ph -> ( ps <-> th ) ) $=
      ( wb a1i bitrd ) ABCDECDGAFHI $.
  $}
  ${
    syl6rbb.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    syl6rbb.2 $e |- ( ch <-> th ) $.
    
    syl6rbb $p |- ( ph -> ( th <-> ps ) ) $=
      ( syl6bb bicomd ) ABDABCDEFGH $.
  $}
  ${
    syl6bbr.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    syl6bbr.2 $e |- ( th <-> ch ) $.
    
    syl6bbr $p |- ( ph -> ( ps <-> th ) ) $=
      ( bicomi syl6bb ) ABCDEDCFGH $.
  $}
  ${
    3imtr3.1 $e |- ( ph -> ps ) $.
    3imtr3.2 $e |- ( ph <-> ch ) $.
    3imtr3.3 $e |- ( ps <-> th ) $.
    
    3imtr3i $p |- ( ch -> th ) $=
      ( sylbir sylib ) CBDCABFEHGI $.
  $}
  ${
    3imtr4.1 $e |- ( ph -> ps ) $.
    3imtr4.2 $e |- ( ch <-> ph ) $.
    3imtr4.3 $e |- ( th <-> ps ) $.
    
    3imtr4i $p |- ( ch -> th ) $=
      ( sylbi sylibr ) CBDCABFEHGI $.
  $}
  ${
    3imtr3g.1 $e |- ( ph -> ( ps -> ch ) ) $.
    3imtr3g.2 $e |- ( ps <-> th ) $.
    3imtr3g.3 $e |- ( ch <-> ta ) $.
    
    3imtr3g $p |- ( ph -> ( th -> ta ) ) $=
      ( syl5bir syl6ib ) ADCEDBACGFIHJ $.
  $}
  ${
    3imtr4g.1 $e |- ( ph -> ( ps -> ch ) ) $.
    3imtr4g.2 $e |- ( th <-> ps ) $.
    3imtr4g.3 $e |- ( ta <-> ch ) $.
    
    3imtr4g $p |- ( ph -> ( th -> ta ) ) $=
      ( syl5bi syl6ibr ) ADCEDBACGFIHJ $.
  $}
  ${
    3bitri.1 $e |- ( ph <-> ps ) $.
    3bitri.2 $e |- ( ps <-> ch ) $.
    3bitri.3 $e |- ( ch <-> th ) $.
    
    3bitri $p |- ( ph <-> th ) $=
      ( bitri ) ABDEBCDFGHH $.
  $}
  ${
    3bitr3i.1 $e |- ( ph <-> ps ) $.
    3bitr3i.2 $e |- ( ph <-> ch ) $.
    3bitr3i.3 $e |- ( ps <-> th ) $.
    
    3bitr3i $p |- ( ch <-> th ) $=
      ( bitr3i bitri ) CBDCABFEHGI $.
  $}
  ${
    3bitr4i.1 $e |- ( ph <-> ps ) $.
    3bitr4i.2 $e |- ( ch <-> ph ) $.
    3bitr4i.3 $e |- ( th <-> ps ) $.
    
    3bitr4i $p |- ( ch <-> th ) $=
      ( bitr4i bitri ) CADFABDEGHI $.
    
    3bitr4ri $p |- ( th <-> ch ) $=
      ( bitr4i bitr2i ) CADFABDEGHI $.
  $}
  ${
    3bitr3g.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    3bitr3g.2 $e |- ( ps <-> th ) $.
    3bitr3g.3 $e |- ( ch <-> ta ) $.
    
    3bitr3g $p |- ( ph -> ( th <-> ta ) ) $=
      ( syl5bbr syl6bb ) ADCEDBACGFIHJ $.
  $}
  ${
    3bitr4g.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    3bitr4g.2 $e |- ( th <-> ps ) $.
    3bitr4g.3 $e |- ( ta <-> ch ) $.
    
    3bitr4g $p |- ( ph -> ( th <-> ta ) ) $=
      ( syl5bb syl6bbr ) ADCEDBACGFIHJ $.
  $}
  
  notnotb $p |- ( ph <-> -. -. ph ) $=
    ( wn notnot notnotr impbii ) AABBACADE $.
  
  con34b $p |- ( ( ph -> ps ) <-> ( -. ps -> -. ph ) ) $=
    ( wi wn con3 con4 impbii ) ABCBDADCABEBAFG $.
  ${
    con4bid.1 $e |- ( ph -> ( -. ps <-> -. ch ) ) $.
    
    con4bid $p |- ( ph -> ( ps <-> ch ) ) $=
      ( wn biimprd con4d biimpd impcon4bid ) ABCACBABEZCEZDFGAJKDHI $.
  $}
  ${
    notbid.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    notbid $p |- ( ph -> ( -. ps <-> -. ch ) ) $=
      ( wn notnotb 3bitr3g con4bid ) ABEZCEZABCIEJEDBFCFGH $.
  $}
  
  notbi $p |- ( ( ph <-> ps ) <-> ( -. ph <-> -. ps ) ) $=
    ( wb wn id notbid con4bid impbii ) ABCZADBDCZIABIEFJABJEGH $.
  ${
    notbii.1 $e |- ( ph <-> ps ) $.
    
    notbii $p |- ( -. ph <-> -. ps ) $=
      ( wb wn notbi mpbi ) ABDAEBEDCABFG $.
  $}
  ${
    mtbi.1 $e |- -. ph $.
    mtbi.2 $e |- ( ph <-> ps ) $.
    
    mtbi $p |- -. ps $=
      ( biimpri mto ) BACABDEF $.
  $}
  ${
    mtbir.1 $e |- -. ps $.
    mtbir.2 $e |- ( ph <-> ps ) $.
    
    mtbir $p |- -. ph $=
      ( bicomi mtbi ) BACABDEF $.
  $}
  ${
    mtbiri.min $e |- -. ch $.
    mtbiri.maj $e |- ( ph -> ( ps <-> ch ) ) $.
    
    mtbiri $p |- ( ph -> -. ps ) $=
      ( biimpd mtoi ) ABCDABCEFG $.
  $}
  ${
    xchbinx.1 $e |- ( ph <-> -. ps ) $.
    xchbinx.2 $e |- ( ps <-> ch ) $.
    
    xchbinx $p |- ( ph <-> -. ch ) $=
      ( wn notbii bitri ) ABFCFDBCEGH $.
  $}
  ${
    xchbinxr.1 $e |- ( ph <-> -. ps ) $.
    xchbinxr.2 $e |- ( ch <-> ps ) $.
    
    xchbinxr $p |- ( ph <-> -. ch ) $=
      ( bicomi xchbinx ) ABCDCBEFG $.
  $}
  ${
    imbi2i.1 $e |- ( ph <-> ps ) $.
    
    imbi2i $p |- ( ( ch -> ph ) <-> ( ch -> ps ) ) $=
      ( wb a1i pm5.74i ) CABABECDFG $.
  $}
  ${
    bibi2i.1 $e |- ( ph <-> ps ) $.
    
    bibi2i $p |- ( ( ch <-> ph ) <-> ( ch <-> ps ) ) $=
      ( wb id syl6bb syl6bbr impbii ) CAEZCBEZJCABJFDGKCBAKFDHI $.
    
    bibi1i $p |- ( ( ph <-> ch ) <-> ( ps <-> ch ) ) $=
      ( wb bicom bibi2i 3bitri ) ACECAECBEBCEACFABCDGCBFH $.
    ${
      bibi12i.2 $e |- ( ch <-> th ) $.
      
      bibi12i $p |- ( ( ph <-> ch ) <-> ( ps <-> th ) ) $=
        ( wb bibi2i bibi1i bitri ) ACGADGBDGCDAFHABDEIJ $.
    $}
  $}
  ${
    imbid.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    imbi2d $p |- ( ph -> ( ( th -> ps ) <-> ( th -> ch ) ) ) $=
      ( wb a1d pm5.74d ) ADBCABCFDEGH $.
    
    imbi1d $p |- ( ph -> ( ( ps -> th ) <-> ( ch -> th ) ) ) $=
      ( wi biimprd imim1d biimpd impbid ) ABDFCDFACBDABCEGHABCDABCEIHJ $.
    
    bibi2d $p |- ( ph -> ( ( th <-> ps ) <-> ( th <-> ch ) ) ) $=
      ( wb wi pm5.74i bibi2i pm5.74 3bitr4i pm5.74ri ) ADBFZDCFZADGZABGZFOACGZF
      AMGANGPQOABCEHIADBJADCJKL $.
    
    bibi1d $p |- ( ph -> ( ( ps <-> th ) <-> ( ch <-> th ) ) ) $=
      ( wb bibi2d bicom 3bitr4g ) ADBFDCFBDFCDFABCDEGBDHCDHI $.
  $}
  ${
    imbi12d.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    imbi12d.2 $e |- ( ph -> ( th <-> ta ) ) $.
    
    imbi12d $p |- ( ph -> ( ( ps -> th ) <-> ( ch -> ta ) ) ) $=
      ( wi imbi1d imbi2d bitrd ) ABDHCDHCEHABCDFIADECGJK $.
    
    bibi12d $p |- ( ph -> ( ( ps <-> th ) <-> ( ch <-> ta ) ) ) $=
      ( wb bibi1d bibi2d bitrd ) ABDHCDHCEHABCDFIADECGJK $.
  $}
  
  imbi12 $p |- ( ( ph <-> ps ) ->
                    ( ( ch <-> th ) -> ( ( ph -> ch ) <-> ( ps -> th ) ) ) ) $=
    ( wb wi wn simplim simprim imbi12d expi ) ABEZCDEZACFBDFELMGZFGABCDLNHLMIJK
    $.
  
  imbi1 $p |- ( ( ph <-> ps ) -> ( ( ph -> ch ) <-> ( ps -> ch ) ) ) $=
    ( wb id imbi1d ) ABDZABCGEF $.
  ${
    imbi1i.1 $e |- ( ph <-> ps ) $.
    
    imbi1i $p |- ( ( ph -> ch ) <-> ( ps -> ch ) ) $=
      ( wb wi imbi1 ax-mp ) ABEACFBCFEDABCGH $.
  $}
  ${
    imbi12i.1 $e |- ( ph <-> ps ) $.
    imbi12i.2 $e |- ( ch <-> th ) $.
    
    imbi12i $p |- ( ( ph -> ch ) <-> ( ps -> th ) ) $=
      ( wb wi imbi12 mp2 ) ABGCDGACHBDHGEFABCDIJ $.
  $}
  
  bibi1 $p |- ( ( ph <-> ps ) -> ( ( ph <-> ch ) <-> ( ps <-> ch ) ) ) $=
    ( wb id bibi1d ) ABDZABCGEF $.
  ${
    con1bii.1 $e |- ( -. ph <-> ps ) $.
    
    con1bii $p |- ( -. ps <-> ph ) $=
      ( wn notnotb xchbinx bicomi ) ABDAADBAECFG $.
  $}
  ${
    con2bii.1 $e |- ( ph <-> -. ps ) $.
    
    con2bii $p |- ( ps <-> -. ph ) $=
      ( wn bicomi con1bii ) ADBBAABDCEFE $.
  $}
  
  con1b $p |- ( ( -. ph -> ps ) <-> ( -. ps -> ph ) ) $=
    ( wn wi con1 impbii ) ACBDBCADABEBAEF $.
  
  biimt $p |- ( ph -> ( ps <-> ( ph -> ps ) ) ) $=
    ( wi ax-1 pm2.27 impbid2 ) ABABCBADABEF $.
  
  pm5.5 $p |- ( ph -> ( ( ph -> ps ) <-> ps ) ) $=
    ( wi biimt bicomd ) ABABCABDE $.
  ${
    a1bi.1 $e |- ph $.
    
    a1bi $p |- ( ps <-> ( ph -> ps ) ) $=
      ( wi wb biimt ax-mp ) ABABDECABFG $.
  $}
  
  pm5.501 $p |- ( ph -> ( ps <-> ( ph <-> ps ) ) ) $=
    ( wb pm5.1im biimp com12 impbid ) ABABCZABDHABABEFG $.
  
  nbn2 $p |- ( -. ph -> ( -. ps <-> ( ph <-> ps ) ) ) $=
    ( wn wb pm5.501 notbi syl6bbr ) ACZBCZHIDABDHIEABFG $.
  
  bibif $p |- ( -. ps -> ( ( ph <-> ps ) <-> -. ph ) ) $=
    ( wn wb nbn2 bicom syl6rbb ) BCACBADABDBAEBAFG $.
  ${
    nbn.1 $e |- -. ph $.
    
    nbn $p |- ( -. ps <-> ( ps <-> ph ) ) $=
      ( wb wn bibif ax-mp bicomi ) BADZBEZAEIJDCBAFGH $.
  $}
  ${
    2falsed.1 $e |- ( ph -> -. ps ) $.
    2falsed.2 $e |- ( ph -> -. ch ) $.
    
    2falsed $p |- ( ph -> ( ps <-> ch ) ) $=
      ( pm2.21d impbid ) ABCABCDFACBEFG $.
  $}
  ${
    pm5.21ni.1 $e |- ( ph -> ps ) $.
    pm5.21ni.2 $e |- ( ch -> ps ) $.
    
    pm5.21ni $p |- ( -. ps -> ( ph <-> ch ) ) $=
      ( wn con3i 2falsed ) BFACABDGCBEGH $.
    ${
      pm5.21nii.3 $e |- ( ps -> ( ph <-> ch ) ) $.
      
      pm5.21nii $p |- ( ph <-> ch ) $=
        ( wb pm5.21ni pm2.61i ) BACGFABCDEHI $.
    $}
  $}
  
  bi2.04 $p |- ( ( ph -> ( ps -> ch ) ) <-> ( ps -> ( ph -> ch ) ) ) $=
    ( wi pm2.04 impbii ) ABCDDBACDDABCEBACEF $.
  
  $c \/ $. 
  $c /\ $.
  
  wo $a wff ( ph \/ ps ) $.
  
  wa $a wff ( ph /\ ps ) $.
  
  df-or $a |- ( ( ph \/ ps ) <-> ( -. ph -> ps ) ) $.
  
  df-an $a |- ( ( ph /\ ps ) <-> -. ( ph -> -. ps ) ) $.
  
  pm2.53 $p |- ( ( ph \/ ps ) -> ( -. ph -> ps ) ) $=
    ( wo wn wi df-or biimpi ) ABCADBEABFG $.
  
  pm2.54 $p |- ( ( -. ph -> ps ) -> ( ph \/ ps ) ) $=
    ( wo wn wi df-or biimpri ) ABCADBEABFG $.
  ${
    orri.1 $e |- ( -. ph -> ps ) $.
    
    orri $p |- ( ph \/ ps ) $=
      ( wo wn wi df-or mpbir ) ABDAEBFCABGH $.
  $}
  ${
    ord.1 $e |- ( ph -> ( ps \/ ch ) ) $.
    
    ord $p |- ( ph -> ( -. ps -> ch ) ) $=
      ( wo wn wi df-or sylib ) ABCEBFCGDBCHI $.
  $}
  ${
    orrd.1 $e |- ( ph -> ( -. ps -> ch ) ) $.
    
    orrd $p |- ( ph -> ( ps \/ ch ) ) $=
      ( wn wi wo pm2.54 syl ) ABECFBCGDBCHI $.
  $}
  ${
    jaoi.1 $e |- ( ph -> ps ) $.
    jaoi.2 $e |- ( ch -> ps ) $.
    
    jaoi $p |- ( ( ph \/ ch ) -> ps ) $=
      ( wo wn pm2.53 syl6 pm2.61d2 ) ACFZABKAGCBACHEIDJ $.
  $}
  ${
    jaod.1 $e |- ( ph -> ( ps -> ch ) ) $.
    jaod.2 $e |- ( ph -> ( th -> ch ) ) $.
    
    jaod $p |- ( ph -> ( ( ps \/ th ) -> ch ) ) $=
      ( wo wi com12 jaoi ) BDGACBACHDABCEIADCFIJI $.
    jaod.3 $e |- ( ph -> ( ps \/ th ) ) $.
    
    mpjaod $p |- ( ph -> ch ) $=
      ( wo jaod mpd ) ABDHCGABCDEFIJ $.
  $}
  
  orel2 $p |- ( -. ph -> ( ( ps \/ ph ) -> ps ) ) $=
    ( wn idd pm2.21 jaod ) ACZBBAGBDABEF $.
  
  olc $p |- ( ph -> ( ps \/ ph ) ) $=
    ( wn ax-1 orrd ) ABAABCDE $.
  
  orc $p |- ( ph -> ( ph \/ ps ) ) $=
    ( pm2.24 orrd ) AABABCD $.
  
  pm1.4 $p |- ( ( ph \/ ps ) -> ( ps \/ ph ) ) $=
    ( wo olc orc jaoi ) ABACBABDBAEF $.
  
  orcom $p |- ( ( ph \/ ps ) <-> ( ps \/ ph ) ) $=
    ( wo pm1.4 impbii ) ABCBACABDBADE $.
  ${
    orcomd.1 $e |- ( ph -> ( ps \/ ch ) ) $.
    
    orcomd $p |- ( ph -> ( ch \/ ps ) ) $=
      ( wo orcom sylib ) ABCECBEDBCFG $.
  $}
  ${
    orci.1 $e |- ph $.
    
    orci $p |- ( ph \/ ps ) $=
      ( pm2.24i orri ) ABABCDE $.
  $}
  ${
    orcd.1 $e |- ( ph -> ps ) $.
    
    orcd $p |- ( ph -> ( ps \/ ch ) ) $=
      ( wo orc syl ) ABBCEDBCFG $.
    
    olcd $p |- ( ph -> ( ch \/ ps ) ) $=
      ( orcd orcomd ) ABCABCDEF $.
  $}
  
  pm2.07 $p |- ( ph -> ( ph \/ ph ) ) $=
    ( olc ) AAB $.
  ${
    biorfi.1 $e |- -. ph $.
    
    biorfi $p |- ( ps <-> ( ps \/ ph ) ) $=
      ( wo orc wn wi orel2 ax-mp impbii ) BBADZBAEAFKBGCABHIJ $.
  $}
  
  imor $p |- ( ( ph -> ps ) <-> ( -. ph \/ ps ) ) $=
    ( wi wn wo notnotb imbi1i df-or bitr4i ) ABCADZDZBCJBEAKBAFGJBHI $.
  
  imnan $p |- ( ( ph -> -. ps ) <-> -. ( ph /\ ps ) ) $=
    ( wa wn wi df-an con2bii ) ABCABDEABFG $.
  
  iman $p |- ( ( ph -> ps ) <-> -. ( ph /\ -. ps ) ) $=
    ( wi wn wa notnotb imbi2i imnan bitri ) ABCABDZDZCAJEDBKABFGAJHI $.
  
  annim $p |- ( ( ph /\ -. ps ) <-> -. ( ph -> ps ) ) $=
    ( wi wn wa iman con2bii ) ABCABDEABFG $.
  ${
    imp.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    imp $p |- ( ( ph /\ ps ) -> ch ) $=
      ( wa wn wi df-an impi sylbi ) ABEABFGFCABHABCDIJ $.
    
    impcom $p |- ( ( ps /\ ph ) -> ch ) $=
      ( com12 imp ) BACABCDEF $.
  $}
  ${
    impd.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    
    impd $p |- ( ph -> ( ( ps /\ ch ) -> th ) ) $=
      ( wa wi com3l imp com12 ) BCFADBCADGABCDEHIJ $.
    
    imp31 $p |- ( ( ( ph /\ ps ) /\ ch ) -> th ) $=
      ( wa wi imp ) ABFCDABCDGEHH $.
    
    imp32 $p |- ( ( ph /\ ( ps /\ ch ) ) -> th ) $=
      ( wa impd imp ) ABCFDABCDEGH $.
  $}
  ${
    ex.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    ex $p |- ( ph -> ( ps -> ch ) ) $=
      ( wn wi wa df-an sylbir expi ) ABCABEFEABGCABHDIJ $.
    
    expcom $p |- ( ps -> ( ph -> ch ) ) $=
      ( ex com12 ) ABCABCDEF $.
  $}
  ${
    expd.1 $e |- ( ph -> ( ( ps /\ ch ) -> th ) ) $.
    
    expd $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( wi wa com12 ex com3r ) BCADBCADFABCGDEHIJ $.
  $}
  
  pm3.3 $p |- ( ( ( ph /\ ps ) -> ch ) -> ( ph -> ( ps -> ch ) ) ) $=
    ( wa wi id expd ) ABDCEZABCHFG $.
  
  pm3.31 $p |- ( ( ph -> ( ps -> ch ) ) -> ( ( ph /\ ps ) -> ch ) ) $=
    ( wi id impd ) ABCDDZABCGEF $.
  
  impexp $p |- ( ( ( ph /\ ps ) -> ch ) <-> ( ph -> ( ps -> ch ) ) ) $=
    ( wa wi pm3.3 pm3.31 impbii ) ABDCEABCEEABCFABCGH $.
  
  pm3.2 $p |- ( ph -> ( ps -> ( ph /\ ps ) ) ) $=
    ( wa id ex ) ABABCZFDE $.
  
  pm3.21 $p |- ( ph -> ( ps -> ( ps /\ ph ) ) ) $=
    ( wa pm3.2 com12 ) BABACBADE $.
  
  pm3.22 $p |- ( ( ph /\ ps ) -> ( ps /\ ph ) ) $=
    ( wa pm3.21 imp ) ABBACABDE $.
  
  ancom $p |- ( ( ph /\ ps ) <-> ( ps /\ ph ) ) $=
    ( wa pm3.22 impbii ) ABCBACABDBADE $.
  ${
    ancomd.1 $e |- ( ph -> ( ps /\ ch ) ) $.
    
    ancomd $p |- ( ph -> ( ch /\ ps ) ) $=
      ( wa ancom sylib ) ABCECBEDBCFG $.
  $}
  ${
    ancoms.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    ancoms $p |- ( ( ps /\ ph ) -> ch ) $=
      ( expcom imp ) BACABCDEF $.
  $}
  ${
    ancomsd.1 $e |- ( ph -> ( ( ps /\ ch ) -> th ) ) $.
    
    ancomsd $p |- ( ph -> ( ( ch /\ ps ) -> th ) ) $=
      ( wa ancom syl5bi ) CBFBCFADCBGEH $.
  $}
  ${
    pm3.2i.1 $e |- ph $.
    pm3.2i.2 $e |- ps $.
    
    pm3.2i $p |- ( ph /\ ps ) $=
      ( wa pm3.2 mp2 ) ABABECDABFG $.
  $}
  
  simpl $p |- ( ( ph /\ ps ) -> ph ) $=
    ( ax-1 imp ) ABAABCD $.
  ${
    simpli.1 $e |- ( ph /\ ps ) $.
    
    simpli $p |- ph $=
      ( wa simpl ax-mp ) ABDACABEF $.
  $}
  ${
    simpld.1 $e |- ( ph -> ( ps /\ ch ) ) $.
    
    simpld $p |- ( ph -> ps ) $=
      ( wa simpl syl ) ABCEBDBCFG $.
  $}
  ${
    simplbi.1 $e |- ( ph <-> ( ps /\ ch ) ) $.
    
    simplbi $p |- ( ph -> ps ) $=
      ( wa biimpi simpld ) ABCABCEDFG $.
  $}
  
  simpr $p |- ( ( ph /\ ps ) -> ps ) $=
    ( idd imp ) ABBABCD $.
  ${
    simpri.1 $e |- ( ph /\ ps ) $.
    
    simpri $p |- ps $=
      ( wa simpr ax-mp ) ABDBCABEF $.
  $}
  ${
    simprd.1 $e |- ( ph -> ( ps /\ ch ) ) $.
    
    simprd $p |- ( ph -> ch ) $=
      ( ancomd simpld ) ACBABCDEF $.
  $}
  ${
    simprbi.1 $e |- ( ph <-> ( ps /\ ch ) ) $.
    
    simprbi $p |- ( ph -> ch ) $=
      ( wa biimpi simprd ) ABCABCEDFG $.
  $}
  ${
    adantr.1 $e |- ( ph -> ps ) $.
    
    adantr $p |- ( ( ph /\ ch ) -> ps ) $=
      ( a1d imp ) ACBABCDEF $.
  $}
  ${
    adantl.1 $e |- ( ph -> ps ) $.
    
    adantl $p |- ( ( ch /\ ph ) -> ps ) $=
      ( adantr ancoms ) ACBABCDEF $.
  $}
  ${
    adantld.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    adantld $p |- ( ph -> ( ( th /\ ps ) -> ch ) ) $=
      ( wa simpr syl5 ) DBFBACDBGEH $.
  $}
  ${
    adantrd.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    adantrd $p |- ( ph -> ( ( ps /\ th ) -> ch ) ) $=
      ( wa simpl syl5 ) BDFBACBDGEH $.
  $}
  ${
    mpan9.1 $e |- ( ph -> ps ) $.
    mpan9.2 $e |- ( ch -> ( ps -> th ) ) $.
    
    mpan9 $p |- ( ( ph /\ ch ) -> th ) $=
      ( syl5 impcom ) CADABCDEFGH $.
  $}
  ${
    syldan.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    syldan.2 $e |- ( ( ph /\ ch ) -> th ) $.
    
    syldan $p |- ( ( ph /\ ps ) -> th ) $=
      ( wa expcom adantrd mpcom ) CABGDECADBACDFHIJ $.
  $}
  ${
    sylan.1 $e |- ( ph -> ps ) $.
    sylan.2 $e |- ( ( ps /\ ch ) -> th ) $.
    
    sylan $p |- ( ( ph /\ ch ) -> th ) $=
      ( expcom mpan9 ) ABCDEBCDFGH $.
  $}
  ${
    sylanb.1 $e |- ( ph <-> ps ) $.
    sylanb.2 $e |- ( ( ps /\ ch ) -> th ) $.
    
    sylanb $p |- ( ( ph /\ ch ) -> th ) $=
      ( biimpi sylan ) ABCDABEGFH $.
  $}
  ${
    sylan2.1 $e |- ( ph -> ch ) $.
    sylan2.2 $e |- ( ( ps /\ ch ) -> th ) $.
    
    sylan2 $p |- ( ( ps /\ ph ) -> th ) $=
      ( adantl syldan ) BACDACBEGFH $.
  $}
  ${
    syl2an.1 $e |- ( ph -> ps ) $.
    syl2an.2 $e |- ( ta -> ch ) $.
    syl2an.3 $e |- ( ( ps /\ ch ) -> th ) $.
    
    syl2an $p |- ( ( ph /\ ta ) -> th ) $=
      ( sylan sylan2 ) EACDGABCDFHIJ $.
  $}
  ${
    syland.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syland.2 $e |- ( ph -> ( ( ch /\ th ) -> ta ) ) $.
    
    syland $p |- ( ph -> ( ( ps /\ th ) -> ta ) ) $=
      ( wi expd syld impd ) ABDEABCDEHFACDEGIJK $.
  $}
  ${
    sylan2d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    sylan2d.2 $e |- ( ph -> ( ( th /\ ch ) -> ta ) ) $.
    
    sylan2d $p |- ( ph -> ( ( th /\ ps ) -> ta ) ) $=
      ( ancomsd syland ) ABDEABCDEFADCEGHIH $.
  $}
  ${
    syl2and.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl2and.2 $e |- ( ph -> ( th -> ta ) ) $.
    syl2and.3 $e |- ( ph -> ( ( ch /\ ta ) -> et ) ) $.
    
    syl2and $p |- ( ph -> ( ( ps /\ th ) -> et ) ) $=
      ( sylan2d syland ) ABCDFGADECFHIJK $.
  $}
  ${
    biimpa.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    biimpa $p |- ( ( ph /\ ps ) -> ch ) $=
      ( biimpd imp ) ABCABCDEF $.
    
    biimpar $p |- ( ( ph /\ ch ) -> ps ) $=
      ( biimprd imp ) ACBABCDEF $.
  $}
  
  iba $p |- ( ph -> ( ps <-> ( ps /\ ph ) ) ) $=
    ( wa pm3.21 simpl impbid1 ) ABBACABDBAEF $.
  
  ibar $p |- ( ph -> ( ps <-> ( ph /\ ps ) ) ) $=
    ( wa pm3.2 simpr impbid1 ) ABABCABDABEF $.
  ${
    biantru.1 $e |- ph $.
    
    biantru $p |- ( ps <-> ( ps /\ ph ) ) $=
      ( wa wb iba ax-mp ) ABBADECABFG $.
  $}
  
  pm1.2 $p |- ( ( ph \/ ph ) -> ph ) $=
    ( id jaoi ) AAAABZDC $.
  
  oridm $p |- ( ( ph \/ ph ) <-> ph ) $=
    ( wo pm1.2 pm2.07 impbii ) AABAACADE $.
  ${
    orim12i.1 $e |- ( ph -> ps ) $.
    orim12i.2 $e |- ( ch -> th ) $.
    
    orim12i $p |- ( ( ph \/ ch ) -> ( ps \/ th ) ) $=
      ( wo orcd olcd jaoi ) ABDGCABDEHCDBFIJ $.
  $}
  ${
    orim1i.1 $e |- ( ph -> ps ) $.
    
    orim2i $p |- ( ( ch \/ ph ) -> ( ch \/ ps ) ) $=
      ( id orim12i ) CCABCEDF $.
  $}
  ${
    orbi2i.1 $e |- ( ph <-> ps ) $.
    
    orbi2i $p |- ( ( ch \/ ph ) <-> ( ch \/ ps ) ) $=
      ( wo biimpi orim2i biimpri impbii ) CAECBEABCABDFGBACABDHGI $.
    
    orbi1i $p |- ( ( ph \/ ch ) <-> ( ps \/ ch ) ) $=
      ( wo orcom orbi2i 3bitri ) ACECAECBEBCEACFABCDGCBFH $.
  $}
  ${
    orbi12i.1 $e |- ( ph <-> ps ) $.
    orbi12i.2 $e |- ( ch <-> th ) $.
    
    orbi12i $p |- ( ( ph \/ ch ) <-> ( ps \/ th ) ) $=
      ( wo orbi2i orbi1i bitri ) ACGADGBDGCDAFHABDEIJ $.
  $}
  ${
    jca.1 $e |- ( ph -> ps ) $.
    jca.2 $e |- ( ph -> ch ) $.
    
    jca $p |- ( ph -> ( ps /\ ch ) ) $=
      ( wa pm3.2 sylc ) ABCBCFDEBCGH $.
  $}
  ${
    jcad.1 $e |- ( ph -> ( ps -> ch ) ) $.
    jcad.2 $e |- ( ph -> ( ps -> th ) ) $.
    
    jcad $p |- ( ph -> ( ps -> ( ch /\ th ) ) ) $=
      ( wa pm3.2 syl6c ) ABCDCDGEFCDHI $.
  $}
  ${
    jctild.1 $e |- ( ph -> ( ps -> ch ) ) $.
    jctild.2 $e |- ( ph -> th ) $.
    
    jctild $p |- ( ph -> ( ps -> ( th /\ ch ) ) ) $=
      ( a1d jcad ) ABDCADBFGEH $.
  $}
  ${
    syl6an.1 $e |- ( ph -> ps ) $.
    syl6an.2 $e |- ( ph -> ( ch -> th ) ) $.
    syl6an.3 $e |- ( ( ps /\ th ) -> ta ) $.
    
    syl6an $p |- ( ph -> ( ch -> ta ) ) $=
      ( wa jctild syl6 ) ACBDIEACDBGFJHK $.
  $}
  
  anclb $p |- ( ( ph -> ps ) <-> ( ph -> ( ph /\ ps ) ) ) $=
    ( wa ibar pm5.74i ) ABABCABDE $.
  
  ancr $p |- ( ( ph -> ps ) -> ( ph -> ( ps /\ ph ) ) ) $=
    ( wa pm3.21 a2i ) ABBACABDE $.
  ${
    ancld.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    ancld $p |- ( ph -> ( ps -> ( ps /\ ch ) ) ) $=
      ( idd jcad ) ABBCABEDF $.
  $}
  ${
    ancrd.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    ancrd $p |- ( ph -> ( ps -> ( ch /\ ps ) ) ) $=
      ( idd jcad ) ABCBDABEF $.
  $}
  ${
    anc2li.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    anc2li $p |- ( ph -> ( ps -> ( ph /\ ch ) ) ) $=
      ( id jctild ) ABCADAEF $.
  $}
  
  pm3.4 $p |- ( ( ph /\ ps ) -> ( ph -> ps ) ) $=
    ( wa simpr a1d ) ABCBAABDE $.
  ${
    anim12d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    anim12d.2 $e |- ( ph -> ( th -> ta ) ) $.
    
    anim12d $p |- ( ph -> ( ( ps /\ th ) -> ( ch /\ ta ) ) ) $=
      ( wa idd syl2and ) ABCDECEHZFGAKIJ $.
  $}
  ${
    anim1d.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    anim2d $p |- ( ph -> ( ( th /\ ps ) -> ( th /\ ch ) ) ) $=
      ( idd anim12d ) ADDBCADFEG $.
  $}
  ${
    anim12i.1 $e |- ( ph -> ps ) $.
    anim12i.2 $e |- ( ch -> th ) $.
    
    anim12i $p |- ( ( ph /\ ch ) -> ( ps /\ th ) ) $=
      ( wa id syl2an ) ABDBDGZCEFJHI $.
  $}
  ${
    anim1i.1 $e |- ( ph -> ps ) $.
    
    anim2i $p |- ( ( ch /\ ph ) -> ( ch /\ ps ) ) $=
      ( id anim12i ) CCABCEDF $.
  $}
  ${
    exp31.1 $e |- ( ( ( ph /\ ps ) /\ ch ) -> th ) $.
    
    exp31 $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( wi wa ex ) ABCDFABGCDEHH $.
  $}
  ${
    exp32.1 $e |- ( ( ph /\ ( ps /\ ch ) ) -> th ) $.
    
    exp32 $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( wa ex expd ) ABCDABCFDEGH $.
  $}
  
  dfbi2 $p |- ( ( ph <-> ps ) <-> ( ( ph -> ps ) /\ ( ps -> ph ) ) ) $=
    ( wb wi wn wa dfbi1 df-an bitr4i ) ABCABDZBADZEDEJKFABGJKHI $.
  
  pm4.71 $p |- ( ( ph -> ps ) <-> ( ph <-> ( ph /\ ps ) ) ) $=
    ( wa wi wb simpl biantru anclb dfbi2 3bitr4i ) AABCZDZLKADZCABDAKEMLABFGABH
    AKIJ $.
  ${
    pm4.71i.1 $e |- ( ph -> ps ) $.
    
    pm4.71i $p |- ( ph <-> ( ph /\ ps ) ) $=
      ( wi wa wb pm4.71 mpbi ) ABDAABEFCABGH $.
  $}
  
  pm5.32 $p |- ( ( ph -> ( ps <-> ch ) ) <->
               ( ( ph /\ ps ) <-> ( ph /\ ch ) ) ) $=
    ( wb wi wn wa notbi imbi2i pm5.74 3bitri df-an bibi12i bitr4i ) ABCDZEZABFZ
    EZFZACFZEZFZDZABGZACGZDPAQTDZERUADUCOUFABCHIAQTJRUAHKUDSUEUBABLACLMN $.
  ${
    pm5.32i.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    pm5.32i $p |- ( ( ph /\ ps ) <-> ( ph /\ ch ) ) $=
      ( wb wi wa pm5.32 mpbi ) ABCEFABGACGEDABCHI $.
    
    pm5.32ri $p |- ( ( ps /\ ph ) <-> ( ch /\ ph ) ) $=
      ( wa pm5.32i ancom 3bitr4i ) ABEACEBAECAEABCDFBAGCAGH $.
  $}
  ${
    pm5.32d.1 $e |- ( ph -> ( ps -> ( ch <-> th ) ) ) $.
    
    pm5.32d $p |- ( ph -> ( ( ps /\ ch ) <-> ( ps /\ th ) ) ) $=
      ( wb wi wa pm5.32 sylib ) ABCDFGBCHBDHFEBCDIJ $.
    
    pm5.32rd $p |- ( ph -> ( ( ch /\ ps ) <-> ( th /\ ps ) ) ) $=
      ( wa pm5.32d ancom 3bitr4g ) ABCFBDFCBFDBFABCDEGCBHDBHI $.
  $}
  ${
    pm5.32da.1 $e |- ( ( ph /\ ps ) -> ( ch <-> th ) ) $.
    
    pm5.32da $p |- ( ph -> ( ( ps /\ ch ) <-> ( ps /\ th ) ) ) $=
      ( wb ex pm5.32d ) ABCDABCDFEGH $.
  $}
  
  pm4.24 $p |- ( ph <-> ( ph /\ ph ) ) $=
    ( id pm4.71i ) AAABC $.
  ${
    anidms.1 $e |- ( ( ph /\ ph ) -> ps ) $.
    
    anidms $p |- ( ph -> ps ) $=
      ( ex pm2.43i ) ABAABCDE $.
  $}
  ${
    anasss.1 $e |- ( ( ( ph /\ ps ) /\ ch ) -> th ) $.
    
    anasss $p |- ( ( ph /\ ( ps /\ ch ) ) -> th ) $=
      ( exp31 imp32 ) ABCDABCDEFG $.
  $}
  ${
    anassrs.1 $e |- ( ( ph /\ ( ps /\ ch ) ) -> th ) $.
    
    anassrs $p |- ( ( ( ph /\ ps ) /\ ch ) -> th ) $=
      ( exp32 imp31 ) ABCDABCDEFG $.
  $}
  
  anass $p |- ( ( ( ph /\ ps ) /\ ch ) <-> ( ph /\ ( ps /\ ch ) ) ) $=
    ( wa id anassrs anasss impbii ) ABDCDZABCDDZABCJJEFABCIIEGH $.
  ${
    sylan9.1 $e |- ( ph -> ( ps -> ch ) ) $.
    sylan9.2 $e |- ( th -> ( ch -> ta ) ) $.
    
    sylan9 $p |- ( ( ph /\ th ) -> ( ps -> ta ) ) $=
      ( wi syl9 imp ) ADBEHABCDEFGIJ $.
  $}
  ${
    syl2anc.1 $e |- ( ph -> ps ) $.
    syl2anc.2 $e |- ( ph -> ch ) $.
    syl2anc.3 $e |- ( ( ps /\ ch ) -> th ) $.
    
    syl2anc $p |- ( ph -> th ) $=
      ( ex sylc ) ABCDEFBCDGHI $.
  $}
  ${
    sylancl.1 $e |- ( ph -> ps ) $.
    sylancl.2 $e |- ch $.
    sylancl.3 $e |- ( ( ps /\ ch ) -> th ) $.
    
    sylancl $p |- ( ph -> th ) $=
      ( a1i syl2anc ) ABCDECAFHGI $.
  $}
  ${
    sylanbrc.1 $e |- ( ph -> ps ) $.
    sylanbrc.2 $e |- ( ph -> ch ) $.
    sylanbrc.3 $e |- ( th <-> ( ps /\ ch ) ) $.
    
    sylanbrc $p |- ( ph -> th ) $=
      ( wa jca sylibr ) ABCHDABCEFIGJ $.
  $}
  ${
    mpancom.1 $e |- ( ps -> ph ) $.
    mpancom.2 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    mpancom $p |- ( ps -> ch ) $=
      ( id syl2anc ) BABCDBFEG $.
  $}
  ${
    mpan.1 $e |- ph $.
    mpan.2 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    mpan $p |- ( ps -> ch ) $=
      ( a1i mpancom ) ABCABDFEG $.
  $}
  ${
    mp2an.1 $e |- ph $.
    mp2an.2 $e |- ps $.
    mp2an.3 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    mp2an $p |- ch $=
      ( mpan ax-mp ) BCEABCDFGH $.
  $}
  ${
    imdistani.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    imdistani $p |- ( ( ph /\ ps ) -> ( ph /\ ch ) ) $=
      ( wa anc2li imp ) ABACEABCDFG $.
  $}
  ${
    anbi.1 $e |- ( ph <-> ps ) $.
    
    anbi2i $p |- ( ( ch /\ ph ) <-> ( ch /\ ps ) ) $=
      ( wb a1i pm5.32i ) CABABECDFG $.
    
    anbi1i $p |- ( ( ph /\ ch ) <-> ( ps /\ ch ) ) $=
      ( wb a1i pm5.32ri ) CABABECDFG $.
  $}
  ${
    anbi12.1 $e |- ( ph <-> ps ) $.
    anbi12.2 $e |- ( ch <-> th ) $.
    
    anbi12i $p |- ( ( ph /\ ch ) <-> ( ps /\ th ) ) $=
      ( wa anbi1i anbi2i bitri ) ACGBCGBDGABCEHCDBFIJ $.
  $}
  ${
    sylan9bb.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    sylan9bb.2 $e |- ( th -> ( ch <-> ta ) ) $.
    
    sylan9bb $p |- ( ( ph /\ th ) -> ( ps <-> ta ) ) $=
      ( wa wb adantr adantl bitrd ) ADHBCEABCIDFJDCEIAGKL $.
  $}
  ${
    bid.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    orbi2d $p |- ( ph -> ( ( th \/ ps ) <-> ( th \/ ch ) ) ) $=
      ( wn wi wo imbi2d df-or 3bitr4g ) ADFZBGLCGDBHDCHABCLEIDBJDCJK $.
    
    orbi1d $p |- ( ph -> ( ( ps \/ th ) <-> ( ch \/ th ) ) ) $=
      ( wo orbi2d orcom 3bitr4g ) ADBFDCFBDFCDFABCDEGBDHCDHI $.
    
    anbi2d $p |- ( ph -> ( ( th /\ ps ) <-> ( th /\ ch ) ) ) $=
      ( wb a1d pm5.32d ) ADBCABCFDEGH $.
    
    anbi1d $p |- ( ph -> ( ( ps /\ th ) <-> ( ch /\ th ) ) ) $=
      ( wb a1d pm5.32rd ) ADBCABCFDEGH $.
  $}
  
  anbi2 $p |- ( ( ph <-> ps ) -> ( ( ch /\ ph ) <-> ( ch /\ ps ) ) ) $=
    ( wb id anbi2d ) ABDZABCGEF $.
  ${
    bi12d.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    bi12d.2 $e |- ( ph -> ( th <-> ta ) ) $.
    
    orbi12d $p |- ( ph -> ( ( ps \/ th ) <-> ( ch \/ ta ) ) ) $=
      ( wo orbi1d orbi2d bitrd ) ABDHCDHCEHABCDFIADECGJK $.
    
    anbi12d $p |- ( ph -> ( ( ps /\ th ) <-> ( ch /\ ta ) ) ) $=
      ( wa anbi1d anbi2d bitrd ) ABDHCDHCEHABCDFIADECGJK $.
  $}
  ${
    adant2.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    adantll $p |- ( ( ( th /\ ph ) /\ ps ) -> ch ) $=
      ( wa simpr sylan ) DAFABCDAGEH $.
    
    adantlr $p |- ( ( ( ph /\ th ) /\ ps ) -> ch ) $=
      ( wa simpl sylan ) ADFABCADGEH $.
    
    adantrl $p |- ( ( ph /\ ( th /\ ps ) ) -> ch ) $=
      ( wa simpr sylan2 ) DBFABCDBGEH $.
    
    adantrr $p |- ( ( ph /\ ( ps /\ th ) ) -> ch ) $=
      ( wa simpl sylan2 ) BDFABCBDGEH $.
  $}
  ${
    ad2ant.1 $e |- ( ph -> ps ) $.
    
    ad2antrr $p |- ( ( ( ph /\ ch ) /\ th ) -> ps ) $=
      ( adantr adantlr ) ADBCABDEFG $.
    
    ad2antlr $p |- ( ( ( ch /\ ph ) /\ th ) -> ps ) $=
      ( adantr adantll ) ADBCABDEFG $.
  $}
  
  simpll $p |- ( ( ( ph /\ ps ) /\ ch ) -> ph ) $=
    ( id ad2antrr ) AABCADE $.
  
  simplr $p |- ( ( ( ph /\ ps ) /\ ch ) -> ps ) $=
    ( id ad2antlr ) BBACBDE $.
  ${
    pm2.61ian.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    pm2.61ian.2 $e |- ( ( -. ph /\ ps ) -> ch ) $.
    
    pm2.61ian $p |- ( ps -> ch ) $=
      ( wi ex wn pm2.61i ) ABCFABCDGAHBCEGI $.
  $}
  ${
    pm2.61dan.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    pm2.61dan.2 $e |- ( ( ph /\ -. ps ) -> ch ) $.
    
    pm2.61dan $p |- ( ph -> ch ) $=
      ( ex wn pm2.61d ) ABCABCDFABGCEFH $.
  $}
  
  abai $p |- ( ( ph /\ ps ) <-> ( ph /\ ( ph -> ps ) ) ) $=
    ( wi biimt pm5.32i ) ABABCABDE $.
  
  an12 $p |- ( ( ph /\ ( ps /\ ch ) ) <-> ( ps /\ ( ph /\ ch ) ) ) $=
    ( wa ancom anbi1i anass 3bitr3i ) ABDZCDBADZCDABCDDBACDDIJCABEFABCGBACGH $.
  ${
    anabsan.1 $e |- ( ( ( ph /\ ph ) /\ ps ) -> ch ) $.
    
    anabsan $p |- ( ( ph /\ ps ) -> ch ) $=
      ( wa pm4.24 sylanb ) AAAEBCAFDG $.
  $}
  ${
    anabss5.1 $e |- ( ( ph /\ ( ph /\ ps ) ) -> ch ) $.
    
    anabss5 $p |- ( ( ph /\ ps ) -> ch ) $=
      ( anassrs anabsan ) ABCAABCDEF $.
  $}
  ${
    anabsi5.1 $e |- ( ph -> ( ( ph /\ ps ) -> ch ) ) $.
    
    anabsi5 $p |- ( ( ph /\ ps ) -> ch ) $=
      ( wa imp anabss5 ) ABCAABECDFG $.
  $}
  
  an4 $p |- ( ( ( ph /\ ps ) /\ ( ch /\ th ) ) <->
              ( ( ph /\ ch ) /\ ( ps /\ th ) ) ) $=
    ( wa an12 anbi2i anass 3bitr4i ) ABCDEZEZEACBDEZEZEABEJEACELEKMABCDFGABJHAC
    LHI $.
  ${
    an4s.1 $e |- ( ( ( ph /\ ps ) /\ ( ch /\ th ) ) -> ta ) $.
    
    an4s $p |- ( ( ( ph /\ ch ) /\ ( ps /\ th ) ) -> ta ) $=
      ( wa an4 sylbi ) ACGBDGGABGCDGGEACBDHFI $.
  $}
  ${
    bi2an9.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    bi2an9.2 $e |- ( th -> ( ta <-> et ) ) $.
    
    bi2anan9 $p |- ( ( ph /\ th ) -> ( ( ps /\ ta ) <-> ( ch /\ et ) ) ) $=
      ( wa anbi1d anbi2d sylan9bb ) ABEICEIDCFIABCEGJDEFCHKL $.
  $}
  ${
    baib.1 $e |- ( ph <-> ( ps /\ ch ) ) $.
    
    rbaibr $p |- ( ch -> ( ps <-> ph ) ) $=
      ( wa iba syl6bbr ) CBBCEACBFDG $.
  $}
  ${
    mpbiran2.1 $e |- ch $.
    mpbiran2.2 $e |- ( ph <-> ( ps /\ ch ) ) $.
    
    mpbiran2 $p |- ( ph <-> ps ) $=
      ( wa biantru bitr4i ) ABCFBECBDGH $.
  $}
  
  bimsc1 $p |- ( ( ( ph -> ps ) /\ ( ch <-> ( ps /\ ph ) ) )
               -> ( ch <-> ph ) ) $=
    ( wi wa wb simpr ancr impbid2 bibi2d biimpa ) ABDZCBAEZFCAFLMACLMABAGABHIJK
    $.
  
  cases2 $p |- ( ( ( ph /\ ps ) \/ ( -. ph /\ ch ) )
                                   <-> ( ( ph -> ps ) /\ ( -. ph -> ch ) ) ) $=
    ( wa wn wo wi pm3.4 pm2.24 adantr pm2.21 jaoi pm2.27 imdistani orcd adantrr
    jca olcd adantrl pm2.61ian impbii ) ABDZAEZCDZFZABGZUCCGZDZUBUHUDUBUFUGABHA
    UGBACIJQUDUFUGUCUFCABKJUCCHQLAUHUEAUFUEUGAUFDUBUDAUFBABMNOPUCUGUEUFUCUGDUDU
    BUCUGCUCCMNRSTUA $.
  
  dfbi3 $p |- ( ( ph <-> ps ) <-> ( ( ph /\ ps ) \/ ( -. ph /\ -. ps ) ) ) $=
    ( wi wa wn wb wo con34b anbi2i dfbi2 cases2 3bitr4i ) ABCZBACZDMAEZBEZCZDAB
    FABDOPDGNQMBAHIABJABPKL $.
  
  dedlem0a $p |- ( ph -> ( ps <-> ( ( ch -> ph ) -> ( ps /\ ph ) ) ) ) $=
    ( wa wi iba wb ax-1 biimt syl bitrd ) ABBADZCAEZLEZABFAMLNGACHMLIJK $.
  
  dedlemb $p |- ( -. ph -> ( ch <-> ( ( ps /\ ph ) \/ ( ch /\ -. ph ) ) ) ) $=
    ( wn wa wo olc expcom pm2.21 adantld wi simpl a1i jaod impbid ) ADZCBAEZCPE
    ZFZCPSRQGHPQCRPACBACIJRCKPCPLMNO $.
  ${
    oplem1.1 $e |- ( ph -> ( ps \/ ch ) ) $.
    oplem1.2 $e |- ( ph -> ( th \/ ta ) ) $.
    oplem1.3 $e |- ( ps <-> th ) $.
    oplem1.4 $e |- ( ch -> ( th <-> ta ) ) $.
    
    oplem1 $p |- ( ph -> ps ) $=
      ( wn wa notbii ord syl5bir jcad biimpar syl6 pm2.18d sylibr ) ADBADADJZCE
      KDATCETBJACBDHLABCFMNADEGMOCDEIPQRHS $.
  $}
  
  $c , $.
  
  w3a $a wff ( ph /\ ps /\ ch ) $.
  
  df-3an $a |- ( ( ph /\ ps /\ ch ) <-> ( ( ph /\ ps ) /\ ch ) ) $.
  
  pm3.2an3 $p |- ( ph -> ( ps -> ( ch -> ( ph /\ ps /\ ch ) ) ) ) $=
    ( w3a wa df-3an biimpri exp31 ) ABCABCDZIABECEABCFGH $.
  ${
    3imp.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
    
    3imp $p |- ( ( ph /\ ps /\ ch ) -> th ) $=
      ( w3a wa df-3an imp31 sylbi ) ABCFABGCGDABCHABCDEIJ $.
  $}
  ${
    3impb.1 $e |- ( ( ph /\ ( ps /\ ch ) ) -> th ) $.
    
    3impb $p |- ( ( ph /\ ps /\ ch ) -> th ) $=
      ( exp32 3imp ) ABCDABCDEFG $.
  $}
  ${
    3exp.1 $e |- ( ( ph /\ ps /\ ch ) -> th ) $.
    
    3exp $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( w3a pm3.2an3 syl8 ) ABCABCFDABCGEH $.
    
    3expia $p |- ( ( ph /\ ps ) -> ( ch -> th ) ) $=
      ( wi 3exp imp ) ABCDFABCDEGH $.
  $}
  ${
    mp3an3.1 $e |- ch $.
    mp3an3.2 $e |- ( ( ph /\ ps /\ ch ) -> th ) $.
    
    mp3an3 $p |- ( ( ph /\ ps ) -> th ) $=
      ( wa 3expia mpi ) ABGCDEABCDFHI $.
  $}
  
  $c A. $. 
  $c setvar $.
  ${
    $v x $.
    
    vx.wal $f setvar x $.
    
    wal $a wff A. x ph $.
  $}
  $c class $.
  ${
    $v x $.
    
    vx.cv $f setvar x $.
    
    cv $a class x $.
  $}
  
  $c = $.  
  ${
    $v A $.
    $v B $.
    
    cA.wceq $f class A $.
    cB.wceq $f class B $.
    
    wceq $a wff A = B $.
  $}
  $c T. $.
  
  wtru $a wff T. $.
  ${
    $v x $.
    $v y $.
    
    vx.tru $f setvar x $.
    vy.tru $f setvar y $.
    
    df-tru $a |- ( T. <-> ( A. x x = x -> A. x x = x ) ) $.
    
    tru $p |- T. $=
      ( vx.tru wtru cv wceq wal wi id df-tru mpbir ) BACZJDAEZKFKGAHI $.
  $}
  ${
    trud.1 $e |- ( T. -> ph ) $.
    
    trud $p |- ph $=
      ( wtru tru ax-mp ) CADBE $.
  $}
  
  $v x $.
  $v y $.
  $v z $.
  $v w $.
  $v v $.
  $v u $.
  $v t $.
  
  vx $f setvar x $.
  
  vy $f setvar y $.
  
  vz $f setvar z $.
  
  vw $f setvar w $.
  
  vv $f setvar v $.
  
  vu $f setvar u $.
  
  vt $f setvar t $.
  
  $c E. $.
  
  wex $a wff E. x ph $.
  
  df-ex $a |- ( E. x ph <-> -. A. x -. ph ) $.
  
  alnex $p |- ( A. x -. ph <-> -. E. x ph ) $=
    ( wex wn wal df-ex con2bii ) ABCADBEABFG $.
  
  eximal $p |- ( ( E. x ph -> ps ) <-> ( -. ps -> A. x -. ph ) ) $=
    ( wex wi wn wal df-ex imbi1i con1b bitri ) ACDZBEAFCGZFZBEBFMELNBACHIMBJK
    $.
  $c F/ $.
  
  wnf $a wff F/ x ph $.
  
  df-nf $a |- ( F/ x ph <-> ( E. x ph -> A. x ph ) ) $.
  
  nf2 $p |- ( F/ x ph <-> ( A. x ph \/ -. E. x ph ) ) $=
    ( wnf wex wal wi wn wo df-nf imor orcom 3bitri ) ABCABDZABEZFMGZNHNOHABIMNJ
    ONKL $.
  
  nf3 $p |- ( F/ x ph <-> ( A. x ph \/ A. x -. ph ) ) $=
    ( wnf wal wex wn wo nf2 alnex orbi2i bitr4i ) ABCABDZABEFZGLAFBDZGABHNMLABI
    JK $.
  ${
    nfi.1 $e |- ( E. x ph -> A. x ph ) $.
    
    nfi $p |- F/ x ph $=
      ( wnf wex wal wi df-nf mpbir ) ABDABEABFGCABHI $.
  $}
  ${
    nfd.1 $e |- ( ph -> ( E. x ps -> A. x ps ) ) $.
    
    nfd $p |- ( ph -> F/ x ps ) $=
      ( wex wal wi wnf df-nf sylibr ) ABCEBCFGBCHDBCIJ $.
  $}
  ${
    nfrd.1 $e |- ( ph -> F/ x ps ) $.
    
    nfrd $p |- ( ph -> ( E. x ps -> A. x ps ) ) $=
      ( wnf wex wal wi df-nf sylib ) ABCEBCFBCGHDBCIJ $.
  $}
  
  nftht $p |- ( A. x ph -> F/ x ph ) $=
    ( wal wex wi wnf ax-1 df-nf sylibr ) ABCZABDZJEABFJKGABHI $.
  ${
    ax-gen.1 $e |- ph $.
    
    ax-gen $a |- A. x ph $.
  $}
  ${
    mpg.1 $e |- ( A. x ph -> ps ) $.
    mpg.2 $e |- ph $.
    
    mpg $p |- ps $=
      ( wal ax-gen ax-mp ) ACFBACEGDH $.
  $}
  ${
    mpgbi.1 $e |- ( A. x ph <-> ps ) $.
    mpgbi.2 $e |- ph $.
    
    mpgbi $p |- ps $=
      ( wal ax-gen mpbi ) ACFBACEGDH $.
  $}
  ${
    mpgbir.1 $e |- ( ph <-> A. x ps ) $.
    mpgbir.2 $e |- ps $.
    
    mpgbir $p |- ph $=
      ( wal ax-gen mpbir ) ABCFBCEGDH $.
  $}
  
  ax-4 $a |- ( A. x ( ph -> ps ) -> ( A. x ph -> A. x ps ) ) $.
  
  alim $p |- ( A. x ( ph -> ps ) -> ( A. x ph -> A. x ps ) ) $=
    ( ax-4 ) ABCD $.
  ${
    alimi.1 $e |- ( ph -> ps ) $.
    
    alimi $p |- ( A. x ph -> A. x ps ) $=
      ( wi wal alim mpg ) ABEACFBCFECABCGDH $.
  $}
  
  ala1 $p |- ( A. x ph -> A. x ( ps -> ph ) ) $=
    ( wi ax-1 alimi ) ABADCABEF $.
  
  al2im $p |- ( A. x ( ph -> ( ps -> ch ) ) ->
                                     ( A. x ph -> ( A. x ps -> A. x ch ) ) ) $=
    ( wi wal alim syl6 ) ABCEZEDFADFIDFBDFCDFEAIDGBCDGH $.
  ${
    al2imi.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    al2imi $p |- ( A. x ph -> ( A. x ps -> A. x ch ) ) $=
      ( wi wal al2im mpg ) ABCFFADGBDGCDGFFDABCDHEI $.
  $}
  ${
    alanimi.1 $e |- ( ( ph /\ ps ) -> ch ) $.
    
    alanimi $p |- ( ( A. x ph /\ A. x ps ) -> A. x ch ) $=
      ( wal ex al2imi imp ) ADFBDFCDFABCDABCEGHI $.
  $}
  ${
    alimdh.1 $e |- ( ph -> A. x ph ) $.
    alimdh.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    alimdh $p |- ( ph -> ( A. x ps -> A. x ch ) ) $=
      ( wal wi al2imi syl ) AADGBDGCDGHEABCDFIJ $.
  $}
  
  albi $p |- ( A. x ( ph <-> ps ) -> ( A. x ph <-> A. x ps ) ) $=
    ( wb wal biimp al2imi biimpr impbid ) ABDZCEACEBCEJABCABFGJBACABHGI $.
  ${
    albii.1 $e |- ( ph <-> ps ) $.
    
    albii $p |- ( A. x ph <-> A. x ps ) $=
      ( wb wal albi mpg ) ABEACFBCFECABCGDH $.
  $}
  ${
    sylg.1 $e |- ( ph -> A. x ps ) $.
    sylg.2 $e |- ( ps -> ch ) $.
    
    sylg $p |- ( ph -> A. x ch ) $=
      ( wal alimi syl ) ABDGCDGEBCDFHI $.
  $}
  ${
    alrimih.1 $e |- ( ph -> A. x ph ) $.
    alrimih.2 $e |- ( ph -> ps ) $.
    
    alrimih $p |- ( ph -> A. x ps ) $=
      ( sylg ) AABCDEF $.
  $}
  ${
    hbxfrbi.1 $e |- ( ph <-> ps ) $.
    hbxfrbi.2 $e |- ( ps -> A. x ps ) $.
    
    hbxfrbi $p |- ( ph -> A. x ph ) $=
      ( wal albii 3imtr4i ) BBCFAACFEDABCDGH $.
  $}
  
  alex $p |- ( A. x ph <-> -. E. x -. ph ) $=
    ( wal wn wex notnotb albii alnex bitri ) ABCADZDZBCJBEDAKBAFGJBHI $.
  
  exnal $p |- ( E. x -. ph <-> -. A. x ph ) $=
    ( wal wn wex alex con2bii ) ABCADBEABFG $.
  ${
    aleximi.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    aleximi $p |- ( A. x ph -> ( E. x ps -> E. x ch ) ) $=
      ( wal wex wn con3d al2imi alnex 3imtr3g con4d ) ADFZCDGZBDGZNCHZDFBHZDFOH
      PHAQRDABCEIJCDKBDKLM $.
  $}
  ${
    alexbii.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    alexbii $p |- ( A. x ph -> ( E. x ps <-> E. x ch ) ) $=
      ( wal wex biimpd aleximi biimprd impbid ) ADFBDGCDGABCDABCEHIACBDABCEJIK
      $.
  $}
  
  exim $p |- ( A. x ( ph -> ps ) -> ( E. x ph -> E. x ps ) ) $=
    ( wi id aleximi ) ABDZABCGEF $.
  ${
    eximi.1 $e |- ( ph -> ps ) $.
    
    eximi $p |- ( E. x ph -> E. x ps ) $=
      ( wi wex exim mpg ) ABEACFBCFECABCGDH $.
  $}
  ${
    eximii.1 $e |- E. x ph $.
    eximii.2 $e |- ( ph -> ps ) $.
    
    eximii $p |- E. x ps $=
      ( wex eximi ax-mp ) ACFBCFDABCEGH $.
  $}
  
  exa1 $p |- ( E. x ph -> E. x ( ps -> ph ) ) $=
    ( wi ax-1 eximi ) ABADCABEF $.
  
  19.38 $p |- ( ( E. x ph -> A. x ps ) -> A. x ( ph -> ps ) ) $=
    ( wex wal wi wn alnex pm2.21 alimi sylbir ala1 ja ) ACDZBCEABFZCEZNGAGZCEPA
    CHQOCABIJKBACLM $.
  
  19.38a $p |-
             ( F/ x ph -> ( ( E. x ph -> A. x ps ) <-> A. x ( ph -> ps ) ) ) $=
    ( wnf wex wal wi 19.38 df-nf alim imim1 syl5 sylbi impbid2 ) ACDZACEZBCFZGZ
    ABGCFZABCHOPACFZGZSRGACISTQGUARABCJPTQKLMN $.
  
  imnang $p |- ( A. x ( ph -> -. ps ) <-> A. x -. ( ph /\ ps ) ) $=
    ( wn wi wa imnan albii ) ABDEABFDCABGH $.
  
  alinexa $p |- ( A. x ( ph -> -. ps ) <-> -. E. x ( ph /\ ps ) ) $=
    ( wn wi wal wa wex imnang alnex bitri ) ABDECFABGZDCFLCHDABCILCJK $.
  
  exbi $p |- ( A. x ( ph <-> ps ) -> ( E. x ph <-> E. x ps ) ) $=
    ( wb id alexbii ) ABDZABCGEF $.
  ${
    exbii.1 $e |- ( ph <-> ps ) $.
    
    exbii $p |- ( E. x ph <-> E. x ps ) $=
      ( wb wex exbi mpg ) ABEACFBCFECABCGDH $.
  $}
  ${
    2exbii.1 $e |- ( ph <-> ps ) $.
    
    2exbii $p |- ( E. x E. y ph <-> E. x E. y ps ) $=
      ( wex exbii ) ADFBDFCABDEGG $.
  $}
  
  nfbiit $p |- ( A. x ( ph <-> ps ) -> ( F/ x ph <-> F/ x ps ) ) $=
    ( wb wal wex wi wnf exbi albi imbi12d df-nf 3bitr4g ) ABDCEZACFZACEZGBCFZBC
    EZGACHBCHNOQPRABCIABCJKACLBCLM $.
  ${
    nfbii.1 $e |- ( ph <-> ps ) $.
    
    nfbii $p |- ( F/ x ph <-> F/ x ps ) $=
      ( wb wnf nfbiit mpg ) ABEACFBCFECABCGDH $.
    ${
      nfxfr.2 $e |- F/ x ps $.
      
      nfxfr $p |- F/ x ph $=
        ( wnf nfbii mpbir ) ACFBCFEABCDGH $.
    $}
    ${
      nfxfrd.2 $e |- ( ch -> F/ x ps ) $.
      
      nfxfrd $p |- ( ch -> F/ x ph ) $=
        ( wnf nfbii sylibr ) CBDGADGFABDEHI $.
    $}
  $}
  
  nfnbi $p |- ( F/ x ph <-> F/ x -. ph ) $=
    ( wal wn wo wnf notnotb albii orbi1i orcom bitri nf3 3bitr4i ) ABCZADZBCZEZ
    PODZBCZEZABFOBFQSPETNSPARBAGHISPJKABLOBLM $.
  
  nfnt $p |- ( F/ x ph -> F/ x -. ph ) $=
    ( wnf wn nfnbi biimpi ) ABCADBCABEF $.
  ${
    nfn.1 $e |- F/ x ph $.
    
    nfn $p |- F/ x -. ph $=
      ( wnf wn nfnt ax-mp ) ABDAEBDCABFG $.
  $}
  ${
    nfnd.1 $e |- ( ph -> F/ x ps ) $.
    
    nfnd $p |- ( ph -> F/ x -. ps ) $=
      ( wnf wn nfnt syl ) ABCEBFCEDBCGH $.
  $}
  
  exanali $p |- ( E. x ( ph /\ -. ps ) <-> -. A. x ( ph -> ps ) ) $=
    ( wn wa wex wi wal annim exbii exnal bitri ) ABDEZCFABGZDZCFNCHDMOCABIJNCKL
    $.
  
  exancom $p |- ( E. x ( ph /\ ps ) <-> E. x ( ps /\ ph ) ) $=
    ( wa ancom exbii ) ABDBADCABEF $.
  ${
    exan.1 $e |- ( E. x ph /\ ps ) $.
    
    exan $p |- E. x ( ph /\ ps ) $=
      ( wex wa simpli wi simpri pm3.21 ax-mp eximi ) ACEZABFZCEMBDGANCBANHMBDIB
      AJKLK $.
  $}
  ${
    alrimdh.1 $e |- ( ph -> A. x ph ) $.
    alrimdh.2 $e |- ( ps -> A. x ps ) $.
    alrimdh.3 $e |- ( ph -> ( ps -> ch ) ) $.
    
    alrimdh $p |- ( ph -> ( ps -> A. x ch ) ) $=
      ( wal alimdh syl5 ) BBDHACDHFABCDEGIJ $.
  $}
  ${
    eximdh.1 $e |- ( ph -> A. x ph ) $.
    eximdh.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    eximdh $p |- ( ph -> ( E. x ps -> E. x ch ) ) $=
      ( wal wex wi aleximi syl ) AADGBDHCDHIEABCDFJK $.
  $}
  ${
    albidh.1 $e |- ( ph -> A. x ph ) $.
    albidh.2 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    albidh $p |- ( ph -> ( A. x ps <-> A. x ch ) ) $=
      ( wb wal alrimih albi syl ) ABCGZDHBDHCDHGALDEFIBCDJK $.
  $}
  ${
    exbidh.1 $e |- ( ph -> A. x ph ) $.
    exbidh.2 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    exbidh $p |- ( ph -> ( E. x ps <-> E. x ch ) ) $=
      ( wal wex wb alexbii syl ) AADGBDHCDHIEABCDFJK $.
  $}
  
  exsimpl $p |- ( E. x ( ph /\ ps ) -> E. x ph ) $=
    ( wa simpl eximi ) ABDACABEF $.
  
  exsimpr $p |- ( E. x ( ph /\ ps ) -> E. x ps ) $=
    ( wa simpr eximi ) ABDBCABEF $.
  
  19.40 $p |- ( E. x ( ph /\ ps ) -> ( E. x ph /\ E. x ps ) ) $=
    ( wa wex exsimpl exsimpr jca ) ABDCEACEBCEABCFABCGH $.
  
  19.26 $p |- ( A. x ( ph /\ ps ) <-> ( A. x ph /\ A. x ps ) ) $=
    ( wa wal simpl alimi simpr jca id alanimi impbii ) ABDZCEZACEZBCEZDNOPMACAB
    FGMBCABHGIABMCMJKL $.
  
  19.35 $p |- ( E. x ( ph -> ps ) <-> ( A. x ph -> E. x ps ) ) $=
    ( wi wex wal pm2.27 aleximi com12 wn exnal pm2.21 eximi sylbir exa1 impbii
    ja ) ABDZCEZACFZBCEZDTSUAARBCABGHITUASTJAJZCESACKUBRCABLMNBACOQP $.
  ${
    19.35i.1 $e |- E. x ( ph -> ps ) $.
    
    19.35i $p |- ( A. x ph -> E. x ps ) $=
      ( wi wex wal 19.35 mpbi ) ABECFACGBCFEDABCHI $.
  $}
  
  albiim $p |- ( A. x ( ph <-> ps ) <->
             ( A. x ( ph -> ps ) /\ A. x ( ps -> ph ) ) ) $=
    ( wb wal wi wa dfbi2 albii 19.26 bitri ) ABDZCEABFZBAFZGZCEMCENCEGLOCABHIMN
    CJK $.
  
  exintrbi $p |- ( A. x ( ph -> ps ) -> ( E. x ph <-> E. x ( ph /\ ps ) ) ) $=
    ( wi wa abai rbaibr alexbii ) ABDZAABEZCJAIABFGH $.
  
  exintr $p |- ( A. x ( ph -> ps ) -> ( E. x ph -> E. x ( ph /\ ps ) ) ) $=
    ( wi wal wex wa exintrbi biimpd ) ABDCEACFABGCFABCHI $.
  
  nfimt $p |- ( F/ x ph -> ( F/ x ps -> F/ x ( ph -> ps ) ) ) $=
    ( wnf wi wex wal 19.35 df-nf biimpi imim1d imim2d syl9 19.38 syl7bi syl6ibr
    syl8 ) ACDZBCDZABEZCFZTCGZETCDUAACGZBCFZEZRSUBABCHRSUEACFZBCGZEZUBRUEUFUDES
    UHRUFUCUDRUFUCEACIJKSUDUGUFSUDUGEBCIJLMABCNQOTCIP $.
  
  nfimt2 $p |- ( ( F/ x ph /\ F/ x ps ) -> F/ x ( ph -> ps ) ) $=
    ( wnf wi nfimt imp ) ACDBCDABECDABCFG $.
  ${
    nfimd.1 $e |- ( ph -> F/ x ps ) $.
    nfimd.2 $e |- ( ph -> F/ x ch ) $.
    
    nfimd $p |- ( ph -> F/ x ( ps -> ch ) ) $=
      ( wnf wi nfimt2 syl2anc ) ABDGCDGBCHDGEFBCDIJ $.
  $}
  ${
    nfim.1 $e |- F/ x ph $.
    nfim.2 $e |- F/ x ps $.
    
    nfim $p |- F/ x ( ph -> ps ) $=
      ( wnf wi nfimt2 mp2an ) ACFBCFABGCFDEABCHI $.
  $}
  ${
    nfand.1 $e |- ( ph -> F/ x ps ) $.
    nfand.2 $e |- ( ph -> F/ x ch ) $.
    
    nfand $p |- ( ph -> F/ x ( ps /\ ch ) ) $=
      ( wa wn wi df-an nfnd nfimd nfxfrd ) BCGBCHZIZHADBCJAODABNDEACDFKLKM $.
  $}
  ${
    nfan.1 $e |- F/ x ph $.
    nfan.2 $e |- F/ x ps $.
    
    nfan $p |- F/ x ( ph /\ ps ) $=
      ( wa wnf wtru a1i nfand trud ) ABFCGHABCACGHDIBCGHEIJK $.
  $}
  ${
    nfbid.1 $e |- ( ph -> F/ x ps ) $.
    nfbid.2 $e |- ( ph -> F/ x ch ) $.
    
    nfbid $p |- ( ph -> F/ x ( ps <-> ch ) ) $=
      ( wb wi wa dfbi2 nfimd nfand nfxfrd ) BCGBCHZCBHZIADBCJANODABCDEFKACBDFEK
      LM $.
  $}
  ${
    nf.1 $e |- F/ x ph $.
    nf.2 $e |- F/ x ps $.
    
    nfbi $p |- F/ x ( ph <-> ps ) $=
      ( wb wnf wtru a1i nfbid trud ) ABFCGHABCACGHDIBCGHEIJK $.
  $}
  ${
    $d x ph $.
    
    ax-5 $a |- ( ph -> A. x ph ) $.
  $}
  ${
    $d x ph $.
    
    ax5e $p |- ( E. x ph -> ph ) $=
      ( wex wi wn wal ax-5 eximal mpbir ) ABCADAEZJBFDJBGAABHI $.
  $}
  ${
    $d x ph $.
    
    ax5ea $p |- ( E. x ph -> A. x ph ) $=
      ( wex wal ax5e ax-5 syl ) ABCAABDABEABFG $.
  $}
  ${
    $d x ph $.
    
    nfv $p |- F/ x ph $=
      ( ax5ea nfi ) ABABCD $.
  $}
  ${
    $d x ph $.
    alimdv.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    alimdv $p |- ( ph -> ( A. x ps -> A. x ch ) ) $=
      ( ax-5 alimdh ) ABCDADFEG $.
    
    eximdv $p |- ( ph -> ( E. x ps -> E. x ch ) ) $=
      ( ax-5 eximdh ) ABCDADFEG $.
  $}
  ${
    $d x ph $.
    albidv.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    albidv $p |- ( ph -> ( A. x ps <-> A. x ch ) ) $=
      ( ax-5 albidh ) ABCDADFEG $.
    
    exbidv $p |- ( ph -> ( E. x ps <-> E. x ch ) ) $=
      ( ax-5 exbidh ) ABCDADFEG $.
  $}
  ${
    $d x ph $.  $d y ph $.
    2albidv.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    2exbidv $p |- ( ph -> ( E. x E. y ps <-> E. x E. y ch ) ) $=
      ( wex exbidv ) ABEGCEGDABCEFHH $.
  $}
  ${
    $d x ph $.
    alrimiv.1 $e |- ( ph -> ps ) $.
    
    alrimiv $p |- ( ph -> A. x ps ) $=
      ( ax-5 alrimih ) ABCACEDF $.
  $}
  ${
    $d x ph $.  $d x ps $.
    alrimdv.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    alrimdv $p |- ( ph -> ( ps -> A. x ch ) ) $=
      ( ax-5 alrimdh ) ABCDADFBDFEG $.
  $}
  ${
    $d x ps $.
    exlimiv.1 $e |- ( ph -> ps ) $.
    
    exlimiv $p |- ( E. x ph -> ps ) $=
      ( wex eximi ax5e syl ) ACEBCEBABCDFBCGH $.
    exlimiiv.2 $e |- E. x ph $.
    
    exlimiiv $p |- ps $=
      ( wex exlimiv ax-mp ) ACFBEABCDGH $.
  $}
  ${
    $d x ps $.  $d y ps $.
    exlimivv.1 $e |- ( ph -> ps ) $.
    
    exlimivv $p |- ( E. x E. y ph -> ps ) $=
      ( wex exlimiv ) ADFBCABDEGG $.
  $}
  ${
    $d x ch $.  $d x ph $.
    exlimdv.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    exlimdv $p |- ( ph -> ( E. x ps -> ch ) ) $=
      ( wex eximdv ax5e syl6 ) ABDFCDFCABCDEGCDHI $.
  $}
  ${
    $d x ph $.
    
    stdpc5v $p |- ( A. x ( ph -> ps ) -> ( ph -> A. x ps ) ) $=
      ( wal wi ax-5 alim syl5 ) AACDABECDBCDACFABCGH $.
    
    19.21v $p |- ( A. x ( ph -> ps ) <-> ( ph -> A. x ps ) ) $=
      ( wi wal stdpc5v wex ax5e imim1i 19.38 syl impbii ) ABDCEZABCEZDZABCFOACG
      ZNDMPANACHIABCJKL $.
  $}
  
  weq $p wff x = y $=
    ( cv wceq ) ACBCD $.
  ${
    speimfw.2 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    speimfw $p |- ( -. A. x -. x = y -> ( A. x ph -> E. x ps ) ) $=
      ( weq wn wal wex df-ex biimpri com12 aleximi syl5com ) CDFZGCHGZOCIZACHBC
      IQPOCJKAOBCOABELMN $.
  $}
  ${
    spimfw.1 $e |- ( -. ps -> A. x -. ps ) $.
    spimfw.2 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    spimfw $p |- ( -. A. x -. x = y -> ( A. x ph -> ps ) ) $=
      ( weq wn wal wex speimfw df-ex con1i sylbi syl6 ) CDGHCIHACIBCJZBABCDFKPB
      HCIZHBBCLBQEMNO $.
  $}
  $c [ $. 
  $c / $. 
  $c ] $.
  
  wsb $a wff [ y / x ] ph $.
  
  df-sb $a |- ( [ y / x ] ph <->
              ( ( x = y -> ph ) /\ E. x ( x = y /\ ph ) ) ) $.
  
  sbequ2 $p |- ( x = y -> ( [ y / x ] ph -> ph ) ) $=
    ( wsb weq wi wa wex df-sb simplbi com12 ) ABCDZBCEZALMAFMAGBHABCIJK $.
  
  sb1 $p |- ( [ y / x ] ph -> E. x ( x = y /\ ph ) ) $=
    ( wsb weq wi wa wex df-sb simprbi ) ABCDBCEZAFKAGBHABCIJ $.
  
  spsbe $p |- ( [ y / x ] ph -> E. x ph ) $=
    ( wsb weq wa wex sb1 exsimpr syl ) ABCDBCEZAFBGABGABCHKABIJ $.
  ${
    sbimi.1 $e |- ( ph -> ps ) $.
    
    sbimi $p |- ( [ y / x ] ph -> [ y / x ] ps ) $=
      ( weq wi wa wex wsb imim2i anim2i eximi anim12i df-sb 3imtr4i ) CDFZAGZQA
      HZCIZHQBGZQBHZCIZHACDJBCDJRUATUCABQEKSUBCABQELMNACDOBCDOP $.
  $}
  ${
    sbbii.1 $e |- ( ph <-> ps ) $.
    
    sbbii $p |- ( [ y / x ] ph <-> [ y / x ] ps ) $=
      ( wsb biimpi sbimi biimpri impbii ) ACDFBCDFABCDABEGHBACDABEIHJ $.
  $}
  
  ax-6 $a |- -. A. x -. x = y $.
  ${
    $d x y $.
    
    ax6v $p |- -. A. x -. x = y $=
      ( ax-6 ) ABC $.
  $}
  ${
    $d x y $.
    
    ax6ev $p |- E. x x = y $=
      ( weq wex wn wal ax6v df-ex mpbir ) ABCZADJEAFEABGJAHI $.
  $}
  ${
    $d x y $.
    exiftru.1 $e |- ph $.
    
    exiftru $p |- E. x ph $=
      ( vy weq ax6ev a1i eximii ) BDEZABBDFAICGH $.
  $}
  
  19.2 $p |- ( A. x ph -> E. x ph ) $=
    ( wi id exiftru 19.35i ) AABAACBADEF $.
  ${
    19.2d.1 $e |- ( ph -> A. x ps ) $.
    
    19.2d $p |- ( ph -> E. x ps ) $=
      ( wal wex 19.2 syl ) ABCEBCFDBCGH $.
  $}
  ${
    19.8w.1 $e |- ( ph -> A. x ph ) $.
    
    19.8w $p |- ( ph -> E. x ph ) $=
      ( 19.2d ) AABCD $.
  $}
  ${
    $d x ph $.
    
    19.8v $p |- ( ph -> E. x ph ) $=
      ( ax-5 19.8w ) ABABCD $.
    
    19.9v $p |- ( E. x ph <-> ph ) $=
      ( wex ax5e 19.8v impbii ) ABCAABDABEF $.
  $}
  ${
    $d x ps $.
    
    19.23v $p |- ( A. x ( ph -> ps ) <-> ( E. x ph -> ps ) ) $=
      ( wi wal wex exim 19.9v syl6ib ax-5 imim2i 19.38 syl impbii ) ABDCEZACFZB
      DZOPBCFBABCGBCHIQPBCEZDOBRPBCJKABCLMN $.
  $}
  ${
    $d x ps $.
    
    19.36v $p |- ( E. x ( ph -> ps ) <-> ( A. x ph -> ps ) ) $=
      ( wi wex wal 19.35 19.9v imbi2i bitri ) ABDCEACFZBCEZDKBDABCGLBKBCHIJ $.
  $}
  ${
    $d x ps $.
    19.36iv.1 $e |- E. x ( ph -> ps ) $.
    
    19.36iv $p |- ( A. x ph -> ps ) $=
      ( wi wex wal 19.36v mpbi ) ABECFACGBEDABCHI $.
  $}
  ${
    $d x ps $.
    
    19.41v $p |- ( E. x ( ph /\ ps ) <-> ( E. x ph /\ ps ) ) $=
      ( wa wex 19.40 19.9v anbi2i sylib pm3.21 eximdv impcom impbii ) ABDZCEZAC
      EZBDZOPBCEZDQABCFRBPBCGHIBPOBANCBAJKLM $.
  $}
  ${
    $d x ph $.
    
    19.42v $p |- ( E. x ( ph /\ ps ) <-> ( ph /\ E. x ps ) ) $=
      ( wa wex 19.41v exancom ancom 3bitr4i ) BADCEBCEZADABDCEAJDBACFABCGAJHI
      $.
  $}
  ${
    $d x y $.
    spimw.1 $e |- ( -. ps -> A. x -. ps ) $.
    spimw.2 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    spimw $p |- ( A. x ph -> ps ) $=
      ( weq wn wal wi ax6v spimfw ax-mp ) CDGHCIHACIBJCDKABCDEFLM $.
  $}
  ${
    $d x y $.  $d x ps $.
    spimvw.1 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    spimvw $p |- ( A. x ph -> ps ) $=
      ( wn ax-5 spimw ) ABCDBFCGEH $.
  $}
  ${
    $d x y $.  $d x ps $.
    equsalvw.1 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    equsalvw $p |- ( A. x ( x = y -> ph ) <-> ps ) $=
      ( weq wi wal wex 19.23v pm5.74i albii ax6ev a1bi 3bitr4i ) CDFZBGZCHPCIZB
      GPAGZCHBPBCJSQCPABEKLRBCDMNO $.
  $}
  ${
    $d x y $.
    cbvaliw.1 $e |- ( A. x ph -> A. y A. x ph ) $.
    cbvaliw.2 $e |- ( -. ps -> A. x -. ps ) $.
    cbvaliw.3 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    cbvaliw $p |- ( A. x ph -> A. y ps ) $=
      ( wal spimw alrimih ) ACHBDEABCDFGIJ $.
  $}
  ${
    $d x y $.  $d x ps $.  $d y ph $.
    cbvalivw.1 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    cbvalivw $p |- ( A. x ph -> A. y ps ) $=
      ( wal spimvw alrimiv ) ACFBDABCDEGH $.
  $}
  
  ax-7 $a |- ( x = y -> ( x = z -> y = z ) ) $.
  ${
    $d x y $.
    
    ax7v $p |- ( x = y -> ( x = z -> y = z ) ) $=
      ( ax-7 ) ABCD $.
  $}
  ${
    $d x y $.  $d x z $.
    
    ax7v1 $p |- ( x = y -> ( x = z -> y = z ) ) $=
      ( ax7v ) ABCD $.
  $}
  ${
    $d x y $.  $d y z $.
    
    ax7v2 $p |- ( x = y -> ( x = z -> y = z ) ) $=
      ( ax7v ) ABCD $.
  $}
  ${
    $d x y $.
    
    equid $p |- x = x $=
      ( vy weq ax7v1 pm2.43i ax6ev exlimiiv ) BACZAACZBHIBAADEBAFG $.
  $}
  ${
    $d x y $.
    
    equcomiv $p |- ( x = y -> y = x ) $=
      ( weq equid ax7v2 mpi ) ABCAACBACADABAEF $.
  $}
  ${
    $d x y $.
    
    ax6evr $p |- E. x y = x $=
      ( weq ax6ev equcomiv eximii ) ABCBACAABDABEF $.
  $}
  ${
    $d t x $.  $d t y $.  $d t z $.
    
    ax7 $p |- ( x = y -> ( x = z -> y = z ) ) $=
      ( vt weq wi ax7v2 wa ax7v1 imp a1i syl2and expd ax6evr exlimiiv ) ADEZABE
      ZACEZBCEZFFDPQRSPQDBEZRDCEZSADBGADCGTUAHSFPTUASDBCIJKLMDANO $.
  $}
  
  equcomi $p |- ( x = y -> y = x ) $=
    ( weq equid ax7 mpi ) ABCAACBACADABAEF $.
  
  equcom $p |- ( x = y <-> y = x ) $=
    ( weq equcomi impbii ) ABCBACABDBADE $.
  ${
    equcoms.1 $e |- ( x = y -> ph ) $.
    
    equcoms $p |- ( y = x -> ph ) $=
      ( weq equcomi syl ) CBEBCEACBFDG $.
  $}
  
  equtr $p |- ( x = y -> ( y = z -> x = z ) ) $=
    ( weq wi ax7 equcoms ) BCDACDEBABACFG $.
  
  equtrr $p |- ( x = y -> ( z = x -> z = y ) ) $=
    ( weq equtr com12 ) CADABDCBDCABEF $.
  
  equeuclr $p |- ( x = z -> ( y = z -> y = x ) ) $=
    ( weq wi equtrr equcoms ) BCDBADECACABFG $.
  
  equeucl $p |- ( x = z -> ( y = z -> x = y ) ) $=
    ( weq equeuclr com12 ) BCDACDABDBACEF $.
  
  equequ1 $p |- ( x = y -> ( x = z <-> y = z ) ) $=
    ( weq ax7 equtr impbid ) ABDACDBCDABCEABCFG $.
  
  equequ2 $p |- ( x = y -> ( z = x <-> z = y ) ) $=
    ( weq equtrr equeuclr impbid ) ABDCADCBDABCEACBFG $.
  
  equtr2 $p |- ( ( x = z /\ y = z ) -> x = y ) $=
    ( weq equeucl imp ) ACDBCDABDABCEF $.
  ${
    $d x z $.  $d y z $.
    
    equvinv $p |- ( x = y <-> E. z ( z = x /\ z = y ) ) $=
      ( weq wa wex ax6ev equtrr ancld eximdv mpi ax7 imp exlimiv impbii ) ABDZC
      ADZCBDZEZCFZPQCFTCAGPQSCPQRABCHIJKSPCQRPCABLMNO $.
    
    equviniva $p |- ( x = y -> E. z ( x = z /\ y = z ) ) $=
      ( weq wex wa ax6evr equtr ancrd eximdv mpi ) ABDZBCDZCEACDZMFZCECBGLMOCLM
      NABCHIJK $.
  $}
  
  ax13b $p |- ( ( -. x = y -> ( y = z -> ph ) )
                       <-> ( -. x = y -> ( -. x = z -> ( y = z -> ph ) ) ) ) $=
    ( weq wn wi ax-1 equeuclr con3rr3 imim1d pm2.43 syl6 impbid2 pm5.74i ) BCEZ
    FZCDEZAGZBDEZFZSGZQSUBSUAHQUBRSGSQRUASRTPCBDIJKRALMNO $.
  ${
    $d x y $.
    spfw.1 $e |- ( -. ps -> A. x -. ps ) $.
    spfw.2 $e |- ( A. x ph -> A. y A. x ph ) $.
    spfw.3 $e |- ( -. ph -> A. y -. ph ) $.
    spfw.4 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    spfw $p |- ( A. x ph -> ph ) $=
      ( wal weq biimpd cbvaliw wi biimprd equcoms spimw syl ) ACIBDIAABCDFECDJZ
      ABHKLBADCGBAMCDRABHNOPQ $.
  $}
  ${
    $d x y $.  $d x ps $.  $d y ph $.
    spw.1 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    spw $p |- ( A. x ph -> ph ) $=
      ( wn ax-5 wal spfw ) ABCDBFCGACHDGAFDGEI $.
  $}
  ${
    $d x y z $.
    
    spaev $p |- ( A. x x = y -> x = y ) $=
      ( vz weq equequ1 spw ) ABDCBDACACBEF $.
  $}
  ${
    $d x y t $.  $d y z t $.
    
    cbvaev $p |- ( A. x x = y -> A. z z = y ) $=
      ( vt weq wal ax7 cbvalivw syl ) ABEZAFDBEZDFCBEZCFJKADADBGHKLDCDCBGHI $.
  $}
  ${
    $d x y z $.
    
    aevlem0 $p |- ( A. x x = y -> A. z z = x ) $=
      ( weq wal spaev alrimiv cbvaev equeuclr al2imi sylc ) ABDZAEZLCECBDZCECAD
      ZCEMLCABFGABCHLNOCACBIJK $.
  $}
  ${
    $d x y u $.  $d z t u $.
    
    aevlem $p |- ( A. x x = y -> A. z z = t ) $=
      ( vu weq wal cbvaev aevlem0 4syl ) ABFAGEBFEGAEFAGDEFDGCDFCGABEHEBAIAEDHD
      ECIJ $.
  $}
  ${
    $d x y $.  $d u z $.  $d u t $.
    
    aeveq $p |- ( A. x x = y -> z = t ) $=
      ( vu weq wal wex aevlem ax6ev ax7 aleximi mpi ax5e 3syl ) ABFAGECFZEGZCDF
      ZEHZRABECIQEDFZEHSEDJPTREECDKLMRENO $.
  $}
  ${
    $d x y $.  $d v w z $.
    
    aev $p |- ( A. x x = y -> A. z t = u ) $=
      ( vv vw weq wal aevlem aeveq alrimiv syl ) ABHAIFGHFIZEDHZCIABFGJNOCFGEDK
      LM $.
  $}
  
  $c e. $. 
  ${
    $v A $.
    $v B $.
    wcel.cA $f class A $.
    wcel.cB $f class B $.
    
    wcel $a wff A e. B $.
  $}
  
  wel $p wff x e. y $=
    ( cv wcel ) ACBCD $.
  
  ax-9 $a |- ( x = y -> ( z e. x -> z e. y ) ) $.
  ${
    $d x y $.
    
    ax9v $p |- ( x = y -> ( z e. x -> z e. y ) ) $=
      ( ax-9 ) ABCD $.
  $}
  ${
    $d x y $.  $d x z $.
    
    ax9v1 $p |- ( x = y -> ( z e. x -> z e. y ) ) $=
      ( ax9v ) ABCD $.
  $}
  ${
    $d x y $.  $d y z $.
    
    ax9v2 $p |- ( x = y -> ( z e. x -> z e. y ) ) $=
      ( ax9v ) ABCD $.
  $}
  ${
    $d t x $.  $d t y $.  $d t z $.
    
    ax9 $p |- ( x = y -> ( z e. x -> z e. y ) ) $=
      ( vt weq wa wex wel wi equvinv ax9v2 equcoms ax9v1 sylan9 exlimiv sylbi )
      ABEDAEZDBEZFZDGCAHZCBHZIZABDJSUBDQTCDHZRUATUCIADADCKLDBCMNOP $.
  $}
  
  elequ2 $p |- ( x = y -> ( z e. x <-> z e. y ) ) $=
    ( weq wel ax9 wi equcoms impbid ) ABDCAEZCBEZABCFKJGBABACFHI $.
  
  ax-10 $a |- ( -. A. x ph -> A. x -. A. x ph ) $.
  
  hbn1 $p |- ( -. A. x ph -> A. x -. A. x ph ) $=
    ( ax-10 ) ABC $.
  
  hbe1 $p |- ( E. x ph -> A. x E. x ph ) $=
    ( wex wn wal df-ex hbn1 hbxfrbi ) ABCADZBEDBABFIBGH $.
  
  hbe1a $p |- ( E. x A. x ph -> A. x ph ) $=
    ( wal wex wn df-ex hbn1 con1i sylbi ) ABCZBDJEBCZEJJBFJKABGHI $.
  
  nf5-1 $p |- ( A. x ( ph -> A. x ph ) -> F/ x ph ) $=
    ( wal wi wex exim hbe1a syl6 nfd ) AABCZDBCZABKABEJBEJAJBFABGHI $.
  ${
    nf5i.1 $e |- ( ph -> A. x ph ) $.
    
    nf5i $p |- F/ x ph $=
      ( wal wi wnf nf5-1 mpg ) AABDEABFBABGCH $.
  $}
  
  nfe1 $p |- F/ x E. x ph $=
    ( wex hbe1 nf5i ) ABCBABDE $.
  
  nfa1 $p |- F/ x A. x ph $=
    ( wal wn wex alex nfe1 nfn nfxfr ) ABCADZBEZDBABFKBJBGHI $.
  
  nfna1 $p |- F/ x -. A. x ph $=
    ( wal nfa1 nfn ) ABCBABDE $.
  
  nfnf1 $p |- F/ x F/ x ph $=
    ( wnf wex wal wi df-nf nfe1 nfa1 nfim nfxfr ) ABCABDZABEZFBABGLMBABHABIJK
    $.
  
  ax-11 $a |- ( A. x A. y ph -> A. y A. x ph ) $.
  ${
    hbal.1 $e |- ( ph -> A. x ph ) $.
    
    hbal $p |- ( A. y ph -> A. x A. y ph ) $=
      ( wal alimi ax-11 syl ) ACEZABEZCEIBEAJCDFACBGH $.
  $}
  
  ax-12 $a |- ( x = y -> ( A. y ph -> A. x ( x = y -> ph ) ) ) $.
  ${
    $d x y $.  $d y ph $.
    
    ax12v $p |- ( x = y -> ( ph -> A. x ( x = y -> ph ) ) ) $=
      ( wal weq wi ax-5 ax-12 syl5 ) AACDBCEZJAFBDACGABCHI $.
  $}
  ${
    $d x y $.  $d y ph $.
    
    19.8a $p |- ( ph -> E. x ph ) $=
      ( vy weq wex wi wal ax12v ax6ev exim syl6mpi ax6evr exlimiiv ) BCDZAABEZF
      CNANAFBGNBEOABCHBCINABJKCBLM $.
  $}
  
  sp $p |- ( A. x ph -> ph ) $=
    ( wal wn wex alex 19.8a con1i sylbi ) ABCADZBEZDAABFAKJBGHI $.
  ${
    sps.1 $e |- ( ph -> ps ) $.
    
    sps $p |- ( A. x ph -> ps ) $=
      ( wal sp syl ) ACEABACFDG $.
  $}
  ${
    spsd.1 $e |- ( ph -> ( ps -> ch ) ) $.
    
    spsd $p |- ( ph -> ( A. x ps -> ch ) ) $=
      ( wal sp syl5 ) BDFBACBDGEH $.
  $}
  ${
    19.21bi.1 $e |- ( ph -> A. x ps ) $.
    
    19.21bi $p |- ( ph -> ps ) $=
      ( wal sp syl ) ABCEBDBCFG $.
  $}
  
  nf5r $p |- ( F/ x ph -> ( ph -> A. x ph ) ) $=
    ( wex wnf wal 19.8a wi df-nf biimpi syl5 ) AABCZABDZABEZABFLKMGABHIJ $.
  ${
    nf5ri.1 $e |- F/ x ph $.
    
    nf5ri $p |- ( ph -> A. x ph ) $=
      ( wnf wal wi nf5r ax-mp ) ABDAABEFCABGH $.
  $}
  ${
    nf5rd.1 $e |- ( ph -> F/ x ps ) $.
    
    nf5rd $p |- ( ph -> ( ps -> A. x ps ) ) $=
      ( wnf wal wi nf5r syl ) ABCEBBCFGDBCHI $.
  $}
  ${
    nfim1.1 $e |- F/ x ph $.
    nfim1.2 $e |- ( ph -> F/ x ps ) $.
    
    nfim1 $p |- F/ x ( ph -> ps ) $=
      ( wal wn wo wi wnf nf3 mpbi nftht sps nfimd pm2.21 alimi syl jaoi ax-mp )
      ACFZAGZCFZHZABIZCJZACJUDDACKLUAUFUCUAABCACMABCJCENOUCUECFUFUBUECABPQUECMR
      ST $.
  $}
  ${
    19.9d.1 $e |- ( ps -> F/ x ph ) $.
    
    19.9d $p |- ( ps -> ( E. x ph -> ph ) ) $=
      ( wex wal wnf wi df-nf sylib sp syl6 ) BACEZACFZABACGMNHDACIJACKL $.
  $}
  
  19.9t $p |- ( F/ x ph -> ( E. x ph <-> ph ) ) $=
    ( wnf wex id 19.9d 19.8a impbid1 ) ABCZABDAAIBIEFABGH $.
  ${
    19.9.1 $e |- F/ x ph $.
    
    19.9 $p |- ( E. x ph <-> ph ) $=
      ( wnf wex wb 19.9t ax-mp ) ABDABEAFCABGH $.
  $}
  
  19.21t $p |- ( F/ x ph -> ( A. x ( ph -> ps ) <-> ( ph -> A. x ps ) ) ) $=
    ( wnf wex wal wi 19.38a 19.9t imbi1d bitr3d ) ACDZACEZBCFZGABGCFANGABCHLMAN
    ACIJK $.
  
  19.23t $p |- ( F/ x ps -> ( A. x ( ph -> ps ) <-> ( E. x ph -> ps ) ) ) $=
    ( wnf wn wi wal wex wb nfnt 19.21t syl con34b albii eximal 3bitr4g ) BCDZBE
    ZAEZFZCGZRSCGFZABFZCGACHBFQRCDUAUBIBCJRSCKLUCTCABMNABCOP $.
  ${
    19.23.1 $e |- F/ x ps $.
    
    19.23 $p |- ( A. x ( ph -> ps ) <-> ( E. x ph -> ps ) ) $=
      ( wnf wi wal wex wb 19.23t ax-mp ) BCEABFCGACHBFIDABCJK $.
  $}
  ${
    alimd.1 $e |- F/ x ph $.
    alimd.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    alimd $p |- ( ph -> ( A. x ps -> A. x ch ) ) $=
      ( nf5ri alimdh ) ABCDADEGFH $.
  $}
  ${
    alrimi.1 $e |- F/ x ph $.
    alrimi.2 $e |- ( ph -> ps ) $.
    
    alrimi $p |- ( ph -> A. x ps ) $=
      ( nf5ri alrimih ) ABCACDFEG $.
  $}
  ${
    eximd.1 $e |- F/ x ph $.
    eximd.2 $e |- ( ph -> ( ps -> ch ) ) $.
    
    eximd $p |- ( ph -> ( E. x ps -> E. x ch ) ) $=
      ( nf5ri eximdh ) ABCDADEGFH $.
  $}
  ${
    exlimi.1 $e |- F/ x ps $.
    exlimi.2 $e |- ( ph -> ps ) $.
    
    exlimi $p |- ( E. x ph -> ps ) $=
      ( wi wex 19.23 mpgbi ) ABFACGBFCABCDHEI $.
  $}
  ${
    exlimd.1 $e |- F/ x ph $.
    exlimd.2 $e |- F/ x ch $.
    exlimd.3 $e |- ( ph -> ( ps -> ch ) ) $.
    
    exlimd $p |- ( ph -> ( E. x ps -> ch ) ) $=
      ( wex eximd 19.9 syl6ib ) ABDHCDHCABCDEGICDFJK $.
  $}
  ${
    albid.1 $e |- F/ x ph $.
    albid.2 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    albid $p |- ( ph -> ( A. x ps <-> A. x ch ) ) $=
      ( nf5ri albidh ) ABCDADEGFH $.
    
    exbid $p |- ( ph -> ( E. x ps <-> E. x ch ) ) $=
      ( nf5ri exbidh ) ABCDADEGFH $.
    
    nfbidf $p |- ( ph -> ( F/ x ps <-> F/ x ch ) ) $=
      ( wex wal wi wnf exbid albid imbi12d df-nf 3bitr4g ) ABDGZBDHZICDGZCDHZIB
      DJCDJAPRQSABCDEFKABCDEFLMBDNCDNO $.
  $}
  ${
    19.36.1 $e |- F/ x ps $.
    
    19.36 $p |- ( E. x ( ph -> ps ) <-> ( A. x ph -> ps ) ) $=
      ( wi wex wal 19.35 19.9 imbi2i bitri ) ABECFACGZBCFZELBEABCHMBLBCDIJK $.
    19.36i.2 $e |- E. x ( ph -> ps ) $.
    
    19.36i $p |- ( A. x ph -> ps ) $=
      ( wi wex wal 19.36 mpbi ) ABFCGACHBFEABCDIJ $.
  $}
  
  sbequ1 $p |- ( x = y -> ( ph -> [ y / x ] ph ) ) $=
    ( weq wsb wa wi wex pm3.4 19.8a df-sb sylanbrc ex ) BCDZAABCEZNAFZNAGPBHONA
    IPBJABCKLM $.
  
  sbequ12 $p |- ( x = y -> ( ph <-> [ y / x ] ph ) ) $=
    ( weq wsb sbequ1 sbequ2 impbid ) BCDAABCEABCFABCGH $.
  
  sbequ12r $p |- ( x = y -> ( [ x / y ] ph <-> ph ) ) $=
    ( wsb wb weq sbequ12 bicomd equcoms ) ACBDZAECBCBFAJACBGHI $.
  
  sbid $p |- ( [ x / x ] ph <-> ph ) $=
    ( weq wsb wb equid sbequ12r ax-mp ) BBCABBDAEBFABBGH $.
  ${
    $d x y $.
    spimv1.nf $e |- F/ x ps $.
    spimv1.1 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    spimv1 $p |- ( A. x ph -> ps ) $=
      ( weq wi ax6ev eximii 19.36i ) ABCECDGABHCCDIFJK $.
  $}
  
  nf5 $p |- ( F/ x ph <-> A. x ( ph -> A. x ph ) ) $=
    ( wnf wex wal wi df-nf nfa1 19.23 bitr4i ) ABCABDABEZFAKFBEABGAKBABHIJ $.
  ${
    nf5d.1 $e |- F/ x ph $.
    nf5d.2 $e |- ( ph -> ( ps -> A. x ps ) ) $.
    
    nf5d $p |- ( ph -> F/ x ps ) $=
      ( wal wi wnf alrimi nf5-1 syl ) ABBCFGZCFBCHALCDEIBCJK $.
  $}
  ${
    axc4i.1 $e |- ( A. x ph -> ps ) $.
    
    axc4i $p |- ( A. x ph -> A. x ps ) $=
      ( wal nfa1 alrimi ) ACEBCACFDG $.
  $}
  ${
    $d w x y $.  $d w z $.  $d w ph $.
    
    axc16g $p |- ( A. x x = y -> ( ph -> A. z ph ) ) $=
      ( vw weq wal wi aevlem ax12v sps pm2.27 al2imi syld syl ) BCFBGDEFZDGZAAD
      GZHBCDEIQAPAHZDGZRPATHDADEJKPSADPALMNO $.
  $}
  ${
    $d x y $.
    
    axc16 $p |- ( A. x x = y -> ( ph -> A. x ph ) ) $=
      ( axc16g ) ABCBD $.
  $}
  ${
    $d x y $.
    
    axc16nf $p |- ( A. x x = y -> F/ z ph ) $=
      ( weq wal wex wn df-ex axc16g con1d syl5bi syld nfd ) BCEBFZADOADGZAADFPA
      HZDFZHOAADIOARQBCDJKLABCDJMN $.
  $}
  ${
    nfal.1 $e |- F/ x ph $.
    
    nfal $p |- F/ x A. y ph $=
      ( wal nf5ri hbal nf5i ) ACEBABCABDFGH $.
  $}
  ${
    nfex.1 $e |- F/ x ph $.
    
    nfex $p |- F/ x E. y ph $=
      ( wex wn wal df-ex nfn nfal nfxfr ) ACEAFZCGZFBACHMBLBCABDIJIK $.
  $}
  
  19.12 $p |- ( E. x A. y ph -> A. y E. x ph ) $=
    ( wal wex nfa1 nfex sp eximi alrimi ) ACDZBEABECKCBACFGKABACHIJ $.
  ${
    nfald.1 $e |- F/ y ph $.
    nfald.2 $e |- ( ph -> F/ x ps ) $.
    
    nfald $p |- ( ph -> F/ x A. y ps ) $=
      ( wal wex 19.12 nfrd alimd ax-11 syl56 nfd ) ABDGZCOCHBCHZDGABCGZDGOCGBCD
      IAPQDEABCFJKBDCLMN $.
    
    nfexd $p |- ( ph -> F/ x E. y ps ) $=
      ( wex wn wal df-ex nfnd nfald nfxfrd ) BDGBHZDIZHACBDJAOCANCDEABCFKLKM $.
  $}
  ${
    $d x y $.
    cbv3v.nf1 $e |- F/ y ph $.
    cbv3v.nf2 $e |- F/ x ps $.
    cbv3v.1 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    cbv3v $p |- ( A. x ph -> A. y ps ) $=
      ( wal nfal spimv1 alrimi ) ACHBDADCEIABCDFGJK $.
  $}
  ${
    $d x y $.
    cbvalv1.nf1 $e |- F/ y ph $.
    cbvalv1.nf2 $e |- F/ x ps $.
    cbvalv1.1 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    cbvalv1 $p |- ( A. x ph <-> A. y ps ) $=
      ( wal weq biimpd cbv3v wi biimprd equcoms impbii ) ACHBDHABCDEFCDIZABGJKB
      ADCFEBALCDPABGMNKO $.
  $}
  
  axc11r $p |- ( A. y y = x -> ( A. x ph -> A. y ph ) ) $=
    ( weq wal wi ax-12 sps pm2.27 al2imi syld ) CBDZCEABEZLAFZCEZACELMOFCACBGHL
    NACLAIJK $.
  
  ax-13 $a |- ( -. x = y -> ( y = z -> A. x y = z ) ) $.
  ${
    $d x z $.  $d y z $.
    
    ax13v $p |- ( -. x = y -> ( y = z -> A. x y = z ) ) $=
      ( ax-13 ) ABCD $.
  $}
  ${
    $d x z w $.  $d y w $.
    
    ax13lem1 $p |- ( -. x = y -> ( z = y -> A. x z = y ) ) $=
      ( vw weq wa wex wal equviniva ax13v equeucl alimdv syl9 impd exlimdv syl5
      wn ) CBEZCDEZBDEZFZDGABEQZRAHZCBDIUBUAUCDUBSTUCUBTTAHSUCABDJSTRACBDKLMNOP
      $.
  $}
  ${
    $d x w $.  $d z w $.  $d y w $.
    
    ax13 $p |- ( -. x = y -> ( y = z -> A. x y = z ) ) $=
      ( vw weq wn wal wi wa wex equvinv ax13lem1 imp ax7v1 alanimi an4s exlimdv
      syl2an ex syl5bi ax13b mpbir ) ABEFZBCEZUDAGZHZHUCACEFZUFHHUCUGUFUDDBEZDC
      EZIZDJUCUGIZUEBCDKUKUJUEDUKUJUEUCUHUGUIUEUCUHIUHAGZUIAGZUEUGUIIUCUHULABDL
      MUGUIUMACDLMUHUIUDAUHUIUDDBCNMORPSQTSUEABCUAUB $.
  $}
  ${
    $d y w $.  $d x w $.
    
    ax6e $p |- E. x x = y $=
      ( vw weq wex 19.8a wn wi wal ax13lem1 ax6ev equtr eximii syl6com exlimiiv
      19.35i pm2.61i ) ABDZRAEZRAFCBDZRGZSHCUATTAISABCJTRAACDTRHAACKACBLMPNCBKO
      Q $.
  $}
  ${
    spim.1 $e |- F/ x ps $.
    spim.2 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    spim $p |- ( A. x ph -> ps ) $=
      ( weq wi ax6e eximii 19.36i ) ABCECDGABHCCDIFJK $.
  $}
  ${
    $d x ps $.
    spimv.1 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    spimv $p |- ( A. x ph -> ps ) $=
      ( weq wi ax6e eximii 19.36iv ) ABCCDFABGCCDHEIJ $.
  $}
  ${
    $d x ps $.
    spv.1 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    spv $p |- ( A. x ph -> ps ) $=
      ( weq biimpd spimv ) ABCDCDFABEGH $.
  $}
  ${
    cbv3.1 $e |- F/ y ph $.
    cbv3.2 $e |- F/ x ps $.
    cbv3.3 $e |- ( x = y -> ( ph -> ps ) ) $.
    
    cbv3 $p |- ( A. x ph -> A. y ps ) $=
      ( wal nfal spim alrimi ) ACHBDADCEIABCDFGJK $.
  $}
  ${
    cbval.1 $e |- F/ y ph $.
    cbval.2 $e |- F/ x ps $.
    cbval.3 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    cbval $p |- ( A. x ph <-> A. y ps ) $=
      ( wal weq biimpd cbv3 wi biimprd equcoms impbii ) ACHBDHABCDEFCDIZABGJKBA
      DCFEBALCDPABGMNKO $.
    
    cbvex $p |- ( E. x ph <-> E. y ps ) $=
      ( wn wal wex nfn weq notbid cbval notbii df-ex 3bitr4i ) AHZCIZHBHZDIZHAC
      JBDJSUARTCDADEKBCFKCDLABGMNOACPBDPQ $.
  $}
  ${
    $d y ph $.  $d x ps $.
    cbvalv.1 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    cbvalv $p |- ( A. x ph <-> A. y ps ) $=
      ( wal ax-5 hbal spv alrimih weq wb equcoms bicomd impbii ) ACFZBDFZPBDADC
      ADGHABCDEIJQACBCDBCGHBADCDCKABABLCDEMNIJO $.
    
    cbvexv $p |- ( E. x ph <-> E. y ps ) $=
      ( wn wal wex weq notbid cbvalv notbii df-ex 3bitr4i ) AFZCGZFBFZDGZFACHBD
      HPROQCDCDIABEJKLACMBDMN $.
  $}
  
  equs4 $p |- ( A. x ( x = y -> ph ) -> E. x ( x = y /\ ph ) ) $=
    ( weq wi wal wex wa ax6e exintr mpi ) BCDZAEBFLBGLAHBGBCILABJK $.
  ${
    equsal.1 $e |- F/ x ps $.
    equsal.2 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    equsal $p |- ( A. x ( x = y -> ph ) <-> ps ) $=
      ( weq wi wal wex 19.23 pm5.74i albii ax6e a1bi 3bitr4i ) CDGZBHZCIQCJZBHQ
      AHZCIBQBCEKTRCQABFLMSBCDNOP $.
  $}
  ${
    $d w x z $.  $d w y $.
    
    ax13lem2 $p |- ( -. x = y -> ( E. x z = y -> z = y ) ) $=
      ( vw weq wn wex wi wal ax13lem1 equeucl eximi 19.36v syl9 alrimdv equequ2
      sylib equsalvw syl6ib ) ABEFZCBEZAGZDBEZCDEZHZDIUATUBUEDTUCUCAIZUBUDABDJU
      BUEAGUFUDHUAUEACDBKLUCUDAMQNOUDUADBDBCPRS $.
  $}
  ${
    $d x z $.
    
    nfeqf2 $p |- ( -. A. x x = y -> F/ x z = y ) $=
      ( weq wal wn wex wnf exnal nfnf1 wi ax13lem2 ax13lem1 df-nf sylibr exlimi
      syld sylbir ) ABDZAEFSFZAGCBDZAHZSAITUBAUAAJTUAAGZUAAEZKUBTUCUAUDABCLABCM
      QUAANOPR $.
  $}
  ${
    $d x z $.
    
    dveeq2 $p |- ( -. A. x x = y -> ( z = y -> A. x z = y ) ) $=
      ( weq wal wn nfeqf2 nf5rd ) ABDAEFCBDAABCGH $.
  $}
  ${
    $d x z $.
    
    nfeqf1 $p |- ( -. A. x x = y -> F/ x y = z ) $=
      ( weq wal wn wnf nfeqf2 equcom nfbii sylib ) ABDAEFCBDZAGBCDZAGABCHLMACBI
      JK $.
  $}
  ${
    $d x z $.
    
    dveeq1 $p |- ( -. A. x x = y -> ( y = z -> A. x y = z ) ) $=
      ( weq wal wn nfeqf1 nf5rd ) ABDAEFBCDAABCGH $.
  $}
  ${
    $d x w $.  $d y w $.  $d z w $.
    
    nfeqf $p |- ( ( -. A. z z = x /\ -. A. z z = y ) -> F/ z x = y ) $=
      ( vw weq wal wn nfna1 nfan wex equviniva dveeq1 imp equtr2 alanimi syl2an
      wa an4s ex exlimdv syl5 nf5d ) CAEZCFGZCBEZCFGZQZABEZCUDUFCUCCHUECHIUHADE
      ZBDEZQZDJUGUHCFZABDKUGUKULDUGUKULUDUIUFUJULUDUIQUICFZUJCFZULUFUJQUDUIUMCA
      DLMUFUJUNCBDLMUIUJUHCABDNOPRSTUAUB $.
  $}
  
  axc9 $p |- ( -. A. z z = x -> ( -. A. z z = y
              -> ( x = y -> A. z x = y ) ) ) $=
    ( weq wal wn wi wa nfeqf nf5rd ex ) CADCEFZCBDCEFZABDZNCEGLMHNCABCIJK $.
  ${
    $d x z $.  $d y z $.  $d z ph $.
    
    axc15 $p |- ( -. A. x x = y ->
                 ( x = y -> ( ph -> A. x ( x = y -> ph ) ) ) ) $=
      ( vz weq wal wn wex wi ax6ev dveeq2 ax12v equequ2 sps imbi1d albid imbi2d
      wb nfa1 imbi12d mpbii syl6 exlimdv mpi ) BCEZBFGZDCEZDHUEAUEAIZBFZIZIZDCJ
      UFUGUKDUFUGUGBFZUKBCDKULBDEZAUMAIZBFZIZIUKABDLULUMUEUPUJUGUMUERBDCBMNZULU
      OUIAULUNUHBUGBSULUMUEAUQOPQTUAUBUCUD $.
  $}
  ${
    $d x z $.  $d y z $.
    
    axc11n $p |- ( A. x x = y -> A. y y = x ) $=
      ( vz weq wal wn dveeq1 com12 axc11r aev syl6 syl9 ax6evr exlimiiv pm2.18d
      wi ) ABDAEZBADBEZACDZQRFZRPPCSTSBEZQRTSUABACGHQUASAERSBAIACBABJKLCAMNO $.
  $}
  
  aecom $p |- ( A. x x = y <-> A. y y = x ) $=
    ( weq wal axc11n impbii ) ABCADBACBDABEBAEF $.
  ${
    aecoms.1 $e |- ( A. x x = y -> ph ) $.
    
    aecoms $p |- ( A. y y = x -> ph ) $=
      ( weq wal aecom sylbi ) CBECFBCEBFACBGDH $.
  $}
  
  axc11 $p |- ( A. x x = y -> ( A. x ph -> A. y ph ) ) $=
    ( wal wi axc11r aecoms ) ABDACDECBABCFG $.
  
  hbae $p |- ( A. x x = y -> A. z A. x x = y ) $=
    ( weq wal wi wn sp axc9 syl7 axc11r axc11 pm2.43i syl5 pm2.61ii axc4i ax-11
    syl ) ABDZAEZSCEZAETCESUAACADCEZCBDCEZTUAFTSUBGUCGUASAHABCIJSACKTSBEZUCUATU
    DSABLMSBCKNOPSACQR $.
  
  nfae $p |- F/ z A. x x = y $=
    ( weq wal hbae nf5i ) ABDAECABCFG $.
  
  nfnae $p |- F/ z -. A. x x = y $=
    ( weq wal nfae nfn ) ABDAECABCFG $.
  ${
    dral1.1 $e |- ( A. x x = y -> ( ph <-> ps ) ) $.
    
    dral1 $p |- ( A. x x = y -> ( A. x ph <-> A. y ps ) ) $=
      ( weq wal nfa1 albid axc11 axc11r impbid bitrd ) CDFZCGZACGBCGZBDGZOABCNC
      HEIOPQBCDJBDCKLM $.
    
    drnf1 $p |- ( A. x x = y -> ( F/ x ph <-> F/ y ps ) ) $=
      ( weq wal wi wnf dral1 imbi12d nf5 3bitr4g ) CDFCGZAACGZHZCGBBDGZHZDGACIB
      DIPRCDNABOQEABCDEJKJACLBDLM $.
    
    drnf2 $p |- ( A. x x = y -> ( F/ z ph <-> F/ z ps ) ) $=
      ( weq wal nfae nfbidf ) CDGCHABECDEIFJ $.
  $}
  ${
    nfald2.1 $e |- F/ y ph $.
    nfald2.2 $e |- ( ( ph /\ -. A. x x = y ) -> F/ x ps ) $.
    
    nfald2 $p |- ( ph -> F/ x A. y ps ) $=
      ( weq wal wnf wn wa nfnae nfan nfald ex nfa1 biidd drnf1 mpbiri pm2.61d2
      ) ACDGCHZBDHZCIZAUAJZUCAUDKBCDAUDDECDDLMFNOUAUCUBDIBDPUBUBCDUAUBQRST $.
  $}
  ${
    dvelimf.1 $e |- F/ x ph $.
    dvelimf.2 $e |- F/ z ps $.
    dvelimf.3 $e |- ( z = y -> ( ph <-> ps ) ) $.
    
    dvelimf $p |- ( -. A. x x = y -> F/ x ps ) $=
      ( weq wi wal wn equsal bicomi nfnae wa wnf nfeqf ancoms a1i nfald2 nfxfrd
      nfimd ) BEDIZAJZEKZCDICKLZCUFBABEDGHMNUGUECECDEOUGCEICKLZPZUDACUHUGUDCQED
      CRSACQUIFTUCUAUB $.
  $}
  ${
    dvelimdf.1 $e |- F/ x ph $.
    dvelimdf.2 $e |- F/ z ph $.
    dvelimdf.3 $e |- ( ph -> F/ x ps ) $.
    dvelimdf.4 $e |- ( ph -> F/ z ch ) $.
    dvelimdf.5 $e |- ( ph -> ( z = y -> ( ps <-> ch ) ) ) $.
    
    dvelimdf $p |- ( ph -> ( -. A. x x = y -> F/ x ch ) ) $=
      ( weq wal wn wi wnf nfim1 wb com12 pm5.74d dvelimf pm5.5 nfbidf syl5ib )
      DELDMNACOZDPACDPABOUEDEFABDGIQACFHJQFELZABCAUFBCRKSTUAAUECDGACUBUCUD $.
  $}
  
  equs5 $p |- ( -. A. x x = y ->
             ( E. x ( x = y /\ ph ) <-> A. x ( x = y -> ph ) ) ) $=
    ( weq wal wn wa wex wi nfna1 nfa1 axc15 impd exlimd equs4 impbid1 ) BCDZBEF
    ZQAGZBHQAIZBEZRSUABQBJTBKRQAUAABCLMNABCOP $.
  
  sb2 $p |- ( A. x ( x = y -> ph ) -> [ y / x ] ph ) $=
    ( weq wi wal wa wex wsb sp equs4 df-sb sylanbrc ) BCDZAEZBFONAGBHABCIOBJABC
    KABCLM $.
  
  stdpc4 $p |- ( A. x ph -> [ y / x ] ph ) $=
    ( wal weq wi wsb ala1 sb2 syl ) ABDBCEZAFBDABCGAKBHABCIJ $.
  
  sb4 $p |- ( -. A. x x = y -> ( [ y / x ] ph -> A. x ( x = y -> ph ) ) ) $=
    ( wsb weq wa wex wal wn wi sb1 equs5 syl5ib ) ABCDBCEZAFBGNBHINAJBHABCKABCL
    M $.
  
  hbsb2 $p |- ( -. A. x x = y -> ( [ y / x ] ph -> A. x [ y / x ] ph ) ) $=
    ( weq wal wn wsb wi sb4 sb2 axc4i syl6 ) BCDZBEFABCGZMAHZBENBEABCIONBABCJKL
    $.
  
  nfsb2 $p |- ( -. A. x x = y -> F/ x [ y / x ] ph ) $=
    ( weq wal wn wsb nfna1 hbsb2 nf5d ) BCDZBEFABCGBKBHABCIJ $.
  
  equsb1 $p |- [ y / x ] x = y $=
    ( weq wi wsb sb2 id mpg ) ABCZIDIABEAIABFIGH $.
  
  dfsb2 $p |- ( [ y / x ] ph <->
              ( ( x = y /\ ph ) \/ A. x ( x = y -> ph ) ) ) $=
    ( wsb weq wa wi wal wo sp sbequ2 sps orc syl6an sb4 olc syl6 pm2.61i sbequ1
    wn imp sb2 jaoi impbii ) ABCDZBCEZAFZUFAGBHZIZUFBHZUEUIGUJUFUEAUIUFBJUFUEAG
    BABCKLUGUHMNUJTUEUHUIABCOUHUGPQRUGUEUHUFAUEABCSUAABCUBUCUD $.
  
  dfsb3 $p |- ( [ y / x ] ph <->
              ( ( x = y -> -. ph ) -> A. x ( x = y -> ph ) ) ) $=
    ( weq wa wi wal wo wn wsb df-or dfsb2 imnan imbi1i 3bitr4i ) BCDZAEZPAFBGZH
    QIZRFABCJPAIFZRFQRKABCLTSRPAMNO $.
  
  sbequi $p |- ( x = y -> ( [ x / z ] ph -> [ y / z ] ph ) ) $=
    ( weq wsb wi equtr sbequ2 sbequ1 syl9 syld wn wal sp con3i sb4 syl equeuclr
    ax13 imim1d al2imi sb2 syl6 pm2.61i ) DBEZBCEZADBFZADCFZGZGUFUGDCEZUJDBCHUF
    UHAUKUIADBIADCJKLUFMZUGUGDNZUJDBCTULUHUFAGZDNZUMUIULUFDNZMUHUOGUPUFUFDOPADB
    QRUMUOUKAGZDNUIUGUNUQDUGUKUFABDCSUAUBADCUCUDKLUE $.
  
  sbequ $p |- ( x = y -> ( [ x / z ] ph <-> [ y / z ] ph ) ) $=
    ( weq wsb sbequi wi equcoms impbid ) BCEADBFZADCFZABCDGLKHCBACBDGIJ $.
  
  sbft $p |- ( F/ x ph -> ( [ y / x ] ph <-> ph ) ) $=
    ( wnf wsb wex spsbe 19.9t syl5ib wal nf5r stdpc4 syl6 impbid ) ABDZABCEZAPA
    BFOAABCGABHIOAABJPABKABCLMN $.
  ${
    sbf.1 $e |- F/ x ph $.
    
    sbf $p |- ( [ y / x ] ph <-> ph ) $=
      ( wnf wsb wb sbft ax-mp ) ABEABCFAGDABCHI $.
  $}
  
  nfsb4t $p |- ( A. x F/ z ph ->
                 ( -. A. z z = y -> F/ z [ y / x ] ph ) ) $=
    ( wnf wal weq wn wsb wi wa sbequ12 sps drnf2 biimpd spsd impcom nfnae nfan
    wb a1d nfnf1 nfal nfa1 sp adantr nfsb2 adantl a1i dvelimdf pm2.61dan ) ADEZ
    BFZBCGZBFZDCGDFHZABCIZDEZJUMUOKURUPUOUMURUOULURBUOULURAUQBCDUNAUQTZBABCLZMN
    OPQUAUMUOHZKZAUQDCBUMVADULDBADUBUCBCDRSUMVABULBUDBCBRSUMULVAULBUEUFVAUQBEUM
    ABCUGUHUNUSJVBUTUIUJUK $.
  ${
    nfsb4.1 $e |- F/ z ph $.
    
    nfsb4 $p |- ( -. A. z z = y -> F/ z [ y / x ] ph ) $=
      ( wnf weq wal wn wsb wi nfsb4t mpg ) ADFDCGDHIABCJDFKBABCDLEM $.
  $}
  
  sbn $p |- ( [ y / x ] -. ph <-> -. [ y / x ] ph ) $=
    ( wn wsb weq wi wal wa wex df-sb exanali anbi2i annim 3bitri dfsb3 xchbinxr
    ) ADZBCEZBCFZRGZTAGBHZGZABCESUATRIBJZIUAUBDZIUCDRBCKUDUEUATABLMUAUBNOABCPQ
    $.
  
  sbi1 $p |- ( [ y / x ] ( ph -> ps ) -> ( [ y / x ] ph -> [ y / x ] ps ) ) $=
    ( weq wal wi wsb sbequ2 syl5d sbequ1 syl6d sps sb4 ax-2 al2imi syl6 pm2.61i
    wn sb2 ) CDEZCFZABGZCDHZACDHZBCDHZGGZUAUGCUAUDUEBUFUAUEAUDBACDIUCCDIJBCDKLM
    UBSZUEUAAGZCFZUDUFACDNUHUDUAUCGZCFZUJUFGUCCDNULUJUABGZCFUFUKUIUMCUAABOPBCDT
    QQJR $.
  
  sbi2 $p |- ( ( [ y / x ] ph -> [ y / x ] ps ) -> [ y / x ] ( ph -> ps ) ) $=
    ( wsb wi wn sbn pm2.21 sbimi sylbir ax-1 ja ) ACDEZBCDEABFZCDEZNGAGZCDEPACD
    HQOCDABIJKBOCDBALJM $.
  
  sbim $p |- ( [ y / x ] ( ph -> ps ) <-> ( [ y / x ] ph -> [ y / x ] ps ) ) $=
    ( wi wsb sbi1 sbi2 impbii ) ABECDFACDFBCDFEABCDGABCDHI $.
  ${
    sbrim.1 $e |- F/ x ph $.
    
    sbrim $p |- ( [ y / x ] ( ph -> ps ) <-> ( ph -> [ y / x ] ps ) ) $=
      ( wi wsb sbim sbf imbi1i bitri ) ABFCDGACDGZBCDGZFAMFABCDHLAMACDEIJK $.
  $}
  
  sbor $p |- ( [ y / x ] ( ph \/ ps ) <-> ( [ y / x ] ph \/ [ y / x ] ps ) ) $=
    ( wn wi wsb wo sbim sbn imbi1i bitri df-or sbbii 3bitr4i ) AEZBFZCDGZACDGZE
    ZBCDGZFZABHZCDGSUAHRPCDGZUAFUBPBCDIUDTUAACDJKLUCQCDABMNSUAMO $.
  
  sban $p |- ( [ y / x ] ( ph /\ ps ) <-> ( [ y / x ] ph /\ [ y / x ] ps ) ) $=
    ( wn wi wsb wa sbn sbim imbi2i bitri xchbinx df-an sbbii 3bitr4i ) ABEZFZEZ
    CDGZACDGZBCDGZEZFZEABHZCDGUAUBHTRCDGZUDRCDIUFUAQCDGZFUDAQCDJUGUCUABCDIKLMUE
    SCDABNOUAUBNP $.
  
  sbbi $p |- ( [ y / x ] ( ph <-> ps )
     <-> ( [ y / x ] ph <-> [ y / x ] ps ) ) $=
    ( wb wsb wi wa dfbi2 sbbii sbim anbi12i sban 3bitr4i bitri ) ABEZCDFABGZBAG
    ZHZCDFZACDFZBCDFZEZPSCDABIJQCDFZRCDFZHUAUBGZUBUAGZHTUCUDUFUEUGABCDKBACDKLQR
    CDMUAUBINO $.
  ${
    sblbis.1 $e |- ( [ y / x ] ph <-> ps ) $.
    
    sblbis $p |- ( [ y / x ] ( ch <-> ph ) <-> ( [ y / x ] ch <-> ps ) ) $=
      ( wb wsb sbbi bibi2i bitri ) CAGDEHCDEHZADEHZGLBGCADEIMBLFJK $.
  $}
  ${
    sbie.1 $e |- F/ x ps $.
    sbie.2 $e |- ( x = y -> ( ph <-> ps ) ) $.
    
    sbie $p |- ( [ y / x ] ph <-> ps ) $=
      ( wb wsb weq equsb1 sbimi ax-mp sbf sblbis mpbi ) ABGZCDHZACDHBGCDIZCDHQC
      DJRPCDFKLBBACDBCDEMNO $.
  $}
  ${
    sbied.1 $e |- F/ x ph $.
    sbied.2 $e |- ( ph -> F/ x ch ) $.
    sbied.3 $e |- ( ph -> ( x = y -> ( ps <-> ch ) ) ) $.
    
    sbied $p |- ( ph -> ( [ y / x ] ps <-> ch ) ) $=
      ( wsb wi sbrim nfim1 weq wb com12 pm5.74d sbie bitr3i pm5.74ri ) ABDEIZCA
      TJABJZDEIACJZABDEFKUAUBDEACDFGLDEMZABCAUCBCNHOPQRS $.
  $}
  ${
    sbco2.1 $e |- F/ z ph $.
    
    sbco2 $p |- ( [ y / z ] [ z / x ] ph <-> [ y / x ] ph ) $=
      ( weq wal wsb wb sbequ12 sbequ bitr3d sps wn nfnae nfsb4 wi sbied pm2.61i
      a1i ) DCFZDGZABDHZDCHZABCHZIZUAUFDUAUCUDUEUCDCJADCBKZLMUBNZUCUEDCDCDOABCD
      EPUAUCUEIQUHUGTRS $.
  $}
  ${
    $d x y $.
    
    hbs1 $p |- ( [ y / x ] ph -> A. x [ y / x ] ph ) $=
      ( weq wal wsb wi axc16 hbsb2 pm2.61i ) BCDBEABCFZKBEGKBCHABCIJ $.
  $}
  ${
    $d y z $.
    nfsb.1 $e |- F/ z ph $.
    
    nfsb $p |- F/ z [ y / x ] ph $=
      ( weq wal wsb wnf axc16nf nfsb4 pm2.61i ) DCFDGABCHZDIMDCDJABCDEKL $.
  $}
  ${
    $d y z $.
    hbsb.1 $e |- ( ph -> A. z ph ) $.
    
    hbsb $p |- ( [ y / x ] ph -> A. z [ y / x ] ph ) $=
      ( wsb nf5i nfsb nf5ri ) ABCFDABCDADEGHI $.
  $}
  ${
    $d x y z $.
    
    ax-ext $a |- ( A. z ( z e. x <-> z e. y ) -> x = y ) $.
  $}
  ${
    $d z x w $.  $d z y w $.
    
    axext3 $p |- ( A. z ( z e. x <-> z e. y ) -> x = y ) $=
      ( vw weq wel wb wal wi elequ2 bibi1d albidv ax-ext syl6bir ax7 syld ax6ev
      exlimiiv ) DAEZCAFZCBFZGZCHZABEZIDSUCDBEZUDSUCCDFZUAGZCHUESUGUBCSUFTUADAC
      JKLDBCMNDABOPDAQR $.
  $}
  
  $c { $. 
  $c | $.  
  $c } $.
  
  $v ./\ $.
  $v .\/ $.
  $v .<_ $.
  $v .< $.
  $v .+ $.
  $v .- $.
  $v .X. $.
  $v ./ $.
  $v .^ $.
  $v .0. $.
  $v .1. $.
  $v .|| $.
  $v .~ $.
  $v ._|_ $.
  $v .+^ $.
  $v .+b $.
  $v .(+) $.
  $v .* $.
  $v .x. $.
  $v .xb $.
  $v ., $.
  $v .(x) $.
  $v .o. $.
  $v .0b $.
  
  $v A $.
  $v B $.
  $v C $.
  $v D $.
  $v P $.
  $v Q $.
  $v R $.
  $v S $.
  $v T $.
  $v U $.
  
  cab $a class { x | ph } $.
  
  cA $f class A $.
  
  cB $f class B $.
  
  cC $f class C $.
  
  c.pa $f class .|| $.
  
  cD $f class D $.
  
  c.dv $f class ./ $.
  
  cP $f class P $.
  
  c.pl $f class .+ $.
  
  c.pd $f class .+^ $.
  
  c.pb $f class .+b $.
  
  c.po $f class .(+) $.
  
  cQ $f class Q $.
  
  c.sm $f class .~ $.
  
  cR $f class R $.
  
  cS $f class S $.
  
  c.lt $f class .< $.
  
  c.xb $f class .xb $.
  
  cT $f class T $.
  
  c.x $f class .x. $.
  
  c.xp $f class .X. $.
  
  c.xo $f class .(x) $.
  
  cU $f class U $.
  
  c.1 $f class .1. $.
  $v e $.
  $v f $.
  $v g $.
  $v h $.
  $v i $.
  $v j $.
  $v k $.
  $v m $.
  $v n $.
  $v o $.
  $v E $.
  $v F $.
  $v G $.
  $v H $.
  $v I $.
  $v J $.
  $v K $.
  $v L $.
  $v M $.
  $v N $.
  $v V $.
  $v W $.
  $v X $.
  $v Y $.
  $v Z $.
  $v O $.
  $v s $.
  $v r $.
  $v q $.
  $v p $.
  $v a $.
  $v b $.
  $v c $.
  $v d $.
  $v l $.
  
  ve $f setvar e $.
  
  vf $f setvar f $.
  
  vg $f setvar g $.
  
  vh $f setvar h $.
  
  vi $f setvar i $.
  
  vj $f setvar j $.
  
  vk $f setvar k $.
  
  vm $f setvar m $.
  
  vn $f setvar n $.
  
  vo $f setvar o $.
  
  cE $f class E $.
  
  c.ex $f class .^ $.
  
  cF $f class F $.
  
  cG $f class G $.
  
  cH $f class H $.
  
  c.xi $f class ., $.
  
  cI $f class I $.
  
  c.as $f class .* $.
  
  cJ $f class J $.
  
  c.or $f class .\/ $.
  
  cK $f class K $.
  
  cL $f class L $.
  
  c.le $f class .<_ $.
  
  cM $f class M $.
  
  c.an $f class ./\ $.
  
  c.mi $f class .- $.
  
  cN $f class N $.
  
  c.pe $f class ._|_ $.
  
  cO $f class O $.
  
  cV $f class V $.
  
  cW $f class W $.
  
  cX $f class X $.
  
  cY $f class Y $.
  
  c.0 $f class .0. $.
  
  c.0b $f class .0b $.
  
  c.op $f class .o. $.
  
  cZ $f class Z $.
  
  vs $f setvar s $.
  
  vr $f setvar r $.
  
  vq $f setvar q $.
  
  vp $f setvar p $.
  
  va $f setvar a $.
  
  vb $f setvar b $.
  
  vc $f setvar c $.
  
  vd $f setvar d $.
  
  vl $f setvar l $.
  
  df-clab $a |- ( x e. { y | ph } <-> [ x / y ] ph ) $.
  
  abid $p |- ( x e. { x | ph } <-> ph ) $=
    ( cv cab wcel wsb df-clab sbid bitri ) BCABDEABBFAABBGABHI $.
  ${
    $d x y $.
    
    hbab1 $p |- ( y e. { x | ph } -> A. x y e. { x | ph } ) $=
      ( cv cab wcel wsb df-clab hbs1 hbxfrbi ) CDABEFABCGBACBHABCIJ $.
    
    nfsab1 $p |- F/ x y e. { x | ph } $=
      ( cv cab wcel hbab1 nf5i ) CDABEFBABCGH $.
  $}
  ${
    $d x A $.  $d x B $.  $d x y z $.
    df-cleq.1 $e |- ( A. x ( x e. y <-> x e. z ) -> y = z ) $.
    
    df-cleq $a |- ( A = B <-> A. x ( x e. A <-> x e. B ) ) $.
  $}
  ${
    $d x A $.  $d x B $.  $d x y z $.
    
    dfcleq $p |- ( A = B <-> A. x ( x e. A <-> x e. B ) ) $=
      ( vy vz axext3 df-cleq ) ADEBCDEAFG $.
  $}
  ${
    $d x A $.  $d x B $.
    
    df-clel $a |- ( A e. B <-> E. x ( x = A /\ x e. B ) ) $.
  $}
  ${
    $d x A $.  $d x B $.
    eqriv.1 $e |- ( x e. A <-> x e. B ) $.
    
    eqriv $p |- A = B $=
      ( wceq cv wcel wb dfcleq mpgbir ) BCEAFZBGKCGHAABCIDJ $.
  $}
  ${
    $d x A $.  $d x B $.  $d x ph $.
    eqrdv.1 $e |- ( ph -> ( x e. A <-> x e. B ) ) $.
    
    eqrdv $p |- ( ph -> A = B ) $=
      ( cv wcel wb wal wceq alrimiv dfcleq sylibr ) ABFZCGNDGHZBICDJAOBEKBCDLM
      $.
  $}
  ${
    $d x A $.
    
    eqid $p |- A = A $=
      ( vx cv wcel biid eqriv ) BAABCADEF $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.  $d x ph $.
    eqeq1d.1 $e |- ( ph -> A = B ) $.
    
    eqeq1d $p |- ( ph -> ( A = C <-> B = C ) ) $=
      ( vx cv wcel wb wal wceq dfcleq biimpi bibi1 alimi albi 4syl 3bitr4g ) AF
      GZBHZSDHZIZFJZSCHZUAIZFJZBDKCDKABCKZTUDIZFJZUBUEIZFJUCUFIEUGUIFBCLMUHUJFT
      UDUANOUBUEFPQFBDLFCDLR $.
  $}
  
  eqeq1 $p |- ( A = B -> ( A = C <-> B = C ) ) $=
    ( wceq id eqeq1d ) ABDZABCGEF $.
  ${
    eqeq1i.1 $e |- A = B $.
    
    eqeq1i $p |- ( A = C <-> B = C ) $=
      ( wceq wb eqeq1 ax-mp ) ABEACEBCEFDABCGH $.
  $}
  ${
    eqcomd.1 $e |- ( ph -> A = B ) $.
    
    eqcomd $p |- ( ph -> B = A ) $=
      ( wceq eqid eqeq1d mpbii ) ABBECBEBFABCBDGH $.
  $}
  
  eqcom $p |- ( A = B <-> B = A ) $=
    ( wceq id eqcomd impbii ) ABCZBACZGABGDEHBAHDEF $.
  ${
    eqcomi.1 $e |- A = B $.
    
    eqcomi $p |- B = A $=
      ( wceq eqcom mpbi ) ABDBADCABEF $.
  $}
  ${
    eqeq2d.1 $e |- ( ph -> A = B ) $.
    
    eqeq2d $p |- ( ph -> ( C = A <-> C = B ) ) $=
      ( wceq eqeq1d eqcom 3bitr4g ) ABDFCDFDBFDCFABCDEGDBHDCHI $.
  $}
  
  eqeq2 $p |- ( A = B -> ( C = A <-> C = B ) ) $=
    ( wceq id eqeq2d ) ABDZABCGEF $.
  ${
    eqeq2i.1 $e |- A = B $.
    
    eqeq2i $p |- ( C = A <-> C = B ) $=
      ( wceq wb eqeq2 ax-mp ) ABECAECBEFDABCGH $.
  $}
  ${
    eqeq12i.1 $e |- A = B $.
    eqeq12i.2 $e |- C = D $.
    
    eqeq12i $p |- ( A = C <-> B = D ) $=
      ( wceq eqeq1i eqeq2i bitri ) ACGBCGBDGABCEHCDBFIJ $.
  $}
  
  eqtr $p |- ( ( A = B /\ B = C ) -> A = C ) $=
    ( wceq eqeq1 biimpar ) ABDACDBCDABCEF $.
  ${
    eqtri.1 $e |- A = B $.
    eqtri.2 $e |- B = C $.
    
    eqtri $p |- A = C $=
      ( wceq eqeq2i mpbi ) ABFACFDBCAEGH $.
  $}
  ${
    eqtr2i.1 $e |- A = B $.
    eqtr2i.2 $e |- B = C $.
    
    eqtr2i $p |- C = A $=
      ( eqtri eqcomi ) ACABCDEFG $.
  $}
  ${
    eqtr4i.1 $e |- A = B $.
    eqtr4i.2 $e |- C = B $.
    
    eqtr4i $p |- A = C $=
      ( eqcomi eqtri ) ABCDCBEFG $.
  $}
  ${
    3eqtri.1 $e |- A = B $.
    3eqtri.2 $e |- B = C $.
    3eqtri.3 $e |- C = D $.
    
    3eqtri $p |- A = D $=
      ( eqtri ) ABDEBCDFGHH $.
  $}
  ${
    3eqtr4i.1 $e |- A = B $.
    3eqtr4i.2 $e |- C = A $.
    3eqtr4i.3 $e |- D = B $.
    
    3eqtr4i $p |- C = D $=
      ( eqtr4i ) CADFDBAGEHH $.
    
    3eqtr4ri $p |- D = C $=
      ( eqtr4i ) DACDBAGEHFH $.
  $}
  ${
    eqtrd.1 $e |- ( ph -> A = B ) $.
    eqtrd.2 $e |- ( ph -> B = C ) $.
    
    eqtrd $p |- ( ph -> A = C ) $=
      ( wceq eqeq2d mpbid ) ABCGBDGEACDBFHI $.
  $}
  ${
    eqtr2d.1 $e |- ( ph -> A = B ) $.
    eqtr2d.2 $e |- ( ph -> B = C ) $.
    
    eqtr2d $p |- ( ph -> C = A ) $=
      ( eqtrd eqcomd ) ABDABCDEFGH $.
  $}
  ${
    eqtr3d.1 $e |- ( ph -> A = B ) $.
    eqtr3d.2 $e |- ( ph -> A = C ) $.
    
    eqtr3d $p |- ( ph -> B = C ) $=
      ( eqcomd eqtrd ) ACBDABCEGFH $.
  $}
  ${
    eqtr4d.1 $e |- ( ph -> A = B ) $.
    eqtr4d.2 $e |- ( ph -> C = B ) $.
    
    eqtr4d $p |- ( ph -> A = C ) $=
      ( eqcomd eqtrd ) ABCDEADCFGH $.
  $}
  ${
    syl5eq.1 $e |- A = B $.
    syl5eq.2 $e |- ( ph -> B = C ) $.
    
    syl5eq $p |- ( ph -> A = C ) $=
      ( wceq a1i eqtrd ) ABCDBCGAEHFI $.
  $}
  ${
    syl6eq.1 $e |- ( ph -> A = B ) $.
    syl6eq.2 $e |- B = C $.
    
    syl6eq $p |- ( ph -> A = C ) $=
      ( wceq a1i eqtrd ) ABCDECDGAFHI $.
  $}
  ${
    syl6req.1 $e |- ( ph -> A = B ) $.
    syl6req.2 $e |- B = C $.
    
    syl6req $p |- ( ph -> C = A ) $=
      ( syl6eq eqcomd ) ABDABCDEFGH $.
  $}
  ${
    syl6eqr.1 $e |- ( ph -> A = B ) $.
    syl6eqr.2 $e |- C = B $.
    
    syl6eqr $p |- ( ph -> A = C ) $=
      ( eqcomi syl6eq ) ABCDEDCFGH $.
  $}
  ${
    syl6reqr.1 $e |- ( ph -> A = B ) $.
    syl6reqr.2 $e |- C = B $.
    
    syl6reqr $p |- ( ph -> C = A ) $=
      ( eqcomi syl6req ) ABCDEDCFGH $.
  $}
  ${
    sylan9eq.1 $e |- ( ph -> A = B ) $.
    sylan9eq.2 $e |- ( ps -> B = C ) $.
    
    sylan9eq $p |- ( ( ph /\ ps ) -> A = C ) $=
      ( wceq eqtr syl2an ) ACDHDEHCEHBFGCDEIJ $.
  $}
  ${
    3eqtr4g.1 $e |- ( ph -> A = B ) $.
    3eqtr4g.2 $e |- C = A $.
    3eqtr4g.3 $e |- D = B $.
    
    3eqtr4g $p |- ( ph -> C = D ) $=
      ( syl5eq syl6eqr ) ADCEADBCGFIHJ $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.  $d x ph $.
    eleq1d.1 $e |- ( ph -> A = B ) $.
    
    eleq1d $p |- ( ph -> ( A e. C <-> B e. C ) ) $=
      ( vx cv wceq wcel wa wex eqeq2d anbi1d exbidv df-clel 3bitr4g ) AFGZBHZQD
      IZJZFKQCHZSJZFKBDICDIATUBFARUASABCQELMNFBDOFCDOP $.
    
    eleq2d $p |- ( ph -> ( C e. A <-> C e. B ) ) $=
      ( vx cv wceq wa wex wb wal dfcleq sylib anbi2 alexbii syl df-clel 3bitr4g
      wcel ) AFGZDHZUABTZIZFJZUBUACTZIZFJZDBTDCTAUCUFKZFLZUEUHKABCHUJEFBCMNUIUD
      UGFUCUFUBOPQFDBRFDCRS $.
  $}
  
  eleq1 $p |- ( A = B -> ( A e. C <-> B e. C ) ) $=
    ( wceq id eleq1d ) ABDZABCGEF $.
  
  eleq2 $p |- ( A = B -> ( C e. A <-> C e. B ) ) $=
    ( wceq id eleq2d ) ABDZABCGEF $.
  ${
    eleq1i.1 $e |- A = B $.
    
    eleq1i $p |- ( A e. C <-> B e. C ) $=
      ( wceq wcel wb eleq1 ax-mp ) ABEACFBCFGDABCHI $.
    
    eleq2i $p |- ( C e. A <-> C e. B ) $=
      ( wceq wcel wb eleq2 ax-mp ) ABECAFCBFGDABCHI $.
  $}
  ${
    eqeltr.1 $e |- A = B $.
    eqeltr.2 $e |- B e. C $.
    
    eqeltri $p |- A e. C $=
      ( wcel eleq1i mpbir ) ACFBCFEABCDGH $.
  $}
  ${
    eleqtr.1 $e |- A e. B $.
    eleqtr.2 $e |- B = C $.
    
    eleqtri $p |- A e. C $=
      ( wcel eleq2i mpbi ) ABFACFDBCAEGH $.
  $}
  ${
    eleqtrr.1 $e |- A e. B $.
    eleqtrr.2 $e |- C = B $.
    
    eleqtrri $p |- A e. C $=
      ( eqcomi eleqtri ) ABCDCBEFG $.
  $}
  ${
    eqeltrd.1 $e |- ( ph -> A = B ) $.
    eqeltrd.2 $e |- ( ph -> B e. C ) $.
    
    eqeltrd $p |- ( ph -> A e. C ) $=
      ( wcel eleq1d mpbird ) ABDGCDGFABCDEHI $.
  $}
  ${
    eleqtrd.1 $e |- ( ph -> A e. B ) $.
    eleqtrd.2 $e |- ( ph -> B = C ) $.
    
    eleqtrd $p |- ( ph -> A e. C ) $=
      ( wcel eleq2d mpbid ) ABCGBDGEACDBFHI $.
  $}
  ${
    syl5eqel.1 $e |- A = B $.
    syl5eqel.2 $e |- ( ph -> B e. C ) $.
    
    syl5eqel $p |- ( ph -> A e. C ) $=
      ( wceq a1i eqeltrd ) ABCDBCGAEHFI $.
  $}
  ${
    syl5eleq.1 $e |- A e. B $.
    syl5eleq.2 $e |- ( ph -> B = C ) $.
    
    syl5eleq $p |- ( ph -> A e. C ) $=
      ( wcel a1i eleqtrd ) ABCDBCGAEHFI $.
  $}
  ${
    syl6eqel.1 $e |- ( ph -> A = B ) $.
    syl6eqel.2 $e |- B e. C $.
    
    syl6eqel $p |- ( ph -> A e. C ) $=
      ( wcel a1i eqeltrd ) ABCDECDGAFHI $.
  $}
  ${
    $d y A $.  $d y B $.  $d x y $.
    cleqh.1 $e |- ( y e. A -> A. x y e. A ) $.
    cleqh.2 $e |- ( y e. B -> A. x y e. B ) $.
    
    cleqh $p |- ( A = B <-> A. x ( x e. A <-> x e. B ) ) $=
      ( wceq cv wcel wal dfcleq nfv nf5i nfbi weq eleq1 bibi12d cbvalv1 bitr4i
      wb ) CDGBHZCIZUADIZTZBJAHZCIZUEDIZTZAJBCDKUHUDABUHBLUBUCAUBAEMUCAFMNABOUF
      UBUGUCUEUACPUEUADPQRS $.
  $}
  ${
    $d y A $.  $d w y $.  $d w A $.  $d w x $.
    
    clelsb3 $p |- ( [ x / y ] y e. A <-> x e. A ) $=
      ( vw cv wcel wsb nfv sbco2 eleq1 sbie sbbii 3bitr3i ) DEZCFZDBGZBAGODAGBE
      ZCFZBAGAEZCFZODABOBHIPRBAORDBRDHNQCJKLOTDATDHNSCJKM $.
  $}
  ${
    $d y A $.  $d x z $.
    hblem.1 $e |- ( y e. A -> A. x y e. A ) $.
    
    hblem $p |- ( z e. A -> A. x z e. A ) $=
      ( cv wcel wsb wal hbsb clelsb3 albii 3imtr3i ) BFDGZBCHZOAICFDGZPAINBCAEJ
      CBDKZOPAQLM $.
  $}
  ${
    $d x A y $.  $d ph y $.
    
    abeq2 $p |- ( A = { x | ph } <-> A. x ( x e. A <-> ph ) ) $=
      ( vy cab wceq cv wcel wb wal ax-5 hbab1 cleqh abid bibi2i albii bitri ) C
      ABEZFBGZCHZSRHZIZBJTAIZBJBDCRDGCHBKABDLMUBUCBUAATABNOPQ $.
  $}
  ${
    abeq2d.1 $e |- ( ph -> A = { x | ps } ) $.
    
    abeq2d $p |- ( ph -> ( x e. A <-> ps ) ) $=
      ( cv wcel cab eleq2d abid syl6bb ) ACFZDGLBCHZGBADMLEIBCJK $.
  $}
  ${
    abeq2i.1 $e |- A = { x | ph } $.
    
    abeq2i $p |- ( x e. A <-> ph ) $=
      ( cv wcel wb wtru cab wceq a1i abeq2d trud ) BECFAGHABCCABIJHDKLM $.
  $}
  ${
    $d ph y $.  $d ps y $.  $d x y $.
    
    abbi $p |- ( A. x ( ph <-> ps ) <-> { x | ph } = { x | ps } ) $=
      ( vy cab wceq cv wcel wb wal hbab1 cleqh abid bibi12i albii bitr2i ) ACEZ
      BCEZFCGZQHZSRHZIZCJABIZCJCDQRACDKBCDKLUBUCCTAUABACMBCMNOP $.
  $}
  ${
    $d x A $.
    abbi2i.1 $e |- ( x e. A <-> ph ) $.
    
    abbi2i $p |- A = { x | ph } $=
      ( cab wceq cv wcel wb abeq2 mpgbir ) CABEFBGCHAIBABCJDK $.
  $}
  ${
    abbii.1 $e |- ( ph <-> ps ) $.
    
    abbii $p |- { x | ph } = { x | ps } $=
      ( wb cab wceq abbi mpgbi ) ABEACFBCFGCABCHDI $.
  $}
  ${
    abbid.1 $e |- F/ x ph $.
    abbid.2 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    abbid $p |- ( ph -> { x | ps } = { x | ch } ) $=
      ( wb wal cab wceq alrimi abbi sylib ) ABCGZDHBDICDIJANDEFKBCDLM $.
  $}
  ${
    $d x ph $.
    abbidv.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    abbidv $p |- ( ph -> { x | ps } = { x | ch } ) $=
      ( nfv abbid ) ABCDADFEG $.
  $}
  ${
    $d x A $.  $d ph x $.
    abbi2dv.1 $e |- ( ph -> ( x e. A <-> ps ) ) $.
    
    abbi2dv $p |- ( ph -> A = { x | ps } ) $=
      ( cv wcel wb wal cab wceq alrimiv abeq2 sylibr ) ACFDGBHZCIDBCJKAOCELBCDM
      N $.
  $}
  ${
    $d x A $.
    
    abid1 $p |- A = { x | x e. A } $=
      ( cv wcel biid abbi2i ) ACBDZABGEF $.
  $}
  ${
    $d x A $.
    
    abid2 $p |- { x | x e. A } = A $=
      ( cv wcel cab abid1 eqcomi ) BACBDAEABFG $.
  $}
  $c F/_ $.
  
  wnfc $a wff F/_ x A $.
  ${
    $d x y $.  $d y A $.
    
    df-nfc $a |- ( F/_ x A <-> A. y F/ x y e. A ) $.
    ${
      nfci.1 $e |- F/ x y e. A $.
      
      nfci $p |- F/_ x A $=
        ( wnfc cv wcel wnf df-nfc mpgbir ) ACEBFCGAHBABCIDJ $.
    $}
    
    nfcr $p |- ( F/_ x A -> F/ x y e. A ) $=
      ( wnfc cv wcel wnf wal df-nfc sp sylbi ) ACDBECFAGZBHLABCILBJK $.
  $}
  ${
    $d x y z $.  $d z A $.
    nfcri.1 $e |- F/_ x A $.
    
    nfcrii $p |- ( y e. A -> A. x y e. A ) $=
      ( vz cv wcel wnfc wnf nfcr ax-mp nf5ri hblem ) AEBCEFCGZAACHNAIDAECJKLM
      $.
    
    nfcri $p |- F/ x y e. A $=
      ( cv wcel nfcrii nf5i ) BECFAABCDGH $.
  $}
  ${
    $d x y A $.
    
    nfcv $p |- F/_ x A $=
      ( vy cv wcel nfv nfci ) ACBCDBEAFG $.
    
    nfcvd $p |- ( ph -> F/_ x A ) $=
      ( wnfc nfcv a1i ) BCDABCEF $.
  $}
  ${
    $d x y $.  $d y A $.  $d y ph $.
    
    nfab1 $p |- F/_ x { x | ph } $=
      ( vy cab nfsab1 nfci ) BCABDABCEF $.
  $}
  ${
    $d x y $.  $d y A $.  $d y B $.
    nfeqd.1 $e |- ( ph -> F/_ x A ) $.
    
    nfcrd $p |- ( ph -> F/ x y e. A ) $=
      ( wnfc cv wcel wnf nfcr syl ) ABDFCGDHBIEBCDJK $.
    $d y ph $.
    nfeqd.2 $e |- ( ph -> F/_ x B ) $.
    
    nfeqd $p |- ( ph -> F/ x A = B ) $=
      ( vy wceq cv wcel wb wal dfcleq nfv nfcrd nfbid nfald nfxfrd ) CDHGIZCJZS
      DJZKZGLABGCDMAUBBGAGNATUABABGCEOABGDFOPQR $.
    
    nfeld $p |- ( ph -> F/ x A e. B ) $=
      ( vy wcel cv wceq wa wex df-clel nfv nfcvd nfeqd nfcrd nfand nfexd nfxfrd
      ) CDHGIZCJZUADHZKZGLABGCDMAUDBGAGNAUBUCBABUACABUAOEPABGDFQRST $.
  $}
  ${
    $d x z $.  $d y z $.  $d z A $.  $d z B $.
    nfnfc.1 $e |- F/_ x A $.
    nfeq.2 $e |- F/_ x B $.
    
    nfeq $p |- F/ x A = B $=
      ( wceq wnf wtru wnfc a1i nfeqd trud ) BCFAGHABCABIHDJACIHEJKL $.
    
    nfel $p |- F/ x A e. B $=
      ( wcel wnf wtru wnfc a1i nfeld trud ) BCFAGHABCABIHDJACIHEJKL $.
  $}
  ${
    $d x B $.
    nfeq1.1 $e |- F/_ x A $.
    
    nfel1 $p |- F/ x A e. B $=
      ( nfcv nfel ) ABCDACEF $.
  $}
  ${
    $d x A $.
    nfeq2.1 $e |- F/_ x B $.
    
    nfeq2 $p |- F/ x A = B $=
      ( nfcv nfeq ) ABCABEDF $.
  $}
  ${
    $d y A $.  $d y B $.  $d x y $.
    cleqf.1 $e |- F/_ x A $.
    cleqf.2 $e |- F/_ x B $.
    
    cleqf $p |- ( A = B <-> A. x ( x e. A <-> x e. B ) ) $=
      ( vy nfcrii cleqh ) AFBCAFBDGAFCEGH $.
  $}
  
  wral $a wff A. x e. A ph $.
  
  wrex $a wff E. x e. A ph $.
  
  crab $a class { x e. A | ph } $.
  
  df-ral $a |- ( A. x e. A ph <-> A. x ( x e. A -> ph ) ) $.
  
  df-rex $a |- ( E. x e. A ph <-> E. x ( x e. A /\ ph ) ) $.
  
  df-rab $a |- { x e. A | ph } = { x | ( x e. A /\ ph ) } $.
  ${
    rgen.1 $e |- ( x e. A -> ph ) $.
    
    rgen $p |- A. x e. A ph $=
      ( wral cv wcel wi df-ral mpgbir ) ABCEBFCGAHBABCIDJ $.
  $}
  ${
    r2allem.1 $e |- ( A. y ( x e. A -> ( y e. B -> ph ) )
                      <-> ( x e. A -> A. y ( y e. B -> ph ) ) ) $.
    
    r2allem $p |- ( A. x e. A A. y e. B ph <->
               A. x A. y ( ( x e. A /\ y e. B ) -> ph ) ) $=
      ( wral cv wcel wi wal wa df-ral impexp albii imbi2i 3bitr4i bitr4i ) ACEG
      ZBDGBHDIZSJZBKTCHEIZLAJZCKZBKSBDMUDUABTUBAJZJZCKTUECKZJUDUAFUCUFCTUBANOSU
      GTACEMPQOR $.
  $}
  ${
    $d x y $.  $d y A $.
    
    r2al $p |- ( A. x e. A A. y e. B ph <->
               A. x A. y ( ( x e. A /\ y e. B ) -> ph ) ) $=
      ( cv wcel wi 19.21v r2allem ) ABCDEBFDGCFEGAHCIJ $.
  $}
  ${
    $d x ph $.
    
    r19.21v $p |- ( A. x e. A ( ph -> ps ) <-> ( ph -> A. x e. A ps ) ) $=
      ( cv wcel wi wal wral bi2.04 albii 19.21v bitri df-ral imbi2i 3bitr4i ) C
      EDFZABGZGZCHZAQBGZCHZGZRCDIABCDIZGTAUAGZCHUCSUECQABJKAUACLMRCDNUDUBABCDNO
      P $.
  $}
  ${
    ralbii2.1 $e |- ( ( x e. A -> ph ) <-> ( x e. B -> ps ) ) $.
    
    ralbii2 $p |- ( A. x e. A ph <-> A. x e. B ps ) $=
      ( cv wcel wi wal wral albii df-ral 3bitr4i ) CGZDHAIZCJOEHBIZCJACDKBCEKPQ
      CFLACDMBCEMN $.
  $}
  ${
    ralbii.1 $e |- ( ph <-> ps ) $.
    
    ralbii $p |- ( A. x e. A ph <-> A. x e. A ps ) $=
      ( cv wcel imbi2i ralbii2 ) ABCDDABCFDGEHI $.
  $}
  
  raln $p |- ( A. x e. A -. ph <-> A. x -. ( x e. A /\ ph ) ) $=
    ( wn wral cv wcel wi wal wa df-ral imnang bitri ) ADZBCEBFCGZNHBIOAJDBINBCK
    OABLM $.
  
  ralnex $p |- ( A. x e. A -. ph <-> -. E. x e. A ph ) $=
    ( wn wral cv wcel wa wal wrex raln wex alnex df-rex xchbinxr bitri ) ADBCEB
    FCGAHZDBIZABCJZDABCKRQBLSQBMABCNOP $.
  
  dfral2 $p |- ( A. x e. A ph <-> -. E. x e. A -. ph ) $=
    ( wral wn wrex notnotb ralbii ralnex bitri ) ABCDAEZEZBCDKBCFEALBCAGHKBCIJ
    $.
  
  rexnal $p |- ( E. x e. A -. ph <-> -. A. x e. A ph ) $=
    ( wral wn wrex dfral2 con2bii ) ABCDAEBCFABCGH $.
  
  dfrex2 $p |- ( E. x e. A ph <-> -. A. x e. A -. ph ) $=
    ( wn wral wrex ralnex con2bii ) ADBCEABCFABCGH $.
  ${
    $d x ps $.
    
    r19.23v $p |- ( A. x e. A ( ph -> ps ) <-> ( E. x e. A ph -> ps ) ) $=
      ( wi wral wn wrex con34b ralbii r19.21v dfrex2 imbi1i con1b bitr2i 3bitri
      ) ABEZCDFBGZAGZEZCDFRSCDFZEZACDHZBEZQTCDABIJRSCDKUDUAGZBEUBUCUEBACDLMUABN
      OP $.
  $}
  ${
    $d x ps $.
    rexlimiv.1 $e |- ( x e. A -> ( ph -> ps ) ) $.
    
    rexlimiv $p |- ( E. x e. A ph -> ps ) $=
      ( wi wral wrex rgen r19.23v mpbi ) ABFZCDGACDHBFLCDEIABCDJK $.
  $}
  ${
    $d x ph $.  $d x ch $.
    rexlimdv.1 $e |- ( ph -> ( x e. A -> ( ps -> ch ) ) ) $.
    
    rexlimdv $p |- ( ph -> ( E. x e. A ps -> ch ) ) $=
      ( wrex wi cv wcel com3l rexlimiv com12 ) BDEGACBACHDEADIEJBCFKLM $.
  $}
  ${
    $d x ph $.  $d x ch $.
    rexlimdva.1 $e |- ( ( ph /\ x e. A ) -> ( ps -> ch ) ) $.
    
    rexlimdva $p |- ( ph -> ( E. x e. A ps -> ch ) ) $=
      ( cv wcel wi ex rexlimdv ) ABCDEADGEHBCIFJK $.
  $}
  ${
    $d x y ps $.  $d y A $.
    rexlimivv.1 $e |- ( ( x e. A /\ y e. B ) -> ( ph -> ps ) ) $.
    
    rexlimivv $p |- ( E. x e. A E. y e. B ph -> ps ) $=
      ( wrex cv wcel rexlimdva rexlimiv ) ADFHBCECIEJABDFGKL $.
  $}
  ${
    rexbii2.1 $e |- ( ( x e. A /\ ph ) <-> ( x e. B /\ ps ) ) $.
    
    rexbii2 $p |- ( E. x e. A ph <-> E. x e. B ps ) $=
      ( cv wcel wa wex wrex exbii df-rex 3bitr4i ) CGZDHAIZCJOEHBIZCJACDKBCEKPQ
      CFLACDMBCEMN $.
  $}
  ${
    rexbii.1 $e |- ( ph <-> ps ) $.
    
    rexbii $p |- ( E. x e. A ph <-> E. x e. A ps ) $=
      ( cv wcel anbi2i rexbii2 ) ABCDDABCFDGEHI $.
    
    2rexbii $p |- ( E. x e. A E. y e. B ph <-> E. x e. A E. y e. B ps ) $=
      ( wrex rexbii ) ADFHBDFHCEABDFGII $.
  $}
  
  rexnal2 $p |- ( E. x e. A E. y e. B -. ph <-> -. A. x e. A A. y e. B ph ) $=
    ( wn wrex wral rexnal rexbii bitri ) AFCEGZBDGACEHZFZBDGMBDHFLNBDACEIJMBDIK
    $.
  
  ralnex2 $p |- ( A. x e. A A. y e. B -. ph <-> -. E. x e. A E. y e. B ph ) $=
    ( wn wral wrex notnotb 2rexbii rexnal2 bitr2i xchbinx ) AFZCEGBDGZOFZACEHBD
    HZOIQNFZCEHBDHPARBCDEAIJNBCDEKLM $.
  ${
    $d x ph $.
    rexbidv2.1 $e |- ( ph -> ( ( x e. A /\ ps ) <-> ( x e. B /\ ch ) ) ) $.
    
    rexbidv2 $p |- ( ph -> ( E. x e. A ps <-> E. x e. B ch ) ) $=
      ( cv wcel wa wex wrex exbidv df-rex 3bitr4g ) ADHZEIBJZDKPFICJZDKBDELCDFL
      AQRDGMBDENCDFNO $.
  $}
  ${
    $d x ph $.
    rexbidva.1 $e |- ( ( ph /\ x e. A ) -> ( ps <-> ch ) ) $.
    
    rexbidva $p |- ( ph -> ( E. x e. A ps <-> E. x e. A ch ) ) $=
      ( cv wcel pm5.32da rexbidv2 ) ABCDEEADGEHBCFIJ $.
  $}
  ${
    $d x ph $.
    rexbidv.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    rexbidv $p |- ( ph -> ( E. x e. A ps <-> E. x e. A ch ) ) $=
      ( wb cv wcel adantr rexbidva ) ABCDEABCGDHEIFJK $.
  $}
  ${
    r2exlem.1 $e |- ( A. x e. A A. y e. B -. ph <->
               A. x A. y ( ( x e. A /\ y e. B ) -> -. ph ) ) $.
    
    r2exlem $p |- ( E. x e. A E. y e. B ph <->
                E. x E. y ( ( x e. A /\ y e. B ) /\ ph ) ) $=
      ( cv wcel wa wn wi wal wex wral wrex exnal xchbinxr alinexa con2bii exbii
      ralnex2 3bitr4ri ) BGDHCGEHIZAJZKCLZJZBMZUDCENBDNZJUCAICMZBMACEOBDOZUGUEB
      LUHUEBPFQUIUFBUEUIUCACRSTUHUJABCDEUASUB $.
  $}
  ${
    $d x y $.  $d y A $.
    
    r2ex $p |- ( E. x e. A E. y e. B ph <->
               E. x E. y ( ( x e. A /\ y e. B ) /\ ph ) ) $=
      ( wn r2al r2exlem ) ABCDEAFBCDEGH $.
  $}
  ${
    rabeqf.1 $e |- F/_ x A $.
    rabeqf.2 $e |- F/_ x B $.
    
    rabeqf $p |- ( A = B -> { x e. A | ph } = { x e. B | ph } ) $=
      ( wceq cv wcel wa cab crab nfeq eleq2 anbi1d abbid df-rab 3eqtr4g ) CDGZB
      HZCIZAJZBKTDIZAJZBKABCLABDLSUBUDBBCDEFMSUAUCACDTNOPABCQABDQR $.
  $}
  ${
    $d x A $.  $d x B $.
    
    rabeq $p |- ( A = B -> { x e. A | ph } = { x e. B | ph } ) $=
      ( nfcv rabeqf ) ABCDBCEBDEF $.
  $}
  
  $c _V $.
  
  cvv $a class _V $.
  
  df-v $a |- _V = { x | x = x } $.
  
  vex $p |- x e. _V $=
    ( cv cvv wcel weq equid df-v abeq2i mpbir ) ABCDAAEZAFJACAGHI $.
  ${
    $d x A $.
    
    isset $p |- ( A e. _V <-> E. x x = A ) $=
      ( cvv wcel cv wceq wa wex df-clel vex biantru exbii bitr4i ) BCDAEZBFZNCD
      ZGZAHOAHABCIOQAPOAJKLM $.
  $}
  ${
    $d A y $.  $d x y $.
    issetf.1 $e |- F/_ x A $.
    
    issetf $p |- ( A e. _V <-> E. x x = A ) $=
      ( vy cvv wcel cv wceq wex isset nfeq2 nfv eqeq1 cbvex bitri ) BEFDGZBHZDI
      AGZBHZAIDBJQSDAAPBCKSDLPRBMNO $.
  $}
  ${
    $d x A $.
    issetri.1 $e |- E. x x = A $.
    
    issetri $p |- A e. _V $=
      ( cvv wcel cv wceq wex isset mpbir ) BDEAFBGAHCABIJ $.
  $}
  ${
    $d x A $.  $d x B $.
    
    elex $p |- ( A e. B -> A e. _V ) $=
      ( vx cv wceq wcel wa wex cvv exsimpl df-clel isset 3imtr4i ) CDZAEZNBFZGC
      HOCHABFAIFOPCJCABKCALM $.
  $}
  ${
    elexi.1 $e |- A e. B $.
    elexi $p |- A e. _V $=
      ( wcel cvv elex ax-mp ) ABDAEDCABFG $.
  $}
  ${
    $d x A $.
    
    elisset $p |- ( A e. V -> E. x x = A ) $=
      ( wcel cvv cv wceq wex elex isset sylib ) BCDBEDAFBGAHBCIABJK $.
  $}
  ${
    vtoclgf.1 $e |- F/_ x A $.
    vtoclgf.2 $e |- F/ x ps $.
    vtoclgf.3 $e |- ( x = A -> ( ph <-> ps ) ) $.
    vtoclgf.4 $e |- ph $.
    
    vtoclgf $p |- ( A e. V -> ps ) $=
      ( wcel cvv elex cv wceq wex issetf mpbii exlimi sylbi syl ) DEJDKJZBDELUA
      CMDNZCOBCDFPUBBCGUBABIHQRST $.
  $}
  ${
    $d x A $.
    vtoclg1f.nf $e |- F/ x ps $.
    vtoclg1f.maj $e |- ( x = A -> ( ph <-> ps ) ) $.
    vtoclg1f.min $e |- ph $.
    
    vtoclg1f $p |- ( A e. V -> ps ) $=
      ( wcel cvv elex cv wceq wex isset mpbii exlimi sylbi syl ) DEIDJIZBDEKTCL
      DMZCNBCDOUABCFUAABHGPQRS $.
  $}
  ${
    $d x A $.  $d x ps $.
    vtoclg.1 $e |- ( x = A -> ( ph <-> ps ) ) $.
    vtoclg.2 $e |- ph $.
    
    vtoclg $p |- ( A e. V -> ps ) $=
      ( nfv vtoclg1f ) ABCDEBCHFGI $.
  $}
  ${
    vtocl2gf.1 $e |- F/_ x A $.
    vtocl2gf.2 $e |- F/_ y A $.
    vtocl2gf.3 $e |- F/_ y B $.
    vtocl2gf.4 $e |- F/ x ps $.
    vtocl2gf.5 $e |- F/ y ch $.
    vtocl2gf.6 $e |- ( x = A -> ( ph <-> ps ) ) $.
    vtocl2gf.7 $e |- ( y = B -> ( ps <-> ch ) ) $.
    vtocl2gf.8 $e |- ph $.
    
    vtocl2gf $p |- ( ( A e. V /\ B e. W ) -> ch ) $=
      ( wcel cvv wi elex nfel1 nfim cv wceq imbi2d vtoclgf mpan9 ) FHRFSRZGIRCF
      HUAUIBTUICTEGILUICEEFSKUBNUCEUDGUEBCUIPUFABDFSJMOQUGUGUH $.
  $}
  ${
    $d x A $.  $d y A $.  $d y B $.  $d x ps $.  $d y ch $.
    vtocl2g.1 $e |- ( x = A -> ( ph <-> ps ) ) $.
    vtocl2g.2 $e |- ( y = B -> ( ps <-> ch ) ) $.
    vtocl2g.3 $e |- ph $.
    
    vtocl2g $p |- ( ( A e. V /\ B e. W ) -> ch ) $=
      ( nfcv nfv vtocl2gf ) ABCDEFGHIDFMEFMEGMBDNCENJKLO $.
  $}
  ${
    $d x A $.  $d x ph $.
    vtocleg.1 $e |- ( x = A -> ph ) $.
    
    vtocleg $p |- ( A e. V -> ph ) $=
      ( wcel cv wceq wex elisset exlimiv syl ) CDFBGCHZBIABCDJMABEKL $.
  $}
  ${
    spcimgft.1 $e |- F/ x ps $.
    spcimgft.2 $e |- F/_ x A $.
    
    spcimgft $p |- ( A. x ( x = A -> ( ph -> ps ) ) -> ( A e. B ->
                      ( A. x ph -> ps ) ) ) $=
      ( wcel cvv cv wceq wi wal elex wex issetf exim syl5bi 19.36 syl6ib syl5 )
      DEHDIHZCJDKZABLZLCMZACMBLZDENUEUBUDCOZUFUBUCCOUEUGCDGPUCUDCQRABCFSTUA $.
    
    spcgft $p |- ( A. x ( x = A -> ( ph <-> ps ) ) -> ( A e. B ->
                      ( A. x ph -> ps ) ) ) $=
      ( cv wceq wb wi wal wcel biimp imim2i alimi spcimgft syl ) CHDIZABJZKZCLS
      ABKZKZCLDEMACLBKKUAUCCTUBSABNOPABCDEFGQR $.
  $}
  ${
    spcgf.1 $e |- F/_ x A $.
    spcgf.2 $e |- F/ x ps $.
    spcgf.3 $e |- ( x = A -> ( ph <-> ps ) ) $.
    
    spcgf $p |- ( A e. V -> ( A. x ph -> ps ) ) $=
      ( cv wceq wb wi wcel wal spcgft mpg ) CIDJABKLDEMACNBLLCABCDEGFOHP $.
    
    spcegf $p |- ( A e. V -> ( ps -> E. x ph ) ) $=
      ( wcel wn wal wex nfn cv wceq notbid spcgf con2d df-ex syl6ibr ) DEIZBAJZ
      CKZJACLUAUCBUBBJCDEFBCGMCNDOABHPQRACST $.
  $}
  ${
    $d x A $.  $d x B $.
    rspc.1 $e |- F/ x ps $.
    rspc.2 $e |- ( x = A -> ( ph <-> ps ) ) $.
    
    rspce $p |- ( ( A e. B /\ ps ) -> E. x e. B ph ) $=
      ( wcel wa cv wex wrex nfcv nfv nfan wceq eleq1 anbi12d spcegf anabsi5
      df-rex sylibr ) DEHZBIZCJZEHZAIZCKZACELUCBUHUGUDCDECDMUCBCUCCNFOUEDPUFUCA
      BUEDEQGRSTACEUAUB $.
  $}
  ${
    $d x A $.  $d x B $.  $d x ps $.
    rspcv.1 $e |- ( x = A -> ( ph <-> ps ) ) $.
    
    rspcev $p |- ( ( A e. B /\ ps ) -> E. x e. B ph ) $=
      ( nfv rspce ) ABCDEBCGFH $.
  $}
  ${
    $d x y A $.  $d y B $.  $d x C $.  $d x y D $.  $d x ch $.  $d y ps $.
    rspc2v.1 $e |- ( x = A -> ( ph <-> ch ) ) $.
    rspc2v.2 $e |- ( y = B -> ( ch <-> ps ) ) $.
    
    rspc2ev $p |- ( ( A e. C /\ B e. D /\ ps ) -> E. x e. C E. y e. D ph ) $=
      ( wcel w3a wrex wa rspcev anim2i 3impb cv wceq rexbidv syl ) FHLZGILZBMUC
      CEINZOZAEINZDHNUCUDBUFUDBOUEUCCBEGIKPQRUGUEDFHDSFTACEIJUAPUB $.
  $}
  ${
    elabgf.1 $e |- F/_ x A $.
    elabgf.2 $e |- F/ x ps $.
    elabgf.3 $e |- ( x = A -> ( ph <-> ps ) ) $.
    
    elabgf $p |- ( A e. B -> ( A e. { x | ph } <-> ps ) ) $=
      ( cv cab wcel wb nfab1 nfel nfbi wceq eleq1 bibi12d abid vtoclgf ) CIZACJ
      ZKZALDUBKZBLCDEFUDBCCDUBFACMNGOUADPUCUDABUADUBQHRACST $.
  $}
  ${
    $d x ps $.  $d x A $.
    elabg.1 $e |- ( x = A -> ( ph <-> ps ) ) $.
    
    elabg $p |- ( A e. V -> ( A e. { x | ph } <-> ps ) ) $=
      ( nfcv nfv elabgf ) ABCDECDGBCHFI $.
  $}
  ${
    $d x ps $.  $d x A $.
    elab2g.1 $e |- ( x = A -> ( ph <-> ps ) ) $.
    elab2g.2 $e |- B = { x | ph } $.
    
    elab2g $p |- ( A e. V -> ( A e. B <-> ps ) ) $=
      ( wcel cab eleq2i elabg syl5bb ) DEIDACJZIDFIBENDHKABCDFGLM $.
  $}
  
  $c \ $. 
  $c u. $. 
  $c i^i $. 
  $c C_ $.
  
  cdif $a class ( A \ B ) $.
  
  cun $a class ( A u. B ) $.
  
  cin $a class ( A i^i B ) $.
  
  wss $a wff A C_ B $.
  ${
    $d x A $.  $d x B $.
    
    df-dif $a |- ( A \ B ) = { x | ( x e. A /\ -. x e. B ) } $.
  $}
  ${
    $d x A $.  $d x B $.
    
    df-un $a |- ( A u. B ) = { x | ( x e. A \/ x e. B ) } $.
  $}
  ${
    $d x A $.  $d x B $.
    
    df-in $a |- ( A i^i B ) = { x | ( x e. A /\ x e. B ) } $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.
    
    eldif $p |- ( A e. ( B \ C ) <-> ( A e. B /\ -. A e. C ) ) $=
      ( vx cdif wcel cvv wn wa elex adantr cv wceq notbid anbi12d df-dif elab2g
      eleq1 pm5.21nii ) ABCEZFAGFZABFZACFZHZIZATJUBUAUDABJKDLZBFZUFCFZHZIUEDATG
      UFAMZUGUBUIUDUFABRUJUHUCUFACRNODBCPQS $.
  $}
  
  df-ss $a |- ( A C_ B <-> ( A i^i B ) = A ) $.
  
  dfss $p |- ( A C_ B <-> A = ( A i^i B ) ) $=
    ( wss cin wceq df-ss eqcom bitri ) ABCABDZAEAIEABFIAGH $.
  ${
    $d x A $.  $d x B $.
    
    dfss2 $p |- ( A C_ B <-> A. x ( x e. A -> x e. B ) ) $=
      ( wss cv wcel wa wb wal wi cin wceq dfss df-in eqeq2i abeq2 3bitri pm4.71
      cab albii bitr4i ) BCDZAEZBFZUDUCCFZGZHZAIZUDUEJZAIUBBBCKZLBUFASZLUHBCMUJ
      UKBABCNOUFABPQUIUGAUDUERTUA $.
  $}
  ${
    $d z A $.  $d z B $.  $d x z $.
    dfss2f.1 $e |- F/_ x A $.
    dfss2f.2 $e |- F/_ x B $.
    
    dfss2f $p |- ( A C_ B <-> A. x ( x e. A -> x e. B ) ) $=
      ( vz wss cv wcel wal dfss2 nfcri nfim nfv weq eleq1 imbi12d cbval bitri
      wi ) BCGFHZBIZUACIZTZFJAHZBIZUECIZTZAJFBCKUDUHFAUBUCAAFBDLAFCELMUHFNFAOUB
      UFUCUGUAUEBPUAUECPQRS $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.
    
    ssel $p |- ( A C_ B -> ( C e. A -> C e. B ) ) $=
      ( vx wss cv wceq wa wex wi wal dfss2 biimpi 19.21bi anim2d eximdv df-clel
      wcel 3imtr4g ) ABEZDFZCGZUAARZHZDIUBUABRZHZDICARCBRTUDUFDTUCUEUBTUCUEJZDT
      UGDKDABLMNOPDCAQDCBQS $.
  $}
  ${
    $d x A $.  $d x B $.
    ssriv.1 $e |- ( x e. A -> x e. B ) $.
    
    ssriv $p |- A C_ B $=
      ( wss cv wcel wi dfss2 mpgbir ) BCEAFZBGKCGHAABCIDJ $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.
    
    sstr2 $p |- ( A C_ B -> ( B C_ C -> A C_ C ) ) $=
      ( vx wss cv wcel wi wal ssel imim1d alimdv dfss2 3imtr4g ) ABEZDFZBGZPCGZ
      HZDIPAGZRHZDIBCEACEOSUADOTQRABPJKLDBCMDACMN $.
  $}
  ${
    $d x A $.  $d x B $.
    
    eqss $p |- ( A = B <-> ( A C_ B /\ B C_ A ) ) $=
      ( vx cv wcel wb wal wi wa wceq wss albiim dfcleq dfss2 anbi12i 3bitr4i )
      CDZAEZQBEZFCGRSHCGZSRHCGZIABJABKZBAKZIRSCLCABMUBTUCUACABNCBANOP $.
  $}
  
  sseq2 $p |- ( A = B -> ( C C_ A <-> C C_ B ) ) $=
    ( wss wa wi wceq wb sstr2 com12 anim12i eqss dfbi2 3imtr4i ) ABDZBADZECADZC
    BDZFZRQFZEABGQRHOSPTQORCABIJRPQCBAIJKABLQRMN $.
  ${
    sseq1i.1 $e |- A = B $.
    
    sseq2i $p |- ( C C_ A <-> C C_ B ) $=
      ( wceq wss wb sseq2 ax-mp ) ABECAFCBFGDABCHI $.
  $}
  
  ss2ab $p |- ( { x | ph } C_ { x | ps } <-> A. x ( ph -> ps ) ) $=
    ( cab wss cv wcel wi wal nfab1 dfss2f abid imbi12i albii bitri ) ACDZBCDZEC
    FZPGZRQGZHZCIABHZCICPQACJBCJKUAUBCSATBACLBCLMNO $.
  ${
    $d x A $.
    
    abss $p |- ( { x | ph } C_ A <-> A. x ( ph -> x e. A ) ) $=
      ( cab wss cv wcel wi wal abid2 sseq2i ss2ab bitr3i ) ABDZCENBFCGZBDZEAOHB
      IPCNBCJKAOBLM $.
  $}
  ${
    $d x ph $.  $d x A $.
    abssdv.1 $e |- ( ph -> ( ps -> x e. A ) ) $.
    
    abssdv $p |- ( ph -> { x | ps } C_ A ) $=
      ( cv wcel wi wal cab wss alrimiv abss sylibr ) ABCFDGHZCIBCJDKAOCELBCDMN
      $.
  $}
  
  eldifi $p |- ( A e. ( B \ C ) -> A e. B ) $=
    ( cdif wcel wn eldif simplbi ) ABCDEABEACEFABCGH $.
  
  eldifn $p |- ( A e. ( B \ C ) -> -. A e. C ) $=
    ( cdif wcel wn eldif simprbi ) ABCDEABEACEFABCGH $.
  ${
    $d x A $.  $d x B $.  $d x C $.
    
    elun $p |- ( A e. ( B u. C ) <-> ( A e. B \/ A e. C ) ) $=
      ( vx cun wcel cvv wo elex jaoi wceq eleq1 orbi12d df-un elab2g pm5.21nii
      cv ) ABCEZFAGFZABFZACFZHZARITSUAABIACIJDQZBFZUCCFZHUBDARGUCAKUDTUEUAUCABL
      UCACLMDBCNOP $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.
    uneqri.1 $e |- ( ( x e. A \/ x e. B ) <-> x e. C ) $.
    
    uneqri $p |- ( A u. B ) = C $=
      ( cun cv wcel wo elun bitri eqriv ) ABCFZDAGZMHNBHNCHINDHNBCJEKL $.
  $}
  ${
    $d x A $.
    
    unidm $p |- ( A u. A ) = A $=
      ( vx cv wcel oridm uneqri ) BAAABCADEF $.
  $}
  ${
    $d x A $.  $d x B $.
    
    uncom $p |- ( A u. B ) = ( B u. A ) $=
      ( vx cun cv wcel wo orcom elun bitr4i uneqri ) CABBADZCEZAFZMBFZGONGMLFNO
      HMBAIJK $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.
    
    uneq1 $p |- ( A = B -> ( A u. C ) = ( B u. C ) ) $=
      ( vx wceq cun cv wcel wo eleq2 orbi1d elun 3bitr4g eqrdv ) ABEZDACFZBCFZO
      DGZAHZRCHZIRBHZTIRPHRQHOSUATABRJKRACLRBCLMN $.
  $}
  
  uneq2 $p |- ( A = B -> ( C u. A ) = ( C u. B ) ) $=
    ( wceq cun uneq1 uncom 3eqtr4g ) ABDACEBCECAECBEABCFCAGCBGH $.
  
  uneq12 $p |- ( ( A = B /\ C = D ) -> ( A u. C ) = ( B u. D ) ) $=
    ( wceq cun uneq1 uneq2 sylan9eq ) ABECDEACFBCFBDFABCGCDBHI $.
  ${
    uneq1i.1 $e |- A = B $.
    ${
      uneq12i.2 $e |- C = D $.
      
      uneq12i $p |- ( A u. C ) = ( B u. D ) $=
        ( wceq cun uneq12 mp2an ) ABGCDGACHBDHGEFABCDIJ $.
    $}
  $}
  ${
    uneq1d.1 $e |- ( ph -> A = B ) $.
    
    uneq1d $p |- ( ph -> ( A u. C ) = ( B u. C ) ) $=
      ( wceq cun uneq1 syl ) ABCFBDGCDGFEBCDHI $.
  $}
  ${
    $d x y $.  $d ph y $.  $d ps y $.
    
    unab $p |- ( { x | ph } u. { x | ps } ) = { x | ( ph \/ ps ) } $=
      ( vy cab wo wsb cv wcel sbor df-clab orbi12i 3bitr4ri uneqri ) DACEZBCEZA
      BFZCEZQCDGACDGZBCDGZFDHZRIUAOIZUAPIZFABCDJQDCKUBSUCTADCKBDCKLMN $.
  $}
  
  $c (/) $.
  
  c0 $a class (/) $.
  
  df-nul $a |- (/) = ( _V \ _V ) $.
  
  noel $p |- -. A e. (/) $=
    ( c0 wcel cvv cdif eldifi eldifn pm2.65i df-nul eleq2i mtbir ) ABCADDEZCZMA
    DCADDFADDGHBLAIJK $.
  
  n0i $p |- ( B e. A -> -. A = (/) ) $=
    ( c0 wceq wcel noel eleq2 mtbiri con2i ) ACDZBAEZJKBCEBFACBGHI $.
  ${
    eq0f.1 $e |- F/_ x A $.
    
    eq0f $p |- ( A = (/) <-> A. x -. x e. A ) $=
      ( c0 wceq cv wcel wb wal wn nfcv cleqf noel nbn albii bitr4i ) BDEAFZBGZQ
      DGZHZAIRJZAIABDCADKLUATASRQMNOP $.
    
    neq0f $p |- ( -. A = (/) <-> E. x x e. A ) $=
      ( c0 wceq wn cv wcel wal wex eq0f notbii df-ex bitr4i ) BDEZFAGBHZFAIZFPA
      JOQABCKLPAMN $.
  $}
  ${
    $d x A $.
    
    eq0 $p |- ( A = (/) <-> A. x -. x e. A ) $=
      ( nfcv eq0f ) ABABCD $.
    
    neq0 $p |- ( -. A = (/) <-> E. x x e. A ) $=
      ( nfcv neq0f ) ABABCD $.
  $}
  ${
    $d x A $.
    
    un0 $p |- ( A u. (/) ) = A $=
      ( vx c0 cv wcel wo noel biorfi bicomi uneqri ) BACABDZAEZLKCEZFMLKGHIJ $.
  $}
  ${
    $d A x $.
    
    0ss $p |- (/) C_ A $=
      ( vx c0 cv wcel noel pm2.21i ssriv ) BCABDZCEIAEIFGH $.
  $}
  
  ss0b $p |- ( A C_ (/) <-> A = (/) ) $=
    ( c0 wceq wss 0ss eqss mpbiran2 bicomi ) ABCZABDZIJBADAEABFGH $.
  
  ss0 $p |- ( A C_ (/) -> A = (/) ) $=
    ( c0 wss wceq ss0b biimpi ) ABCABDAEF $.
  
  $c if $.
  
  cif $a class if ( ph , A , B ) $.
  ${
    $d x ph $.  $d x A $.  $d x B $.
    
    df-if $a |- if ( ph , A , B ) =
                 { x | ( ( x e. A /\ ph ) \/ ( x e. B /\ -. ph ) ) } $.
  $}
  ${
    $d x ph $.  $d x A $.  $d x B $.  $d x C $.
    
    dfif2 $p |- if ( ph , A , B ) =
                 { x | ( ( x e. B -> ph ) -> ( x e. A /\ ph ) ) } $=
      ( cif cv wcel wa wn wo cab wi df-if df-or orcom iman imbi1i 3bitr4i abbii
      eqtri ) ACDEBFZCGAHZUADGZAIHZJZBKUCALZUBLZBKABCDMUEUGBUDUBJUDIZUBLUEUGUDU
      BNUBUDOUFUHUBUCAPQRST $.
    
    dfif6 $p |- if ( ph , A , B ) =
                 ( { x e. A | ph } u. { x e. B | -. ph } ) $=
      ( cv wcel wa cab wn cun wo crab cif unab df-rab uneq12i df-if 3eqtr4ri )
      BEZCFAGZBHZSDFAIZGZBHZJTUCKBHABCLZUBBDLZJACDMTUCBNUEUAUFUDABCOUBBDOPABCDQ
      R $.
    
    ifeq1 $p |- ( A = B -> if ( ph , A , C ) = if ( ph , B , C ) ) $=
      ( vx wceq crab wn cun cif rabeq uneq1d dfif6 3eqtr4g ) BCFZAEBGZAHEDGZIAE
      CGZQIABDJACDJOPRQAEBCKLAEBDMAECDMN $.
    
    iftrue $p |- ( ph -> if ( ph , A , B ) = A ) $=
      ( vx cv wcel wi wa cab cif dedlem0a abbi2dv dfif2 syl6reqr ) ABDEZCFZAGOB
      FZAHGZDIABCJARDBAQPKLADBCMN $.
  $}
  ${
    $d x ph $.  $d x A $.  $d x B $.
    
    iffalse $p |- ( -. ph -> if ( ph , A , B ) = B ) $=
      ( vx wn cv wcel wa wo cab cif dedlemb abbi2dv df-if syl6reqr ) AEZCDFZBGZ
      AHQCGZPHIZDJABCKPTDCARSLMADBCNO $.
  $}
  ${
    ifeq1d.1 $e |- ( ph -> A = B ) $.
    
    ifeq1d $p |- ( ph -> if ( ps , A , C ) = if ( ps , B , C ) ) $=
      ( wceq cif ifeq1 syl ) ACDGBCEHBDEHGFBCDEIJ $.
  $}
  
  ifbi $p |- ( ( ph <-> ps ) -> if ( ph , A , B ) = if ( ps , A , B ) ) $=
    ( wb wa wn wo cif wceq dfbi3 iftrue eqcomd sylan9eq iffalse jaoi sylbi ) AB
    EABFZAGZBGZFZHACDIZBCDIZJZABKRUDUAABUBCUCACDLBUCCBCDLMNSTUBDUCACDOTUCDBCDOM
    NPQ $.
  ${
    ifbid.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    
    ifbid $p |- ( ph -> if ( ps , A , B ) = if ( ch , A , B ) ) $=
      ( wb cif wceq ifbi syl ) ABCGBDEHCDEHIFBCDEJK $.
  $}
  ${
    ifbieq1d.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    ifbieq1d.2 $e |- ( ph -> A = B ) $.
    
    ifbieq1d $p |- ( ph -> if ( ps , A , C ) = if ( ch , B , C ) ) $=
      ( cif ifbid ifeq1d eqtrd ) ABDFICDFICEFIABCDFGJACDEFHKL $.
  $}
  ${
    ifboth.1 $e |- ( A = if ( ph , A , B ) -> ( ps <-> th ) ) $.
    ifboth.2 $e |- ( B = if ( ph , A , B ) -> ( ch <-> th ) ) $.
    ${
      ifbothda.3 $e |- ( ( et /\ ph ) -> ps ) $.
      ifbothda.4 $e |- ( ( et /\ -. ph ) -> ch ) $.
      
      ifbothda $p |- ( et -> th ) $=
        ( wa wb cif wceq iftrue eqcomd syl adantl mpbid wn iffalse pm2.61dan )
        EADEALBDJABDMZEAFAFGNZOUDAUEFAFGPQHRSTEAUAZLCDKUFCDMZEUFGUEOUGUFUEGAFGU
        BQIRSTUC $.
    $}
    
    ifboth $p |- ( ( ps /\ ch ) -> th ) $=
      ( wa simpll wn simplr ifbothda ) ABCDBCIEFGHBCAJBCAKLM $.
  $}
  ${
    keephyp.1 $e |- ( A = if ( ph , A , B ) -> ( ps <-> th ) ) $.
    keephyp.2 $e |- ( B = if ( ph , A , B ) -> ( ch <-> th ) ) $.
    keephyp.3 $e |- ps $.
    keephyp.4 $e |- ch $.
    
    keephyp $p |- th $=
      ( ifboth mp2an ) BCDIJABCDEFGHKL $.
  $}
  ${
    keepel.1 $e |- A e. C $.
    keepel.2 $e |- B e. C $.
    
    keepel $p |- if ( ph , A , B ) e. C $=
      ( wcel cif eleq1 keephyp ) ABDGCDGABCHZDGBCBKDICKDIEFJ $.
  $}
  ${
    dedex.1 $e |- A e. _V $.
    dedex.2 $e |- B e. _V $.
    
    ifex $p |- if ( ph , A , B ) e. _V $=
      ( cvv keepel ) ABCFDEG $.
  $}
  
  $c <. $.  
  $c >. $.
  
  csn $a class { A } $.
  ${
    $d x A $.
    
    df-sn $a |- { A } = { x | x = A } $.
  $}
  
  cpr $a class { A , B } $.
  
  df-pr $a |- { A , B } = ( { A } u. { B } ) $.
  
  cop $a class <. A , B >. $.
  ${
    $d x A $.  $d x B $.
    
    df-op $a |- <. A , B >. = { x |
      ( A e. _V /\ B e. _V /\ x e. { { A } , { A , B } } ) } $.
  $}
  ${
    $d x A $.  $d x B $.
    
    sneq $p |- ( A = B -> { A } = { B } ) $=
      ( vx wceq cv cab csn eqeq2 abbidv df-sn 3eqtr4g ) ABDZCEZADZCFMBDZCFAGBGL
      NOCABMHICAJCBJK $.
  $}
  
  dfsn2 $p |- { A } = { A , A } $=
    ( cpr csn cun df-pr unidm eqtr2i ) AABACZHDHAAEHFG $.
  ${
    $d A x $.  $d B x $.
    
    elsng $p |- ( A e. V -> ( A e. { B } <-> A = B ) ) $=
      ( vx cv wceq csn eqeq1 df-sn elab2g ) DEZBFABFDABGCKABHDBIJ $.
  $}
  ${
    elsn.1 $e |- A e. _V $.
    
    elsn $p |- ( A e. { B } <-> A = B ) $=
      ( cvv wcel csn wceq wb elsng ax-mp ) ADEABFEABGHCABDIJ $.
  $}
  
  velsn $p |- ( x e. { A } <-> x = A ) $=
    ( cv vex elsn ) ACBADE $.
  
  elsni $p |- ( A e. { B } -> A = B ) $=
    ( csn wcel wceq elsng ibi ) ABCZDABEABHFG $.
  ${
    $d x A $.  $d x B $.
    
    dfpr2 $p |- { A , B } = { x | ( x = A \/ x = B ) } $=
      ( cpr csn cun cv wceq wo df-pr wcel elun velsn orbi12i bitri abbi2i eqtri
      cab ) BCDBEZCEZFZAGZBHZUBCHZIZARBCJUEAUAUBUAKUBSKZUBTKZIUEUBSTLUFUCUGUDAB
      MACMNOPQ $.
  $}
  ${
    $d x A $.  $d x B $.  $d x C $.
    
    elprg $p |- ( A e. V -> ( A e. { B , C } <-> ( A = B \/ A = C ) ) ) $=
      ( vx cv wceq wo cpr eqeq1 orbi12d dfpr2 elab2g ) EFZBGZNCGZHABGZACGZHEABC
      IDNAGOQPRNABJNACJKEBCLM $.
  $}
  
  elpri $p |- ( A e. { B , C } -> ( A = B \/ A = C ) ) $=
    ( cpr wcel wceq wo elprg ibi ) ABCDZEABFACFGABCJHI $.
  ${
    elpr.1 $e |- A e. _V $.
    
    elpr $p |- ( A e. { B , C } <-> ( A = B \/ A = C ) ) $=
      ( cvv wcel cpr wceq wo wb elprg ax-mp ) AEFABCGFABHACHIJDABCEKL $.
  $}
  
  snidg $p |- ( A e. V -> A e. { A } ) $=
    ( wcel csn wceq eqid elsng mpbiri ) ABCAADCAAEAFAABGH $.
  ${
    $d x A $.
    
    snprc $p |- ( -. A e. _V <-> { A } = (/) ) $=
      ( vx csn c0 wceq cvv wcel cv wex velsn exbii neq0 isset 3bitr4i con1bii
      wn ) ACZDEZAFGZBHZQGZBITAEZBIRPSUAUBBBAJKBQLBAMNO $.
  $}
  
  prcom $p |- { A , B } = { B , A } $=
    ( csn cun cpr uncom df-pr 3eqtr4i ) ACZBCZDJIDABEBAEIJFABGBAGH $.
  
  preq1 $p |- ( A = B -> { A , C } = { B , C } ) $=
    ( wceq csn cun cpr sneq uneq1d df-pr 3eqtr4g ) ABDZAEZCEZFBEZNFACGBCGLMONAB
    HIACJBCJK $.
  
  preq2 $p |- ( A = B -> { C , A } = { C , B } ) $=
    ( wceq cpr preq1 prcom 3eqtr4g ) ABDACEBCECAECBEABCFCAGCBGH $.
  
  preq12 $p |- ( ( A = C /\ B = D ) -> { A , B } = { C , D } ) $=
    ( wceq cpr preq1 preq2 sylan9eq ) ACEBDEABFCBFCDFACBGBDCHI $.
  ${
    preq1d.1 $e |- ( ph -> A = B ) $.
    
    preq2d $p |- ( ph -> { C , A } = { C , B } ) $=
      ( wceq cpr preq2 syl ) ABCFDBGDCGFEBCDHI $.
    preq12d.2 $e |- ( ph -> C = D ) $.
    
    preq12d $p |- ( ph -> { A , C } = { B , D } ) $=
      ( wceq cpr preq12 syl2anc ) ABCHDEHBDICEIHFGBDCEJK $.
  $}
  
  prid1g $p |- ( A e. V -> A e. { A , B } ) $=
    ( wcel cpr wceq wo eqid orci elprg mpbiri ) ACDAABEDAAFZABFZGLMAHIAABCJK $.
  ${
    prid1.1 $e |- A e. _V $.
    
    prid1 $p |- A e. { A , B } $=
      ( cvv wcel cpr prid1g ax-mp ) ADEAABFECABDGH $.
  $}
  
  prprc1 $p |- ( -. A e. _V -> { A , B } = { B } ) $=
    ( cvv wcel wn csn c0 wceq cpr snprc cun uneq1 df-pr uncom un0 3eqtr4g sylbi
    eqtr2i ) ACDEAFZGHZABIZBFZHAJTSUBKGUBKZUAUBSGUBLABMUCUBGKUBGUBNUBORPQ $.
  
  prprc2 $p |- ( -. B e. _V -> { A , B } = { A } ) $=
    ( cvv wcel wn cpr csn prcom prprc1 syl5eq ) BCDEABFBAFAGABHBAIJ $.
  
  sneqrg $p |- ( A e. V -> ( { A } = { B } -> A = B ) ) $=
    ( wcel csn wceq snidg eleq2 syl5ibcom elsng sylibd ) ACDZAEZBEZFZANDZABFLAM
    DOPACGMNAHIABCJK $.
  ${
    sneqr.1 $e |- A e. _V $.
    
    sneqr $p |- ( { A } = { B } -> A = B ) $=
      ( cvv wcel csn wceq wi sneqrg ax-mp ) ADEAFBFGABGHCABDIJ $.
  $}
  ${
    preq1b.a $e |- ( ph -> A e. V ) $.
    preq1b.b $e |- ( ph -> B e. W ) $.
    
    preq1b $p |- ( ph -> ( { A , C } = { B , C } <-> A = B ) ) $=
      ( cpr wceq wa wo wcel prid1g syl eleq2 wb elprg sylibd imp eqcom eqeq2 ex
      syl5ibcom syl5ibrcom oplem1 preq1 impbid1 ) ABDIZCDIZJZBCJZAUKULAUKKULBDJ
      ZCBJZCDJZAUKULUMLZAUKBUJMZUPABUIMZUKUQABEMZURGBDENOUIUJBPUDAUSUQUPQGBCDER
      OSTAUKUNUOLZAUKCUIMZUTAVAUKCUJMZACFMZVBHCDFNOUIUJCPUEAVCVAUTQHCBDFROSTBCU
      ABDCUBUFUCBCDUGUH $.
  $}
  ${
    preqr1.a $e |- A e. _V $.
    preqr1.b $e |- B e. _V $.
    
    preqr1 $p |- ( { A , C } = { B , C } -> A = B ) $=
      ( cpr wceq cvv wcel wb id a1i preq1b ax-mp biimpi ) ACFBCFGZABGZAHIZPQJDR
      ABCHHRKBHIRELMNO $.
    
    preqr2 $p |- ( { C , A } = { C , B } -> A = B ) $=
      ( cpr wceq prcom eqeq12i preqr1 sylbi ) CAFZCBFZGACFZBCFZGABGLNMOCAHCBHIA
      BCDEJK $.
  $}
  ${
    $d x A $.  $d x B $.
    
    dfopif $p |- <. A , B >. =
      if ( ( A e. _V /\ B e. _V ) , { { A } , { A , B } } , (/) ) $=
      ( vx cop cvv wcel cv csn cpr w3a cab wa c0 df-op df-3an abbii wceq iftrue
      cif ibar abbi2dv eqtr2d wss pm2.21 adantrd abssdv ss0 syl iffalse pm2.61i
      wn eqtr4d 3eqtri ) ABDAEFZBEFZCGZAHABIIZFZJZCKUNUOLZURLZCKZUTUQMSZCABNUSV
      ACUNUOUROPUTVBVCQUTVCUQVBUTUQMRUTVACUQUTURTUAUBUTUKZVBMVCVDVBMUCVBMQVDVAC
      MVDUTUPMFZURUTVEUDUEUFVBUGUHUTUQMUIULUJUM $.
  $}
  
  dfopg $p |- ( ( A e. V /\ B e. W ) ->
    <. A , B >. = { { A } , { A , B } } ) $=
    ( wcel cvv cop csn cpr wceq elex wa c0 cif dfopif iftrue syl5eq syl2an ) AC
    EAFEZBFEZABGZAHABIIZJBDEACKBDKSTLZUAUCUBMNUBABOUCUBMPQR $.
  ${
    dfop.1 $e |- A e. _V $.
    dfop.2 $e |- B e. _V $.
    
    dfop $p |- <. A , B >. = { { A } , { A , B } } $=
      ( cvv wcel cop csn cpr wceq dfopg mp2an ) AEFBEFABGAHABIIJCDABEEKL $.
  $}
  
  opeq1 $p |- ( A = B -> <. A , C >. = <. B , C >. ) $=
    ( wceq cvv wcel wa csn cpr cif cop eleq1 anbi1d sneq preq1 preq12d ifbieq1d
    c0 dfopif 3eqtr4g ) ABDZAEFZCEFZGZAHZACIZIZRJBEFZUCGZBHZBCIZIZRJACKBCKUAUDU
    IUGULRUAUBUHUCABELMUAUEUJUFUKABNABCOPQACSBCST $.
  
  opeq2 $p |- ( A = B -> <. C , A >. = <. C , B >. ) $=
    ( wceq cvv wcel wa csn cpr c0 cif eleq1 anbi2d preq2 preq2d ifbieq1d dfopif
    cop 3eqtr4g ) ABDZCEFZAEFZGZCHZCAIZIZJKUABEFZGZUDCBIZIZJKCARCBRTUCUHUFUJJTU
    BUGUAABELMTUEUIUDABCNOPCAQCBQS $.
  
  opeq12 $p |- ( ( A = C /\ B = D ) -> <. A , B >. = <. C , D >. ) $=
    ( wceq cop opeq1 opeq2 sylan9eq ) ACEBDEABFCBFCDFACBGBDCHI $.
  ${
    opeq1d.1 $e |- ( ph -> A = B ) $.
    
    opeq1d $p |- ( ph -> <. A , C >. = <. B , C >. ) $=
      ( wceq cop opeq1 syl ) ABCFBDGCDGFEBCDHI $.
  $}
  
  opprc $p |- ( -. ( A e. _V /\ B e. _V ) -> <. A , B >. = (/) ) $=
    ( cvv wcel wa wn cop csn cpr c0 cif dfopif iffalse syl5eq ) ACDBCDEZFABGOAH
    ABIIZJKJABLOPJMN $.
  
  oprcl $p |- ( C e. <. A , B >. -> ( A e. _V /\ B e. _V ) ) $=
    ( cop wcel c0 wceq cvv wa n0i opprc nsyl2 ) CABDZEMFGAHEBHEIMCJABKL $.
  
  copab $a class { <. x , y >. | ph } $.
  ${
    $d x z $.  $d y z $.  $d z ph $.
    
    df-opab $a |- { <. x , y >. | ph } =
                  { z | E. x E. y ( z = <. x , y >. /\ ph ) } $.
  $}
  ${
    $d x y z w $.  $d y z ph w $.
    
    ax-sep $a |- E. y A. x ( x e. y <-> ( x e. z /\ ph ) ) $.
  $}
  ${
    $d x ph z $.  $d x y z $.
    bm1.3ii.1 $e |- E. x A. y ( ph -> y e. x ) $.
    
    bm1.3ii $p |- E. x A. y ( y e. x <-> ph ) $=
      ( vz wel wi wal wa wb wex 19.42v bimsc1 eximi sylbir elequ2 imbi2d albidv
      alanimi weq cbvexv mpbi ax-sep pm3.2i exan exlimiiv ) ACEFZGZCHZCBFZUGAIJ
      ZCHZBKZIZUJAJZCHZBKZEUNUIULIZBKUQUIULBLURUPBUHUKUOCAUGUJMSNOUIUMEUIEKZUMA
      UJGZCHZBKUSDVAUIBEBETZUTUHCVBUJUGABECPQRUAUBACBEUCUDUEUF $.
  $}
  ${
    $d x y z w $.
    
    ax-nul $a |- E. x A. y -. y e. x $.
    
    0ex $p |- (/) e. _V $=
      ( vx vy c0 cv wceq wex wel wn wal ax-nul eq0 exbii mpbir issetri ) ACADZC
      EZAFBAGHBIZAFABJPQABOKLMN $.
  $}
  ${
    $d x z w v $.  $d y z w v $.
    
    ax-pr $a |- E. z A. w ( ( w = x \/ w = y ) -> w e. z ) $.
    
    zfpair2 $p |- { x , y } e. _V $=
      ( vz vw cv cpr wceq wex wcel wo wal ax-pr bm1.3ii dfcleq vex bibi2i albii
      wb elpr bitri exbii mpbir issetri ) CAEZBEZFZCEZUFGZCHDEZUGIZUIUDGUIUEGJZ
      RZDKZCHUKCDABCDLMUHUMCUHUJUIUFIZRZDKUMDUGUFNUOULDUNUKUJUIUDUEDOSPQTUAUBUC
      $.
  $}
  ${
    $d x A $.
    
    snex $p |- { A } e. _V $=
      ( vx cvv wcel csn cpr dfsn2 cv wceq preq12 anidms eleq1d zfpair2 syl5eqel
      vtoclg wn c0 snprc biimpi 0ex syl6eqel pm2.61i ) ACDZAEZCDUCUDAAFZCAGBHZU
      FFZCDUECDBACUFAIZUGUECUHUGUEIUFUFAAJKLBBMONUCPZUDQCUIUDQIARSTUAUB $.
  $}
  ${
    $d x A $.  $d x y B $.
    
    prex $p |- { A , B } e. _V $=
      ( vx vy cvv wcel cpr wi wceq preq2 eleq1d zfpair2 vtoclg preq1 syl5ib csn
      cv wn snex syl6eqel vtocleg prprc1 prprc2 pm2.61nii ) AEFZBEFZABGZEFZUFUH
      HCAEUFCQZBGZEFZUIAIZUHUIDQZGZEFUKDBEUMBIUNUJEUMBUIJKCDLMULUJUGEUIABNKOUAU
      ERUGBPEABUBBSTUFRUGAPEABUCASTUD $.
  $}
  
  opex $p |- <. A , B >. e. _V $=
    ( cop cvv wcel wa csn cpr c0 cif dfopif prex 0ex ifex eqeltri ) ABCADEBDEFZ
    AGZABHZHZIJDABKPSIQRLMNO $.
  ${
    opi1.1 $e |- A e. _V $.
    opi1.2 $e |- B e. _V $.
    
    opi1 $p |- { A } e. <. A , B >. $=
      ( csn cpr cop snex prid1 dfop eleqtrri ) AEZLABFZFABGLMAHIABCDJK $.
  $}
  ${
    opth1.1 $e |- A e. _V $.
    opth1.2 $e |- B e. _V $.
    
    opth1 $p |- ( <. A , B >. = <. C , D >. -> A = C ) $=
      ( cop wceq csn wcel opi1 id syl5eleq cpr wi sneqr a1i cvv oprcl syl eleq2
      simpld prid1g syl5ibrcom elsni eqcomd syl6 wo dfopg eleqtrd elpri mpjaod
      wa ) ABGZCDGZHZAIZUOJZACHZUPUQUNUOABEFKUPLMURUQCIZHZUSUQCDNZHZVAUSOURACEP
      QURVCCUQJZUSURVDVCCVBJZURCRJZVEURVFDRJZCDUQSZUBCDRUCTUQVBCUAUDVDCACAUEUFU
      GURUQUTVBNZJVAVCUHURUQUOVIURLURVFVGUMUOVIHVHCDRRUITUJUQUTVBUKTULT $.
    $d x B $.  $d x C $.  $d x D $.
    
    opth $p |- ( <. A , B >. = <. C , D >. <-> ( A = C /\ B = D ) ) $=
      ( vx cop wceq wa cvv wcel cpr csn syl eqtr3d dfopg prex preqr2 wi opi1 id
      opth1 syl5eleq oprcl simprd opeq1d simpld sylancl cv preq2 eqeq2d imbi12d
      eqeq2 vex vtoclg sylc jca opeq12 impbii ) ABHZCDHZIZACIZBDIZJVCVDVEABCDEF
      UCZVCDKLZCBMZCDMZIZVEVCCKLZVGVCANZVBLVKVGJZVCVLVAVBABEFUAVCUBZUDCDVLUEOZU
      FVCCNZVHMZVPVIMZIVJVCVBVQVRVCCBHZVBVQVCVAVSVBVCACBVFUGVNPVCVKBKLVSVQIVCVK
      VGVOUHFCBKKQUIPVCVMVBVRIVOCDKKQOPVHVIVPCBRCDRSOVHCGUJZMZIZBVTIZTVJVETGDKV
      TDIZWBVJWCVEWDWAVIVHVTDCUKULVTDBUNUMBVTCFGUOSUPUQURABCDUSUT $.
  $}
  ${
    $d x y A $.  $d y B $.  $d x y C $.  $d x y D $.
    
    opthg $p |- ( ( A e. V /\ B e. W ) ->
                 ( <. A , B >. = <. C , D >. <-> ( A = C /\ B = D ) ) ) $=
      ( vx vy cv cop wceq wa wb opeq1 eqeq1d eqeq1 anbi1d bibi12d opeq2 vex
      anbi2d opth vtocl2g ) GIZHIZJZCDJZKZUDCKZUEDKZLZMAUEJZUGKZACKZUJLZMABJZUG
      KZUNBDKZLZMGHABEFUDAKZUHUMUKUOUTUFULUGUDAUENOUTUIUNUJUDACPQRUEBKZUMUQUOUS
      VAULUPUGUEBASOVAUJURUNUEBDPUARUDUECDGTHTUBUC $.
  $}
  
  opthg2 $p |- ( ( C e. V /\ D e. W ) ->
               ( <. A , B >. = <. C , D >. <-> ( A = C /\ B = D ) ) ) $=
    ( wcel wa cop wceq opthg eqcom anbi12i 3bitr4g ) CEGDFGHCDIZABIZJCAJZDBJZHP
    OJACJZBDJZHCDABEFKPOLSQTRACLBDLMN $.
  ${
    opth2.1 $e |- C e. _V $.
    opth2.2 $e |- D e. _V $.
    
    opth2 $p |- ( <. A , B >. = <. C , D >. <-> ( A = C /\ B = D ) ) $=
      ( cvv wcel cop wceq wa wb opthg2 mp2an ) CGHDGHABICDIJACJBDJKLEFABCDGGMN
      $.
  $}
  ${
    $d x z A $.  $d y z A $.  $d z ph $.
    
    elopab $p |- ( A e. { <. x , y >. | ph } <->
                 E. x E. y ( A = <. x , y >. /\ ph ) ) $=
      ( vz copab wcel cvv cv cop wceq wa elex opex eleq1 mpbiri adantr exlimivv
      wex eqeq1 anbi1d 2exbidv df-opab elab2g pm5.21nii ) DABCFZGDHGZDBIZCIZJZK
      ZALZCSBSZDUFMULUGBCUKUGAUKUGUJHGUHUINDUJHOPQREIZUJKZALZCSBSUMEDUFHUNDKZUP
      ULBCUQUOUKAUNDUJTUAUBABCEUCUDUE $.
  $}
  
  $c X. $.
  
  cxp $a class ( A X. B ) $.
  ${
    $d x y z A $.  $d x y z B $.
    
    df-xp $a |- ( A X. B ) = { <. x , y >. | ( x e. A /\ y e. B ) } $.
  $}
  ${
    $d x y z A $.  $d x y z B $.  $d x y z C $.
    
    elxp $p |- ( A e. ( B X. C ) <-> E. x E. y ( A = <. x , y >. /\
               ( x e. B /\ y e. C ) ) ) $=
      ( cxp wcel cv wa copab cop wceq wex df-xp eleq2i elopab bitri ) CDEFZGCAH
      ZDGBHZEGIZABJZGCSTKLUAIBMAMRUBCABDENOUAABCPQ $.
    
    elxp2 $p |- ( A e. ( B X. C ) <-> E. x e. B E. y e. C A = <. x , y >. ) $=
      ( cv cop wceq wcel wa wex cxp wrex ancom 2exbii elxp r2ex 3bitr4i ) CAFZB
      FZGHZSDITEIJZJZBKAKUBUAJZBKAKCDELIUABEMADMUCUDABUAUBNOABCDEPUAABDEQR $.
  $}
  ${
    $d x y A $.  $d x y B $.  $d x y C $.  $d x y D $.
    
    opelxp $p |- ( <. A , B >. e. ( C X. D ) <-> ( A e. C /\ B e. D ) ) $=
      ( vx vy cop cxp wcel cv wceq wrex wa elxp2 wb opth2 eleq1 bi2anan9 eqeq2d
      vex sylbi biimprcd rexlimivv eqid opeq1 opeq2 rspc2ev mp3an3 impbii bitri
      ) ABGZCDHIUKEJZFJZGZKZFDLECLZACIZBDIZMZEFUKCDNUPUSUOUSEFCDUOUSULCIZUMDIZM
      ZUOAULKZBUMKZMUSVBOABULUMETFTPVCUQUTVDURVAAULCQBUMDQRUAUBUCUQURUKUKKZUPUK
      UDUOVEUKAUMGZKEFABCDULAKUNVFUKULAUMUESUMBKVFUKUKUMBAUFSUGUHUIUJ $.
  $}
 
  $c R. $.
 
  $c CC $.
  
  cnr $a class R. $.
  
  cc $a class CC $.
  
  df-c $a |- CC = ( R. X. R. ) $.
  
  opelcn $p |- ( <. A , B >. e. CC <-> ( A e. R. /\ B e. R. ) ) $=
    ( cop cc wcel cnr cxp wa df-c eleq2i opelxp bitri ) ABCZDEMFFGZEAFEBFEHDNMI
    JABFFKL $.
