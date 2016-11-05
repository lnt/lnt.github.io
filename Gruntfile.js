function cleanURL(url) {
    var protocol = null;
    url = url.replace(/[\/]+/g, '/');
    var ars = url.split('/');
    var context = ars.shift();
    var parents = [];
    for (var i in ars) {
        switch (ars[i]) {
            case '.':
                // Don't need to do anything here
                break;
            case '..':
                parents.pop();
                break;
            default:
                parents.push(ars[i]);
                break;
        }
    }
    if (protocol) {
        return protocol + "://" + ( context + '/' + parents.join('/')).replace(/(\/)+/g, '/');
    }
    return (context + '/' + parents.join('/')).replace(/(\/)+/g, '/');
}

module.exports = function(grunt) {
    "use strict";
    // Project configuration.

    grunt.initConfig({
        uglify: {
            options: {
                mangle: true
                //compress : false,
                //beautify : true
            },
            my_target: {
                options: {
                    footer: ""
                },
                files: {
                    "files/single.min.js": [
                        "files/jquery.min.js",
                        "files/contact.js",
                        "files/slick.js",
                        "files/scrollTo.js",
                        "files/functions.js",
                        "files/analytics.js"]
                }
            }
        },
        img: {
            // recursive extension filter with output path
            task2: {
                src: ['files/shared/images/*'],
                dest: 'files/shared/images2/'
            }
        },
        minifyHtml: {
            options: {
                cdata: true
            },
            dist: {
                files: {
                    'index.html': 'index-src.html'
                }
            }
        },
        'get-remote': {
            options: {
                root: 'files',
                dir: "shared",
                srcUrl: "http://uploads.branded.me/shared"
            },
            libraries: {
                files: {
                    'shared/themes/reset.css': 'http://uploads.branded.me/shared/themes/reset.css',
                    'shared/themes/clearfix.css': 'http://uploads.branded.me/shared/themes/clearfix.css',
                    "shared/themes/theme-2/css/core/style.css": "http://uploads.branded.me/shared/themes/theme-2/css/core/style.css"
                }
            }
        },
        cssmin: {
            options: {
                target: "",
                advanced: true,
                keepSpecialComments: 0
            },
            target: {
                files: {
                    'files/style-min.css': [
                        "files/googlefont.css",
                        'files/shared/themes/reset.css',
                        'files/shared/themes/clearfix.css',
                        "files/style-img.css"
                    ]
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-img');
    grunt.loadNpmTasks('grunt-minify-html');
    grunt.loadNpmTasks('grunt-include-source');
    grunt.loadNpmTasks('grunt-get-remote');
    grunt.loadNpmTasks('grunt-css-img-2-data-uri');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('build', ['uglify', 'img']);

    var fs      = require('fs');
    var url     = require('url');
    var http    = require('http');
    var request = require('request');


    grunt.registerTask('remote-scrap-img', "Gte", function() {
        var config = grunt.config("get-remote");
        var htmlContent = grunt.file.read("index-src.html");

        grunt.file.recurse(config.options.root + "/" + config.options.dir, function(abspath, rootdir, subdir, filename) {
            if (filename.indexOf(".css") > 0) {
                var fileContent = grunt.file.read(abspath);
                var matchs = fileContent.match(/url\(.*?g\)/ig);
                if (matchs) {
                    matchs.map(function(url) {
                        var plac = (url).replace(/url\(|\)/ig, "");
                        var localURl = cleanURL(subdir + "/" + plac);
                        var imageURL = config.options.srcUrl + "/" + localURl;
                        //new RegExp(plac, 'g')
                        fileContent = fileContent.replace(new RegExp(plac, 'g'), imageURL);
                    });
                    grunt.file.write(abspath, fileContent);
                }
            }
        });
        var cssContent = grunt.file.read("files/shared/themes/theme-2/css/core/style.css");
        grunt.file.recurse(config.options.root, function(abspath, rootdir, subdir, filename) {
            if(filename.indexOf(".png") > 0 || filename.indexOf(".jpg") > 0){
                console.log("imageURL",abspath);
                var fileContent = fs.readFileSync(abspath);
                var base64      = new Buffer(fileContent).toString('base64');
                var dataURI     = 'data:image/png;base64,' + base64;
                htmlContent = htmlContent.replace(new RegExp("./"+abspath,'g'),dataURI);
                //console.log(dataURI);
                var newAbspath = abspath.replace(config.options.root + "/" + config.options.dir,"");
               // cssContent = cssContent.replace(config.options.srcUrl + newAbspath,"./" + config.options.dir + newAbspath);
                var find = new RegExp(config.options.srcUrl + newAbspath, 'g')
                cssContent = cssContent.replace(find,dataURI);
            }
        });
        //grunt.file.write("index-src-img.html", htmlContent);
        grunt.file.write("files/style-img.css", cssContent);
    });
    grunt.registerTask('default', ["get-remote", "remote-scrap-img","cssmin","minifyHtml"]);

};
