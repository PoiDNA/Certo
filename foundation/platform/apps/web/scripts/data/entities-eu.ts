/**
 * Real EU entities database — public data only
 * Sources: government registries, stock exchanges, NGO directories
 *
 * Structure: ENTITIES[country_iso2][sector] = Array<{ name, city }>
 */

export type EntityRecord = { name: string; city: string };
export type SectorData = { publiczny: EntityRecord[]; prywatny: EntityRecord[]; pozarzadowy: EntityRecord[] };
export type EntitiesDB = Record<string, SectorData>;

export const ENTITIES: EntitiesDB = {

  // ═══════════════════════════════════════════════════════════
  // POLSKA (PL)
  // ═══════════════════════════════════════════════════════════
  PL: {
    publiczny: [
      // Urzędy miast
      { name: 'Urząd Miasta Stołecznego Warszawy', city: 'WARSZAWA' },
      { name: 'Urząd Miasta Krakowa', city: 'KRAKÓW' },
      { name: 'Urząd Miasta Wrocławia', city: 'WROCŁAW' },
      { name: 'Urząd Miasta Poznania', city: 'POZNAŃ' },
      { name: 'Urząd Miasta Gdańska', city: 'GDAŃSK' },
      { name: 'Urząd Miasta Łodzi', city: 'ŁÓDŹ' },
      { name: 'Urząd Miasta Katowice', city: 'KATOWICE' },
      { name: 'Urząd Miasta Szczecin', city: 'SZCZECIN' },
      { name: 'Urząd Miasta Lublin', city: 'LUBLIN' },
      { name: 'Urząd Miasta Bydgoszcz', city: 'BYDGOSZCZ' },
      { name: 'Urząd Miasta Białystok', city: 'BIAŁYSTOK' },
      { name: 'Urząd Miasta Rzeszów', city: 'RZESZÓW' },
      { name: 'Urząd Miasta Toruń', city: 'TORUŃ' },
      { name: 'Urząd Miasta Olsztyn', city: 'OLSZTYN' },
      { name: 'Urząd Miasta Opole', city: 'OPOLE' },
      { name: 'Urząd Miasta Kielce', city: 'KIELCE' },
      { name: 'Urząd Miasta Gliwice', city: 'GLIWICE' },
      { name: 'Urząd Miasta Zielona Góra', city: 'ZIELONA GÓRA' },
      // Szpitale
      { name: 'Szpital Kliniczny im. Heliodora Święcickiego', city: 'POZNAŃ' },
      { name: 'Centralny Szpital Kliniczny MSWiA', city: 'WARSZAWA' },
      { name: 'Szpital Uniwersytecki w Krakowie', city: 'KRAKÓW' },
      { name: 'Uniwersytecki Szpital Kliniczny we Wrocławiu', city: 'WROCŁAW' },
      { name: 'Uniwersyteckie Centrum Kliniczne w Gdańsku', city: 'GDAŃSK' },
      { name: 'Szpital Kliniczny im. Karola Jonschera', city: 'POZNAŃ' },
      { name: 'Instytut Centrum Zdrowia Matki Polki', city: 'ŁÓDŹ' },
      { name: 'Narodowy Instytut Onkologii im. Marii Skłodowskiej-Curie', city: 'WARSZAWA' },
      // Spółki komunalne
      { name: 'Miejskie Przedsiębiorstwo Wodociągów i Kanalizacji w Warszawie', city: 'WARSZAWA' },
      { name: 'Miejskie Przedsiębiorstwo Komunikacyjne w Krakowie', city: 'KRAKÓW' },
      { name: 'Tramwaje Warszawskie Sp. z o.o.', city: 'WARSZAWA' },
      { name: 'Zarząd Transportu Miejskiego w Poznaniu', city: 'POZNAŃ' },
      { name: 'Gdańskie Autobusy i Tramwaje Sp. z o.o.', city: 'GDAŃSK' },
      // Kultura i sport
      { name: 'Teatr Wielki — Opera Narodowa', city: 'WARSZAWA' },
      { name: 'Muzeum Narodowe w Warszawie', city: 'WARSZAWA' },
      { name: 'Filharmonia Narodowa', city: 'WARSZAWA' },
      { name: 'Stadion Narodowy w Warszawie', city: 'WARSZAWA' },
      { name: 'Muzeum Narodowe w Krakowie', city: 'KRAKÓW' },
      { name: 'Centrum Nauki Kopernik', city: 'WARSZAWA' },
      { name: 'TAURON Arena Kraków', city: 'KRAKÓW' },
      // Uczelnie
      { name: 'Uniwersytet Warszawski', city: 'WARSZAWA' },
      { name: 'Uniwersytet Jagielloński', city: 'KRAKÓW' },
      { name: 'Politechnika Warszawska', city: 'WARSZAWA' },
      { name: 'Politechnika Wrocławska', city: 'WROCŁAW' },
      { name: 'Uniwersytet im. Adama Mickiewicza', city: 'POZNAŃ' },
    ],
    prywatny: [
      // GPW — WIG20 + mWIG40
      { name: 'PKN ORLEN S.A.', city: 'PŁOCK' },
      { name: 'PKO Bank Polski S.A.', city: 'WARSZAWA' },
      { name: 'PZU S.A.', city: 'WARSZAWA' },
      { name: 'KGHM Polska Miedź S.A.', city: 'LUBIN' },
      { name: 'PGE Polska Grupa Energetyczna S.A.', city: 'WARSZAWA' },
      { name: 'LPP S.A.', city: 'GDAŃSK' },
      { name: 'CD Projekt S.A.', city: 'WARSZAWA' },
      { name: 'Allegro.eu S.A.', city: 'POZNAŃ' },
      { name: 'Dino Polska S.A.', city: 'KROTOSZYN' },
      { name: 'CCC S.A.', city: 'POLKOWICE' },
      { name: 'ENEA S.A.', city: 'POZNAŃ' },
      { name: 'Tauron Polska Energia S.A.', city: 'KATOWICE' },
      { name: 'Grupa LOTOS S.A.', city: 'GDAŃSK' },
      { name: 'mBank S.A.', city: 'WARSZAWA' },
      { name: 'Bank Millennium S.A.', city: 'WARSZAWA' },
      { name: 'Cyfrowy Polsat S.A.', city: 'WARSZAWA' },
      { name: 'Budimex S.A.', city: 'WARSZAWA' },
      { name: 'Asseco Poland S.A.', city: 'RZESZÓW' },
      { name: 'Comarch S.A.', city: 'KRAKÓW' },
      { name: 'Grupa Żywiec S.A.', city: 'ŻYWIEC' },
      { name: 'AmRest Holdings SE', city: 'WROCŁAW' },
      { name: 'Inter Cars S.A.', city: 'WARSZAWA' },
      { name: 'Kruk S.A.', city: 'WROCŁAW' },
    ],
    pozarzadowy: [
      { name: 'Fundacja Wielka Orkiestra Świątecznej Pomocy', city: 'WARSZAWA' },
      { name: 'Caritas Polska', city: 'WARSZAWA' },
      { name: 'Polski Czerwony Krzyż', city: 'WARSZAWA' },
      { name: 'Fundacja TVN', city: 'WARSZAWA' },
      { name: 'Amnesty International Polska', city: 'WARSZAWA' },
      { name: 'Helsińska Fundacja Praw Człowieka', city: 'WARSZAWA' },
      { name: 'Fundacja im. Stefana Batorego', city: 'WARSZAWA' },
      { name: 'Polskie Stowarzyszenie na rzecz Osób z Niepełnosprawnością Intelektualną', city: 'WARSZAWA' },
      { name: 'Fundacja Szlachetna Paczka', city: 'KRAKÓW' },
      { name: 'SOS Wioski Dziecięce w Polsce', city: 'WARSZAWA' },
      { name: 'WWF Polska', city: 'WARSZAWA' },
      { name: 'Fundacja Rozwoju Społeczeństwa Informacyjnego', city: 'WARSZAWA' },
      { name: 'Stowarzyszenie Klon/Jawor', city: 'WARSZAWA' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // NIEMCY (DE)
  // ═══════════════════════════════════════════════════════════
  DE: {
    publiczny: [
      { name: 'Stadtverwaltung Berlin', city: 'BERLIN' },
      { name: 'Landeshauptstadt München', city: 'MÜNCHEN' },
      { name: 'Freie und Hansestadt Hamburg', city: 'HAMBURG' },
      { name: 'Stadt Köln', city: 'KÖLN' },
      { name: 'Stadt Frankfurt am Main', city: 'FRANKFURT' },
      { name: 'Landeshauptstadt Stuttgart', city: 'STUTTGART' },
      { name: 'Stadt Düsseldorf', city: 'DÜSSELDORF' },
      { name: 'Stadt Leipzig', city: 'LEIPZIG' },
      { name: 'Stadt Dresden', city: 'DRESDEN' },
      { name: 'Landeshauptstadt Hannover', city: 'HANNOVER' },
      { name: 'Charité — Universitätsmedizin Berlin', city: 'BERLIN' },
      { name: 'Universitätsklinikum Heidelberg', city: 'HEIDELBERG' },
      { name: 'Universitätsklinikum München', city: 'MÜNCHEN' },
      { name: 'Klinikum der Universität Frankfurt', city: 'FRANKFURT' },
      { name: 'Berliner Verkehrsbetriebe (BVG)', city: 'BERLIN' },
      { name: 'Münchner Verkehrsgesellschaft', city: 'MÜNCHEN' },
      { name: 'Hamburger Hochbahn AG', city: 'HAMBURG' },
      { name: 'Berliner Wasserbetriebe', city: 'BERLIN' },
      { name: 'Staatsoper Unter den Linden', city: 'BERLIN' },
      { name: 'Bayerische Staatsoper', city: 'MÜNCHEN' },
      { name: 'Humboldt-Universität zu Berlin', city: 'BERLIN' },
      { name: 'Ludwig-Maximilians-Universität München', city: 'MÜNCHEN' },
      { name: 'Technische Universität München', city: 'MÜNCHEN' },
    ],
    prywatny: [
      // DAX 40
      { name: 'Volkswagen AG', city: 'WOLFSBURG' },
      { name: 'Siemens AG', city: 'MÜNCHEN' },
      { name: 'Deutsche Telekom AG', city: 'BONN' },
      { name: 'SAP SE', city: 'WALLDORF' },
      { name: 'Allianz SE', city: 'MÜNCHEN' },
      { name: 'BASF SE', city: 'LUDWIGSHAFEN' },
      { name: 'BMW AG', city: 'MÜNCHEN' },
      { name: 'Mercedes-Benz Group AG', city: 'STUTTGART' },
      { name: 'Deutsche Post DHL Group', city: 'BONN' },
      { name: 'Bayer AG', city: 'LEVERKUSEN' },
      { name: 'Infineon Technologies AG', city: 'NEUBIBERG' },
      { name: 'Deutsche Bank AG', city: 'FRANKFURT' },
      { name: 'Adidas AG', city: 'HERZOGENAURACH' },
      { name: 'Henkel AG & Co. KGaA', city: 'DÜSSELDORF' },
      { name: 'E.ON SE', city: 'ESSEN' },
      { name: 'RWE AG', city: 'ESSEN' },
      { name: 'Continental AG', city: 'HANNOVER' },
      { name: 'Deutsche Börse AG', city: 'FRANKFURT' },
      { name: 'Merck KGaA', city: 'DARMSTADT' },
      { name: 'Vonovia SE', city: 'BOCHUM' },
    ],
    pozarzadowy: [
      { name: 'Deutsches Rotes Kreuz', city: 'BERLIN' },
      { name: 'Caritas Deutschland', city: 'FREIBURG' },
      { name: 'Diakonie Deutschland', city: 'BERLIN' },
      { name: 'Arbeiterwohlfahrt (AWO)', city: 'BERLIN' },
      { name: 'Amnesty International Deutschland', city: 'BERLIN' },
      { name: 'Greenpeace Deutschland', city: 'HAMBURG' },
      { name: 'NABU — Naturschutzbund Deutschland', city: 'BERLIN' },
      { name: 'Transparency International Deutschland', city: 'BERLIN' },
      { name: 'SOS-Kinderdorf Deutschland', city: 'MÜNCHEN' },
      { name: 'Deutsche Welthungerhilfe', city: 'BONN' },
      { name: 'Bertelsmann Stiftung', city: 'GÜTERSLOH' },
      { name: 'Robert Bosch Stiftung', city: 'STUTTGART' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // FRANCJA (FR)
  // ═══════════════════════════════════════════════════════════
  FR: {
    publiczny: [
      { name: 'Mairie de Paris', city: 'PARIS' },
      { name: 'Ville de Marseille', city: 'MARSEILLE' },
      { name: 'Ville de Lyon', city: 'LYON' },
      { name: 'Ville de Toulouse', city: 'TOULOUSE' },
      { name: 'Ville de Nice', city: 'NICE' },
      { name: 'Ville de Nantes', city: 'NANTES' },
      { name: 'Ville de Strasbourg', city: 'STRASBOURG' },
      { name: 'Ville de Bordeaux', city: 'BORDEAUX' },
      { name: 'Ville de Lille', city: 'LILLE' },
      { name: 'Assistance Publique — Hôpitaux de Paris', city: 'PARIS' },
      { name: 'Hospices Civils de Lyon', city: 'LYON' },
      { name: 'CHU de Toulouse', city: 'TOULOUSE' },
      { name: 'CHU de Bordeaux', city: 'BORDEAUX' },
      { name: 'RATP — Régie Autonome des Transports Parisiens', city: 'PARIS' },
      { name: 'Sorbonne Université', city: 'PARIS' },
      { name: 'Université Paris-Saclay', city: 'PARIS' },
      { name: 'Opéra National de Paris', city: 'PARIS' },
      { name: 'Musée du Louvre', city: 'PARIS' },
    ],
    prywatny: [
      // CAC 40
      { name: 'LVMH Moët Hennessy Louis Vuitton SE', city: 'PARIS' },
      { name: 'TotalEnergies SE', city: 'COURBEVOIE' },
      { name: 'L\'Oréal S.A.', city: 'CLICHY' },
      { name: 'Sanofi S.A.', city: 'PARIS' },
      { name: 'BNP Paribas S.A.', city: 'PARIS' },
      { name: 'AXA S.A.', city: 'PARIS' },
      { name: 'Schneider Electric SE', city: 'RUEIL-MALMAISON' },
      { name: 'Air Liquide S.A.', city: 'PARIS' },
      { name: 'Danone S.A.', city: 'PARIS' },
      { name: 'Société Générale S.A.', city: 'PARIS' },
      { name: 'Vinci S.A.', city: 'NANTERRE' },
      { name: 'Orange S.A.', city: 'PARIS' },
      { name: 'Renault Group', city: 'BOULOGNE-BILLANCOURT' },
      { name: 'Carrefour S.A.', city: 'MASSY' },
      { name: 'Michelin S.A.', city: 'CLERMONT-FERRAND' },
    ],
    pozarzadowy: [
      { name: 'Croix-Rouge française', city: 'PARIS' },
      { name: 'Médecins Sans Frontières', city: 'PARIS' },
      { name: 'Secours Populaire Français', city: 'PARIS' },
      { name: 'Fondation de France', city: 'PARIS' },
      { name: 'Emmaüs France', city: 'PARIS' },
      { name: 'Greenpeace France', city: 'PARIS' },
      { name: 'Amnesty International France', city: 'PARIS' },
      { name: 'Transparency International France', city: 'PARIS' },
      { name: 'Action contre la Faim', city: 'PARIS' },
      { name: 'Fondation Abbé Pierre', city: 'PARIS' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // WŁOCHY (IT)
  // ═══════════════════════════════════════════════════════════
  IT: {
    publiczny: [
      { name: 'Comune di Roma', city: 'ROMA' },
      { name: 'Comune di Milano', city: 'MILANO' },
      { name: 'Comune di Napoli', city: 'NAPOLI' },
      { name: 'Comune di Torino', city: 'TORINO' },
      { name: 'Comune di Firenze', city: 'FIRENZE' },
      { name: 'Comune di Bologna', city: 'BOLOGNA' },
      { name: 'Comune di Genova', city: 'GENOVA' },
      { name: 'Comune di Palermo', city: 'PALERMO' },
      { name: 'Comune di Venezia', city: 'VENEZIA' },
      { name: 'Policlinico Universitario Agostino Gemelli', city: 'ROMA' },
      { name: 'Ospedale San Raffaele', city: 'MILANO' },
      { name: 'Ospedale Maggiore Policlinico', city: 'MILANO' },
      { name: 'Azienda Ospedaliera di Padova', city: 'PADOVA' },
      { name: 'ATM — Azienda Trasporti Milanesi', city: 'MILANO' },
      { name: 'ATAC — Azienda per i Trasporti Autoferrotranviari del Comune di Roma', city: 'ROMA' },
      { name: 'Teatro alla Scala', city: 'MILANO' },
      { name: 'Università di Bologna', city: 'BOLOGNA' },
      { name: 'Sapienza Università di Roma', city: 'ROMA' },
    ],
    prywatny: [
      // FTSE MIB
      { name: 'Eni S.p.A.', city: 'ROMA' },
      { name: 'Enel S.p.A.', city: 'ROMA' },
      { name: 'Intesa Sanpaolo S.p.A.', city: 'TORINO' },
      { name: 'UniCredit S.p.A.', city: 'MILANO' },
      { name: 'Ferrari N.V.', city: 'MARANELLO' },
      { name: 'Stellantis N.V.', city: 'TORINO' },
      { name: 'Generali S.p.A.', city: 'TRIESTE' },
      { name: 'Leonardo S.p.A.', city: 'ROMA' },
      { name: 'Telecom Italia S.p.A.', city: 'ROMA' },
      { name: 'Poste Italiane S.p.A.', city: 'ROMA' },
      { name: 'Pirelli & C. S.p.A.', city: 'MILANO' },
      { name: 'Luxottica Group S.p.A.', city: 'MILANO' },
      { name: 'Campari Group', city: 'MILANO' },
      { name: 'Prada S.p.A.', city: 'MILANO' },
    ],
    pozarzadowy: [
      { name: 'Croce Rossa Italiana', city: 'ROMA' },
      { name: 'Caritas Italiana', city: 'ROMA' },
      { name: 'Emergency ONG Onlus', city: 'MILANO' },
      { name: 'Amnesty International Italia', city: 'ROMA' },
      { name: 'WWF Italia', city: 'ROMA' },
      { name: 'Legambiente', city: 'ROMA' },
      { name: 'Save the Children Italia', city: 'ROMA' },
      { name: 'Fondazione Cariplo', city: 'MILANO' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // HISZPANIA (ES)
  // ═══════════════════════════════════════════════════════════
  ES: {
    publiczny: [
      { name: 'Ayuntamiento de Madrid', city: 'MADRID' },
      { name: 'Ajuntament de Barcelona', city: 'BARCELONA' },
      { name: 'Ayuntamiento de Valencia', city: 'VALENCIA' },
      { name: 'Ayuntamiento de Sevilla', city: 'SEVILLA' },
      { name: 'Ayuntamiento de Zaragoza', city: 'ZARAGOZA' },
      { name: 'Ayuntamiento de Málaga', city: 'MÁLAGA' },
      { name: 'Ayuntamiento de Bilbao', city: 'BILBAO' },
      { name: 'Hospital Universitario La Paz', city: 'MADRID' },
      { name: 'Hospital Clínic de Barcelona', city: 'BARCELONA' },
      { name: 'Hospital Universitario Vall d\'Hebron', city: 'BARCELONA' },
      { name: 'Metro de Madrid', city: 'MADRID' },
      { name: 'Transports Metropolitans de Barcelona', city: 'BARCELONA' },
      { name: 'Universidad Complutense de Madrid', city: 'MADRID' },
      { name: 'Universitat de Barcelona', city: 'BARCELONA' },
      { name: 'Museo del Prado', city: 'MADRID' },
    ],
    prywatny: [
      // IBEX 35
      { name: 'Inditex S.A.', city: 'ARTEIXO' },
      { name: 'Banco Santander S.A.', city: 'SANTANDER' },
      { name: 'Iberdrola S.A.', city: 'BILBAO' },
      { name: 'Telefónica S.A.', city: 'MADRID' },
      { name: 'BBVA S.A.', city: 'BILBAO' },
      { name: 'Repsol S.A.', city: 'MADRID' },
      { name: 'CaixaBank S.A.', city: 'VALENCIA' },
      { name: 'Amadeus IT Group S.A.', city: 'MADRID' },
      { name: 'Ferrovial SE', city: 'MADRID' },
      { name: 'Endesa S.A.', city: 'MADRID' },
      { name: 'Naturgy Energy Group S.A.', city: 'MADRID' },
      { name: 'Grifols S.A.', city: 'BARCELONA' },
    ],
    pozarzadowy: [
      { name: 'Cruz Roja Española', city: 'MADRID' },
      { name: 'Cáritas Española', city: 'MADRID' },
      { name: 'Amnistía Internacional España', city: 'MADRID' },
      { name: 'Greenpeace España', city: 'MADRID' },
      { name: 'Oxfam Intermón', city: 'BARCELONA' },
      { name: 'Médicos Sin Fronteras España', city: 'BARCELONA' },
      { name: 'Fundación ONCE', city: 'MADRID' },
      { name: 'Transparency International España', city: 'MADRID' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // HOLANDIA (NL)
  // ═══════════════════════════════════════════════════════════
  NL: {
    publiczny: [
      { name: 'Gemeente Amsterdam', city: 'AMSTERDAM' },
      { name: 'Gemeente Rotterdam', city: 'ROTTERDAM' },
      { name: 'Gemeente Den Haag', city: 'DEN HAAG' },
      { name: 'Gemeente Utrecht', city: 'UTRECHT' },
      { name: 'Gemeente Eindhoven', city: 'EINDHOVEN' },
      { name: 'Amsterdam UMC', city: 'AMSTERDAM' },
      { name: 'Erasmus MC', city: 'ROTTERDAM' },
      { name: 'GVB Amsterdam', city: 'AMSTERDAM' },
      { name: 'Universiteit van Amsterdam', city: 'AMSTERDAM' },
    ],
    prywatny: [
      { name: 'Royal Dutch Shell plc', city: 'DEN HAAG' },
      { name: 'ASML Holding N.V.', city: 'VELDHOVEN' },
      { name: 'Unilever N.V.', city: 'ROTTERDAM' },
      { name: 'ING Groep N.V.', city: 'AMSTERDAM' },
      { name: 'Philips N.V.', city: 'AMSTERDAM' },
      { name: 'Heineken N.V.', city: 'AMSTERDAM' },
      { name: 'ABN AMRO Bank N.V.', city: 'AMSTERDAM' },
      { name: 'Randstad N.V.', city: 'DIEMEN' },
      { name: 'Ahold Delhaize N.V.', city: 'ZAANDAM' },
      { name: 'Wolters Kluwer N.V.', city: 'ALPHEN AAN DEN RIJN' },
    ],
    pozarzadowy: [
      { name: 'Het Nederlandse Rode Kruis', city: 'DEN HAAG' },
      { name: 'Oxfam Novib', city: 'DEN HAAG' },
      { name: 'Greenpeace Nederland', city: 'AMSTERDAM' },
      { name: 'Amnesty International Nederland', city: 'AMSTERDAM' },
      { name: 'Artsen zonder Grenzen Nederland', city: 'AMSTERDAM' },
    ],
  },

  // ═══════════════════════════════════════════════════════════
  // REMAINING EU COUNTRIES (compact format)
  // ═══════════════════════════════════════════════════════════

  RO: {
    publiczny: [
      { name: 'Primăria Municipiului București', city: 'BUCUREȘTI' },
      { name: 'Primăria Cluj-Napoca', city: 'CLUJ-NAPOCA' },
      { name: 'Primăria Timișoara', city: 'TIMIȘOARA' },
      { name: 'Primăria Iași', city: 'IAȘI' },
      { name: 'Spitalul Universitar de Urgență București', city: 'BUCUREȘTI' },
      { name: 'Universitatea din București', city: 'BUCUREȘTI' },
    ],
    prywatny: [
      { name: 'OMV Petrom S.A.', city: 'BUCUREȘTI' },
      { name: 'Banca Transilvania S.A.', city: 'CLUJ-NAPOCA' },
      { name: 'Romgaz S.A.', city: 'MEDIAȘ' },
      { name: 'Nuclearelectrica S.A.', city: 'BUCUREȘTI' },
      { name: 'Electrica S.A.', city: 'BUCUREȘTI' },
      { name: 'BRD — Groupe Société Générale', city: 'BUCUREȘTI' },
    ],
    pozarzadowy: [
      { name: 'Crucea Roșie Română', city: 'BUCUREȘTI' },
      { name: 'Fundația pentru Dezvoltarea Societății Civile', city: 'BUCUREȘTI' },
      { name: 'SOS Satele Copiilor România', city: 'BUCUREȘTI' },
    ],
  },

  BE: {
    publiczny: [
      { name: 'Ville de Bruxelles', city: 'BRUXELLES' },
      { name: 'Stad Antwerpen', city: 'ANTWERPEN' },
      { name: 'Stad Gent', city: 'GENT' },
      { name: 'UZ Leuven', city: 'LEUVEN' },
      { name: 'STIB-MIVB Bruxelles', city: 'BRUXELLES' },
      { name: 'Université libre de Bruxelles', city: 'BRUXELLES' },
    ],
    prywatny: [
      { name: 'Anheuser-Busch InBev SA/NV', city: 'LEUVEN' },
      { name: 'KBC Group NV', city: 'BRUXELLES' },
      { name: 'UCB S.A.', city: 'BRUXELLES' },
      { name: 'Solvay S.A.', city: 'BRUXELLES' },
      { name: 'Umicore S.A.', city: 'BRUXELLES' },
      { name: 'Proximus S.A.', city: 'BRUXELLES' },
    ],
    pozarzadowy: [
      { name: 'Croix-Rouge de Belgique', city: 'BRUXELLES' },
      { name: 'Amnesty International Belgique', city: 'BRUXELLES' },
      { name: 'Fondation Roi Baudouin', city: 'BRUXELLES' },
    ],
  },

  CZ: {
    publiczny: [
      { name: 'Magistrát hlavního města Prahy', city: 'PRAHA' },
      { name: 'Statutární město Brno', city: 'BRNO' },
      { name: 'Statutární město Ostrava', city: 'OSTRAVA' },
      { name: 'Fakultní nemocnice v Motole', city: 'PRAHA' },
      { name: 'Univerzita Karlova', city: 'PRAHA' },
      { name: 'Dopravní podnik hl. m. Prahy', city: 'PRAHA' },
    ],
    prywatny: [
      { name: 'ČEZ a.s.', city: 'PRAHA' },
      { name: 'Komerční banka a.s.', city: 'PRAHA' },
      { name: 'Česká spořitelna a.s.', city: 'PRAHA' },
      { name: 'Škoda Auto a.s.', city: 'MLADÁ BOLESLAV' },
      { name: 'Avast Software s.r.o.', city: 'PRAHA' },
      { name: 'Moneta Money Bank a.s.', city: 'PRAHA' },
    ],
    pozarzadowy: [
      { name: 'Český červený kříž', city: 'PRAHA' },
      { name: 'Člověk v tísni', city: 'PRAHA' },
      { name: 'Transparency International Česká republika', city: 'PRAHA' },
    ],
  },

  PT: {
    publiczny: [
      { name: 'Câmara Municipal de Lisboa', city: 'LISBOA' },
      { name: 'Câmara Municipal do Porto', city: 'PORTO' },
      { name: 'Hospital de Santa Maria', city: 'LISBOA' },
      { name: 'Universidade de Lisboa', city: 'LISBOA' },
      { name: 'Metropolitano de Lisboa', city: 'LISBOA' },
    ],
    prywatny: [
      { name: 'EDP — Energias de Portugal S.A.', city: 'LISBOA' },
      { name: 'Galp Energia S.A.', city: 'LISBOA' },
      { name: 'Jerónimo Martins SGPS S.A.', city: 'LISBOA' },
      { name: 'Banco Comercial Português S.A.', city: 'LISBOA' },
      { name: 'Sonae SGPS S.A.', city: 'PORTO' },
    ],
    pozarzadowy: [
      { name: 'Cruz Vermelha Portuguesa', city: 'LISBOA' },
      { name: 'Amnistia Internacional Portugal', city: 'LISBOA' },
      { name: 'Fundação Calouste Gulbenkian', city: 'LISBOA' },
    ],
  },

  SE: {
    publiczny: [
      { name: 'Stockholms stad', city: 'STOCKHOLM' },
      { name: 'Göteborgs stad', city: 'GÖTEBORG' },
      { name: 'Malmö stad', city: 'MALMÖ' },
      { name: 'Karolinska Universitetssjukhuset', city: 'STOCKHOLM' },
      { name: 'Stockholms universitet', city: 'STOCKHOLM' },
    ],
    prywatny: [
      { name: 'Volvo Group AB', city: 'GÖTEBORG' },
      { name: 'Ericsson AB', city: 'STOCKHOLM' },
      { name: 'H&M Hennes & Mauritz AB', city: 'STOCKHOLM' },
      { name: 'Spotify Technology S.A.', city: 'STOCKHOLM' },
      { name: 'Atlas Copco AB', city: 'NACKA' },
      { name: 'Nordea Bank Abp', city: 'STOCKHOLM' },
      { name: 'IKEA (Inter IKEA Holding B.V.)', city: 'ÄLMHULT' },
    ],
    pozarzadowy: [
      { name: 'Svenska Röda Korset', city: 'STOCKHOLM' },
      { name: 'Amnesty International Sverige', city: 'STOCKHOLM' },
      { name: 'Greenpeace Norden', city: 'STOCKHOLM' },
    ],
  },

  HU: {
    publiczny: [
      { name: 'Budapest Főváros Önkormányzata', city: 'BUDAPEST' },
      { name: 'Debrecen Megyei Jogú Város Önkormányzata', city: 'DEBRECEN' },
      { name: 'Semmelweis Egyetem', city: 'BUDAPEST' },
      { name: 'BKV Zrt.', city: 'BUDAPEST' },
    ],
    prywatny: [
      { name: 'MOL Magyar Olaj- és Gázipari Nyrt.', city: 'BUDAPEST' },
      { name: 'OTP Bank Nyrt.', city: 'BUDAPEST' },
      { name: 'Richter Gedeon Nyrt.', city: 'BUDAPEST' },
      { name: 'Magyar Telekom Nyrt.', city: 'BUDAPEST' },
    ],
    pozarzadowy: [
      { name: 'Magyar Vöröskereszt', city: 'BUDAPEST' },
      { name: 'Transparency International Magyarország', city: 'BUDAPEST' },
    ],
  },

  AT: {
    publiczny: [
      { name: 'Stadt Wien', city: 'WIEN' },
      { name: 'Stadt Graz', city: 'GRAZ' },
      { name: 'Medizinische Universität Wien', city: 'WIEN' },
      { name: 'Wiener Linien', city: 'WIEN' },
      { name: 'Universität Wien', city: 'WIEN' },
    ],
    prywatny: [
      { name: 'OMV AG', city: 'WIEN' },
      { name: 'Erste Group Bank AG', city: 'WIEN' },
      { name: 'voestalpine AG', city: 'LINZ' },
      { name: 'Verbund AG', city: 'WIEN' },
      { name: 'Raiffeisen Bank International AG', city: 'WIEN' },
      { name: 'Red Bull GmbH', city: 'FUSCHL AM SEE' },
    ],
    pozarzadowy: [
      { name: 'Österreichisches Rotes Kreuz', city: 'WIEN' },
      { name: 'Caritas Österreich', city: 'WIEN' },
      { name: 'SOS-Kinderdorf Österreich', city: 'INNSBRUCK' },
    ],
  },

  BG: {
    publiczny: [
      { name: 'Столична община', city: 'SOFIA' },
      { name: 'Община Пловдив', city: 'PLOVDIV' },
      { name: 'Община Варна', city: 'VARNA' },
      { name: 'Софийски университет „Св. Климент Охридски"', city: 'SOFIA' },
    ],
    prywatny: [
      { name: 'Българска Енергийна Холдинг ЕАД', city: 'SOFIA' },
      { name: 'Софарма АД', city: 'SOFIA' },
      { name: 'Първа инвестиционна банка АД', city: 'SOFIA' },
    ],
    pozarzadowy: [
      { name: 'Български Червен кръст', city: 'SOFIA' },
      { name: 'Transparency International Bulgaria', city: 'SOFIA' },
    ],
  },

  DK: {
    publiczny: [
      { name: 'Københavns Kommune', city: 'KØBENHAVN' },
      { name: 'Aarhus Kommune', city: 'AARHUS' },
      { name: 'Rigshospitalet', city: 'KØBENHAVN' },
      { name: 'Københavns Universitet', city: 'KØBENHAVN' },
    ],
    prywatny: [
      { name: 'Novo Nordisk A/S', city: 'BAGSVÆRD' },
      { name: 'A.P. Møller — Mærsk A/S', city: 'KØBENHAVN' },
      { name: 'Vestas Wind Systems A/S', city: 'AARHUS' },
      { name: 'Carlsberg Group', city: 'KØBENHAVN' },
      { name: 'Danske Bank A/S', city: 'KØBENHAVN' },
      { name: 'Ørsted A/S', city: 'FREDERICIA' },
    ],
    pozarzadowy: [
      { name: 'Dansk Røde Kors', city: 'KØBENHAVN' },
      { name: 'Amnesty International Danmark', city: 'KØBENHAVN' },
    ],
  },

  FI: {
    publiczny: [
      { name: 'Helsingin kaupunki', city: 'HELSINKI' },
      { name: 'Tampereen kaupunki', city: 'TAMPERE' },
      { name: 'Helsingin yliopisto', city: 'HELSINKI' },
      { name: 'HUS — Helsingin ja Uudenmaan sairaanhoitopiiri', city: 'HELSINKI' },
    ],
    prywatny: [
      { name: 'Nokia Oyj', city: 'ESPOO' },
      { name: 'KONE Oyj', city: 'ESPOO' },
      { name: 'UPM-Kymmene Oyj', city: 'HELSINKI' },
      { name: 'Stora Enso Oyj', city: 'HELSINKI' },
      { name: 'Neste Oyj', city: 'ESPOO' },
      { name: 'Wärtsilä Oyj', city: 'HELSINKI' },
    ],
    pozarzadowy: [
      { name: 'Suomen Punainen Risti', city: 'HELSINKI' },
      { name: 'Amnesty International Suomen osasto', city: 'HELSINKI' },
    ],
  },

  SK: {
    publiczny: [
      { name: 'Magistrát hlavného mesta SR Bratislavy', city: 'BRATISLAVA' },
      { name: 'Mesto Košice', city: 'KOŠICE' },
      { name: 'Univerzita Komenského v Bratislave', city: 'BRATISLAVA' },
      { name: 'Univerzitná nemocnica Bratislava', city: 'BRATISLAVA' },
    ],
    prywatny: [
      { name: 'Slovenský plynárenský priemysel a.s.', city: 'BRATISLAVA' },
      { name: 'Tatra banka a.s.', city: 'BRATISLAVA' },
      { name: 'Slovnaft a.s.', city: 'BRATISLAVA' },
      { name: 'Slovenské elektrárne a.s.', city: 'BRATISLAVA' },
    ],
    pozarzadowy: [
      { name: 'Slovenský Červený kríž', city: 'BRATISLAVA' },
      { name: 'Transparency International Slovensko', city: 'BRATISLAVA' },
    ],
  },

  IE: {
    publiczny: [
      { name: 'Dublin City Council', city: 'DUBLIN' },
      { name: 'Cork City Council', city: 'CORK' },
      { name: 'St. James\'s Hospital', city: 'DUBLIN' },
      { name: 'Trinity College Dublin', city: 'DUBLIN' },
    ],
    prywatny: [
      { name: 'CRH plc', city: 'DUBLIN' },
      { name: 'Ryanair Holdings plc', city: 'DUBLIN' },
      { name: 'Kerry Group plc', city: 'TRALEE' },
      { name: 'AIB Group plc', city: 'DUBLIN' },
      { name: 'Bank of Ireland Group plc', city: 'DUBLIN' },
      { name: 'Smurfit Kappa Group plc', city: 'DUBLIN' },
    ],
    pozarzadowy: [
      { name: 'Irish Red Cross', city: 'DUBLIN' },
      { name: 'Amnesty International Ireland', city: 'DUBLIN' },
      { name: 'Transparency International Ireland', city: 'DUBLIN' },
    ],
  },

  HR: {
    publiczny: [
      { name: 'Grad Zagreb', city: 'ZAGREB' },
      { name: 'Grad Split', city: 'SPLIT' },
      { name: 'KBC Zagreb', city: 'ZAGREB' },
      { name: 'Sveučilište u Zagrebu', city: 'ZAGREB' },
    ],
    prywatny: [
      { name: 'INA d.d.', city: 'ZAGREB' },
      { name: 'HT — Hrvatske telekomunikacije d.d.', city: 'ZAGREB' },
      { name: 'Podravka d.d.', city: 'KOPRIVNICA' },
      { name: 'Atlantic Grupa d.d.', city: 'ZAGREB' },
    ],
    pozarzadowy: [
      { name: 'Hrvatski Crveni križ', city: 'ZAGREB' },
      { name: 'Transparency International Hrvatska', city: 'ZAGREB' },
    ],
  },

  LT: {
    publiczny: [
      { name: 'Vilniaus miesto savivaldybė', city: 'VILNIUS' },
      { name: 'Kauno miesto savivaldybė', city: 'KAUNAS' },
      { name: 'Vilniaus universitetas', city: 'VILNIUS' },
    ],
    prywatny: [
      { name: 'Ignitis grupė AB', city: 'VILNIUS' },
      { name: 'Telia Lietuva AB', city: 'VILNIUS' },
      { name: 'Maxima grupė', city: 'VILNIUS' },
    ],
    pozarzadowy: [
      { name: 'Lietuvos Raudonasis Kryžius', city: 'VILNIUS' },
      { name: 'Transparency International Lietuva', city: 'VILNIUS' },
    ],
  },

  SI: {
    publiczny: [
      { name: 'Mestna občina Ljubljana', city: 'LJUBLJANA' },
      { name: 'Mestna občina Maribor', city: 'MARIBOR' },
      { name: 'Univerzitetni klinični center Ljubljana', city: 'LJUBLJANA' },
      { name: 'Univerza v Ljubljani', city: 'LJUBLJANA' },
    ],
    prywatny: [
      { name: 'Krka d.d.', city: 'NOVO MESTO' },
      { name: 'Petrol d.d.', city: 'LJUBLJANA' },
      { name: 'Zavarovalnica Triglav d.d.', city: 'LJUBLJANA' },
      { name: 'NLB d.d.', city: 'LJUBLJANA' },
    ],
    pozarzadowy: [
      { name: 'Rdeči križ Slovenije', city: 'LJUBLJANA' },
      { name: 'Transparency International Slovenia', city: 'LJUBLJANA' },
    ],
  },

  LV: {
    publiczny: [
      { name: 'Rīgas dome', city: 'RĪGA' },
      { name: 'Latvijas Universitāte', city: 'RĪGA' },
      { name: 'Paula Stradiņa klīniskā universitātes slimnīca', city: 'RĪGA' },
    ],
    prywatny: [
      { name: 'Latvenergo AS', city: 'RĪGA' },
      { name: 'airBaltic Corporation AS', city: 'RĪGA' },
      { name: 'Latvijas Gāze AS', city: 'RĪGA' },
    ],
    pozarzadowy: [
      { name: 'Latvijas Sarkanais Krusts', city: 'RĪGA' },
      { name: 'Transparency International Latvia', city: 'RĪGA' },
    ],
  },

  EE: {
    publiczny: [
      { name: 'Tallinna Linnavalitsus', city: 'TALLINN' },
      { name: 'Tartu Linnavalitsus', city: 'TARTU' },
      { name: 'Tartu Ülikool', city: 'TARTU' },
      { name: 'Tallinna Tehnikaülikool', city: 'TALLINN' },
    ],
    prywatny: [
      { name: 'Eesti Energia AS', city: 'TALLINN' },
      { name: 'Tallink Grupp AS', city: 'TALLINN' },
      { name: 'LHV Group AS', city: 'TALLINN' },
      { name: 'Bolt Technology OÜ', city: 'TALLINN' },
    ],
    pozarzadowy: [
      { name: 'Eesti Punane Rist', city: 'TALLINN' },
      { name: 'Transparency International Estonia', city: 'TALLINN' },
    ],
  },

  CY: {
    publiczny: [
      { name: 'Δήμος Λευκωσίας', city: 'NICOSIA' },
      { name: 'Δήμος Λεμεσού', city: 'LIMASSOL' },
      { name: 'Πανεπιστήμιο Κύπρου', city: 'NICOSIA' },
    ],
    prywatny: [
      { name: 'Bank of Cyprus Holdings plc', city: 'NICOSIA' },
      { name: 'Hellenic Bank Public Company Ltd', city: 'NICOSIA' },
      { name: 'Cyprus Telecommunications Authority', city: 'NICOSIA' },
    ],
    pozarzadowy: [
      { name: 'Cyprus Red Cross Society', city: 'NICOSIA' },
    ],
  },

  LU: {
    publiczny: [
      { name: 'Ville de Luxembourg', city: 'LUXEMBOURG' },
      { name: 'Centre Hospitalier de Luxembourg', city: 'LUXEMBOURG' },
      { name: 'Université du Luxembourg', city: 'LUXEMBOURG' },
    ],
    prywatny: [
      { name: 'ArcelorMittal S.A.', city: 'LUXEMBOURG' },
      { name: 'Tenaris S.A.', city: 'LUXEMBOURG' },
      { name: 'SES S.A.', city: 'BETZDORF' },
      { name: 'Eurofins Scientific SE', city: 'LUXEMBOURG' },
    ],
    pozarzadowy: [
      { name: 'Croix-Rouge luxembourgeoise', city: 'LUXEMBOURG' },
    ],
  },

  MT: {
    publiczny: [
      { name: 'Valletta Local Council', city: 'VALLETTA' },
      { name: 'Mater Dei Hospital', city: 'MSIDA' },
      { name: 'University of Malta', city: 'MSIDA' },
    ],
    prywatny: [
      { name: 'Bank of Valletta plc', city: 'VALLETTA' },
      { name: 'Malta International Airport plc', city: 'LUQA' },
      { name: 'GO plc', city: 'MARSA' },
    ],
    pozarzadowy: [
      { name: 'Malta Red Cross Society', city: 'FLORIANA' },
    ],
  },

  GR: {
    publiczny: [
      { name: 'Δήμος Αθηναίων', city: 'ATHÍNA' },
      { name: 'Δήμος Θεσσαλονίκης', city: 'THESSALONÍKI' },
      { name: 'Εθνικό και Καποδιστριακό Πανεπιστήμιο Αθηνών', city: 'ATHÍNA' },
      { name: 'Γενικό Νοσοκομείο Αθηνών Ευαγγελισμός', city: 'ATHÍNA' },
    ],
    prywatny: [
      { name: 'ΔΕΗ Α.Ε.', city: 'ATHÍNA' },
      { name: 'ΟΤΕ Α.Ε.', city: 'ATHÍNA' },
      { name: 'Alpha Bank Α.Ε.', city: 'ATHÍNA' },
      { name: 'Εθνική Τράπεζα της Ελλάδος Α.Ε.', city: 'ATHÍNA' },
      { name: 'ΜΟΤΟΡ ΟΪΛ Α.Ε.', city: 'ATHÍNA' },
    ],
    pozarzadowy: [
      { name: 'Ελληνικός Ερυθρός Σταυρός', city: 'ATHÍNA' },
      { name: 'Transparency International Greece', city: 'ATHÍNA' },
      { name: 'Amnesty International Ελληνικό Τμήμα', city: 'ATHÍNA' },
    ],
  },
};

// Total count helper
export function countEntities(): { total: number; byCountry: Record<string, number>; bySector: Record<string, number> } {
  let total = 0;
  const byCountry: Record<string, number> = {};
  const bySector: Record<string, number> = { publiczny: 0, prywatny: 0, pozarzadowy: 0 };

  for (const [country, sectors] of Object.entries(ENTITIES)) {
    let countryTotal = 0;
    for (const [sector, entities] of Object.entries(sectors)) {
      countryTotal += entities.length;
      bySector[sector] += entities.length;
    }
    byCountry[country] = countryTotal;
    total += countryTotal;
  }

  return { total, byCountry, bySector };
}
