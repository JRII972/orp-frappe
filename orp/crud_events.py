import frappe


def check_quotation(doc, methode=None) :
    if doc.order_type == "VAE" : 
        if doc.vae :
            vae = frappe.get_doc('VAE', doc.vae)
            vae.devis = doc.name
            vae.save(ignore_permissions=True)