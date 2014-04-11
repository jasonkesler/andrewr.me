function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

$(document).ready(function(){
	var pkgName = getURLParameter("package");
	var url = document.URL;
	var baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
	var changelogUrl = baseUrl + pkgName + "/changelog.json";
	$.ajax({
		type: 'GET',
		url: changelogUrl,
		dataType: 'json',
		success: function(data) {
			document.title = data.title + " - Recent Changes"
			var changelog = data.changelog;
			var panel = $("body>panel");
			$.each(changelog.reverse(), function(idx, element){
				panel.append($("<label></label>").text(element.version + ": " + element.date));
				
				var changeList = $("<fieldset></fieldset>");
				$.each(element.changes, function(idx, change){
					changeList.append($("<div></div>").append($("<p></p>").html(change)));
				});
				panel.append(changeList);
			});
		}
	});
});