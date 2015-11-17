
//静态资源域名，使用pure release命令时，添加--domains或-D参数即可生效

//如果要兼容低版本ie显示透明png图片，请使用pngquant作为图片压缩器，
//否则png图片透明部分在ie下会显示灰色背景
//使用spmx release命令时，添加--optimize或-o参数即可生效
//fis.config.set('settings.optimzier.png-compressor.type', 'pngquant');

//设置jshint插件要排除检查的文件，默认不检查lib、jquery、backbone、underscore等文件
//使用pure release命令时，添加--lint或-l参数即可生效

//csssprite处理时图片之间的边距，默认是3px
fis.config.merge({
    statics: '/static',
    modules: {
        parser: {
            less: 'less',
            tmpl: 'utc'
        },
        postprocessor: {
            js: "jswrapper, require-async",
            html: "require-async"
        },
        postpackager: ['autoload', 'simple'],
        lint: {
            js: 'jshint'
        }
    },
    roadmap: {
        ext: {
            less: 'css'
        },
        path: [{
            reg: /^\/components\/.*\.js$/i,
            isMod: true
        }, {
            reg: /^\/page\/(.*)$/i,
            useCache: false,
            release: '$1'
        }, {
            //一级同名组件，可以引用短路径，比如modules/jquery/juqery.js
            //直接引用为var $ = require('jquery');
            reg: /^\/modules\/([^\/]+)\/\1\.(js)$/i,
            //是组件化的，会被jswrapper包装
            isMod: true,
            //id为文件夹名
            id: '$1',
            release: '${statics}/$&'
        }, {
            //modules目录下的其他脚本文件
            reg: /^\/modules\/(.*)\.(js)$/i,
            //是组件化的，会被jswrapper包装
            isMod: true,
            //id是去掉modules和.js后缀中间的部分
            id: '$1',
            release: '${statics}/$&'
        }, {
            //less的mixin文件无需发布
            reg: /^(.*)mixin\.less$/i,
            release: false
        }, {
            //其他css文件
            reg: /^(.*)\.(css|less)$/i,
            release: '${statics}/$&'
        }, {
            //前端模板
            reg: '**.tmpl',
            //当做类js文件处理，可以识别__inline, __uri等资源定位标识
            isJsLike: true,
            //只是内嵌，不用发布
            release: false
        }, {
            reg: /.*\.(html|jsp|tpl|vm|htm|asp|aspx|php)$/,
            useCache: false,
            release: '$&'
        }, {
            reg: "README.md",
            release: false
        }, {
        	reg: '**.sh',
        	release: false 
        },
        {
            reg: "**",
            release: '${statics}/$&'
        }]
    },
    settings: {
        postprocessor: {
            jswrapper: {
                type: 'amd'
            }
        },
        lint: {
            jshint: {
                camelcase: true,
                curly: true,
                eqeqeq: true,
                forin: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                noempty: true,
                node: true
            }
        }
    },
    pack: {
      'pkg/vendor.js': [
        '/lib/mod.js',
        '/modules/jquery/**.js',
      ],
      'pkg/topic.js': [
        '/modules/common/**.js',
        '/modules/app/**.js'
      ],
      'pkg/topic.css': [
        "/static/**.css",
      ]
    }
});

fis.config.set('roadmap.domain', 'http://list.video.baidu.com/double11vote');
