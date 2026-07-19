/**
 * Hayat — Audited Mburoja content packs 1–2.
 * Source: “Mburoja e Muslimanit”, Albanian edition, IslamHouse.
 */

import { getMburojaChapter } from './mburoja-catalog.js';

export const MBUROJA_CONTENT_VERSION = 2;
export const MBUROJA_CONTENT_REVIEW_STATUS = 'qualified-review-required';

function textItem(id, titleSq, arabic, transliterationSq, translationSq, repetitions, sourceSq) {
  return {
    id: id,
    type: 'text',
    titleSq: titleSq,
    arabic: arabic,
    transliterationSq: transliterationSq,
    translationSq: translationSq,
    repetitions: repetitions || 1,
    sourceSq: sourceSq,
    reviewStatus: MBUROJA_CONTENT_REVIEW_STATUS
  };
}

function instructionItem(id, titleSq, bodySq, sourceSq) {
  return {
    id: id,
    type: 'instruction',
    titleSq: titleSq,
    bodySq: bodySq,
    sourceSq: sourceSq,
    reviewStatus: MBUROJA_CONTENT_REVIEW_STATUS
  };
}

function quranLink(id, titleSq, surah, ayahStart, ayahEnd, sourceSq) {
  return {
    id: id,
    type: 'quran_link',
    titleSq: titleSq,
    surah: surah,
    ayahStart: ayahStart,
    ayahEnd: ayahEnd,
    sourceSq: sourceSq,
    reviewStatus: MBUROJA_CONTENT_REVIEW_STATUS
  };
}

function chapter(number, guidanceSq, items) {
  return { number: number, guidanceSq: guidanceSq || '', items: items };
}

var RAW_CHAPTERS = [
  chapter(1, 'Këto përkujtime thuhen pas zgjimit nga gjumi.', [
    textItem('wake-praise', 'Lavdia pas zgjimit',
      'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا، وَإِلَيْهِ النُّشُورُ',
      'Elḥamdu lil-lãhil-ledhĩ aḥjãnã ba’ëde mã emãtenã we ilejhin-nushũr.',
      'Lavdia i takon Allahut, i Cili na ngjalli pasi na vdiq dhe, pasi të ringjallemi, tek Ai do të tubohemi.',
      1, 'Buhariu dhe Muslimi · Mburoja, f. 11'),
    textItem('wake-tahlil', 'Përkujtimi gjatë zgjimit natën',
      'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ، رَبِّ اغْفِرْ لِي',
      'Lã ilãhe il-lAll-llãhu waḥdehu lã sherĩke lehu, lehul mulku we lehul ḥamdu we huwe ‘alã kul-li shej’in ḳadĩr. Subḥãnall-llãhi welḥamdu lil-lãhi we lã ilãhe il-lAll-llãhu wall-llãhu ekber, we lã ḥawle we lã ḳuwwete il-lã bil-lãhil ‘alijjil ‘aḍhĩmi, rabbiġfir lĩ.',
      'S’ka të adhuruar me të drejtë përveç Allahut, Një dhe të Pashoq. Vetëm Atij i përket sundimi dhe lavdia, dhe Ai është i Fuqishëm për çdo gjë! Allahu është i dëlirë nga të metat; lavdia i takon Allahut; s’ka të adhuruar me të drejtë përveç Tij; Allahu është më i Madhi; nuk ka lëvizje dhe fuqi veçse me Allahun, të Lartin, Madhështorin. O Zoti im, më fal!',
      1, 'Sahih al-Bukhari · Mburoja, f. 11'),
    textItem('wake-health', 'Falënderimi për shëndetin dhe shpirtin',
      'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ',
      'Elḥamdu lil-lãhil-ledhĩ ‘ãfãnĩ fĩ xhesedĩ, we radde ‘alejje rũḥĩ, we edhine lĩ bi dhikrihi.',
      'Lavdia i takon Allahut, i Cili më dha shëndet në trup, ma ktheu shpirtin dhe më mundësoi ta përmend Atë.',
      1, 'Tirmidhiu · Mburoja, f. 12'),
    quranLink('wake-ali-imran', 'Lexo ajetet e fundit të Ali Imranit', 3, 190, 200,
      'Ali Imran 190–200 · Buhariu dhe Muslimi · Mburoja, f. 12–14')
  ]),
  chapter(2, '', [
    textItem('wear-clothing', 'Kur vesh rrobën',
      'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
      'Elḥamdu lil-lãhil-ledhĩ kesãnĩ hãdhã eth-thewbe, we razeḳanĩhi min ġajri ḥawlin minnĩ we lã ḳuwweh.',
      'Lavdia i takon Allahut, i Cili më mundësoi të vesh këtë rrobë dhe më furnizoi me të, pa lëvizje dhe pa fuqi nga ana ime.',
      1, 'Ebu Davudi, Tirmidhiu dhe Ibn Maxhe · Mburoja, f. 14')
  ]),
  chapter(3, '', [
    textItem('new-clothing', 'Kur vesh një rrobë të re',
      'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
      'All-llãhumme lekel-ḥamdu Ente kesewtenĩhi, es’eluke min ḣajrihi we ḣajri mã ṣuni’a lehu, we e’ũdhu bike min sherrihi we sherri mã ṣuni’a lehu.',
      'O Allah! Ty të takon lavdia! Ti ma dhe këtë veshje. Të kërkoj të mirën e saj dhe të mirën për të cilën është prodhuar; kërkoj të më mbrosh nga e keqja e saj dhe nga përdorimi i saj për të keq.',
      1, 'Ebu Davudi · Mburoja, f. 14–15')
  ]),
  chapter(4, 'Mund të thuhet njëra prej këtyre lutjeve për personin që ka veshur rrobë të re.', [
    textItem('clothing-for-other-one', 'Urimi për rrobën e re',
      'تُبْلِي وَيُخْلِفُ اللَّهُ تَعَالَى',
      'Tublĩ we juḣlifull-llãhu te’ãlã.',
      'Allahu të dhëntë jetëgjatësi në të mirë, që kjo rrobë të vjetërohet dhe Allahu i Lartësuar ta zëvendësojë me të tjera.',
      1, 'Ebu Davudi · Mburoja, f. 15'),
    textItem('clothing-for-other-two', 'Urimi i dytë për rrobën e re',
      'الْبَسْ جَدِيدًا، وَعِشْ حَمِيدًا، وَمُتْ شَهِيدًا',
      'Ilbis xhedĩden, we ‘ish ḥamĩden, we mut shehĩden.',
      'Veshç gjithmonë të reja, jetofsh i nderuar dhe vdeksh si dëshmor!',
      1, 'Ibn Maxhe · Mburoja, f. 15')
  ]),
  chapter(5, 'Thuhet kur zhvishen rrobat.', [
    textItem('undress-bismillah', 'Kur zhvish rrobat', 'بِسْمِ اللَّهِ', 'Bismil-lãh.',
      'Me emrin e Allahut.', 1, 'Mburoja, f. 15')
  ]),
  chapter(6, 'Thuhet para hyrjes në tualet.', [
    textItem('enter-toilet', 'Kur hyn në tualet',
      'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
      'Bismil-lãh, All-llãhumme innĩ e’ũdhu bike minel-ḣubuthi wel-ḣabãith.',
      'Me emrin e Allahut. O Allah! Të lutem, më mbroj nga shejtanët dhe shejtanet!',
      1, 'Buhariu dhe Muslimi · Mburoja, f. 16')
  ]),
  chapter(7, 'Thuhet pas daljes nga tualeti.', [
    textItem('leave-toilet', 'Kur del nga tualeti', 'غُفْرَانَكَ', 'Ġufrãneke.',
      'Kërkoj faljen Tënde, o Zot!', 1, 'Tirmidhiu · Mburoja, f. 16')
  ]),
  chapter(8, 'Thuhet para fillimit të abdesit.', [
    textItem('before-wudu', 'Para abdesit', 'بِسْمِ اللَّهِ', 'Bismil-lãh.',
      'Me emrin e Allahut.', 1, 'Ebu Davudi · Mburoja, f. 17')
  ]),
  chapter(9, 'Këto përkujtime thuhen pas përfundimit të abdesit.', [
    textItem('after-wudu-shahadah', 'Dëshmia pas abdesit',
      'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
      'Eshhedu en lã ilãhe il-lAll-llãhu waḥdehu lã sherĩke lehu, we eshhedu enne Muḥammeden ‘abduhu we rasũluhu.',
      'Dëshmoj se nuk ka të adhuruar me të drejtë përveç Allahut, Një dhe të Pashoq, dhe dëshmoj se Muhamedi është rob dhe i Dërguari i Tij.',
      1, 'Sahih Muslim · Mburoja, f. 17'),
    textItem('after-wudu-repentance', 'Lutja për pendim dhe pastërti',
      'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ',
      'All-llãhummexh’alnĩ minet-tewwãbĩne, wexh’alnĩ minel-muteṭahhirĩn.',
      'O Allah! Më bëj prej atyre që pendohen dhe më bëj prej atyre që pastrohen!',
      1, 'Tirmidhiu · Mburoja, f. 17'),
    textItem('after-wudu-glory', 'Lartësimi dhe kërkimi i faljes',
      'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
      'Subḥãnekall-llãhumme we biḥamdike, eshhedu en lã ilãhe il-lã Ente, estaġfiruke we etũbu ilejk.',
      'O Allah, Ti je pa të meta dhe Ty të takon lavdia! Dëshmoj se nuk ka të adhuruar me të drejtë përveç Teje! Ty të kërkoj falje dhe tek Ti kthehem me pendim!',
      1, 'En-Nesai · Mburoja, f. 17–18')
  ]),
  chapter(10, 'Këto lutje thuhen kur del nga shtëpia.', [
    textItem('leave-home-trust', 'Mbështetja tek Allahu',
      'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
      'Bismil-lãh, tewekkeltu ‘alall-llãhi, we lã ḥawle we lã ḳuwwete il-lã bil-lãh.',
      'Në emër të Allahut! Jam mbështetur tek Allahu! Nuk ka lëvizje dhe fuqi për asgjë veçse me ndihmën e Allahut.',
      1, 'Ebu Davudi dhe Tirmidhiu · Mburoja, f. 18'),
    textItem('leave-home-protection', 'Mbrojtja nga humbja dhe padrejtësia',
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ، أَوْ أُضَلَّ، أَوْ أَزِلَّ، أَوْ أُزَلَّ، أَوْ أَظْلِمَ، أَوْ أُظْلَمَ، أَوْ أَجْهَلَ، أَوْ يُجْهَلَ عَلَيَّ',
      'All-llãhumme innĩ e’ũdhu bike en eḍil-le ew uḍal-le, ew ezil-le ew uzel-le, ew eḍhlime ew uḍhleme, ew exhhele ew juxhhele ‘alejje.',
      'O Allah! Më ruaj që të mos humbas e të mos më çojë dikush në humbje; të mos gaboj e të mos më shtyjë kush në gabim; të mos bëj padrejtësi e të mos më bëhet padrejtësi; të mos sillem keq e të mos sillet keq askush me mua!',
      1, 'Katër Sunenet · Mburoja, f. 18')
  ]),
  chapter(11, 'Pas kësaj i jepet selam familjes.', [
    textItem('enter-home', 'Kur hyn në shtëpi',
      'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
      'Bismil-lãhi welexh’nã, we bismil-lãhi ḣaraxh’nã, we ‘alall-llãhi rabbinã tewekkelnã.',
      'Me emrin e Allahut hyjmë në shtëpi e po me emrin e Tij dalim, dhe Allahut, Zotit tonë, iu mbështetëm.',
      1, 'Ebu Davudi · Mburoja, f. 18–19')
  ]),
  chapter(12, 'Lutja që thuhet gjatë rrugës për në xhami.', [
    textItem('going-to-mosque-light', 'Lutja e dritës',
      'اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا، وَفِي لِسَانِي نُورًا، وَفِي سَمْعِي نُورًا، وَفِي بَصَرِي نُورًا، وَمِنْ فَوْقِي نُورًا، وَمِنْ تَحْتِي نُورًا، وَعَنْ يَمِينِي نُورًا، وَعَنْ شِمَالِي نُورًا، وَمِنْ أَمَامِي نُورًا، وَمِنْ خَلْفِي نُورًا، وَاجْعَلْ فِي نَفْسِي نُورًا، وَأَعْظِمْ لِي نُورًا، وَاجْعَلْ لِي نُورًا، وَاجْعَلْنِي نُورًا، اللَّهُمَّ أَعْطِنِي نُورًا، وَاجْعَلْ فِي عَصَبِي نُورًا، وَفِي لَحْمِي نُورًا، وَفِي دَمِي نُورًا، وَفِي شَعْرِي نُورًا، وَفِي بَشَرِي نُورًا، وَاجْعَلْ لِي نُورًا فِي قَبْرِي، وَنُورًا فِي عِظَامِي، وَزِدْنِي نُورًا، وَهَبْ لِي نُورًا عَلَى نُورٍ',
      'All-llãhummexh’al fĩ ḳalbĩ nũran, we fĩ lisãnĩ nũran, we fĩ sem’ĩ nũran, we fĩ beṣarĩ nũran, we min fewḳĩ nũran, we min taḥtĩ nũran, we ‘an jemĩnĩ nũran, we ‘an shimãlĩ nũran, we min emãmĩ nũran, we min ḣalfĩ nũran, wexh’al fĩ nefsĩ nũran, we a’ëḍhim lĩ nũran, wexh’al lĩ nũran, wexh’alnĩ nũrã. All-llãhumme a’ëṭinĩ nũran, wexh’al fĩ ‘aṣabĩ nũran, we fĩ laḥmĩ nũran, we fĩ demĩ nũran, we fĩ sha’ërĩ nũran, we fĩ besherĩ nũrã. All-llãhummexh’al lĩ nũran fĩ ḳabrĩ, we nũran fĩ ‘iḍhãmĩ, we zidnĩ nũran, we heb lĩ nũran ‘alã nũr.',
      'O Allah! Më jep dritë në zemër, në gjuhë, në dëgjim e në shikim. Më bëj dritë nga lart dhe nga poshtë, nga e djathta dhe nga e majta, nga përpara dhe nga prapa. Më bëj dritë në vetvete, ma zmadho dritën, bëj për mua dritë dhe më bëj mua dritë. Më jep dritë në trup, në gjak, në flokë e në lëkurë; ma ndriço varrin dhe kockat; ma shto dritën dhe më dhuro dritë mbi dritë!',
      1, 'Buhariu, Muslimi dhe transmetime plotësuese · Mburoja, f. 19–20')
  ]),
  chapter(13, 'Në xhami hyhet me këmbën e djathtë.', [
    textItem('enter-mosque-protection', 'Mbrojtja nga shejtani',
      'أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ',
      'E’ũdhu bil-lãhil ‘aḍhĩm, we bi wexhhihil kerĩm, we ṣulṭãnihil ḳadĩm, minesh-shejṭãnirr-rraxhĩm.',
      'Kërkoj nga Allahu i Madhërishëm, me Fytyrën e Tij Fisnike dhe me pushtetin e Tij të përhershëm, të më mbrojë nga shejtani i mallkuar!',
      1, 'Ebu Davudi · Mburoja, f. 21'),
    textItem('enter-mosque-mercy', 'Hapja e dyerve të mëshirës',
      'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
      'Bismil-lãh, weṣ-ṣalãtu wes-selãmu ‘alã Rasũlil-lãh. All-llãhumme’ftaḥ lĩ ebwãbe raḥmetike.',
      'Në emër të Allahut; salavati dhe selami qofshin për të Dërguarin e Allahut. O Allah! Më hap dyert e mëshirës Tënde!',
      1, 'Muslimi dhe transmetime plotësuese · Mburoja, f. 21')
  ]),
  chapter(14, 'Nga xhamia dilet me këmbën e majtë.', [
    textItem('leave-mosque', 'Kur del nga xhamia',
      'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ، اللَّهُمَّ اعْصِمْنِي مِنَ الشَّيْطَانِ الرَّجِيمِ',
      'Bismil-lãh, weṣ-ṣalãtu wes-selãmu ‘alã Rasũlil-lãh. All-llãhumme innĩ es’eluke min faḍlike. All-llãhumme i’ëṣimnĩ minesh-shejṭãnirr-rraxhĩm.',
      'Në emër të Allahut; salavati dhe selami qofshin për të Dërguarin e Allahut. O Allah! Të lutem të më japësh nga mirësitë e Tua. O Allah, më mbroj nga shejtani i mallkuar!',
      1, 'Muslimi dhe Ibn Maxhe · Mburoja, f. 21–22')
  ]),
  chapter(34, 'Këto lutje thuhen për largimin e ankthit, shqetësimit dhe trishtimit.', [
    textItem('distress-quran-heart', 'Kurani, pranverë e zemrës',
      'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
      'All-llãhumme, innĩ ‘abduke, ibnu ‘abdike, ibnu emetike! Nãṣijetĩ bi jedike! Mãḍin fijje ḥukmuke! ‘Adlun fijje ḳaḍãuke! Es’eluke bi kul-lismin huwe lek, semmejte bihi nefsek, ew enzeltehu fĩ kitãbike, ew ‘al-lemtehu eḥaden min ḣalḳike ew iste’therte bihi fĩ ‘ilmil ġajbi ‘indek, en texh’alel Kur’ãne rabĩ‘a ḳalbĩ, we nũra ṣadrĩ, we xhelãe ḥuznĩ, we dhehãbe hemmĩ!',
      'O Allah, unë jam robi Yt, biri i robit Tënd, biri i robëreshës Tënde! Qenia ime është në dorën Tënde! Vendimi Yt mbi mua sigurisht që ndodh! Të drejta janë të gjitha caktimet e Tua për mua! Po të drejtohem me të gjithë emrat e Tu, me të cilët e ke emërtuar Veten, apo të cilët i ke shpallur në Librin Tënd, apo të cilët ia ke mësuar ndonjë prej krijesave të Tua, apo të cilët i ke ruajtur në dijen Tënde të fshehtë: që ta bësh Kuranin pranverë të zemrës sime, dritë të gjoksit tim, largues të trishtimit tim dhe heqës të ankthit tim!',
      1, 'Ahmedi; Albani e vlerëson hadithin të saktë · Mburoja, f. 80–81'),
    textItem('distress-protection', 'Mbrojtja nga shqetësimi dhe rëndimi',
      'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
      'All-llãhumme innĩ e‘ũdhu bike minel hemmi wel ḥazeni, wel ‘axhzi wel keseli, wel buḣli wel xhubni, we ḍale‘id-dejni we ġalebetirr-rrixhãl.',
      'O Allah! Më mbroj nga shqetësimi dhe trishtimi, nga paaftësia dhe përtacia, nga koprracia dhe frika, nga rëndimi i borxhit dhe shtypja e njerëzve!',
      1, 'Buhariu · Mburoja, f. 81')
  ]),
  chapter(35, 'Këto lutje thuhen në gjendje sprove dhe mundimi.', [
    textItem('trial-great-throne', 'Zoti i Fronit madhështor',
      'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
      'Lã ilãhe il-lall-llãhu, El ‘Aḍhĩmul Ḥalĩm! Lã ilãhe il-lall-llãhu, Rabbul ‘arshil ‘aḍhĩm! Lã ilãhe il-lall-llãhu Rabbus-semawãti, we Rabbul erḍi, we Rabbul ‘arshil kerĩm!',
      'Nuk ka të adhuruar me të drejtë veç Allahut, të Madhërishmit, Duruesit! Nuk ka të adhuruar me të drejtë veç Allahut, Zotit të Fronit madhështor! Nuk ka të adhuruar me të drejtë veç Allahut, Zotit të shtatë qiejve, Zotit të tokës, Zotit të Fronit të Nderuar!',
      1, 'Buhariu dhe Muslimi · Mburoja, f. 82'),
    textItem('trial-mercy', 'Në mëshirën Tënde shpresoj',
      'اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَهَ إِلَّا أَنْتَ',
      'All-llãhumme! Raḥmeteke erxhũ! Felã tekilnĩ ilã nefsĩ ṭarfete ‘ajnin, we aṣliḥ lĩ she’nĩ kul-lehu, lã ilãhe il-lã Ente!',
      'O Allah! Në mëshirën Tënde shpresoj! Mos më lër të mbështetem në veten time as sa një pulitje sysh dhe m’i rregullo mua të gjitha çështjet e mia! Nuk ka të adhuruar me të drejtë veç Teje!',
      1, 'Ebu Davudi dhe Ahmedi · Mburoja, f. 82'),
    textItem('trial-yunus', 'Lutja e Junusit', 'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
      'Lã ilãhe il-lã Ente, Subḥãneke, innĩ kuntu mineḍh-ḍhãlimĩn!',
      'Nuk ka të adhuruar me të drejtë veç Teje! I dëlirë je Ti nga çdo e metë! Vërtet, unë jam gjynahqar!', 1,
      'Tirmidhiu · Mburoja, f. 82'),
    textItem('trial-allah-my-lord', 'Allahu është Zoti im', 'اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا',
      'Allãhu, Allãhu Rabbĩ! Lã ushriku bihi shej’en.', 'Allahu, Allahu është Zoti im! Unë nuk shoqëroj asgjë e asnjë me Të!', 1,
      'Ebu Davudi · Mburoja, f. 83')
  ]),
  chapter(36, 'Këto lutje thuhen kur përballemi me armikun ose me njeriun me pushtet.', [
    textItem('enemy-protection', 'Mbrojtja nga e keqja e tyre', 'اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ، وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ',
      'All-llãhumme innã nexh’aluke fĩ nuḥũrihim, we ne‘ũdhu bike min shurũrihim.', 'O Allah, të lutemi të na i shmangësh ata dhe të na ruash prej të këqijave të tyre.', 1,
      'Ebu Davudi dhe Hakimi · Mburoja, f. 83'),
    textItem('enemy-support', 'Ti je ndihmësi im', 'اللَّهُمَّ أَنْتَ عَضُدِي، وَأَنْتَ نَصِيرِي، بِكَ أَحُولُ، وَبِكَ أَصُولُ، وَبِكَ أُقَاتِلُ',
      'All-llãhumme Ente aḍudĩ, we Ente neṣĩrĩ, bike eḥũlu, we bike eṣũlu, we bike uḳãtil.', 'O Allah! Ti je krahu im, Ti je ndihmësi im, me ndihmën Tënde arrij të shmang kurthin e armikut, të bëj mësymje shpartalluese dhe t’i luftoj armiqtë.', 1,
      'Ebu Davudi dhe Tirmidhiu · Mburoja, f. 83'),
    textItem('enemy-sufficient', 'Na mjafton Allahu', 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', 'Ḥasbunall-llãhu we ni‘ëmel Wekĩl.',
      'Na mjafton Allahu, dhe Ai për ne është Rregulluesi më i mirë i punëve!', 1, 'Buhariu · Mburoja, f. 83–84')
  ]),
  chapter(37, 'Te vendi “filani, i biri i filanit” përmendet emri i personit nga i cili kërkohet mbrojtje.', [
    textItem('ruler-protection', 'Mbrojtja nga zullumi',
      'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ، وَرَبَّ الْعَرْشِ الْعَظِيمِ، كُنْ لِي جَارًا مِنْ فُلَانِ بْنِ فُلَانٍ، وَأَحْزَابِهِ مِنْ خَلَائِقِكَ، أَنْ يَفْرُطَ عَلَيَّ أَحَدٌ مِنْهُمْ أَوْ يَطْغَى، عَزَّ جَارُكَ، وَجَلَّ ثَنَاؤُكَ، وَلَا إِلَهَ إِلَّا أَنْتَ',
      'All-llãhumme Rabbes-semãwãtis-seb‘i we Rabbel ‘arshil ‘aḍhĩm, kun lĩ xhãran min fulãn ibni fulãn, we aḥzãbihi min ḣalãiḳike, en jefruṭa ‘alejje eḥadun minhum ew jeṭġã. ‘Azze xhãruke, we xhel-le thenãuke, we lã ilãhe il-lã Ente.',
      'O Allah! Zoti i shtatë qiejve dhe Zoti i Fronit madhështor! Më mbroj nga dëmi i filanit të birit të filanit dhe grupeve të tij prej krijesave Tua, që të mos më sulmojë ndonjëri prej tyre dhe të mos më bëjë padrejtësi! Ngadhënjyes dhe i fortë qoftë ai që të kërkon mbrojtje Ty! E lartë është lavdia Jote! Nuk ka të adhuruar me të drejtë veç Teje!', 1,
      'Buhariu në Edebul Mufred · Mburoja, f. 84'),
    textItem('ruler-protection-long', 'Mbrojtja e Allahut nga dëmi i tyre',
      'اللَّهُ أَكْبَرُ، اللَّهُ أَعَزُّ مِنْ خَلْقِهِ جَمِيعًا، اللَّهُ أَعَزُّ مِمَّا أَخَافُ وَأَحْذَرُ، وَأَعُوذُ بِاللَّهِ الَّذِي لَا إِلَهَ إِلَّا هُوَ، الْمُمْسِكِ السَّمَاوَاتِ السَّبْعَ أَنْ يَقَعْنَ عَلَى الْأَرْضِ إِلَّا بِإِذْنِهِ، مِنْ شَرِّ عَبْدِكَ فُلَانٍ، وَجُنُودِهِ وَأَتْبَاعِهِ وَأَشْيَاعِهِ مِنَ الْجِنِّ وَالْإِنْسِ، اللَّهُمَّ كُنْ لِي جَارًا مِنْ شَرِّهِمْ، جَلَّ ثَنَاؤُكَ، وَعَزَّ جَارُكَ، وَتَبَارَكَ اسْمُكَ، وَلَا إِلَهَ غَيْرُكَ',
      'All-llãhu ekber, All-llãhu e‘azzu min ḣalḳihi xhemĩ‘an, All-llãhu e‘azzu mimmã eḣãfu we aḥdheru, we e‘ũdhu bil-lãhil-ledhĩ lã ilãhe il-lã huwel mumsikus-semawãtis-seb‘i en jeḳa‘ëne ‘alel erḍi il-lã bi idhnihi, min sherri ‘abdike fulãn, we xhunũdihi we etbã‘ihi we eshjã‘ihi minel xhinni wel insi. All-llãhumme kun lĩ xhãran min sherrihim, xhel-le thenãuke we ‘azze xhãruke we tebãrekesmuke we lã ilãhe ġajruke.',
      'Allahu është më i madhi. Allahu është më i fortë se të gjitha krijesat e Tij. Allahu është më i fuqishëm se krijesa që unë e kam frikë dhe i ruhem. Unë kërkoj mbrojtje tek Allahu, përveç të Cilit nuk ka hyjni të vërtetë, dhe i Cili i mban shtatë qiejt të mos bien në Tokë veçse me lejen e Tij; nga sherri i robit Tënd, filanit, ushtarëve, pasuesve dhe përkrahësve të tij prej xhindëve dhe njerëzve. O Allah, më mbroj nga dëmi i tyre. E lartë është Lavdia Jote! Ngadhënjyes dhe i fortë qoftë ai që të kërkon mbrojtje Ty! Emri Yt është i bekuar! Nuk ka të adhuruar të vërtetë përveç Teje!', 3,
      'Buhariu në Edebul Mufred · Mburoja, f. 84–85')
  ]),
  chapter(38, '', [textItem('against-enemy', 'Lutja kundër armikut', 'اللَّهُمَّ مُنْزِلَ الْكِتَابِ، سَرِيعَ الْحِسَابِ، اهْزِمِ الْأَحْزَابَ، اللَّهُمَّ اهْزِمْهُمْ وَزَلْزِلْهُمْ',
    'All-llãhumme munzilel kitãb, serĩ‘al ḥisãb, ihzimil aḥzãb. All-llãhumme ihzimhum we zelzilhum.', 'O Allah, o Zbritësi i Librit, o Ti që e bën shpejt llogarinë e krijesave, mposhti ushtritë! O Allah, mposhti ata dhe tronditi, që të mos kenë qëndresë.', 1, 'Muslimi · Mburoja, f. 86')]),
  chapter(39, '', [textItem('fear-group', 'Mbrojtja prej një grupi', 'اللَّهُمَّ اكْفِنِيهِمْ بِمَا شِئْتَ', 'All-llãhumme ikfinĩhim bimã shi’te!', 'O Allah, më ruaj prej tyre me mënyrën që Ti do!', 1, 'Muslimi · Mburoja, f. 86')]),
  chapter(40, 'Kërkohet mbrojtja e Allahut dhe hiqet vëmendja nga dyshimi.', [
    textItem('faith-doubt-refuge', 'Kërkimi i mbrojtjes', 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'E‘ũdhu bil-lãhi minesh-shejṭãnirr-rraxhĩm.', 'I mbështetem Allahut të më mbrojë nga shejtani i mallkuar.', 1, 'Buhariu dhe Muslimi · Mburoja, f. 86'),
    textItem('faith-doubt-belief', 'Pohimi i besimit', 'آمَنْتُ بِاللَّهِ وَرُسُلِهِ', 'Ãmentu bil-lãhi we rusulihi.', 'Besova në Allahun dhe të Dërguarit e Tij.', 1, 'Muslimi · Mburoja, f. 87'),
    quranLink('faith-doubt-hadid', 'Lexo El-Hadid, ajeti 3', 57, 3, 3, 'El-Hadid 57:3 · Ebu Davudi · Mburoja, f. 87')
  ]),
  chapter(41, 'Këto lutje bëhen për shlyerjen e borxheve.', [
    textItem('debt-halal-provision', 'Mjaftimi me hallall', 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ', 'All-llãhumme ikfinĩ bi ḥalãlike ‘an ḥarãmike, we eġninĩ bi faḍlike ‘am-men siwãke.', 'O Allah, më ruaj me rrizk të mjaftueshëm hallall nga harami, dhe m’i plotëso nevojat me mirësinë Tënde, që të mos kem nevojë për askënd tjetër veç Teje.', 1, 'Tirmidhiu · Mburoja, f. 87'),
    textItem('debt-burden', 'Mbrojtja nga rëndimi i borxhit', 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ', 'All-llãhumme innĩ e‘ũdhu bike minel hemmi wel ḥazeni, wel ‘axhzi wel keseli, wel buḣli wel xhubni, we ḍale‘id-dejni we ġalebetirr-rrixhãl!', 'O Allah! Më mbroj nga ankthi dhe dëshpërimi, nga paaftësia dhe përtacia, nga koprracia dhe frika, nga zhytja në borxhe dhe shtypja e burrave mizorë!', 1, 'Buhariu · Mburoja, f. 88')
  ]),
  chapter(42, 'Pas kërkimit të mbrojtjes, pështyhet lehtë tri herë në të majtë.', [textItem('prayer-whisper-refuge', 'Mbrojtja gjatë namazit dhe leximit', 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'E‘ũdhu bil-lãhi minesh-shejṭãnirr-rraxhĩm.', 'I mbështetem Allahut të më mbrojë nga shejtani i mallkuar.', 1, 'Muslimi · Mburoja, f. 88')]),
  chapter(43, '', [textItem('difficulty-ease', 'Kur vështirësohen çështjet', 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا', 'All-llãhumme lã sehle il-lã mã xhe‘altehu sehlen, we Ente texh‘alul ḥazne idhã shi’te sehlã!', 'O Allah! Asgjë nuk është e lehtë përveç asaj që Ti e bën të lehtë. Ti e bën të vështirën, nëse dëshiron, të lehtë.', 1, 'Ibn Hibani · Mburoja, f. 88–89')]),
  chapter(44, 'Pas një gjynahu: pastrohu mirë me abdes ose gusul, fal dy rekate namaz dhe kërkoji falje Allahut.', [
    instructionItem('sin-repentance-action', 'Pendimi pas gjynahut', 'Pejgamberi ﷺ ka treguar se robi që, pasi bën një gjynah, pastrohet mirë, fal dy rekate dhe i kërkon falje Allahut, Allahu ia fal gjynahun.', 'Ebu Davudi dhe Tirmidhiu · Mburoja, f. 89')
  ]),
  chapter(45, 'Krahas kërkimit të mbrojtjes, burimi udhëzon thirrjen e ezanit, dhikrin ditor dhe leximin e Kuranit.', [
    textItem('whispers-refuge', 'Kërkimi i mbrojtjes nga shejtani', 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'E‘ũdhu bil-lãhi minesh-shejṭãnirr-rraxhĩm.', 'I mbështetem Allahut të më mbrojë nga shejtani i mallkuar.', 1, 'Ebu Davudi · Mburoja, f. 89'),
    instructionItem('whispers-practices', 'Veprime të përmendura në burim', 'Thirre ezanin; bëj dhikrin ditor; lexo Kuran. Burimi përmend veçanërisht suren El-Bekare, Ajetin Kursi, dy ajetet e fundit të El-Bekares dhe dhikret e ligjshme të mëngjesit, mbrëmjes, gjumit, shtëpisë e xhamisë.', 'Buhariu dhe Muslimi; Muslimi · Mburoja, f. 89–90')
  ]),
  chapter(46, '', [textItem('disliked-decree', 'Kur ndodh diçka që nuk të pëlqen', 'قَدَرُ اللَّهِ وَمَا شَاءَ فَعَلَ', 'Ḳaderull-llãhi we mã shãe fe‘al.', 'Ky qe kaderi i Allahut. Atë që deshi Ai, e bëri.', 1, 'Muslimi · Mburoja, f. 90')]),
  chapter(69, 'Përmende emrin e Allahut para ushqimit. Nëse harrohet në fillim, përdoret formula përkatëse.', [
    textItem('food-bismillah', 'Para ushqimit', 'بِسْمِ اللَّهِ', 'Bismil-lãh.',
      'Me emrin e Allahut.', 1, 'Ebu Davudi · Mburoja, f. 106'),
    textItem('food-forgot-bismillah', 'Kur harrohet në fillim',
      'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ',
      'Bismil-lãhi fĩ ewwelihi we ãḣirihi.',
      'Me emrin e Allahut, në fillim dhe në fund të ushqimit!',
      1, 'Ebu Davudi · Mburoja, f. 106'),
    textItem('food-blessing', 'Lutja për begatinë e ushqimit',
      'اللَّهُمَّ بَارِكْ لَنَا فِيهِ، وَأَطْعِمْنَا خَيْرًا مِنْهُ',
      'All-llãhumme bãrik lenã fĩhi, we eṭ’imnã ḣajran minhu.',
      'O Allah! Na e begato këtë ushqim dhe na jep diçka më të mirë se ky!',
      1, 'Tirmidhiu · Mburoja, f. 106–107'),
    textItem('milk-blessing', 'Kur pihet qumësht',
      'اللَّهُمَّ بَارِكْ لَنَا فِيهِ، وَزِدْنَا مِنْهُ',
      'All-llãhumme bãrik lenã fĩhi, we zidnã minhu.',
      'O Allah! Na e bëj të begatshëm dhe na e shto!',
      1, 'Tirmidhiu · Mburoja, f. 107')
  ]),
  chapter(70, 'Këto janë dy forma falënderimi pas ushqimit.', [
    textItem('after-food-praise', 'Falënderimi pas ushqimit',
      'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا، وَرَزَقَنِيهِ، مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
      'Elḥamdu lil-lãhil-ledhĩ eṭ’amenĩ hãdhã, we razeḳanĩhi min ġajri ḥawlin minnĩ we lã ḳuwweh.',
      'Lavdia i takon Allahut, i Cili më ushqeu dhe më furnizoi me këtë ushqim, pa asnjë manovrim nga unë dhe pa fuqi të timen!',
      1, 'Ebu Davudi · Mburoja, f. 107'),
    textItem('after-food-abundant-praise', 'Lavdërimi i bollshëm',
      'الْحَمْدُ لِلَّهِ حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ، غَيْرَ مَكْفِيٍّ وَلَا مُوَدَّعٍ وَلَا مُسْتَغْنًى عَنْهُ رَبَّنَا',
      'Elḥamdu lil-lãhi ḥamden kethĩran ṭajjiben mubãraken fĩhi, ġajra mekfijjin we lã muwedde’in, we lã musteġnen ‘anhu Rabbenã.',
      'Lavdia i takon Allahut! Atij i bëjmë shumë lavdi të dëlira dhe të bekuara. Ne nuk do ta lëmë lavdërimin e Tij dhe gjithmonë do të kemi nevojë për Të. O Zoti ynë, pranoje lavdërimin tonë!',
      1, 'Sahih al-Bukhari · Mburoja, f. 107–108')
  ])
];

export const MBUROJA_CONTENT = Object.freeze(RAW_CHAPTERS.map(function (entry) {
  return Object.freeze({
    number: entry.number,
    guidanceSq: entry.guidanceSq,
    items: Object.freeze(entry.items.map(function (item) { return Object.freeze(item); }))
  });
}));

var BY_CHAPTER = new Map(MBUROJA_CONTENT.map(function (entry) { return [entry.number, entry]; }));

export function getMburojaContent(number) {
  var value = typeof number === 'string' && /^\d+$/.test(number) ? Number(number) : number;
  return Number.isInteger(value) ? (BY_CHAPTER.get(value) || null) : null;
}

export function validateMburojaContent() {
  var expected = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,34,35,36,37,38,39,40,41,42,43,44,45,46,69,70];
  var ids = new Set();
  return MBUROJA_CONTENT.length === expected.length && MBUROJA_CONTENT.every(function (entry, index) {
    if (entry.number !== expected[index] || !getMburojaChapter(entry.number) ||
        typeof entry.guidanceSq !== 'string' || !entry.items.length || !Object.isFrozen(entry)) return false;
    return entry.items.every(function (item) {
      if (!item || ids.has(item.id) || typeof item.titleSq !== 'string' || !item.titleSq ||
          typeof item.sourceSq !== 'string' || !item.sourceSq ||
          item.reviewStatus !== MBUROJA_CONTENT_REVIEW_STATUS) return false;
      ids.add(item.id);
      if (item.type === 'quran_link') {
        return Number.isInteger(item.surah) && Number.isInteger(item.ayahStart) &&
          Number.isInteger(item.ayahEnd) && item.ayahEnd >= item.ayahStart;
      }
      if (item.type === 'instruction') return typeof item.bodySq === 'string' && item.bodySq.length > 0;
      return item.type === 'text' && typeof item.arabic === 'string' && item.arabic.length > 0 &&
        typeof item.transliterationSq === 'string' && item.transliterationSq.length > 0 &&
        typeof item.translationSq === 'string' && item.translationSq.length > 0 &&
        Number.isInteger(item.repetitions) && item.repetitions >= 1;
    });
  });
}

if (!validateMburojaContent()) throw new Error('Mburoja content pack 2 failed validation');
