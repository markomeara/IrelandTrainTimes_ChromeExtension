var storage = chrome.storage.sync;
var targettrain = "";
var targetstation = "";
var minutes = "";
var intervalid = "";
var viewdisplayed = 0; // 0 = none (maybe closed), 1 = home (just form), 2 = showing times at station, 3 = showing reminder set
var remindershown = 0;
var traindetails = ""; //To show when user wants to see the status of their reminder setting

function updateBadge(result){
	console.log(result);
	var found = false;
	var trains = result["objStationData"];
	/*NOTE: the above line has already been done in popup method!! This shouldn't be the case*/

	if(trains != null){
		if(!(trains instanceof Array)){
			//If exactly one train is returned then it won't be in an array
			if($.trim(trains['Traincode']) == targettrain){
				updateBadgeWithDetails(trains);
				found = true;
			}
		}
		var i;
		for(i = 0; typeof(trains[i]) != 'undefined' && !found; i++){
			if($.trim(trains[i]['Traincode']) == targettrain){
				updateBadgeWithDetails(trains[i]);
				found = true;
			}		
		}
	}
	if(!found){
	
		//Train has gone through station
		//NOTE: If train is gone and reminder hasn't been shown, do something
		clearReminderSettings();
	
	}

}

function updateBadgeWithDetails(foundtrain){
	traindetails = foundtrain;
	var tempbadgeobj = new Object();
	tempbadgeobj.text = traindetails['Duein'].toString();
	chrome.browserAction.setBadgeText(tempbadgeobj);
	if(parseInt(traindetails["Duein"],10) <= parseInt(minutes,10) && remindershown != 1){
		showNotification(traindetails["Duein"]);
	}
	if(remindershown == 1){
		chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"});
	}
	else{
		chrome.browserAction.setBadgeBackgroundColor({color: "#000000"});
	}
}

function getNextTrainsAtName2(stationname, callbackfunc){
	//Assume we're passed a name
	if(typeof stations[stationname] != 'undefined'){
		var stationcode = stations[stationname];
		var yql = StationDataByCode_URL + stationcode;
		console.log(yql);
		$.ajax({
			url: yql,
			success: function(res){
				var json_res = $.xml2json(res);
				callbackfunc(json_res);
			}
		});
	}
	else{
		$("#result").html("<b>Station name not found</b>");
	}
}

function showNotification(duein){

	// Need to handle unix/linux systems
	
	var notificationoptions = {
		type: "basic",
		title: "TRAIN ALERT",
		message: "Your train is due in " + duein + " minutes",
		iconUrl: "images/alert_icon.png",
		priority: 2
	}

	chrome.notifications.create("", notificationoptions, function confirmReminderSet(){ 
		remindershown = 1;
		storage.set({'remindershown': remindershown});
		chrome.browserAction.setBadgeBackgroundColor({color: "#FF0000"}); 
	});

}

function monitorReminder(){
	//On 30 seconds, might change back to a minute
	intervalid = setInterval(function(){getNextTrainsAtName2(targetstation, updateBadge);}, 30000);
}

function endInterval(){
	clearInterval(intervalid);
}

function clearReminderSettings(){
	endInterval();
	targettrain = "";
	targetstation = "";
	minutes = "";
	intervalid = "";
	viewdisplayed = 1;
	remindershown = 0;
	traindetails = "";
	storage.remove(new Array('targettrain', 'targetstation', 'minutes', 'remindershown'));
	chrome.browserAction.setBadgeText({text: ""});
}

function onBrowserOpen(){
	storage.get(null, 
		function(res){
			if(res["minutes"] != null && res["targetstation"] != null && res["targettrain"] != null && res["remindershown"] != null){
				minutes = res["minutes"];
				targetstation = res["targetstation"];
				targettrain = res["targettrain"];
				remindershown = res["remindershown"];
				getNextTrainsAtName2(targetstation, updateBadge);
				monitorReminder();
			}
		}
	);
}
onBrowserOpen();