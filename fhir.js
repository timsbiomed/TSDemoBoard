
// needs headers, now CORS stuff too? Access-Control-Allow-Origin

const  getFhir = async( theSystem, theCode) => {
    const myHeaders = new Headers({
            "Accept-Charset": "utf-8",
            "Content-Type": "application/fhir+json; charset=UTF-8",
            "User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"
    });


    //const response = await fetch("http://20.119.216.32:8000/r4/CodeSystem/$lookup?system=http://loinc.org&code=LA6668-3", myHeaders)
    const base_str = "http://20.119.216.32:8000/r4/CodeSystem/$lookup?"  // why the /$?

    //const system_str = "system=http://loinc.org"
    //const code_str = "&code=LA6668-3"

    const system_str = "system=" + theSystem
    const code_str = "&code=" + theCode
    const requestString = base_str + system_str + code_str

    alert(requestString)

    const response = await fetch(requestString, myHeaders)
    const myJson = await response.json();
    alert(JSON.stringify(myJson))

    // doesn't work the same for each ontology...
    alert(myJson.parameter[1].valueString)
   /*

LOINC for 66678-4
{"resourceType":"Parameters",
 "parameter":[
    {"name":"name","valueString":"LOINC"},
    {"name":"display","valueString":"Diabetes [PhenX]"},
    {"name":"abstract","valueBoolean":false},
    {"name":"property","part":[
        {"name":"code","valueCode":"CLASSTYPE"},
        {"name":"value","valueString":"2"}] },       
    {"name":"property","part":[
        {"name":"code","valueCode":"VersionLastChanged"},
        {"name":"value","valueString":"2.65"}]},
    {"name":"property","part":[
        {"name":"code","valueCode":"STATUS"},
        {"name":"value","valueString":"TRIAL"}]},

MONDO for  MONDO_000851
{"resourceType":"OperationOutcome",
"issue":[
    {   "severity":"error",
        "code":"processing",
        "diagnostics":"HAPI-1738: Unable to find code[MONDO_000851] in system[http://purl.obolibrary.org/obo/mondo.owl]"}]}

MONDO for CHEBI_33424
{"resourceType":"Parameters",
    "parameter":[
        {"name":"name","valueString":"http://purl.obolibrary.org/obo/mondo.owl"},
        {"name":"version","valueString":"http://purl.obolibrary.org/obo/mondo/releases/2022-07-01/mondo.owl"},
        {"name":"display","valueString":"sulfur oxoacid derivative"},
        {"name":"abstract","valueBoolean":false},
        {"name":"property","part":[
            {   "name":"code", "valueCode":"parent"},
            {   "name":"value","valueString":"CHEBI_33241"}]},
        {"name":"property","part":[
            {"name":"code","valueCode":"parent"},
            {"name":"value","valueString":"CHEBI_26835"}]}]}


   */ 
}

