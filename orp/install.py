
import json
import os

import frappe

def after_install():
    import_fixture()
    
def import_fixture():
    return
    fixture_path = frappe.get_app_path(
        "orp", "fixtures"
    )
    
    _devMode = True
    if not frappe.conf.get("developer_mode") :
        frappe.conf.update({
            "developer_mode" : 1
        })
        _devMode = False
    for root, dirs, files in os.walk(fixture_path):
        for filename in files:
            filename = os.path.join(root, filename)
            with open(filename, "r") as f:
                print(f"Loading fixture : {filename}")
                fixtures = json.load(f)
                for fixture in fixtures :
                    print(f"Import fixture : {fixture['doctype']} {fixture['name']}")
                    frappe.get_doc(fixture).insert(
                        ignore_permissions=True, # ignore write permissions during insert
                        ignore_links=True, # ignore Link validation in the document
                        ignore_if_duplicate=True, # dont insert if DuplicateEntryError is thrown
                        ignore_mandatory=True # insert even if mandatory fields are not set
                    )
                    
    if not _devMode : frappe.conf.pop("developer_mode") 