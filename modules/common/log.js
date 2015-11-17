/**
 * Created by leexiaosi on 14-6-28.
 */

var _ = require('../jquery/underscore.js');
var $ = require('../jquery/jquery.js');
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