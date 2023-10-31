# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class VAE(Document):
    pass


def add_new_appointment(vaeName, time, status, duration, description):
    vae = frappe.get_doc('VAE', vaeName)
    doc = frappe.new_doc('Appointment')
    doc.vae = vaeName
    if vae.client_différent_du_stagiaire :
        contact = frappe.get_doc('Contact', vae.contact_stagiaire)
        doc.customer_name = contact.full_name
        doc.customer_phone_number = contact.email_id 
        doc.customer_email = contact.phone_id
        doc.appointment_with = "Contact"
        doc.party = vae.contact_stagiaire
    else :
        customer = frappe.get_doc('Customer', vae.client)
        doc.customer_name = customer.customer_name
        doc.appointment_with = "Customer"
        doc.party = vae.client
        
        
        doc.customer_phone_number = customer.email_id 
        doc.customer_email = customer.phone_id
    doc.insert()
    
    
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def find_contact_customer(doctype, txt, searchfield, start, page_len, filters):
    print("""SELECT t1.name AS `Name`,
            t1.full_name AS `Full Name`
        FROM `tabDynamic Link` AS t0
        LEFT OUTER JOIN `tabContact` AS t1
            ON t0.parent = t1.name
        WHERE t0.link_doctype = 'Customer'
        AND t0.link_name LIKE '%%%(customer)s%%'
        AND t1.%(searchfield)s LIKE '%%%(name)s%%'
        order by t1.full_name limit %(page_len)s offset %(start)s
        """ % {
            'customer' : filters['customer'],
            'searchfield' : searchfield,
            'name' : txt,
            'page_len' : page_len,
            'start' : start
            } )
    return frappe.db.sql("""SELECT t1.name AS `Name`,
            t1.full_name AS `Full Name`
        FROM `tabDynamic Link` AS t0
        LEFT OUTER JOIN `tabContact` AS t1
            ON t0.parent = t1.name
        WHERE t0.link_doctype = 'Customer'
        AND t0.link_name = '%(customer)s'
        AND t1.%(searchfield)s LIKE '%%%(name)s%%'
        order by t1.full_name limit %(page_len)s offset %(start)s
        """ % {
            'customer' : filters['customer'],
            'searchfield' : searchfield,
            'name' : txt,
            'page_len' : page_len,
            'start' : start
            } , values={
            'customer' : filters['customer'],
            'searchfield' : searchfield,
            'name' : txt,
            'page_len' : page_len,
            'start' : start
            }, as_list=1)