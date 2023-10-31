// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

frappe.ui.form.on("VAE", {
	refresh(frm) {
        frm.set_query('service', () => {
            return {
                filters: {
                    item_group: ['in', ['VAE']],
                    disabled: 0
                }
            }
        })
        // frm.toggle_display(['item_price'], frm.doc.service != '');
        // frm.toggle_reqd('item_price', frm.doc.service != '');
        // frappe.set_route('Form', frm.doc.reference_type, frm.doc.reference_name);
        if (!cur_frm.is_new()){
            frm.add_custom_button('Ajouter un RDV', () => {
                frm.save()
                
                let d = new frappe.ui.Dialog({
                    title: 'Entrer les details',
                    fields: [
                        {
                            label: 'Heures',
                            fieldname: 'time',
                            fieldtype: 'Datetime',
                        },
                        {
                            label: 'Status',
                            fieldname: 'status',
                            fieldtype: 'Select',
                            options: "Open\nUnverified\nClosed",
                        },
                        {
                            label: 'Contact',
                            fieldname: 'contact',
                            fieldtype: 'Link',
                            options: "Contact",
                            hidden: frm.doc.client_différent_du_stagiaire,
                            default: frm.doc.contact_stagiaire
                        },
                        {
                            label: 'Description',
                            fieldname: 'description',
                            fieldtype: 'Small Text'
                        }
                    ],
                    size: 'large', // small, large, extra-large 
                    primary_action_label: 'Nouveau RDV',
                    primary_action(values) {
                        console.log(values);
                        d.hide();
                    }
                });    
                
                d.show()
                cur_dialog.fields[3].get_query = () => {
                    return {
                        query: 'orp.vae.doctype.vae.vae.find_contact_customer',
                        filters: {
                            customer: cur_frm.doc.client
                        }
                    }
                }
                
            })
        }
        
        
	},
    service(frm){
        frm.set_value('item_price', '')
            .then(() => {
                frm.refresh_field('item_price')
                frm.set_df_property('item_price', 'reqd', 0)
                frm.set_df_property('item_price', 'hidden', 1)
                if (frm.doc.service != ''){
                    frm.set_df_property('item_price', 'reqd', 1)
                    frm.set_df_property('item_price', 'hidden', 0)
                    frm.set_query('item_price', () => {
                        return {
                            filters: {
                                item_code: frm.doc.service,
                                selling: 1
                            }
                        }
                    })
                }
        })
    },
    client_différent_du_stagiaire(frm){
        frm.set_value('contact_stagiaire', '')
        if(!frm.doc.client_différent_du_stagiaire){
            frm.set_query('contact_stagiaire',() => {
                return {
                    query: 'orp.vae.doctype.vae.vae.find_contact_customer',
                    filters: {
                        customer: cur_frm.doc.client
                    }
                }
            })
        } else {
            frm.set_query('contact_stagiaire',() => {
                return {}
            })
        }
    }, 
    client(frm){
        if(!frm.doc.client_différent_du_stagiaire){
            frm.set_value('contact_stagiaire', '')
            frm.set_query('contact_stagiaire',() => {
                return {
                    query: 'orp.vae.doctype.vae.vae.find_contact_customer',
                    filters: {
                        customer: cur_frm.doc.client
                    }
                }
            })
        }
    }
});
