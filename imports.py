"""Imports for Jupyter Notebook

"""
import os
import json
from typing import Dict, Union

import httpx
from IPython.display import display, HTML
from httpx import Response


REQUEST_HEADERS = {
    "Accept-Charset": "utf-8",
    "Content-Type": "application/fhir+json; charset=UTF-8",
    "User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"}
PROJECT_DIR = os.path.dirname(__file__)
CACHE_DIR = os.path.join(PROJECT_DIR, 'cache')


class TimsClient:
    """TIMS Client"""

    def __init__(self, base_url: str, verbose=False):
        self.base_url = base_url
        self.verbose=verbose
        self.http_client = httpx.Client()
        
    def is_response_ok(self, response: Response) -> bool:
        """Decode status"""
        if response is None:
            print("NO RESPONSE")
            return False
        else:
            if  200 <= response.status_code < 300:
                if self.verbose:
                    print(f"HTTP STATUS OK {response.status_code}")
                return True
            else:
                print(f"error: {response.status_code}")
                return False

    def do_hapi_get_request(self, internal_path: str, in_params: Dict = None) -> Dict:
        """GET request"""
        url = self.base_url + internal_path
        response_dict = None
        if response_dict:    
            return response_dict
        else:
            if self.verbose:
                print("GETTING")
            rq = httpx.Request("GET", url, params=in_params, headers=REQUEST_HEADERS)
            if self.verbose:
                print(rq.url)
            response: Response = None
            try:
                if self.verbose:
                    print("SENDING")
                response: Response = self.http_client.send(rq)
            except Exception as x:
                print(x)
            if self.is_response_ok(response):        
                response_dict: Dict = json.loads(response.text)
                return response_dict
            return None

    def do_hapi_post_request(self, internal_path, form_data, in_params) -> Dict:
        rq = httpx.Request("POST", self.base_url + internal_path,
                       data=form_data,
                       params=in_params,  
                       headers=REQUEST_HEADERS)
        print(rq.url)
        response = self.http_client.send(rq)
        # this response from POST doesn't have a status like that from GET
        ## if self.is_response_ok(response):        
        response_dict: Dict = json.loads(response.text)
        return response_dict
   

    def summarize_code_systems(self, verbose=False):
        """Summarize code systems"""
        response = self.do_hapi_get_request("CodeSystem?_summary=true", {})
        if response and 'entry' in response and len(response['entry']) > 0:        
            for x in response['entry']:
                if 'title' in x['resource']:
                    print(f"title: {x['resource']['title']}")
                else:
                    print(f"title: (none)")
                print(f"name:{x['resource']['name']} , id:{x['resource']['id']}, url:{x['resource']['url']}")
                print("")
        else:
            print("none loaded")
            
            
            
    def summarize_code_system_by_name(self, name: str):
        """Summarize a code system by name param"""
        response: Dict = self.do_hapi_get_request("CodeSystem", {'name': name})
        if response:        
            TimsClient.decode_code_system_json(response)

    def summarize_code_system_by_system(self, system: str):
        """Summarize a code system by system param"""
        response: Dict = self.do_hapi_get_request("CodeSystem", {'system': system})
        if response:        
            TimsClient.decode_code_system_json(response)

    def validate_code(self, system_id: str, code: str):
        """Validate that code is in code system, putting the system id in the URL path"""
        response: Dict = self.do_hapi_get_request(f'CodeSystem/{system_id}/$validate-code?code={code}')
        if response:        
            valid = [x['valueBoolean'] for x in response['parameter'] if x['name'] == 'result'][0]
            if valid:
                label = [x['valueString'] for x in response['parameter'] if x['name'] == 'display'][0]
                print(label)
            else:
                print('Invalid code')

    def validate_code_2(self, system_id: str, code: str):
        """Validate that code is in code system, putting the system as a parameter"""
        response: Dict = self.do_hapi_get_request(f'CodeSystem/$validate-code?codeSystem={system_id}&code={code}')
        if response:        
            valid = [x['valueBoolean'] for x in response['parameter'] if x['name'] == 'result'][0]
            if valid:
                label = [x['valueString'] for x in response['parameter'] if x['name'] == 'display'][0]
                print(label)
            else:
                print('Invalid code')

        
    def lookup_code(self, system: str, code: str):
        """Lookup code within code system"""
        response: Dict = self.do_hapi_get_request(f'CodeSystem/$lookup?system={system}&code={code}')
        if response:
            TimsClient.decode_lookup_response(response)

    @staticmethod
    def decode_code_system_json(response: Dict):
        """Decode CodeSystem response"""
        if 'entry' in response:
            print("name: " + response['entry'][0]['resource']['name'])
            if 'title' in response['entry'][0]['resource']:
                print("title: " + response['entry'][0]['resource']['title'])
            print("resourceType: ", response['entry'][0]['resource']['resourceType'], end="  ")
            print("id: " + response['entry'][0]['resource']['id'])
            print("url: " + response['entry'][0]['resource']['url'])
            print("full url: " + response['entry'][0]['fullUrl'])
            id_idx = 1 if len(response['entry']) > 1 else 0
            
            if 'identifier' in  response['entry'][id_idx]['resource']:
                id_sys = response['entry'][id_idx]['resource']['identifier'][0]['system']
                id_sys_val = response['entry'][id_idx]['resource']['identifier'][0]['value']
                print("identifier system: \"" + id_sys, end="\",  ")
                print("value: \"" + id_sys_val + "\"")
        else:
            print("Not Present")


    @staticmethod
    def decode_lookup_response(response: Dict):
        """Deocde lookup response"""
        if 'issue' in response:
            print("error")
        else:
            for p in response['parameter']:
                if p['name'] != 'property' and p['name'] != 'designation':
                    if 'valueString' in p:
                        print(p['name'], ":", p['valueString'], sep="", end=", ")
                    if 'valueBoolean' in p:
                        print(p['name'], ":", p['valueBoolean'], sep="", end=", ")
        print("")
        
       
class ResourceValidation:
   
    def __init__(self, base_url: str,  verbose=False):
        self.base_url = base_url
        self.verbose=verbose
        self.tims_client = TimsClient(base_url, verbose)
        
    def put_organization(self, file):
        org_file = open(file, "r")
        form_data = org_file.read()
        response = self.tims_client.do_hapi_post_request("/Organization/", 
                       form_data,  {"_format" : "json", "_pretty" : "true"})    
        
    def get_organization(self, name):
        response = self.tims_client.do_hapi_get_request("/Organization/", 
                       {'name' : name})
        self.decode_organization_json(response)  

    def decode_organization_json(self, response_dict):
            if ('entry' in response_dict):
                print("name:" + response_dict['entry'][0]['resource']['name'])
                print("resourceType:", response_dict['entry'][0]['resource']['resourceType'],
                 end="  ")
                print("id: " + response_dict['entry'][0]['resource']['id'])
            else:
                print("Not Present")
            print("") 
               
    def put_patient(self, file):
        org_file = open(file, "r")
        form_data = org_file.read()
        response = self.tims_client.do_hapi_post_request("/Patient/", 
                       form_data,  {"_format" : "json", "_pretty" : "true"})    
        
    def get_patient(self, name):
        response = self.tims_client.do_hapi_get_request("/Patient/", 
                       {'name' : name})
        self.decode_patient_json(response)  
       
    def decode_patient_json(self, response_dict):
            if ('entry' in response_dict):
                print("name:" + response_dict['entry'][0]['resource']['name'][0]['family'])
                print("name:" + response_dict['entry'][0]['resource']['name'][0]['given'][0])            
                print("resourceType:", response_dict['entry'][0]['resource']['resourceType'],
                 end="  ")
                print("id: " + response_dict['entry'][0]['resource']['id'])
            else:
                print("Not Present")
            print("")
            
    def put_encounter(self, file):
        org_file = open(file, "r")
        form_data = org_file.read()
        response = self.tims_client.do_hapi_post_request("/Encounter/", 
                       form_data,  {"_format" : "json", "_pretty" : "true"})    
        
    def get_encounter(self, name):
        response = self.tims_client.do_hapi_get_request("/Encounter/", 
                       {'patient' : name})
        self.decode_encounter_json(response)  

    def search_encounter(self):
        response = self.tims_client.do_hapi_get_request("/Encounter/", {})
        self.decode_encounter_json(response)  
            
    def decode_encounter_json(self, response_dict):
            if ('entry' in response_dict):
                for entry in response_dict['entry']:
                    print("fullUrl:" + entry['fullUrl'])   
                    print("id: " + entry['resource']['id'])
                    print("text status: " + entry['resource']['text']['status'])
                    print("text div: " + entry['resource']['text']['div'])            
                    print("status: " + entry['resource']['status'])
                    print("patient ref: " + entry['resource']['subject']['reference'])
                    print("")
            else:
                print("entry Not Present")
                print(response_dict)
                print("")
            print("")        

        
# Set true and run this file directly for troubleshooting / ease of development
DEBUG = False
if __name__ == '__main__':
    if DEBUG:
        BASE_URL = "http://20.119.216.32:8000/r4/"  # TIMS server for 
        client = TimsClient(base_url=BASE_URL)
        # examples:
        client.summarize_code_system_by_name('LOINC')
        client.lookup_code(system='http://loinc.org', code='LA6668-3')
