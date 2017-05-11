#!/usr/bin/env node

var argv = require('minimist')(process.argv.slice(2));
var fs = require('fs');
var jsonParser = require('real-changesets-parser');
var _ = require('underscore');
var file = process.argv[2];
var json = JSON.parse(fs.readFileSync(file, 'utf8'));
var geojson = jsonParser(json);
var objs = {
	"type": "FeatureCollection",
	"features": []
};

for (var n = 0; n < geojson.features.length; n++) {
	var feature = geojson.features[n];
	if (feature.properties.changeType !== 'modifiedOld') {
		if (feature.properties.relations) {
			var clone = JSON.parse(JSON.stringify(feature.properties.relations));
			delete feature.properties.relations;
			for (var i = 0; i < clone.length; i++) {
				var p = jsonconcat(feature.properties, JSON.parse(JSON.stringify(feature.properties.tags)));
				var id = clone[i].properties.ref;
				clone[i].properties = jsonconcat(clone[i].properties, p);
				clone[i].properties.idrelation = clone[i].properties.id
				clone[i].properties['@id'] = id;
			}
			objs.features = objs.features.concat(clone);
		} else  {
			if (_.size(feature.properties.tags) > 0) {
				objs.features.push(feature);
			}
		}
		if (feature.properties.tags) {
			feature.properties = jsonconcat(feature.properties, JSON.parse(JSON.stringify(feature.properties.tags)));
			feature.properties['@id'] = feature.properties.id;
		}
	}
}
for (var i = 0; i < objs.features.length; i++) {
	if (objs.features[i].properties.tags) {
		delete objs.features[i].properties.tags
	}
}
console.log(JSON.stringify(objs));

function jsonconcat(o1, o2) {
	for (var key in o2) {
		o1[key] = o2[key];
	}
	return o1;
}