   $c ( $.   $c ) $.   $c -> $.  $c -. $.  $c wff $.  $c |- $.
   $v ph $.   $v ps $.   $v ch $.   $v th $.   $v ta $.   $v et $.   $v ze $.   $v si $.
   wph $f wff ph $.
   wps $f wff ps $.
   wch $f wff ch $.
   wth $f wff th $.
   wta $f wff ta $.
   wet $f wff et $.
   wze $f wff ze $.
   wsi $f wff si $.
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
  ${
    imim2d.1 $e |- ( ph -> ( ps -> ch ) ) $.
       imim2d $p |- ( ph -> ( ( th -> ps ) -> ( th -> ch ) ) ) $=
      ( wi a1d a2d ) ADBCABCFDEGH $.
  $}
   imim2 $p |- ( ( ph -> ps ) -> ( ( ch -> ph ) -> ( ch -> ps ) ) ) $=
    ( wi id imim2d ) ABDZABCGEF $.
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
  ${
    com3.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
       com23 $p |- ( ph -> ( ch -> ( ps -> th ) ) ) $=
      ( wi pm2.27 syl9 ) ABCDFCDECDGH $.
       com3r $p |- ( ch -> ( ph -> ( ps -> th ) ) ) $=
      ( wi com23 com12 ) ACBDFABCDEGH $.
       com3l $p |- ( ps -> ( ch -> ( ph -> th ) ) ) $=
      ( com3r ) CABDABCDEFF $.
  $}
  ${
    pm2.86d.1 $e |- ( ph -> ( ( ps -> ch ) -> ( ps -> th ) ) ) $.
       pm2.86d $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( wi ax-1 syl5 com23 ) ACBDCBCFABDFCBGEHI $.
  $}
   con4 $p |- ( ( -. ph -> -. ps ) -> ( ps -> ph ) ) $=
    ( ax-3 ) ABC $.
  ${
    con4d.1 $e |- ( ph -> ( -. ps -> -. ch ) ) $.
       con4d $p |- ( ph -> ( ch -> ps ) ) $=
      ( wn wi con4 syl ) ABECEFCBFDBCGH $.
  $}
  ${
    pm2.21d.1 $e |- ( ph -> -. ps ) $.
       pm2.21d $p |- ( ph -> ( ps -> ch ) ) $=
      ( wn a1d con4d ) ACBABECEDFG $.
  $}
   pm2.21 $p |- ( -. ph -> ( ph -> ps ) ) $=
    ( wn id pm2.21d ) ACZABFDE $.
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
    con3d.1 $e |- ( ph -> ( ps -> ch ) ) $.
       con3d $p |- ( ph -> ( -. ch -> -. ps ) ) $=
      ( wn notnotr syl5 con1d ) ABEZCIEBACBFDGH $.
  $}
  ${
    con3rr3.1 $e |- ( ph -> ( ps -> ch ) ) $.
       con3rr3 $p |- ( -. ch -> ( ph -> -. ps ) ) $=
      ( wn con3d com12 ) ACEBEABCDFG $.
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
  $}
  ${
    syl5ibr.1 $e |- ( ph -> th ) $.
    syl5ibr.2 $e |- ( ch -> ( ps <-> th ) ) $.
       syl5ibr $p |- ( ch -> ( ph -> ps ) ) $=
      ( bicomd syl5ib ) ADCBECBDFGH $.
  $}
  ${
    biimprd.1 $e |- ( ph -> ( ps <-> ch ) ) $.
       biimprd $p |- ( ph -> ( ch -> ps ) ) $=
      ( id syl5ibr ) CBACCEDF $.
  $}
  ${
    syl6ib.1 $e |- ( ph -> ( ps -> ch ) ) $.
    syl6ib.2 $e |- ( ch <-> th ) $.
       syl6ib $p |- ( ph -> ( ps -> th ) ) $=
      ( biimpi syl6 ) ABCDECDFGH $.
  $}
  ${
    syl6bir.1 $e |- ( ph -> ( ch <-> ps ) ) $.
    syl6bir.2 $e |- ( ch -> th ) $.
       syl6bir $p |- ( ph -> ( ps -> th ) ) $=
      ( biimprd syl6 ) ABCDACBEGFH $.
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
    bitri.1 $e |- ( ph <-> ps ) $.
    bitri.2 $e |- ( ps <-> ch ) $.
       bitri $p |- ( ph <-> ch ) $=
      ( sylbb sylbbr impbii ) ACABCDEFABCDEGH $.
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
    syl6bbr.1 $e |- ( ph -> ( ps <-> ch ) ) $.
    syl6bbr.2 $e |- ( th <-> ch ) $.
       syl6bbr $p |- ( ph -> ( ps <-> th ) ) $=
      ( bicomi syl6bb ) ABCDEDCFGH $.
  $}
  ${
    3imtr3g.1 $e |- ( ph -> ( ps -> ch ) ) $.
    3imtr3g.2 $e |- ( ps <-> th ) $.
    3imtr3g.3 $e |- ( ch <-> ta ) $.
       3imtr3g $p |- ( ph -> ( th -> ta ) ) $=
      ( syl5bir syl6ib ) ADCEDBACGFIHJ $.
  $}
  ${
    3bitri.1 $e |- ( ph <-> ps ) $.
    3bitri.2 $e |- ( ps <-> ch ) $.
    3bitri.3 $e |- ( ch <-> th ) $.
       3bitri $p |- ( ph <-> th ) $=
      ( bitri ) ABDEBCDFGHH $.
  $}
  ${
    3bitr4i.1 $e |- ( ph <-> ps ) $.
    3bitr4i.2 $e |- ( ch <-> ph ) $.
    3bitr4i.3 $e |- ( th <-> ps ) $.
       3bitr4i $p |- ( ch <-> th ) $=
      ( bitr4i bitri ) CADFABDEGHI $.
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
    xchbinx.1 $e |- ( ph <-> -. ps ) $.
    xchbinx.2 $e |- ( ps <-> ch ) $.
       xchbinx $p |- ( ph <-> -. ch ) $=
      ( wn notbii bitri ) ABFCFDBCEGH $.
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
       imbi1d $p |- ( ph -> ( ( ps -> th ) <-> ( ch -> th ) ) ) $=
      ( wi biimprd imim1d biimpd impbid ) ABDFCDFACBDABCEGHABCDABCEIHJ $.
       bibi2d $p |- ( ph -> ( ( th <-> ps ) <-> ( th <-> ch ) ) ) $=
      ( wb wi pm5.74i bibi2i pm5.74 3bitr4i pm5.74ri ) ADBFZDCFZADGZABGZFOACGZF
      AMGANGPQOABCEHIADBJADCJKL $.
       bibi1d $p |- ( ph -> ( ( ps <-> th ) <-> ( ch <-> th ) ) ) $=
      ( wb bibi2d bicom 3bitr4g ) ADBFDCFBDFCDFABCDEGBDHCDHI $.
  $}
   imbi1 $p |- ( ( ph <-> ps ) -> ( ( ph -> ch ) <-> ( ps -> ch ) ) ) $=
    ( wb id imbi1d ) ABDZABCGEF $.
  ${
    imbi1i.1 $e |- ( ph <-> ps ) $.
       imbi1i $p |- ( ( ph -> ch ) <-> ( ps -> ch ) ) $=
      ( wb wi imbi1 ax-mp ) ABEACFBCFEDABCGH $.
  $}
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
  $c /\ $.
   wa $a wff ( ph /\ ps ) $.
   df-an $a |- ( ( ph /\ ps ) <-> -. ( ph -> -. ps ) ) $.
  ${
    imp.1 $e |- ( ph -> ( ps -> ch ) ) $.
       imp $p |- ( ( ph /\ ps ) -> ch ) $=
      ( wa wn wi df-an impi sylbi ) ABEABFGFCABHABCDIJ $.
  $}
  ${
    impd.1 $e |- ( ph -> ( ps -> ( ch -> th ) ) ) $.
       impd $p |- ( ph -> ( ( ps /\ ch ) -> th ) ) $=
      ( wa wi com3l imp com12 ) BCFADBCADGABCDEHIJ $.
  $}
  ${
    ex.1 $e |- ( ( ph /\ ps ) -> ch ) $.
       ex $p |- ( ph -> ( ps -> ch ) ) $=
      ( wn wi wa df-an sylbir expi ) ABCABEFEABGCABHDIJ $.
  $}
  ${
    expd.1 $e |- ( ph -> ( ( ps /\ ch ) -> th ) ) $.
       expd $p |- ( ph -> ( ps -> ( ch -> th ) ) ) $=
      ( wi wa com12 ex com3r ) BCADBCADFABCGDEHIJ $.
  $}
   pm3.2 $p |- ( ph -> ( ps -> ( ph /\ ps ) ) ) $=
    ( wa id ex ) ABABCZFDE $.
   pm3.21 $p |- ( ph -> ( ps -> ( ps /\ ph ) ) ) $=
    ( wa pm3.2 com12 ) BABACBADE $.
   pm3.22 $p |- ( ( ph /\ ps ) -> ( ps /\ ph ) ) $=
    ( wa pm3.21 imp ) ABBACABDE $.
   ancom $p |- ( ( ph /\ ps ) <-> ( ps /\ ph ) ) $=
    ( wa pm3.22 impbii ) ABCBACABDBADE $.
  ${
    ancomsd.1 $e |- ( ph -> ( ( ps /\ ch ) -> th ) ) $.
       ancomsd $p |- ( ph -> ( ( ch /\ ps ) -> th ) ) $=
      ( wa ancom syl5bi ) CBFBCFADCBGEH $.
  $}
   simpl $p |- ( ( ph /\ ps ) -> ph ) $=
    ( ax-1 imp ) ABAABCD $.
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
    ancld.1 $e |- ( ph -> ( ps -> ch ) ) $.
       ancld $p |- ( ph -> ( ps -> ( ps /\ ch ) ) ) $=
      ( idd jcad ) ABBCABEDF $.
  $}
   pm3.4 $p |- ( ( ph /\ ps ) -> ( ph -> ps ) ) $=
    ( wa simpr a1d ) ABCBAABDE $.
   pm5.32 $p |- ( ( ph -> ( ps <-> ch ) ) <->
               ( ( ph /\ ps ) <-> ( ph /\ ch ) ) ) $=
    ( wb wi wn wa notbi imbi2i pm5.74 3bitri df-an bibi12i bitr4i ) ABCDZEZABFZ
    EZFZACFZEZFZDZABGZACGZDPAQTDZERUADUCOUFABCHIAQTJRUAHKUDSUEUBABLACLMN $.
  ${
    pm5.32d.1 $e |- ( ph -> ( ps -> ( ch <-> th ) ) ) $.
       pm5.32d $p |- ( ph -> ( ( ps /\ ch ) <-> ( ps /\ th ) ) ) $=
      ( wb wi wa pm5.32 sylib ) ABCDFGBCHBDHFEBCDIJ $.
  $}
  ${
    sylan9.1 $e |- ( ph -> ( ps -> ch ) ) $.
    sylan9.2 $e |- ( th -> ( ch -> ta ) ) $.
       sylan9 $p |- ( ( ph /\ th ) -> ( ps -> ta ) ) $=
      ( wi syl9 imp ) ADBEHABCDEFGIJ $.
  $}
  ${
    sylanbrc.1 $e |- ( ph -> ps ) $.
    sylanbrc.2 $e |- ( ph -> ch ) $.
    sylanbrc.3 $e |- ( th <-> ( ps /\ ch ) ) $.
       sylanbrc $p |- ( ph -> th ) $=
      ( wa jca sylibr ) ABCHDABCEFIGJ $.
  $}
  ${
    bid.1 $e |- ( ph -> ( ps <-> ch ) ) $.
       anbi2d $p |- ( ph -> ( ( th /\ ps ) <-> ( th /\ ch ) ) ) $=
      ( wb a1d pm5.32d ) ADBCABCFDEGH $.
  $}
   anbi2 $p |- ( ( ph <-> ps ) -> ( ( ch /\ ph ) <-> ( ch /\ ps ) ) ) $=
    ( wb id anbi2d ) ABDZABCGEF $.
   $c A. $.  $c setvar $.
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
   $c = $.   ${
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
   ax-4 $a |- ( A. x ( ph -> ps ) -> ( A. x ph -> A. x ps ) ) $.
   alim $p |- ( A. x ( ph -> ps ) -> ( A. x ph -> A. x ps ) ) $=
    ( ax-4 ) ABCD $.
  ${
    alimi.1 $e |- ( ph -> ps ) $.
       alimi $p |- ( A. x ph -> A. x ps ) $=
      ( wi wal alim mpg ) ABEACFBCFECABCGDH $.
  $}
   al2im $p |- ( A. x ( ph -> ( ps -> ch ) ) ->
                                     ( A. x ph -> ( A. x ps -> A. x ch ) ) ) $=
    ( wi wal alim syl6 ) ABCEZEDFADFIDFBDFCDFEAIDGBCDGH $.
  ${
    al2imi.1 $e |- ( ph -> ( ps -> ch ) ) $.
       al2imi $p |- ( A. x ph -> ( A. x ps -> A. x ch ) ) $=
      ( wi wal al2im mpg ) ABCFFADGBDGCDGFFDABCDHEI $.
  $}
   albi $p |- ( A. x ( ph <-> ps ) -> ( A. x ph <-> A. x ps ) ) $=
    ( wb wal biimp al2imi biimpr impbid ) ABDZCEACEBCEJABCABFGJBACABHGI $.
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
    alimdv.1 $e |- ( ph -> ( ps -> ch ) ) $.
       eximdv $p |- ( ph -> ( E. x ps -> E. x ch ) ) $=
      ( ax-5 eximdh ) ABCDADFEG $.
  $}
  ${
    $d x ph $.
    albidv.1 $e |- ( ph -> ( ps <-> ch ) ) $.
       albidv $p |- ( ph -> ( A. x ps <-> A. x ch ) ) $=
      ( ax-5 albidh ) ABCDADFEG $.
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
   weq $p wff x = y $=
    ( cv wceq ) ACBCD $.
  $c [ $.  $c / $.  $c ] $.
   wsb $a wff [ y / x ] ph $.
   df-sb $a |- ( [ y / x ] ph <->
              ( ( x = y -> ph ) /\ E. x ( x = y /\ ph ) ) ) $.
   sbequ2 $p |- ( x = y -> ( [ y / x ] ph -> ph ) ) $=
    ( wsb weq wi wa wex df-sb simplbi com12 ) ABCDZBCEZALMAFMAGBHABCIJK $.
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
  ${
    equcoms.1 $e |- ( x = y -> ph ) $.
       equcoms $p |- ( y = x -> ph ) $=
      ( weq equcomi syl ) CBEBCEACBFDG $.
  $}
   equtr $p |- ( x = y -> ( y = z -> x = z ) ) $=
    ( weq wi ax7 equcoms ) BCDACDEBABACFG $.
   equtrr $p |- ( x = y -> ( z = x -> z = y ) ) $=
    ( weq equtr com12 ) CADABDCBDCABEF $.
  ${
    $d x z $.  $d y z $.
       equvinv $p |- ( x = y <-> E. z ( z = x /\ z = y ) ) $=
      ( weq wa wex ax6ev equtrr ancld eximdv mpi ax7 imp exlimiv impbii ) ABDZC
      ADZCBDZEZCFZPQCFTCAGPQSCPQRABCHIJKSPCQRPCABLMNO $.
  $}
   $c e. $.  ${
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
   $c { $.  $c | $.   $c } $.
  $v A $.
  $v B $.
  $v C $.
    cab $a class { x | ph } $.
   cA $f class A $.
   cB $f class B $.
   cC $f class C $.
 
   df-clab $a |- ( x e. { y | ph } <-> [ x / y ] ph ) $.
   abid $p |- ( x e. { x | ph } <-> ph ) $=
    ( cv cab wcel wsb df-clab sbid bitri ) BCABDEABBFAABBGABHI $.
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
    $d x A $.  $d x B $.  $d x C $.  $d x ph $.
    eleq1d.1 $e |- ( ph -> A = B ) $.
       eleq2d $p |- ( ph -> ( C e. A <-> C e. B ) ) $=
      ( vx cv wceq wa wex wb wal dfcleq sylib anbi2 alexbii syl df-clel 3bitr4g
      wcel ) AFGZDHZUABTZIZFJZUBUACTZIZFJZDBTDCTAUCUFKZFLZUEUHKABCHUJEFBCMNUIUD
      UGFUCUFUBOPQFDBRFDCRS $.
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
   $c _V $.
   cvv $a class _V $.
   df-v $a |- _V = { x | x = x } $.
   vex $p |- x e. _V $=
    ( cv cvv wcel weq equid df-v abeq2i mpbir ) ABCDAAEZAFJACAGHI $.
