function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    county_boundary.resetStyle(e.target);
}


function check_county() {
  var geo_counties = d3.map(all_counties, function(r) { return r.name; }).keys();
  var counties = d3.map(virus_data, function(r) { return r.County; }).keys();
  var missing = [];
  for(var i in counties) {
    var county = counties[i];
    if(! geo_counties.includes(county)) {
      missing.push(county);
      console.log(county + ' is missing in geo boundaries');
		}
  }
  console.log("total counties in virus data:", counties.length);
  console.log("total missing in geo data:", missing.length);
  return geo_counties;
}

