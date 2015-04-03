var intervalid;
var selectionErrorShowing = 0;
var bkg = chrome.extension.getBackgroundPage();
var storage = chrome.storage.sync;

function getStationName(code){

	var stationname = "";
	for(var c in stations){
		if(stations[c] == code){
			stationname = c;
		}
	}
	if(stationname == ""){
		stationname == "STATION NOT FOUND";
	}
	
	return stationname;

}

function getNextTrainsAtName(userinput, callbackfunc){
	
	//Assuming we're passed a name
	var stationname = getDefinedName(userinput);
	
	if(stationname != null){
		var stationcode = stations[stationname];
		var yql = StationDataByCode_URL + stationcode;
		$.ajax({
			url: yql,
			success: function(res){
				var json_res = $.xml2json(res);
				callbackfunc(json_res);
			}
		});
	}
	else{
		$("#result").html("<b>Station match not found</b>");
		$("#loadingimg").css("display", "none");
	}
}

function parseTrains(result){

	var trains = result["objStationData"];
	
	if(trains != null){
		trains = removeArrivals(trains);
	}
	
	// Might be null after arrivals are removed
	if(trains == null){
		$("#result").html("<div>No trains due at this station.</div>");
		$("#loadingimg").css("display", "none");
	}
	
	else{
		var tableheader = "<tr class=\"table_header\"><th>Destination</th><th>Service</th><th>Sch</th><th>Est. Depart</th><th>Due In</th><th>Latest Information</th><th>Set Reminder</th></tr>";
		
		var trainTables = "";
		
		if(!(trains instanceof Array)){
			if(trains["Destination"] != $('#station').val()){
			
				trainTables = "<h3>" + trains["Direction"] + "</h3><table style=\"trains_table\" summary=\"Journey " +trains["Direction"]+ " details\"><tbody>" + tableheader;
				trainTables = trainTables + getTrainRow(trains);
				
			}
		}
		else{
			// Sort array so trains always appear in desc order of due time
			trains.sort(trainComparison);
			var currDirection = "";
		
			for(var i = 0; typeof trains[i] != 'undefined'; i++){				
				
				// If we need to start a new destinations table
				if(trains[i]["Direction"] != currDirection){
					// If a diff direction was being processed, close that table
					if(currDirection != ""){
						trainTables = trainTables + "</tbody></table>";
					}
					trainTables = trainTables + "<h3>" + trains[i]["Direction"] + "</h3><table style=\"trains_table\" summary=\"Journey Northbound details\"><tbody>" + tableheader;
					currDirection = trains[i]["Direction"];
				}
				trainTables = trainTables + getTrainRow(trains[i]);
			}
		}

		bkg.viewdisplayed = 2;
		
		$("#result").html("<form id=\"reminderform\">");
		$("#reminderform").append(trainTables);
		$("#reminderform").append("<h2 id=\"minutesentry\">Remind me <input type=\"text\" name=\"minutes\" class=\"reminder_box\" /> minutes before selected train      "
			+ "<input type=\"hidden\" name=\"targetstation\" value=\"" + getDefinedName($('#station').val()) + "\" />" 
			+ "<input type=\"submit\" value=\"Set Reminder\" /></h2></form>");
		$("#loadingimg").css("display", "none");
		$('#reminderform').submit(setReminder);
		
		// Hack to fix issue of scrollbar not appearing
		if(document.body.scrollHeight > 600){
			window.scrollTo(0,document.body.scrollHeight);
			window.scrollTo(0,0);
		}
	}
}

function getTrainRow(train){
	/*Destination .. Service .. Sch Depart .. Est. Depart .. Due In .. Latest Information*/
	if(train["Lastlocation"] == null){
		train["Lastlocation"] = "";
	}
	var trainrow = "<tr style=\"border-bottom: 1px solid gray\"><td>" + train["Destination"] + "</td><td>" + train["Traintype"] + "</td><td>" + train["Schdepart"] + "</td><td>" + train["Expdepart"] + "</td><td>" + train["Duein"] + "</td><td>" + train["Lastlocation"] + "</td><td><input type=\"radio\" name=\"reminderselect\" value=\"" + $.trim(train["Traincode"]) + "\" /></td></tr>";
	return trainrow;
}

function setReminder(){
	var selectedtrain = $('input[name="reminderselect"]:checked').val();
	var selectedminutes = $('input[name="minutes"]').val();
	
	if(selectedtrain != null && selectedminutes != ""){
		selectionErrorShowing = 0;
		bkg.clearReminderSettings();
		bkg.targettrain = selectedtrain;
		bkg.targetstation = $('input[name="targetstation"]').val();
		bkg.minutes = selectedminutes;
		storage.set({'targettrain' : bkg.targettrain, 'targetstation': bkg.targetstation, 'minutes': bkg.minutes, 'remindershown': bkg.remindershown}, monitorReminder );
	}
	else{
		if(selectionErrorShowing == 0){
			$("#minutesentry").prepend("<div id=\"selectionerror\">Please select a train, and specify an amount of minutes</div>");
			selectionErrorShowing = 1;
		}
	}
	$("#station").focus();
	return false;
}

function monitorReminder(){
	bkg.getNextTrainsAtName2(bkg.targetstation, function(res){
		bkg.updateBadge(res);
		showReminderConfirmation();
	});
	bkg.monitorReminder();
}

function removeArrivals(trains){
	// If not array - IE only one train
	if(!(trains instanceof Array)){
		if(!compareStations(trains["Destination"], $('#station').val())){
			return trains;
		}
		else{
			return null;
		}
	}
	else{
		for(var i = 0; typeof trains[i] != 'undefined'; i++){
			if(compareStations(trains[i]["Destination"], $('#station').val())){
				trains.splice(i,1);
				i--;
			}
		}
	}
	return trains;
}

function showReminderConfirmation(){
	var train = bkg.traindetails;
	
	if(train["Lastlocation"] == null){
		train["Lastlocation"] = "";
	}
	
	var explanation = "";
	var deletelink = "";
	
	if(bkg.remindershown == 1){
		explanation = "<h3>Countdown for train's departure from " + bkg.targetstation +  "</h3>";
		deletelink = "<h2><button id='deletereminder'>Clear Countdown</button></h2>";	
	}
	else{
		explanation = "<h3>Reminder: " + bkg.minutes + " minutes  --  Station: " + bkg.targetstation + "</h3>";
		deletelink = "<h2><button id='deletereminder'>Delete Reminder</button></h2>";	
	}

	var tableheader = "<tr class=\"table_header\"><th>Destination</th><th>Service</th><th>Sch</th><th>Est. Depart</th><th>Due In</th><th>Latest Information</th></tr>";
	var trainrow = "<tr><td>" + train["Destination"] + "</td><td>" + train["Traintype"] + "</td><td>" + train["Schdepart"] + "</td><td>" + train["Expdepart"] + "</td><td>" + train["Duein"] + "</td><td>" + train["Lastlocation"] + "</td></tr>";
	var table = "<table>" + tableheader + trainrow + "</table>";

	bkg.viewdisplayed = 3;
	$("#result").html(explanation + table + deletelink);
	$('#deletereminder').click(function () {
		bkg.clearReminderSettings();
		$("#result").html("<h3 id='remindercleared'><p>Reminder cleared.</p> <p>Use the search box to find more trains.</p></h3>");
		$("#station").focus();
		return false;
	});
	
	$("#station").focus();

}

function updateBadge(result){
	//DO A CHECK TO CONFIRM NOT NULL AND TRAIN IS THERE! -- IF NOT, END INTERVAL
	var trains = result["objStationData"];
	/*NOTE: the above line is repeated in bkg method!! This shouldn't be the case*/
	bkg.updateBadge(trains);

}

function getDefinedName(userinput){

	for(var key in stations){
		if(compareStations(key, userinput)){
			return key;
		}
	}
	
	return null;
}

function compareStations(one, two){
	/*TODO: Come up with nice way to compare user input with defined station names*/
	return (one.toLowerCase() == two.toLowerCase());
}

function trainComparison(a, b){
	// Primary sort direction, secondary sort due time
	if(!(a["Direction"] === b["Direction"])){
		if(a["Direction"] > b["Direction"]){
			return 1;
		}
		else{
			return -1;
		}
	}
	else{
		if(parseInt(a["Duein"]) > parseInt(b["Duein"])){
			return 1;
		}
		else if(parseInt(a["Duein"]) < parseInt(b["Duein"])){
			return -1;
		}
		else{
			return 0;
		}
	}
}

function onPopupOpen(){

	$('#stationselect').submit(function () {
		$("#loadingimg").css("display", "inline");
		getNextTrainsAtName($("#station").val(), parseTrains);
		return false;
	});

	//Set up for when opening popup, checking if there's a reminder set already
	if(bkg.targettrain != "" && bkg.targetstation != "" && bkg.minutes != ""){
		showReminderConfirmation();
	}
	else{
		viewdisplayed = 1; //Just showing form
	}
	
	$('#station').focus();


	$(function() {
		var availableTags = [
			"Dublin Connolly",
			"Dublin Pearse",
			"Clongriffin",
			"Sutton",
			"Belfast Central",
			"Lisburn",
			"Lurgan",
			"Portadown",
			"Sligo",
			"Newry",
			"Collooney",
			"Ballina",
			"Ballymote",
			"Dundalk",
			"Foxford",
			"Boyle",
			"Carrick on Shannon",
			"Dromod",
			"Castlebar",
			"Manulla Junction",
			"Westport",
			"Ballyhaunis",
			"Castlerea",
			"Longford",
			"Claremorris",
			"Drogheda",
			"Edgeworthstown",
			"Laytown",
			"Gormanston",
			"Roscommon",
			"Balbriggan",
			"Skerries",
			"Mullingar",
			"Rush and Lusk",
			"Donabate",
			"Malahide",
			"M3 Parkway",
			"Athlone",
			"Dunboyne",
			"Portmarnock",
			"Enfield",
			"Kilcock",
			"Bayside",
			"Howth Junction",
			"Howth",
			"Kilbarrack",
			"Hansfield",
			"Clonsilla",
			"Castleknock",
			"Raheny",
			"Harmonstown",
			"Maynooth",
			"Navan Road Parkway",
			"Coolmine",
			"Ashtown",
			"Leixlip (Confey)",
			"Killester",
			"Broombridge",
			"Leixlip (Louisa Bridge)",
			"Drumcondra",
			"Clontarf Road",
			"Docklands",
			"Tara Street",
			"Dublin Heuston",
			"Woodlawn",
			"Grand Canal Dock",
			"Clara",
			"Ballinasloe",
			"Adamstown",
			"Lansdowne Road",
			"Cherry Orchard",
			"Clondalkin",
			"Sandymount",
			"Hazelhatch",
			"Attymon",
			"Sydney Parade",
			"Booterstown",
			"Blackrock",
			"Athenry",
			"Seapoint",
			"Salthill",
			"Dun Laoghaire",
			"Sandycove",
			"Glenageary",
			"Dalkey",
			"Oranmore",
			"Galway",
			"Tullamore",
			"Killiney",
			"Sallins",
			"Shankill",
			"Craughwell",
			"Woodbrook",
			"Bray",
			"Newbridge",
			"Curragh",
			"Kildare",
			"Ardrahan",
			"Portarlington",
			"Monasterevin",
			"Greystones",
			"Kilcoole",
			"Gort",
			"Portlaoise",
			"Athy",
			"Wicklow",
			"Roscrea",
			"Cloughjordan",
			"Rathdrum",
			"Ballybrophy",
			"Nenagh",
			"Carlow",
			"Ennis",
			"Arklow",
			"Templemore",
			"Birdhill",
			"Sixmilebridge",
			"Castleconnell",
			"Muine Bheag",
			"Thurles",
			"Gorey",
			"Limerick",
			"Kilkenny",
			"Thomastown",
			"Enniscorthy",
			"Limerick Junction",
			"Tipperary",
			"Cahir",
			"Clonmel",
			"Carrick on Suir",
			"Charleville",
			"Wexford",
			"Campile",
			"Ballycullane",
			"Rosslare Strand",
			"Tralee",
			"Wellingtonbridge",
			"Waterford",
			"Rosslare Europort",
			"Bridgetown",
			"Farranfore",
			"Mallow",
			"Banteer",
			"Rathmore",
			"Millstreet",
			"Killarney",
			"Midleton",
			"Carrigtwohill",
			"Glounthaune",
			"LittleIsland",
			"Cork",
			"Fota",
			"Carrigaloe",
			"Rushbrooke",
			"Cobh"
		];
		availableTags.sort();
		$( "#station" ).autocomplete({
			autoFocus: true,
			source: function (request, response) {
				var term = $.ui.autocomplete.escapeRegex(request.term)
					, startsWithMatcher = new RegExp("^" + term, "i")
					, startsWith = $.grep(availableTags, function(value) {
						return startsWithMatcher.test(value.label || value.value || value);
					})
                , containsMatcher = new RegExp(term, "i")
                , contains = $.grep(availableTags, function (value) {
                    return $.inArray(value, startsWith) < 0 && 
                        containsMatcher.test(value.label || value.value || value);
				});
            
				response(startsWith.concat(contains));
			}
		});
	});

}