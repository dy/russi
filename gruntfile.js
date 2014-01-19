//Buiding-stage dependencies
require("./src/util.js");
require("./src/endingSchemeBuilder.js");
require("./src/RadixTrei.js");

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jshint: {
			files: ['src/**/*.js'],
			options: {
				globals: {
					module: true
				},
				strict: false
			}
		},

		sweetjs: {
			main: {
				src: "<%= pkg.name %>.js",
				dest: "<%= pkg.name %>.sour.js"
			},
			options: {
				readableNames: true
			}
		},

		homemade: {
			main: {
				src: "./build/build.js",
				dest: "<%= pkg.name %>.js",
				context: {
					projectName: "<%= pkg.name %>",
					DEV: true,
					generalizeScheme: generalizeScheme,
					getEndingScheme: getEndingScheme,

					toLowerCaseDict: function(source){
						for (var i = 0; i < source.length; i++){
							source[i] = source[i].toLowerCase();
						}
						return source
					},

					//converts TSV dict to array
					dictToArray: function(path, options){
						options = options || {};
						options.divider = options.divider || " ";

						//returns serialized array
						//grunt.log.write("dictToArray: `" + path + "`\n")
						var src = grunt.file.read(path);
						//grunt.log.write(src)

						var arr = src.split(/\r?\n/);

						//make format
						var fields = (options && options.format || arr[0]).split(/\s/),
							srcFields = arr[0].split(/\s/),
							fieldNumbers = []; //like [1,3,0]

						for (var i = 0; i < fields.length; i++){
							fieldNumbers.push(srcFields.indexOf(fields[i]))
						}
						//grunt.log.write(fields + " " + fieldNumbers + "\n")


						//set filter: fields required to be non-empty
						//TODO: inhere mongo filtering
						var filterBy = [];
						if (options.filter) {
							filterBy.push(srcFields.indexOf(options.filter))
						}

						//grunt.log.write(filterBy + "\n")


						//filter checker
						function passFilter(forms, filterBy){
							for (var i = 0; i < filterBy.length; i++){
								if(!forms[filterBy[i]]) return false
							}
							return true
						}


						//parse table
						var result = [];

						for (var i = 1; i < arr.length; i++){
							if (!arr[i].trim()) continue;

							var forms = arr[i].split("\t");
							var resStr = "";

							if (passFilter(forms, filterBy)) {
								for (var j = 0; j < fieldNumbers.length; j++){
									resStr += forms[j] + options.divider;
								}
								if (options.divider) resStr = resStr.slice(0, -options.divider.length);
							}

							result.push(resStr);
						}

						if (options.join !== undefined) return result.join(options.join)
						
						return result;						
					}
				}
			}
		},

		'closure-compiler': {
			frontend: {
				closurePath: '.',
				js: '<%= pkg.name %>.js',
				jsOutputFile: '<%= pkg.name %>.min.js',
				maxBuffer: 800,
				options: {
					//compilation_level: 'ADVANCED_OPTIMIZATIONS',
					compilation_level: 'SIMPLE_OPTIMIZATIONS',
					language_in: 'ECMASCRIPT5_STRICT',
					formatting: 'pretty_print'
				}
			}
		},

		watch: {
			files: ["dicts/*", "src/*", "gruntfile.js"],
			tasks: ["homemade"]
		},
	});

	//load tasks
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-closure-compiler');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks("grunt-homemade");
	grunt.loadNpmTasks('grunt-sweet.js');

	//register tasks
	grunt.registerTask('test', ['jshint', 'qunit']);
	grunt.registerTask('default', ['homemade']);

};