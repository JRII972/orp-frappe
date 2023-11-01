# Copyright (c) 2023, jeremy jovinac and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from erpnext.crm.utils import (
	CRMNote,
	copy_comments,
	link_communications,
	link_open_events,
	link_open_tasks,
)

class VAE(CRMNote):
    def before_save(self):
        self.demandes_de_financement = []
        
        financements = frappe.db.get_all('Demande de financement', filters={
                'source_cible': self.doctype,
                'cible': self.name,
            }, fields=['name', 'demande_de_financement', 'status'])
        
        print(financements)
        print('financements ----------------------------------')
        for financement in financements : 
            self.append('demandes_de_financement', {
                'date_de_la_demande' : financement['demande_de_financement'],
                'financement' : financement['name'],
                'status' : financement['status'],
            })
        
    # def on_change(self):
    #     if not self.devis : 
    #         devis = frappe.db.get_list('Quotation',
    #             filters={
    #                 'status': 'Open'
    #             },
    #             fields=['subject', 'date'],
    #             order_by='date desc',
    #             start=10,
    #             page_length=20,
    #             as_list=True
    #         )
                
@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def find_contact_customer(doctype, txt, searchfield, start, page_len, filters):
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
    
@frappe.whitelist()
def add_appointment(docname, contact, contactType, dure, status, time, description = ""):
    AppointmentType = frappe.get_doc('Type de rendez vous', 'New Task')
    AppointmentType.save()
    doc = frappe.new_doc('Appointment')
    contact = frappe.get_doc(contactType, contact)
    doc.scheduled_time = time
    doc.status         = status
    doc.type           = AppointmentType.name
    doc.durée          = dure
    doc.custom_description = description
    doc.appointment_with = contactType
    doc.party            = contact
    doc.vae              = docname
    if contactType == "Customer" :
        customer = frappe.get_doc(contactType, contact)
        doc.customer_name= customer.customer_name
        contact = frappe.get_doc("Contact", customer.customer_primary_contact)
    else : 
        doc.customer_name= contact.full_name
        contact = frappe.get_doc(contactType, contact)
    doc.customer_email   = contact.email_id or None #"default@exemple.com" #TODO: fix this
    doc.insert()
    
    cal_event = frappe.get_doc("Event", doc.calendar_event)
    cal_event.append('event_participants', {
        'reference_doctype': 'vae',
        'reference_docname': docname,
        # 'email': doc.custom,
    })
    cal_event.save(ignore_permissions=True)
    
    vae = frappe.get_doc('VAE', docname)
    vae.append('liste_rdv', {
        'appointment' : cal_event.name
    })
    
    vae.save()
    return doc.name