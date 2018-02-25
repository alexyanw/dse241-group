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

