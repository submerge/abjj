var $ = require('jquery');

var config = (function () {
	var page_size;
	if (document.documentElement.clientWidth < 640){
		page_size = 8;
	}else {
		page_size = 4;
	}
	return {
		page_size: page_size
	};
})();

function Main () {
	this.init.apply(this,arguments);
	console.log(document.documentElement.clientWidth);
	console.log(window.devicePixelRatio);
}

Main.prototype = {
	init: function () {
		this.$window = $(window);
		this.$body = $(document.body);
		this.$content = $('.content');
		this.$poster = this.$content.children('.section_poster');
		this.$vote = this.$content.children('.section_vote');
		this.pn = 1;
		this.clientHeight = document.documentElement.clientHeight;
		this.fatchdata(this.initposter,{page_size:config.page_size,pn:this.pn});
		this.isEnd = false;
		this.$window.scroll(this.bind(this,this.fatchdata_byPage));
		this.$vote.delegate('.tovote','click',this.bind(this,this.vote));
	},
	fatchdata: function (succ_cb, dataparam) {
		$.ajax({
			url: "http://cp01-rdqa-dev397.cp01.baidu.com:8880/commonapi/getvotelist?type=double_11&format=json",
			context: this,
			dataType: 'jsonp',
			data: dataparam,
			success: succ_cb,
			error: function () {
				console.log('error');
			}
		});
	},
	initposter: function (data) {
		var videos = data.data.videos;
		var poster = videos[0];
		var votelist = videos.slice(1);

		var poster_tmpl = __inline('./poster.tmpl');
		var poster_html = poster_tmpl({data:poster});
		this.$poster.append(poster_html);

		this.initcontentlist(data);
	},
	initcontentlist: function (data) {
		var videos = data.data.videos;
		var leftvotenum = data.data.left_vote_times;
		var votelist = videos.slice(1);
		var vote_tmpl = __inline('./votelist.tmpl');
		console.log(votelist.length);
		var vote_html = vote_tmpl({data:votelist,leftvotenum:leftvotenum});
		this.$vote.append(vote_html);
	},
	appendvotelist: function (data) {
		var videos = data.data.videos;
		var votelist = videos.slice(1);
		var vote_tmpl = __inline('./appendvotelist.tmpl');
		console.log(votelist.length);
		var vote_html = vote_tmpl({data:votelist});

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
		var scrollTop = document.body.scrollTop;
		var scrollhei = document.body.scrollHeight;

		if (scrollTop + this.clientHeight >= scrollhei-2) {
			if (!this.isEnd) {
				++this.pn;
				this.fatchdata(this.appendvotelist,{page_size:config.page_size,pn:this.pn});
			}
		} 
	},
	vote: function (e) {
		var $target = $(e.target);
		var workid = $target.attr('workid');
		this.$clickedtarget = $target;
		$.ajax({
			url: "http://cp01-rdqa-dev397.cp01.baidu.com:8880/commonapi/vote?type=double_11",
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
		console.log(data);
	}
};

exports = module.exports = Main;