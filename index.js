
$(document).ready(function () {
			
	// expand all child rows
	$("#expand-tree").on("click", function () {
		$(".tree-list-view-pf")
			.find(".list-group-item-container")
			.filter(function () {
				return $(this).children().length > 0;
			})
			.removeClass("hidden");
	});

	// collapse all child rows
	$("#collapse-tree").on("click", function () {
		$(".tree-list-view-pf").find(".list-group-item-container").addClass("hidden");
	});

	// row checkbox selection
	$(".tree-list-view-pf").on("change", ":checkbox", function (e) {
		if ($(this).is(":checked")) {
			$(this).closest(".list-group-item").addClass("active");
		} else {
			$(this).closest(".list-group-item").removeClass("active");
		}
	});

	// toggle dropdown menu
	$(".list-view-pf-actions").on("show.bs.dropdown", function () {
		var $this = $(this);
		var $dropdown = $this.find(".dropdown");
		var space = $(window).height() - $dropdown[0].getBoundingClientRect().top - $this.find(".dropdown-menu").outerHeight(true);
		$dropdown.toggleClass("dropup", space < 10);
	});

	// click the list-view heading then expand a row
	$(".list-group-item-header").click(function (event) {
		if (!$(event.target).is("button, a, input, .fa-ellipsis-v")) {
			var $this = $(this);
			$this.find(".fa-angle-right").toggleClass("fa-angle-down");
			var $itemContainer = $this.siblings(".list-group-item-container");
			if ($itemContainer.children().length) {
				$itemContainer.toggleClass("hidden");
			}
		}
	});

	// matchHeight the contents of each .card-pf and then the .card-pf itself
	$(".row-cards-pf > [class*='col'] > .card-pf .card-pf-title").matchHeight();
	$(".row-cards-pf > [class*='col'] > .card-pf > .card-pf-body").matchHeight();
	$(".row-cards-pf > [class*='col'] > .card-pf > .card-pf-footer").matchHeight();
	$(".row-cards-pf > [class*='col'] > .card-pf").matchHeight();

	// Initialize the vertical navigation
	$().setupVerticalNavigation(true);
});

// Start

function cloneTemplate(selector) {
	return document.querySelector(selector).content.cloneNode(true);
}

function getTextContent(dom, selector) {
	var node = dom.querySelector(selector);
	return node ? node.textContent : undefined;
}

// goals

function populateGoals(goals) {
	for(var goalIndx in goals) {
		var navItem = cloneTemplate('#template-nav-item');
		var goal = goals[goalIndx]
		navItem.querySelector('li').id = goal.id;
		navItem.querySelector('.fa').classList.add('fa-' + goal.legend);
		navItem.querySelector('.list-group-item-value').innerText = goal.name;
		$('.nav-pf-vertical .list-group').append(navItem);
	}
}
$('.nav-pf-vertical .list-group .list-group-item').on('click', function(){
	changeGoal(this.id);
});

// filters

function createSelect(label) {
	var select = $(cloneTemplate('#template-select'));
	select.find('label').text(label);
	return select;
}

function populateSelect(select, options) {
	select = select.find('select');
	for(var index in options) {
		var selectOption = $('<option value="'+options[index]+'">'+options[index]+'</option>');
		select.append(selectOption);
	}
}

// actions
		
function createDropdown(label) {
	var dropdown = $(cloneTemplate('#template-dropdown'));
	dropdown.find('button').prepend(label);
	return dropdown;
}

function populateDropdown(dropdown, items) {
	var dropdownMenu = dropdown.find('.dropdown-menu');
	for(var index in items) {
		var dropDownItem = $('<li><a href="#">'+items[index]+'</a></li>');
		dropdownMenu.append(dropDownItem);
	}
}

/*
var dropdown = createDropdown('Stack');
var stacks = ['Java', '.Net'];
populateDropdown(dropdown, stacks);
$('#stack').append(dropdown);

var dropdown = createDropdown('Source Technology');
var targetTechs = ['Apache Camel', 'Thorntail', 'jBPM', 'Drools', 'Seam', 'Hibernate', 'Spring Boot', 'Weblogic', 'WebSphere', 'Glassfish',  'Oracle JDK'];
populateDropdown(dropdown, targetTechs);
$('#source-tech').append(dropdown);

var dropdown = createDropdown('Target Technology');
var targetTechs = ['Fuse', 'Quarkus', 'KIE', 'Hibernate', 'JEE', 'Open JDK'];
populateDropdown(dropdown, targetTechs);
$('#target-tech').append(dropdown);
*/

// rulesets 

const parser = new DOMParser();

var baseUrl = 'https://github.com/windup-experiments/windup-rulesets/blob/master/rules/rules-reviewed/';
var rawBaseUrl = 'https://raw.githubusercontent.com/windup-experiments/windup-rulesets/master/rules/rules-reviewed/';

function createRuleset(path, ruleSet) {
	var itemHeader = $(cloneTemplate('#template-item-header'));
	var itemHeaderBody = itemHeader.find('.list-view-pf-body');
	itemHeaderBody.find('.list-view-pf-left').text(ruleSet.phase);
	
	itemHeaderBody.find('.list-group-item-heading').attr('href',  baseUrl + path + '/' + ruleSet.name + '.windup.xml');
	itemHeaderBody.find('.list-group-item-heading').text(ruleSet.name);
	itemHeaderBody.find('.list-group-item-text').text(ruleSet.desc);
	itemHeaderBody.find('.list-view-pf-additional-info-item').text(ruleSet.ruleCount);
	
	var item = $('<div class="list-group-item"></div>')
	var itemBody = $('<div class="list-group-item-header"></div>')
	itemBody.append(itemHeader);
	item.append(itemBody);
	
	$('.container-pf-nav-pf-vertical .list-group').append(item);
}

function populateRuleSets(ruleSetsInfo) {
	$('.container-pf-nav-pf-vertical .list-group').empty();
	if(!ruleSetsInfo) {
		return;
	}
	var path = ruleSetsInfo.path;
	for(var ruleSetIndx in ruleSetsInfo.ruleSets) {
		var ruleSetInfo = ruleSetsInfo.ruleSets[ruleSetIndx];
		var url = rawBaseUrl + path + '/' + ruleSetInfo.name + '.windup.xml';
		$.get(url).then(function(data){
			
			const dom = parser.parseFromString(data, "application/xml");
			var ruleSet = {
				phase : getTextContent(dom, 'metadata phase') || 'Migration',
				name : dom.documentElement.id,
				desc : getTextContent(dom, 'metadata description'),
				ruleCount : dom.querySelectorAll('rules rule').length
			}
			createRuleset(path, ruleSet);
		});
	}
}

var ruleSetsInfo_cloud_java = {
	path : 'openshift',
	ruleSets : [
		{ name : 'embedded-cache-libraries' },
		{ name : 'java-rmi' },
		{ name : 'java-rpc' },
		{ name : 'jca' },
		{ name : 'jni-native-code' },
		{ name : 'local-storage' },
		{ name : 'logging' },
		{ name : 'mail' },
		{ name : 'session' },
		{ name : 'socket-communication' }
	]
};

var ruleSetsInfo_cloud_dotnet = {
	path : 'openshift/dotnet',
	ruleSets : [
		{ name : 'console' },
		{ name : 'database-access' },
		{ name : 'db2-unmanaged' },
		{ name : 'file-cache' },
		{ name : 'file-io' },
		{ name : 'http-cache' },
		{ name : 'iis-module-cache' },
		{ name : 'isapi-filters' },
		{ name : 'launchProcess' },
		{ name : 'logging.net' },
		{ name : 'msmq' },
		{ name : 'oracle-umanaged' },
		{ name : 'request-filter' },
		{ name : 'security.net' },
		{ name : 'sharepoint' },
		{ name : 'static-compression' },
		{ name : 'static-file' },
		{ name : 'transactions' },
		{ name : 'wcf-protocols' },
		{ name : 'wcf-ssl' },
		{ name : 'windowsAuth' },
		{ name : 'windowsForms' },
		{ name : 'windowsPrincipal' },
		{ name : 'windowsRegistry' },
		{ name : 'windowsServices' }
	]
};


var ruleSetsInfo_oss_weblogic = {
	path : 'eap6/weblogic',
	ruleSets : [
		{ name : 'weblogic-catchall' },
		{ name : 'weblogic-ejb' },
		{ name : 'weblogic-ignore-references' },
		{ name : 'weblogic-jms' },
		{ name : 'weblogic-services' },
		{ name : 'weblogic-webapp' },
		{ name : 'weblogic-webservices' },
		{ name : 'weblogic-xml-descriptors' },
		{ name : 'weblogic' }
	]
};

var ruleSetsInfo_oss_websphere = {
	path : 'eap6/websphere',
	ruleSets : [
		{ name : 'websphere-catchall' },
		{ name : 'websphere-ignore-references' },
		{ name : 'websphere-jms' },
		{ name : 'websphere-mq' },
		{ name : 'websphere-mqe' },
		{ name : 'websphere-other' },
		{ name : 'websphere-xml' }
	]
};

// goals

var goals = [
	{ id : "cloud",		legend : "cloud", 			name : "Cloud Readiness" },
	{ id : "oss",		legend : "code",			name : "Open Source" },
	{ id : "modern",	legend : "refresh",			name : "Modernize" },
	{ id : "upgrade",	legend : "window-restore",	name : "Upgrade" }
];

populateGoals(goals);

// filter

var stackSelect = createSelect('Stack');
$('#stack').append(stackSelect);
var stacks = [ 'Java', '.Net' ];
populateSelect($('#stack'), stacks);

$('#stack select').on('change', function() {
	changeStack(event.target.value);
});

var sourceTechSelect = createSelect('Source Technology');
$('#sourceTech').append(sourceTechSelect);
var sourceTechs = [ 'Weblogic', 'WebSphere' ];
populateSelect($('#sourceTech'), sourceTechs);

$('#sourceTech select').on('change', function() {
	changeSourceTech(event.target.value);
});

var targetTechSelect = createSelect('Target Technology');
$('#targetTech').append(targetTechSelect);
var targetTechs = [ 'JEE' ];
populateSelect($('#targetTech'), targetTechs);

$('#targetTech select').on('change', function() {
	changeTargetTech(event.target.value);
});


// default - rulesets

$('.nav-pf-vertical .list-group .list-group-item:first').addClass('active');
populateRuleSets(ruleSetsInfo_cloud_java);
$('#stack select').val('Java');

// filtered - rulesets

function changeGoal(currGoal) {
	if(currGoal == 'cloud') {
		
	} else if(currGoal == 'oss') {
		
	}
}

function changeStack(currStack) {
	if(currStack == 'Java') {
		populateRuleSets(ruleSetsInfo_cloud_java);
	} else if (currStack == '.Net') {
		populateRuleSets(ruleSetsInfo_cloud_dotnet);
	} else {
		populateRuleSets();
	}
}

function changeSourceTech(currSourceTech) {
	if(currSourceTech == 'Weblogic') {
		populateRuleSets(ruleSetsInfo_oss_weblogic);
	} else if (currSourceTech == 'WebSphere') {
		populateRuleSets(ruleSetsInfo_oss_websphere);
	} else {
		populateRuleSets();
	}
}

function changeTargetTech(currTargetTech) {
	console.log(currTargetTech);
}
