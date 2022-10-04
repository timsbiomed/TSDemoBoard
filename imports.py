"""Imports for Jupyter Notebook

TODO's
  1. Remove `if not decode_response_status_not_ok(response)` comments if Chris R OK w/ my new style. - Joe
"""
import os
import json
from typing import Dict, Union

import httpx
from IPython.display import display, HTML
from httpx import Response


BASE_URL = "http://20.119.216.32:8000/r4/"  # TIMS server
REQUEST_HEADERS = {
	"Accept-Charset": "utf-8",
	"Content-Type": "application/fhir+json; charset=UTF-8",
	"User-Agent": "HAPI-FHIR/5.0.0 (FHIR Client; FHIR 4.0.1/R4; apache)"}
PROJECT_DIR = os.path.dirname(__file__)
CACHE_DIR = os.path.join(PROJECT_DIR, 'cache')
URI = str


# Utils
def encode_filename_str(x):
	"""Convert such that can create friendly system filename"""
	delim = '*'
	return x.replace('/', f'{delim}slash')


def decode_filename_str(x):
	"""Convert from friendly system filename"""
	delim = '*'
	return x.replace(f'{delim}slash', '/')


def url_and_params_to_filename(url: str, params: Dict) -> str:
	"""Convert to filename"""
	x = url
	if params:
		x += '___params_'
		for k, v in params.items():
			x += '__' + k + '_' + v
	filename = encode_filename_str(x) + '.json'
	return filename


def cache_write(url: str, params: Dict, response: Dict):
	"""Write to cache"""
	filename = url_and_params_to_filename(url, params)
	if not os.path.exists(CACHE_DIR):
		os.makedirs(CACHE_DIR)
	path = os.path.join(CACHE_DIR, filename)
	with open(path, 'w') as f:
		json.dump(response, f, indent=4)


def cache_read(url: str, params: Dict) -> Union[Dict, None]:
	"""Read from cache"""
	filename = url_and_params_to_filename(url, params)
	path = os.path.join(CACHE_DIR, filename)
	if os.path.exists(path):
		with open(path, 'r') as f:
			data: Dict = json.load(f)
		return data
	return None


# Proper funcs / classes
def decode_response_status_not_ok(response: Response) -> bool:
	"""Decode status"""
	if response is None:
		print("NO RESPONSE")
		return True
	else:
		if 200 <= response.status_code < 300:
			return False
		elif 400 <= response.status_code < 500:
			return True
		elif response.status_code >= 500:
			return True


def decode_code_system_json(response: Dict):
	"""Decode CodeSystem response"""
	# if not decode_response_status_not_ok(response):
	# 	response_dict = json.loads(response.text)
	if 'entry' in response:
		print("title: " + response['entry'][0]['resource']['title'])
		print("resourceType: ", response['entry'][0]['resource']['resourceType'], end="  ")
		print("id: " + response['entry'][0]['resource']['id'])
		print("url: " + response['entry'][0]['resource']['url'])
		print("full url: " + response['entry'][0]['fullUrl'])
		id_idx = 1 if len(response['entry']) > 1 else 0
		id_sys = response['entry'][id_idx]['resource']['identifier'][0]['system']
		id_sys_val = response['entry'][id_idx]['resource']['identifier'][0]['value']
		print("identifier system: \"" + id_sys, end="\",  ")
		print("value: \"" + id_sys_val + "\"")
	else:
		print("Not Present")


def decode_validate_response(response, optional_prints=False):
	"""Decode validate response"""
	print(response)
	if optional_prints:
		print(response.keys())
		print(response['issue']['severity'])
		print(response['issue']['response'])
		display(HTML(response['text']['div']))
		print("")


def decode_lookup_response(response: Dict):
	"""Deocde lookup response"""
	# if not decode_response_status_not_ok(response):
	# 	response_dict = json.loads(response.text)
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


class TimsClient:
	"""TIMS Client"""
	http_client = httpx.Client()

	def __init__(self, base_url: str, use_cache=False):
		self.base_url = base_url
		self.use_cache = use_cache

	def do_hapi_request(self, internal_path: str, in_params: Dict = None) -> Dict:
		"""GET request"""
		url = os.path.join(self.base_url, internal_path)
		if self.use_cache:
			response_dict = cache_read(url, in_params)
			if response_dict:
				return response_dict
		rq = httpx.Request("GET", url, params=in_params, headers=REQUEST_HEADERS)
		response: Response = TimsClient.http_client.send(rq)
		response_dict: Dict = json.loads(response.text)

		cache_write(url, in_params, response_dict)
		return response_dict

	def summarize_code_systems(self, verbose=False):
		"""Summarize code systems"""
		response_dict = self.do_hapi_request("CodeSystem?_summary=true", {})
		# if not decode_response_status_ok(response):
		# 	response_dict = json.loads(response.text)
		if verbose:
			for vocab_entry in response_dict['entry']:
				print(vocab_entry['resource']['name'])
				print(vocab_entry['resource']['id'])
				print(vocab_entry['fullUrl'])
				print(vocab_entry['resource']['url'])
				print('')
		else:
			sys_names = [x['resource']['name'] for x in response_dict['entry']]
			print(', '.join(sys_names))

	def summarize_code_system_by_name(self, name: str):
		"""Summarize a code system by name param"""
		response: Dict = self.do_hapi_request("CodeSystem", {'name': name})
		# if not decode_response_status_not_ok(response):
		decode_code_system_json(response)

	def summarize_code_system_by_system(self, system: str):
		"""Summarize a code system by system param"""
		response: Dict = self.do_hapi_request("CodeSystem", {'system': system})
		# if not decode_response_status_not_ok(response):
		decode_code_system_json(response)

	def validate_code(self, system_id: str, code: str):
		"""Validate that code is in code system"""
		response: Dict = self.do_hapi_request(f'CodeSystem/{system_id}/$validate-code?code={code}')
		valid = [x['valueBoolean'] for x in response['parameter'] if x['name'] == 'result'][0]
		if valid:
			label = [x['valueString'] for x in response['parameter'] if x['name'] == 'display'][0]
			print(label)
		else:
			print('Invalid code')

	def lookup_code(self, system: URI, code: str):
		"""Lookup code within code system"""
		response: Dict = self.do_hapi_request(f'CodeSystem/$lookup?system={system}&code={code}')
		decode_lookup_response(response)


# Set true and run this file directly for troubleshooting / ease of development
DEBUG = False
if __name__ == '__main__':
	if DEBUG:
		client = TimsClient(base_url=BASE_URL, use_cache=True)
		# examples:
		client.summarize_code_system_by_name('LOINC')
		client.lookup_code(system='http://loinc.org', code='LA6668-3')
