
// needs headers, now CORS stuff too? Access-Control-Allow-Origin
    const myHeaders = new Headers({
            "Accept-Charset": "utf-8",
            "Content-Type": "application/fhir+json; charset=UTF-8",
            "User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"
    });

not_implemented = function(x) {
    alert(x + " is not implemented")
}

query_loaded_codesystems = async(theServer) => {
    // http://20.119.216.32:8001/r4/CodeSystem?_summary=true
    const request_string = theServer + "/CodeSystem?_summary=true" 
    alert(request_string)
    const response = await fetch(request_string, myHeaders)
    const myJson = await response.json();
    alert(JSON.stringify(myJson))

}

const  getFhir = async( theServer, theSystem, theCode) => {

    //const response = await fetch("http://20.119.216.32:8000/r4/CodeSystem/$lookup?system=http://loinc.org&code=LA6668-3", myHeaders)
    //const base_str = "http://20.119.216.32:8000/r4/CodeSystem/$lookup?"  // why the /$?
    const base_str = theServer + "/CodeSystem/$lookup?"  // why the /$?

    //const system_str = "system=http://loinc.org"
    //const code_str = "&code=LA6668-3"

    const system_str = "system=" + theSystem
    const code_str = "&code=" + theCode
    const requestString = base_str + system_str + code_str

// alert(requestString)

    const response = await fetch(requestString, myHeaders)
    const myJson = await response.json();
//  alert(JSON.stringify(myJson))

    // doesn't work the same for each ontology...
    label = myJson.parameter[1].valueString

    document.getElementById('output-system').value = theSystem
    document.getElementById('output-code').value = theCode
    document.getElementById('output-label').value = label

    // **** good luck ***
    // The structure isn't a simple map, but a pair of maps, one for name and the other for value.
    //flat_parameter =  myJson.parameter.flat()
    //alert(JSON.stringify(flat_parameter))
    //alert(myJson.parameter['display']['valueString'])

}
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
