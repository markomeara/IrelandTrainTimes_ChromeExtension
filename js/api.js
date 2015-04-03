//Hardcoding stations/codes to save time on requests
var stations = {'Belfast Central': "BFSTC", 'Lisburn': "LBURN", 'Lurgan': "LURGN", 'Portadown': "PDOWN", 'Sligo': "SLIGO", 'Newry': "NEWRY", 'Collooney': "COLNY", 'Ballina': "BALNA", 'Ballymote': "BMOTE", 'Dundalk': "DDALK", 'Foxford': "FXFRD", 'Boyle': "BOYLE", 'Carrick on Shannon': "CKOSH", 'Dromod': "DRMOD", 'Castlebar': "CLBAR", 'Manulla Junction': "MNLAJ", 'Westport': "WPORT", 'Ballyhaunis': "BYHNS", 'Castlerea': "CSREA", 'Longford': "LFORD", 'Claremorris': "CLMRS", 'Drogheda': "DGHDA", 'Edgeworthstown': "ETOWN", 'Laytown': "LTOWN", 'Gormanston': "GSTON", 'Roscommon': "RSCMN", 'Balbriggan': "BBRGN", 'Skerries': "SKRES", 'Mullingar': "MLGAR", 'Rush and Lusk': "RLUSK", 'Donabate': "DBATE", 'Malahide': "MHIDE", 'M3 Parkway': "M3WAY", 'Athlone': "ATLNE", 'Dunboyne': "DBYNE", 'Portmarnock': "PMNCK", 'Enfield': "ENFLD", 'Kilcock': "KCOCK", 'Clongriffin': "GRGRD", 'Sutton': "SUTTN", 'Bayside': "BYSDE", 'Howth Junction': "HWTHJ", 'Howth': "HOWTH", 'Kilbarrack': "KBRCK", 'Hansfield': "HAFLD", 'Clonsilla': "CLSLA", 'Castleknock': "CNOCK", 'Raheny': "RAHNY", 'Harmonstown': "HTOWN", 'Maynooth': "MYNTH", 'Navan Road Parkway': "PHNPK", 'Coolmine': "CMINE", 'Ashtown': "ASHTN", 'Leixlip (Confey)': "LXCON", 'Killester': "KLSTR", 'Broombridge': "BBRDG", 'Leixlip (Louisa Bridge)': "LXLSA", 'Drumcondra': "DCDRA", 'Clontarf Road': "CTARF", 'Dublin Connolly': "CNLLY", 'Docklands': "DCKLS", 'Tara Street': "TARA", 'Dublin Heuston': "HSTON", 'Dublin Pearse': "PERSE", 'Woodlawn': "WLAWN", 'Grand Canal Dock': "GCDK", 'Clara': "CLARA", 'Ballinasloe': "BSLOE", 'Adamstown': "ADMTN", 'Adamstown': "ADAMF", 'Lansdowne Road': "LDWNE", 'Cherry Orchard': "CHORC", 'Cherry Orchard': "PWESF", 'Clondalkin': "CLONF", 'Clondalkin': "CLDKN", 'Sandymount': "SMONT", 'Hazelhatch': "HZLCH", 'Hazelhatch': "HAZEF", 'Attymon': "ATMON", 'Sydney Parade': "SIDNY", 'Booterstown': "BTSTN", 'Blackrock': "BROCK", 'Athenry': "ATHRY", 'Seapoint': "SEAPT", 'Salthill': "SHILL", 'Dun Laoghaire': "DLERY", 'Sandycove': "SCOVE", 'Glenageary': "GLGRY", 'Dalkey': "DLKEY", 'Oranmore': "ORNMR", 'Galway': "GALWY", 'Tullamore': "TMORE", 'Killiney': "KILNY", 'Sallins': "SALNS", 'Shankill': "SKILL", 'Craughwell': "CRGHW", 'Woodbrook': "WBROK", 'Bray': "BRAY", 'Newbridge': "NBRGE", 'Curragh': "CURAH", 'Kildare': "KDARE", 'Ardrahan': "ARHAN", 'Portarlington': "PTRTN", 'Monasterevin': "MONVN", 'Greystones': "GSTNS", 'Kilcoole': "KCOOL", 'Gort': "GORT", 'Portlaoise': "PTLSE", 'Athy': "ATHY", 'Wicklow': "WLOW", 'Roscrea': "RCREA", 'Cloughjordan': "CJRDN", 'Rathdrum': "RDRUM", 'Ballybrophy': "BBRHY", 'Nenagh': "NNAGH", 'Carlow': "CRLOW", 'Ennis': "ENNIS", 'Arklow': "ARKLW", 'Templemore': "TPMOR", 'Birdhill': "BHILL", 'Sixmilebridge': "SXMBR", 'Castleconnell': "CCONL", 'Muine Bheag': "MNEBG", 'Thurles': "THRLS", 'Gorey': "GOREY", 'Limerick': "LMRCK", 'Kilkenny': "KKNNY", 'Thomastown': "THTWN", 'Enniscorthy': "ECRTY", 'Limerick Junction': "LMRKJ", 'Tipperary': "TIPRY", 'Cahir': "CAHIR", 'Clonmel': "CLMEL", 'Carrick on Suir': "CKOSR", 'Charleville': "CVILL", 'Wexford': "WXFRD", 'Campile': "CPILE", 'Ballycullane': "BCLAN", 'Rosslare Strand': "RLSTD", 'Tralee': "TRLEE", 'Wellingtonbridge': "WBDGE", 'Waterford': "WFORD", 'Rosslare Europort': "RLEPT", 'Bridgetown': "BRGTN", 'Farranfore': "FFORE", 'Mallow': "MLLOW", 'Banteer': "BTEER", 'Rathmore': "RMORE", 'Millstreet': "MLSRT", 'Killarney': "KLRNY", 'Midleton': "MDLTN", 'Carrigtwohill': "CGTWL", 'Glounthaune': "GHANE", 'LittleIsland': "LSLND", 'Cork': "CORK", 'Fota': "FOTA", 'Carrigaloe': "CGLOE", 'Rushbrooke': "RBROK", 'Cobh': "COBH"};

/***** URL Declarations *****/

var AllStations_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML";

var AllStationsWithType_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getAllStationsXML_WithStationType?StationType="; //Type

var CurrentTrainsUsage_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getCurrentTrainsXML";

var CurrentTrainsWithType_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getCurrentTrainsXML_WithTrainType?TrainType="; //A type needs to be put at the end, for example 'D'

var StationDataByName_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByNameXML?StationDesc="; //Station Name... NOTE, can put in NumMins parameter too!!

var StationDataByCode_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML?StationCode="; //Need to put in CODE

var StationDataByCodeWithMins_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getStationDataByCodeXML_WithNumMins?StationCode="; //Code and need to put NumMins param too!!
var NumMins_PARAM = "&NumMins=";

var StationsFilterUsage_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getStationsFilterXML?StationText="; //Put in filter text at end

var TrainMovementsUsage_URL = "http://api.irishrail.ie/realtime/realtime.asmx/getTrainMovementsXML?TrainId="; //TrainID AND Must use TrainDate param too
var TrainDate_PARAM = "&TrainDate=";

/***************************/
