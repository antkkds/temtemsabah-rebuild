const { Client } = require("pg");
const topojson = require("topojson-client");
const world = require("world-atlas/countries-110m.json");

// ISO 3166-1 numeric to [alpha-3, alpha-2] mapping
const isoMap = [
  ["004","AFG","AF"],["008","ALB","AL"],["012","DZA","DZ"],["024","AGO","AO"],["010","ATA","AQ"],
  ["032","ARG","AR"],["051","ARM","AM"],["036","AUS","AU"],["040","AUT","AT"],["031","AZE","AZ"],
  ["044","BHS","BS"],["048","BHR","BH"],["050","BGD","BD"],["052","BRB","BB"],["112","BLR","BY"],
  ["056","BEL","BE"],["084","BLZ","BZ"],["204","BEN","BJ"],["064","BTN","BT"],["068","BOL","BO"],
  ["070","BIH","BA"],["072","BWA","BW"],["076","BRA","BR"],["096","BRN","BN"],["100","BGR","BG"],
  ["854","BFA","BF"],["108","BDI","BI"],["132","CPV","CV"],["116","KHM","KH"],["120","CMR","CM"],
  ["124","CAN","CA"],["140","CAF","CF"],["148","TCD","TD"],["152","CHL","CL"],["156","CHN","CN"],
  ["170","COL","CO"],["174","COM","KM"],["178","COG","CG"],["180","COD","CD"],["188","CRI","CR"],
  ["384","CIV","CI"],["191","HRV","HR"],["192","CUB","CU"],["196","CYP","CY"],["203","CZE","CZ"],
  ["208","DNK","DK"],["262","DJI","DJ"],["212","DMA","DM"],["214","DOM","DO"],["218","ECU","EC"],
  ["818","EGY","EG"],["222","SLV","SV"],["226","GNQ","GQ"],["232","ERI","ER"],["233","EST","EE"],
  ["748","SWZ","SZ"],["231","ETH","ET"],["242","FJI","FJ"],["246","FIN","FI"],["250","FRA","FR"],
  ["266","GAB","GA"],["270","GMB","GM"],["268","GEO","GE"],["276","DEU","DE"],["288","GHA","GH"],
  ["300","GRC","GR"],["308","GRD","GD"],["320","GTM","GT"],["324","GIN","GN"],["624","GNB","GW"],
  ["328","GUY","GY"],["332","HTI","HT"],["340","HND","HN"],["348","HUN","HU"],["352","ISL","IS"],
  ["356","IND","IN"],["360","IDN","ID"],["364","IRN","IR"],["368","IRQ","IQ"],["372","IRL","IE"],
  ["376","ISR","IL"],["380","ITA","IT"],["388","JAM","JM"],["392","JPN","JP"],["400","JOR","JO"],
  ["398","KAZ","KZ"],["404","KEN","KE"],["296","KIR","KI"],["408","PRK","KP"],["410","KOR","KR"],
  ["414","KWT","KW"],["417","KGZ","KG"],["418","LAO","LA"],["422","LBN","LB"],["426","LSO","LS"],
  ["428","LVA","LV"],["430","LBR","LR"],["434","LBY","LY"],["438","LIE","LI"],["440","LTU","LT"],
  ["442","LUX","LU"],["450","MDG","MG"],["454","MWI","MW"],["458","MYS","MY"],["462","MDV","MV"],
  ["466","MLI","ML"],["470","MLT","MT"],["584","MHL","MH"],["478","MRT","MR"],["480","MUS","MU"],
  ["484","MEX","MX"],["583","FSM","FM"],["496","MNG","MN"],["499","MNE","ME"],["504","MAR","MA"],
  ["508","MOZ","MZ"],["104","MMR","MM"],["516","NAM","NA"],["520","NRU","NR"],["524","NPL","NP"],
  ["528","NLD","NL"],["554","NZL","NZ"],["558","NIC","NI"],["562","NER","NE"],["566","NGA","NG"],
  ["807","MKD","MK"],["578","NOR","NO"],["512","OMN","OM"],["586","PAK","PK"],["585","PLW","PW"],
  ["275","PSE","PS"],["591","PAN","PA"],["598","PNG","PG"],["600","PRY","PY"],["604","PER","PE"],
  ["608","PHL","PH"],["616","POL","PL"],["620","PRT","PT"],["634","QAT","QA"],["642","ROU","RO"],
  ["643","RUS","RU"],["646","RWA","RW"],["659","KNA","KN"],["662","LCA","LC"],["670","VCT","VC"],
  ["882","WSM","WS"],["674","SMR","SM"],["678","STP","ST"],["682","SAU","SA"],["686","SEN","SN"],
  ["688","SRB","RS"],["690","SYC","SC"],["694","SLE","SL"],["702","SGP","SG"],["703","SVK","SK"],
  ["705","SVN","SI"],["090","SLB","SB"],["706","SOM","SO"],["710","ZAF","ZA"],["728","SSD","SS"],
  ["724","ESP","ES"],["144","LKA","LK"],["729","SDN","SD"],["740","SUR","SR"],["752","SWE","SE"],
  ["756","CHE","CH"],["760","SYR","SY"],["158","TWN","TW"],["762","TJK","TJ"],["834","TZA","TZ"],
  ["764","THA","TH"],["626","TLS","TL"],["768","TGO","TG"],["772","TKL","TK"],["776","TON","TO"],
  ["780","TTO","TT"],["788","TUN","TN"],["792","TUR","TR"],["795","TKM","TM"],["798","TUV","TV"],
  ["800","UGA","UG"],["804","UKR","UA"],["784","ARE","AE"],["826","GBR","GB"],["840","USA","US"],
  ["858","URY","UY"],["860","UZB","UZ"],["548","VUT","VU"],["336","VAT","VA"],["862","VEN","VE"],
  ["704","VNM","VN"],["887","YEM","YE"],["894","ZMB","ZM"],["716","ZWE","ZW"],
  // Territories
  ["344","HKG","HK"],["446","MAC","MO"],["831","GGY","GG"],["832","JEY","JE"],["833","IMN","IM"],
  ["292","GIB","GI"],["234","FRO","FO"],["304","GRL","GL"],["136","CYM","KY"],["060","BMU","BM"],
  ["092","VGB","VG"],["630","PRI","PR"],["316","GUM","GU"],["016","ASM","AS"],["580","MNP","MP"],
  ["876","WLF","WF"],["258","PYF","PF"],["540","NCL","NC"],["184","COK","CK"],["570","NIU","NU"],
  ["248","ALA","AX"],["175","MYT","YT"],["638","REU","RE"],["254","GUF","GF"],["474","MTQ","MQ"],
  ["312","GLP","GP"],["652","BLM","BL"],["663","MAF","MF"],["666","SPM","PM"],["654","SHN","SH"],
  ["660","AIA","AI"],["500","MSR","MS"],["086","IOT","IO"],["260","ATF","TF"],["074","BVT","BV"],
  ["744","SJM","SJ"],["162","CXR","CX"],["166","CCK","CC"],["334","HMD","HM"],["574","NFK","NF"],
  ["612","PCN","PN"],["238","FLK","FK"],["239","SGS","GS"],
];

async function main() {
  const countries = topojson.feature(world, world.objects.countries);
  const isoByNumeric = {};
  for (const [num, a3, a2] of isoMap) {
    isoByNumeric[num] = { a3, a2 };
  }

  const c = new Client({
    connectionString: "postgresql://postgres:hSiR0hAVivGlkMCj@db.sqqknubphqvrhtabtmjb.supabase.co:5432/postgres"
  });
  await c.connect();
  await c.query("DELETE FROM countries");

  let count = 0;
  for (const feature of countries.features) {
    const numCode = String(feature.id);
    const name = feature.properties.name;
    if (!name || !numCode) continue;

    const mapping = isoByNumeric[numCode];
    if (!mapping) {
      console.log("  Skipping", name, "(no mapping for code", numCode + ")");
      continue;
    }
    const { a3: code3, a2: code2 } = mapping;
    if (!code2) {
      console.log("  Skipping", name, "(no alpha-2 for", numCode + ")");
      continue;
    }

    const centroid = computeCentroid(feature.geometry);
    if (!centroid) continue;

    const region = getRegion(code3);

    await c.query(
      "INSERT INTO countries (code, code2, name, lat, lng, region) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (code) DO UPDATE SET name=$3, lat=$4, lng=$5, region=$6",
      [code3, code2, name, centroid[1], centroid[0], region]
    );
    count++;
  }

  console.log(`Seeded ${count} countries`);
  const sample = await c.query("SELECT code2, name, region FROM countries WHERE region != 'Other' LIMIT 5");
  sample.rows.forEach(r => console.log(`  ${r.code2}: ${r.name} [${r.region}]`));
  const otherCount = await c.query("SELECT COUNT(*) as cnt FROM countries WHERE region = 'Other'");
  console.log(`Uncategorized: ${otherCount.rows[0].cnt}`);
  await c.end();
}

function computeCentroid(geometry) {
  if (!geometry) return null;
  const coords = collectCoords(geometry);
  if (coords.length === 0) return null;
  let lon = 0, lat = 0;
  for (const [lng, lt] of coords) {
    lon += lng;
    lat += lt;
  }
  return [lon / coords.length, lat / coords.length];
}

function collectCoords(geom) {
  if (geom.type === "Point") return [geom.coordinates];
  if (geom.type === "MultiPoint") return geom.coordinates;
  if (geom.type === "LineString") return geom.coordinates;
  if (geom.type === "MultiLineString") return geom.coordinates.flat();
  if (geom.type === "Polygon") return geom.coordinates.flat();
  if (geom.type === "MultiPolygon") return geom.coordinates.flat(2);
  return [];
}

function getRegion(code) {
  const seAsia = ["IDN","MYS","PHL","SGP","THA","VNM","BRN","KHM","LAO","MMR","TLS","PNG"];
  const eAsia = ["CHN","JPN","KOR","PRK","MNG","TWN","HKG","MAC"];
  const sAsia = ["IND","PAK","BGD","LKA","NPL","BTN","MDV"];
  const westAsia = ["ARE","SAU","QAT","KWT","OMN","BHR","TUR","IRN","IRQ","ISR","JOR","LBN","SYR","YEM","AFG","AZE","GEO","ARM"];
  const oceania = ["AUS","NZL","FJI","SLB","VUT","WSM","TON","PLW","FSM","MHL","KIR","NRU","TUV"];
  const europe = ["GBR","DEU","FRA","ITA","ESP","PRT","NLD","BEL","CHE","AUT","SWE","NOR","DNK","FIN","POL","CZE","HUN","ROU","GRC","UKR","IRL","ISL","HRV","SRB","BGR","SVK","SVN","LTU","LVA","EST","BIH","MKD","ALB","MNE","MLT","CYP","LUX","MCO","LIE","AND","SMR","VAT"];
  const na = ["USA","CAN","MEX","GTM","HND","SLV","NIC","CRI","PAN","BLZ","CUB","JAM","HTI","DOM","BHS","BRB","TTO","LCA","VCT","GRD","DMA","KNA","ATG"];
  const sa = ["BRA","ARG","CHL","COL","PER","VEN","ECU","BOL","PRY","URY","GUY","SUR"];
  const africa = ["ZAF","NGA","EGY","KEN","ETH","TZA","COD","AGO","MOZ","GHA","CMR","CIV","MDG","SEN","MLI","BFA","NER","TCD","SDN","SSD","UGA","RWA","BDI","SOM","ZWE","ZMB","MWI","MWI","BWA","NAM","LSO","SWZ","GIN","GMB","GNB","SLE","LBR","TGO","BEN","GAB","COG","CAF","STP","GNQ","ERI","DJI","MUS","COM","CPV","SYC","MRT","ESH","LBY","TUN","DZA","MAR"];
  if (seAsia.includes(code)) return "Southeast Asia";
  if (eAsia.includes(code)) return "East Asia";
  if (sAsia.includes(code)) return "South Asia";
  if (westAsia.includes(code)) return "West Asia";
  if (oceania.includes(code)) return "Oceania";
  if (europe.includes(code)) return "Europe";
  if (na.includes(code)) return "North America";
  if (sa.includes(code)) return "South America";
  if (africa.includes(code)) return "Africa";
  return "Other";
}

main().catch(e => { console.error(e); process.exit(1); });
