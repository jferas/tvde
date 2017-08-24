$(document).ready(function() {
    $("#url").val($("#url").attr("title"));

	$('input[type="text"]').each(function(){
		$(this).focus(function(){
			if($(this).val() == $(this).attr('title')){ $(this).val(''); }
		}).blur(function(){
			if($(this).val() == '' || $(this).val() == ' '){ $(this).val($(this).attr('title')); }
		});
	});

    $("#clear").click(function() {
        clear_results();
        $("#url").val("");
    });

    $("#extract").click(function(){
        clear_results();
        var twitter_video_url = $("#url").val();

        if ( (twitter_video_url.indexOf("twitter") < 0) || (twitter_video_url.indexOf("status") < 0) ) {
            alert("You must enter a twitter video URL");
        }
        else {
            fields_of_url = twitter_video_url.split('/');
            video_id = fields_of_url[fields_of_url.length - 1]

            query_url = "http://jferas.pythonanywhere.com/" + video_id;

            // for testing without a network
            // query_url = "http://localhost:8000/sample_data/sample_frame.html"

            getTwitterVideoData(query_url);
        }
    });
});

// method to clear the current info that is displayed
//
var clear_results = function() {
    $("#video_description").html("");
    $("#created_at_date").html("");
    for (var i = 0; i < 10; i++) {
        $("#tvde-" + i).html("");
    }
};

// method to request data about a video from Twitter
//
var getTwitterVideoData = function(the_url)
{
    $.ajax({url: the_url, type: 'GET',
            contentType: 'application/x-www-form-urlencoded', dataType: 'text',
            success: onSuccessGetData, error: onAjaxError});
};

// AJAX error handler
//
var onAjaxError = function(err)
{
    $("#video_description").html("An error occured: " + err);
};  
            
function encode_utf8( s ){
        return unescape( encodeURIComponent( s ) );
}
// AJAX success handler - extract text description and image links from received HTML response
//
var onSuccessGetData = function(response, status_info)
{
    // remove URL encoding and un-escape the slashes in the string

    s = response.replace(/&quot;/g, "\"");
    s = unicodeToChar(s);
    s = s.replace(/\\/g, '');

    // extract and present the text tag describing the video if it is present
    extract_text_and_present_description(s);

    // extract and present the "created_at" tag, indicating when video was uploaded
    //
    extract_and_present_created_at_tag(s);

    // extract and present the JPG images
    extract_and_present_images(s);
};

function unicodeToChar(text) {
   return text.replace(/\\u[\dA-F]{4}/gi, 
          function (match) {
               return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
          });
}

// extract text description from given string and update web page output
//
var extract_text_and_present_description = function(s)
{
    text_tag_location = s.indexOf("\"text\":");
    if (text_tag_location > 0) {
        description_location = text_tag_location + 8;
        trailing_quote_location = s.indexOf("\"", description_location);
        description = s.substr(description_location, trailing_quote_location - description_location);
        $("#video_description").html("<u>Description:</u><br><br>" + description);
    }
};

// extract "created_at" tag from given string and update web page output
//
var extract_and_present_created_at_tag = function(s)
{
    created_at_location = s.indexOf("\"created_at\":");
    if (created_at_location > 0) {
        date_start = created_at_location + 14;
        date_end = s.indexOf("\"", date_start);
        the_date = s.substr(date_start, date_end - date_start);
        $("#created_at_date").html("<u>Date created:</u><br><br>" + the_date);
    }
};

// extract image references from given string and display those images and their referencing URL
//
var extract_and_present_images = function(s)
{
    // loop through the JPG images referenced in the HTML response from twi
    var jpg_index = 0;
    var div_index = 0;
    while (jpg_index >= 0) {
        jpg_index = s.indexOf("\.jpg\"", jpg_index);
        if (jpg_index > 0) {
            // process the discovered image reference, build an image tag and put it into the DOM
            start_of_url = s.lastIndexOf("\"", jpg_index) + 1;
            end_of_url = jpg_index + 4;
            the_jpg_url = s.substr(start_of_url, end_of_url - start_of_url);

            end_of_tag = start_of_url - 4;
            start_of_tag = s.lastIndexOf("\"", end_of_tag) + 1;
            the_tag = s.substr(start_of_tag, end_of_tag - start_of_tag + 1);

            if (the_tag.indexOf("profile") < 0) {
                reverse_link = '<a href="https://www.google.com/searchbyimage?image_url=' + the_jpg_url +  '" target="new">reverse search</a>';
                html_string = '<br><br><hr><br>Image ' + reverse_link + '<br><br><img src="' + the_jpg_url + '" alt="">';
                $("#tvde-"+ div_index).html(html_string);
            }

            // skip past this image and try to find the next image reference
            jpg_index += 4;
            div_index += 1;
        }
    }
}
