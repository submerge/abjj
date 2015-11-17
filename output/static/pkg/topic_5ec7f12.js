define('common/log', function(require, exports, module){ /**
 * Created by leexiaosi on 14-6-28.
 */

var _ = require('jquery/underscore');
var $ = require('jquery');
var log = {};

log.loadImage = function(src,callback){
    if(!src) {return}
    var t = new Date().getTime();
    var name =  'gcw_img' + t;
    var img = window[name] = new Image();
    img.onload = img.onerror = img.onabort = function(){
        if(typeof callback == 'function'){
            callback(img);
        }
        img.onload = img.onerror = img.onabort = null;
        try{
            window[name] = null;
            delete window[name];
            img = null;
        }
        catch (e){
            img = null;
        }
    };
    img.src = src + '&r=' + t;
};

log.getUrl = function(gif){
    return 'http://nsclick.baidu.com/' + gif + '?pid=104&id=abjj&tn=zhuanti&tpl=zhuanti';
};

log.pvlog = function(){
    this.loadImage(this.getUrl('p.gif') );
};

log.clicklog = function(conf){
    this.loadImage(this.getUrl('v.gif') + conf);
};

log.init = function(){
    var self = this;
    $(document.body).delegate('a','mousedown',function(ev){
        var $link = $(ev.currentTarget),
            info = {
                u : $link.attr('href')
            },
            title = $link.attr('title') || $link.text() || '';
            info.ti = $.trim(title);
            info = _.defaults(info,log.static2map($link.attr('static') || ""));
            $link.parents().each(function(){
                var logConf = $(this).attr('static');
                if(logConf){
                    info = _.defaults(info,log.static2map(logConf));
                }
            });
            self.clicklog('&' + $.param(info));
    });
    self.pvlog();
};
log.static2map = function(logConf){
    var result = {};
    _.each(logConf.split('&'),function(item){
        var keyMap = item.split('=');
        if(!_.isEmpty(keyMap[0])){
            result[keyMap[0]] = encodeURIComponent(keyMap[1]);
        }
    });
    return result;
};
exports = module.exports = _.bind(log.init,log); 
});
;define('app/main', function(require, exports, module){ var $ = require('jquery');

var config = (function () {

	var ua = navigator.userAgent;
	var iphone = false;
	if (/\s*iPhone\s*/.test(ua)) {
		iphone = true;
	}
	console.log(ua);
	var page_size;
	if (document.documentElement.clientWidth < 640){
		page_size = 8;
		//http://m.v.baidu.com/static/webapp/static/pkg/vendor_5cffbea.js
		//http://m.v.baidu.com/static/webapp/static/pkg/page_e17bae8.js
		/*
		$.getScript('http://cp01-rdqa-dev301.cp01.baidu.com:8087/static/webapp/static/pkg/vendor_9ae849e.js', function () {
			$.getScript('http://cp01-rdqa-dev301.cp01.baidu.com:8087/static/webapp/static/pkg/page_f444e56.js', function () {
				require('webapp:static/page/main.js');
			});
		});
*/
	}else {
		page_size = 20;
	}
	return {
		page_size: page_size,
		iphone: iphone
	};
})();

function Main () {
	this.init.apply(this,arguments);
}

Main.prototype = {
	init: function () {
		this.$window = $(window);
		this.$body = $(document.body);
		this.$content = $('.content');
		this.$poster = this.$content.children('.section_poster');
		this.$vote = this.$content.children('.section_vote');
		this.pn = 1;
		//this.dataapi = 'http://cp01-ocean-2242.epc.baidu.com:8088/commonapi/getvotelist?type=double_11&format=json';
		this.dataapi = 'http://v.baidu.com/commonapi/getvotelist?type=double_11&format=json';
		this.proxyurl = 'http://list.video.baidu.com/webapp/proxy/index.html?';
		this.clientHeight = document.documentElement.clientHeight;
		this.fatchdata(this.initposter,{page_size:config.page_size,pn:this.pn},"http://v.baidu.com/videoapi/?page_name=blockContentList&block_sign=list_male_star&format=json");
		this.fatchdata(this.initcontentlist,{page_size:config.page_size,pn:this.pn},this.dataapi);
		this.isEnd = false;
		this.$window.scroll(this.bind(this,this.fatchdata_byPage,this.dataapi));
		this.$vote.delegate('.tovote','click',this.bind(this,this.vote));
		//this.$content.delegate('.poster ,.vote_poster, .vote_post_title', 'click', this.bind(this,this.diaoqiplay));
	},
	// 拉取数据
	fatchdata: function (succ_cb, dataparam, url) {
 		$.ajax({
			url: url,
			context: this,
			dataType: 'jsonp',
			data: dataparam,
			success: succ_cb,
			error: function () {
				console.log('error');
			}
		});
	},
	// 初始化头图
	initposter: function (data) {
		var videos = data[0].data.videos;
		if (config.iphone){
			this.transferur(videos);
		}
		var poster = videos[0];
		//var votelist = videos.slice(1);
		//this.total_num = parseInt(data.data.total_num);

		var poster_tmpl = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<a class="poster" href="'+
((__t=( data.url))==null?'':__t)+
'" target="_blank" static="bl=poster&tpl=poster">\r\n\t<img src="'+
((__t=( data.imgh_url))==null?'':__t)+
'">\r\n\t<span class="title postertitle">'+
((__t=( data.title))==null?'':__t)+
'</span>\r\n\t<span class="mask postermask"></span>\r\n</a>\r\n';
}
return __p;
};
		var poster_html = poster_tmpl({data:poster});
		this.$poster.append(poster_html);

		//this.initcontentlist(data);
	},
	// 初始化投票作品列表
	initcontentlist: function (data) {
		var videos = data.data.videos;
		if (config.iphone){
			this.transferur(videos);
		}
		var leftvotenum = data.data.left_vote_times;
		//var votelist = videos.slice(1);
		var vote_tmpl = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='<div class="vote_header">\r\n\t<h2 class="ilb vote_title">给最感人的视频点个赞吧</h2>\r\n\t<p class="ilb leftvotenum">今日可投票数:<span class="availnums">'+
((__t=(leftvotenum))==null?'':__t)+
'</span></p>\r\n</div>\r\n<div class="vote_list" static="bl=votelist">\r\n\t<ul>\r\n\t\t';
for (var i=0;i<data.length;i++){
__p+='\r\n\t\t\t<li class="vote_item ';
if(i%2 === 0){
__p+='oven';
}
__p+='">\r\n\t\t\t\t<a href="'+
((__t=(data[i].url))==null?'':__t)+
'" class="vote_poster" target="_blank" static="tpl=voteitem" alog-alias="voteitem'+
((__t=(i))==null?'':__t)+
'">\r\n\t\t\t\t\t<img src="'+
((__t=(data[i].imgh_url))==null?'':__t)+
'">\r\n\t\t\t\t</a>\r\n\t\t\t\t<a href="'+
((__t=(data[i].url))==null?'':__t)+
'" class="vote_post_title" data-openap="'+
((__t=( data[i].url))==null?'':__t)+
'" data-openapp-fail="baiduvideo_4190a.apk" data-title="'+
((__t=( data[i].title))==null?'':__t)+
'">'+
((__t=(data[i].title))==null?'':__t)+
'</a>\r\n\t\t\t\t<div class="wrapvote">\r\n\t\t\t\t\t<a href="javascript:void(0)" class="tovote fl ';
if(data[i].uid_has_voted){
__p+='voted';
}
__p+='" workid = "'+
((__t=(data[i].works_id))==null?'':__t)+
'">\r\n\t\t\t\t\t\t';
if(data[i].uid_has_voted){
__p+='\r\n\t\t\t\t\t\t\t已赞\r\n\t\t\t\t\t\t';
} else {
__p+='\r\n\t\t\t\t\t\t\t赞一下\r\n\t\t\t\t\t\t';
}
__p+='\r\n\t\t\t\t\t</a>\r\n\t\t\t\t\t<span class="votenum fl">'+
((__t=(data[i].vote_num))==null?'':__t)+
'票</span>\r\n\t\t\t\t</div>\r\n\t\t\t</li>\r\n\t\t';
}
__p+='\r\n\t</ul>\r\n</div>';
}
return __p;
};
		var vote_html = vote_tmpl({data:videos,leftvotenum:leftvotenum});
		this.$vote.append(vote_html);
	},
	appendvotelist: function (data) {
		var videos = data.data.videos;
		//var votelist = videos.slice(1);
		if (config.iphone){
			this.transferur(videos);
		}
		var vote_tmpl = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'');};
with(obj||{}){
__p+='';
for (var i=0;i<data.length;i++){
__p+='\r\n\t<li class="vote_item ';
if(i%2 === 0){
__p+='oven';
}
__p+='">\r\n\t\t<a href="'+
((__t=(data[i].url))==null?'':__t)+
'" class="vote_poster" target="_blank" workid = "'+
((__t=(data[i.works_id]))==null?'':__t)+
'" static="tpl=voteitem" alog-alias="voteitem'+
((__t=(i))==null?'':__t)+
'">\r\n\t\t\t<img src="'+
((__t=(data[i].imgh_url))==null?'':__t)+
'">\r\n\t\t</a>\r\n\t\t<a href="'+
((__t=(data[i].url))==null?'':__t)+
'" class="vote_post_title" static="tpl=voteitem" alog-alias="voteitem'+
((__t=(i))==null?'':__t)+
'">'+
((__t=(data[i].title))==null?'':__t)+
'</a>\r\n\t\t<div class="wrapvote">\r\n\t\t\t<a href="javascript:void(0)" class="tovote fl ';
if(data[i].uid_has_voted){
__p+='voted';
}
__p+='" workid = "'+
((__t=(data[i].works_id))==null?'':__t)+
'">\r\n\t\t\t\t';
if(data[i].uid_has_voted){
__p+='\r\n\t\t\t\t\t\t\t已赞\r\n\t\t\t\t\t\t';
} else {
__p+='\r\n\t\t\t\t\t\t\t赞一下\r\n\t\t\t\t\t\t';
}
__p+='\r\n\t\t\t</a>\r\n\t\t\t<span class="votenum fl">'+
((__t=(data[i].vote_num))==null?'':__t)+
'票</span>\r\n\t\t</div>\r\n\t</li>\r\n';
}
__p+='';
}
return __p;
};
		var vote_html = vote_tmpl({data:videos});
		if (!this.$votelist) {
			this.$votelist = this.$vote.find('ul');
		}
		this.$votelist.append(vote_html);
	},
	bind: function(obj, func) {
		return function () {
			func.apply(obj, arguments);
		}
	},
	fatchdata_byPage: function () {
		//var scrollTop = document.body.scrollTop;
		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || 
              document.body.scrollTop;
		var scrollhei = document.body.scrollHeight;
		if (scrollTop + this.clientHeight >= scrollhei-2) {
			if (this.pn * config.page_size > this.total_num) {
				this.isEnd = true;
			}
			if (!this.isEnd) {
				++this.pn;
				this.fatchdata(this.appendvotelist,{page_size:config.page_size,pn:this.pn},this.dataapi);
			}
		} 
	},
	transferur: function (videos) {
		for (var i=0, len= videos.length;i<len;i++) {
			var url = videos[i].url;
			var title = videos[i].title;
			var transurl = this.proxyurl+ 'refer=' + encodeURIComponent(url) + '&title=' + encodeURIComponent(title) + '&type=normal';
			videos[i].url = transurl;
		}
	},
	vote: function (e) {
		var $target = $(e.target);
		var workid = $target.attr('workid');
		this.$clickedtarget = $target;
		if (this.$clickedtarget.hasClass('voted')) {
			return;
		}

		if (!this.$availnums) {
			this.$availnums = this.$vote.find('.availnums');
		}

		if (parseInt(this.$availnums.html()) <= 0) {
			return;
		}

		$.ajax({
			//url: "http://cp01-rdqa-dev397.cp01.baidu.com:8880/commonapi/vote?type=double_11",
			//url: "http://cp01-ocean-2242.epc.baidu.com:8088/commonapi/vote?id=2&type=double_11",
			url: 'http://v.baidu.com/commonapi/vote?id=2&type=double_11',
			context: this,
			dataType: 'jsonp',
			data: {id: workid},
			success: this.voteSucc,
			error: function () {
				console.log('error');
			}
		});
	},
	voteSucc: function (data) {
		this.$clickedtarget.addClass('voted');
		this.$clickedtarget.html('已赞');
		
		//处理今日可投票数
		var availnums = parseInt(this.$availnums.html());
		this.$availnums.html(--availnums);

		//当前票数加一
		var $currentnums = this.$clickedtarget.next();
		var cnum = parseInt($currentnums.html()) + 1;
		$currentnums.html(cnum + '票');
	},
	diaoqiplay: function (e) {
		//var utils = require('webapp:static/utils/utils.js');
		var ele = $(e.currentTarget);
        e.preventDefault();
        if (!ele.data('data-openapp')) {
            var url = ele.attr('href');
            ele.attr('data-openapp', utils.appUnify({
                title: ele.data('title'),
                id: url,
                url: url,
                type: 'normal',
                action: 0
            }));
        }
	}
};

exports = module.exports = Main; 
});