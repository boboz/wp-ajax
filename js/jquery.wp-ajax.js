(function($) {
	var wp_ajax = {
		current_url : $.address.baseURL()+"/",
		
		anim_finished : 0,
		new_content : '',
		/*new_background = '',*/
		content_received : 0,
		cache : {},
		/*back_cache = {};*/
	};
	var init = true;
	if (wp_ajax.current_url != wpAjax.baseurl) {
			window.location.href = wpAjax.baseurl+"#/"+wp_ajax.current_url.substr(wp_ajax.current_url.indexOf(wpAjax.baseurl) + wpAjax.baseurl.length);
			return;
		}

	$.wp_ajax = function() {
		if (init) {
		if (("standalone" in window.navigator) && window.navigator.standalone) {
			window.location.hash = '#/';
		}
		if (window.location.hash == '') {
			window.location.hash = '#/';
		}
		if (window.location.hash != '#') {
				wp_ajax.current_url = wpAjax.baseurl;
				init = false;
		} else {
			$.address.update();
			window.location.hash = '#/';
		}
		alter_links(wpAjax.links_selector);
		$.address.init( function(){$(window).scrollTop=0; $.address.change( onhashchange );} );
		}
	};
	
	$.wp_ajax.plugins = new Object();
	
	function alterForms($selector) {
		$form = $selector.find('form[class="wpcf7-form"]');
		if ($form.length > 0) {
			$.getScript(wpAjax.baseurl+"wp-content/plugins/contact-form-7/scripts.js");
		}
		$form.each(function(index){
			$this = $(this);
			$this.attr("action","");
			/* TODO : Add hash (location) support) */
			/*action = $this.attr("action");
			$this.attr("action",action.substring(action.indexOf("#")));*/
		});
	}
	
	function bindForms($selector) {
		/*$selector.find('form[class="wpcf7-form"]').submit(function(event) {
			wp_ajax.anim_finished=0;
			
			if (wpAjax.transition_out != '') {
				eval(stripslashes(wpAjax.transition_out));
			}
			
			wp_ajax.content_received=0;
			
			var queryString = $(this).formSerialize();
			var params = queryString.QueryStringToJSON();
			
			var url = wp_ajax.base_url.slice(0,wp_ajax.base_url.length-1) + wp_ajax.current_url;

			$.post(
					url,
					params
					,function(result){
						processJSON(result,url);
					},
						"json"
				).error(function(xhr, ajaxOptions, thrownError) { if(xhr.status=='404') {result={html:'Error 404'};processJSON(result,url);} });
			event.preventDefault();
		});*/
		/*$selector.find('form[action=""]').submit(function(event) {
			wp_ajax.anim_finished=0;
			
			if (wpAjax.transition_out != '') {
				eval(stripslashes(wpAjax.transition_out));
			}
			
			wp_ajax.content_received=0;
			
			var queryString = $(this).formSerialize();
			alert(queryString);
			var params = {
				action : 'wp-ajax-submit-form',
				hash : wp_ajax.base_url+$(this).attr("action")
			};
			jQuery.extend(params,queryString.QueryStringToJSON());
			alert(params.toSource());
			
			$.post(
					wpAjax.ajaxurl,
					params
					,function(result){
						processJSON(result,url);
					},
						"json"
				).error(function(xhr, ajaxOptions, thrownError) { if(xhr.status=='404') {result={html:'Error 404'};processJSON(result,url);} });
			event.preventDefault();
		});*/
	}
	
	function onhashchange(event) {
			if (init) {
				init = false;
				return;
			}
			var url = event.value;
			if (wpAjax.pre_code != '') {
				eval(stripslashes(wpAjax.pre_code));
			}
			wp_ajax.anim_finished=0;
			
			if (wpAjax.transition_out != '') {
				eval(stripslashes(wpAjax.transition_out));
			}
			
			wp_ajax.content_received=0;
			wp_ajax.current_url = url;
			loadContent(url);
	}
	
	function processJSON(result,url) {
		wp_ajax.cache[url]=result;
		/*back_cache[url]=result.background;*/
		if(wp_ajax.anim_finished) {
			showContent(result.html/*,result.background*/);
		} else {
			wp_ajax.new_content = result.html;
			/*new_background = result.background;*/
			wp_ajax.content_received = 1;
		}
	}
	
	function processForm(result) {
		if(wp_ajax.anim_finished) {
			showContent(result.html/*,result.background*/);
		} else {
			wp_ajax.new_content = result.html;
			wp_ajax.content_received = 1;
		}
	}
	
	function showContent(html/*,background*/) {
		$(wpAjax.container).html(html);
		
		if (wpAjax.post_code != '') {
			eval(stripslashes(wpAjax.post_code));
		}

		/*$(window).resize();*/
		/*if ($.browser.msie) {
			document.title = 'L\'usine | '+window.location.hash.substring(2);
		}*/
		
		$container = $(wpAjax.container);
		alter_links($container.find(wpAjax.links_selector));
		alterForms($container);
		bindForms($container);

		$('.preloader').remove();
		if (wpAjax.transition_in != '') {
			eval(stripslashes(wpAjax.transition_in));
		}
		/*$('#back1,#back2').smartBackgroundImage(wpAjax.backurl+background);*/
	}
	
	function addPreloader() {
		$(wpAjax.loading_container).prepend(stripslashes(wpAjax.loading_html));
		if(!Detect.cssTransitions()) {
			animatePreloader();
		}
		wp_ajax.anim_finished=1; if(wp_ajax.content_received) showContent(wp_ajax.new_content/*,new_background*/);
	}
	
	function loadContent(url) {
		if ( wp_ajax.cache[ url ]) {
				/* Since the element is already in the cache, it doesn't need to be
				 created, so instead of creating it again, let's just show it! */
				if (wp_ajax.anim_finished) {
					showContent(wp_ajax.cache[ url ].html/*,back_cache[ url ]*/);
				} else {
					wp_ajax.new_content=wp_ajax.cache[ url ].html;
					/*new_background=back_cache[ url ];*/
					wp_ajax.content_received=1;
				}
				for(plugin in wpAjax.plugins) {
							plugin_object = $.wp_ajax.plugins[wpAjax.plugins[plugin]];
							if(typeof(plugin_object.process) != "undefined") {
								plugin_object.process.call(this, wp_ajax.cache[ url ]);
								/* TODO:: EXTEND $args */
							}
						}
			} else {
				/* Loading animation test mode*/
				if(wpAjax.loading_test_mode==true) {
					return;
				}
			
				$args = {};
				var plugin;
				for(plugin in wpAjax.plugins) {
					plugin_object = $.wp_ajax.plugins[wpAjax.plugins[plugin]];
					if(typeof(plugin_object.postParams) != "undefined") {
						$arg = plugin_object.postParams.call();
						/* TODO:: EXTEND $args */
					}
				}
				/* TODO:: EXTEND $args with defaults*/
				$.post(
					wpAjax.ajaxurl,
					{
						action : 'wp-ajax-submit-hash',
						hash : url
					},function(result){
						for(plugin in wpAjax.plugins) {
							plugin_object = $.wp_ajax.plugins[wpAjax.plugins[plugin]];
							if(typeof(plugin_object.process) != "undefined") {
								plugin_object.process.call(this, result);
								/* TODO:: EXTEND $args */
							}
						}
						processJSON(result,url);
					},
						"json"
				).error(function(xhr, ajaxOptions, thrownError) { if(xhr.status=='404') {result={html:thrownError};processJSON(result,url);} });
			}
	}
	
	alter_links = function(selector) {
		$(selector).each(function(){
			url = $(this).attr("href");
			if(url) {
				hash2_start = url.indexOf(wpAjax.baseurl);
				if (hash2_start!=-1) {
					hash = url.substring(hash2_start + wpAjax.baseurl.length,url.length);
					$(this).attr("href",wpAjax.baseurl+"#/"+hash);
				}
			}
		});
	}
	
	function url_change_from_flash(url) {
		if(url) {
				hash2_start = url.indexOf(wpAjax.baseurl);
				if (hash2_start!=-1) {
					hash = url.substring(hash2_start + wpAjax.baseurl.length,url.length);
				}
			}
		window.location.hash = "/"+hash;
	}
	
	function stripslashes (str) {
		// +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		// +   improved by: Ates Goral (http://magnetiq.com)
		// +      fixed by: Mick@el
		// +   improved by: marrtins    // +   bugfixed by: Onno Marsman
		// +   improved by: rezna
		// +   input by: Rick Waldron
		// +   reimplemented by: Brett Zamir (http://brett-zamir.me)
		// +   input by: Brant Messenger (http://www.brantmessenger.com/)    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
		// *     example 1: stripslashes('Kevin\'s code');
		// *     returns 1: "Kevin's code"
		// *     example 2: stripslashes('Kevin\\\'s code');
		// *     returns 2: "Kevin\'s code"    return (str + '').replace(/\\(.?)/g, function (s, n1) {
		return (str + '').replace(/\\(.?)/g, function (s, n1) {
			switch (n1) {
			case '\\':
				return '\\';
			case '0':            return '\u0000';
			case '':
				return '';
			default:
				return n1;        }
		});
	}

    if (wpAjax.loading_js != '')
		eval(stripslashes(wpAjax.loading_js));
	
	$.expr[':'].external = function(obj){
		return !obj.href.match(/^mailto\:/)
				&& (obj.hostname != location.hostname);
	};
	
	String.prototype.QueryStringToJSON = function () {
		href = this;
		var o = {};
        href.replace(
            new RegExp("([^?=&]+)(=([^&]*))?", "g"),
            function ($0, $1, $2, $3) { o[$1] = $3; }
            );
        return o;
	}
	var Detect = (function () {
		function cssTransitions () {
		var div = document.createElement("div");
		var p, ext, pre = ["", "ms", "O", "Webkit", "Moz"];
		for (p in pre) {
		  if (div.style[ pre[p] + "Transition" ] !== undefined) {
			ext = pre[p];
			break;
		  }
		}
		delete div;
		return ext;
		};
		return {
		"cssTransitions" : cssTransitions
		};
	}());
})(jQuery);

jQuery(document).ready(function($) {
    $.wp_ajax();
});