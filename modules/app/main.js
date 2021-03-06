var $ = require('jquery');

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

		var poster_tmpl = __inline('./poster.tmpl');
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
		var vote_tmpl = __inline('./votelist.tmpl');
		var vote_html = vote_tmpl({data:videos,leftvotenum:leftvotenum});
		this.$vote.append(vote_html);
	},
	appendvotelist: function (data) {
		var videos = data.data.videos;
		//var votelist = videos.slice(1);
		if (config.iphone){
			this.transferur(videos);
		}
		var vote_tmpl = __inline('./appendvotelist.tmpl');
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