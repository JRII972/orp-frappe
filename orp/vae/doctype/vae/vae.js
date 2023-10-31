// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

frappe.ui.form.on("VAE", {
	refresh(frm) {
        // show_notes() {
        const crm_notes = new erpnext.utils.CRMNotes({
            frm: frm,
            notes_wrapper: $(frm.fields_dict.notes_html.wrapper),
        });
        crm_notes.refresh();
    
        // show_activities() {
        const crm_activities = new erpnext.utils.CRMActivities({
            frm: frm,
            open_activities_wrapper: $(frm.fields_dict.open_activities_html.wrapper),
            all_activities_wrapper: $(frm.fields_dict.all_activities_html.wrapper),
            form_wrapper: $(frm.wrapper),
        });
        crm_activities.refresh();

        frm.set_query('service', () => {
            return {
                filters: {
                    item_group: ['in', ['VAE']],
                    disabled: 0
                }
            }
        })
        frm.set_query('liste_de_prix', () => {
            return {
                filters: {
                    selling: true,
                    enabled: 1
                }
            }
        })

        // frm.toggle_display(['item_price'], frm.doc.service != '');
        // frm.toggle_reqd('item_price', frm.doc.service != '');
        // frappe.set_route('Form', frm.doc.reference_type, frm.doc.reference_name);
        if (!cur_frm.is_new()){
            frm.set_query('financement', 'demandes_de_financement', () => {
                return {
                    filters: {
                        source_cible: 'VAE',
                        cible: frm.doc.name
                    }
                }
            })
            frm.set_query('appointment', 'liste_rdv', () => {
                return {
                    filters: {
                        vae: frm.doc.name
                    }
                }
            })
            

            frm.add_custom_button('Ajouter un RDV', () => {
                frm.save()
                
                let d = new frappe.ui.Dialog({
                    title: 'Entrer les details',
                    fields: [
                        {
                            label: 'Heures',
                            fieldname: 'time',
                            fieldtype: 'Datetime',
                            reqd : 1
                        },
                        {
                            label: 'Status',
                            fieldname: 'status',
                            fieldtype: 'Select',
                            options: "\nOpen\nUnverified\nClosed",
                            reqd : 1
                        },
                        {
                            label: 'Durée',
                            fieldname: 'dure',
                            fieldtype: 'Duration',
                            hide_days : 1,
                            hide_seconds : 1,
                            reqd : 1
                        },
                        {
                            label: 'Contact',
                            fieldname: 'contact',
                            fieldtype: 'Link',
                            options: frm.doc.client_différent_du_stagiaire ? "Contact" : "Customer",
                            // hidden: frm.doc.client_différent_du_stagiaire,
                            default: frm.doc.contact_stagiaire,
                            reqd : 1
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
                        values["contactType"] = frm.doc.client_différent_du_stagiaire ? "Contact" : "Customer",
                        values["docname"]     = frm.doc.name
                        
                        frappe.call({
                            method:     'orp.vae.doctype.vae.vae.add_appointment', 
                            args: values,
                            // disable the button until the request is completed
                            btn: $('.primary-action'),
                            // freeze the screen until the request is completed
                            freeze: true,
                            callback: (r) => {
                                console.log(r.message)
                                d.hide();
                            },
                            error: (r) => {
                                // on error
                            }
                            
                        })
                        
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
        frm.set_value('prix_appliqué', '')
        frm.set_value('liste_de_prix', '')
            .then(() => {
                frm.refresh_field('liste_de_prix')
                frm.set_df_property('liste_de_prix', 'reqd', 0)
                frm.set_df_property('liste_de_prix', 'hidden', 1)
                if (frm.doc.service != ''){
                    frappe.db.get_list('Item Price', {
                        fields: ['name', 'price_list'],
                         filters: {
                             item_code: cur_frm.doc.service 
                         }
                     }).then(doc => {
                            var _list = []
                            doc.forEach((data, index) => _list.push(data.price_list))
                            frm.set_df_property('liste_de_prix', 'reqd', 1)
                            frm.set_df_property('liste_de_prix', 'hidden', 0)
                            frm.set_query('liste_de_prix', () => {
                                return {
                                    filters: {
                                        name: ['in', _list],
                                        selling: true,
                                        enabled: 1
                                    }
                                }
                            })
                            if (_list.length == 1 ){
                                frm.set_value('liste_de_prix', _list[0])
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
    },
    liste_de_prix(frm) {
        frm.set_value('prix_appliqué', '')
        frm.refresh_field('prix_appliqué')
        if (frm.doc.liste_de_prix){
            frappe.db.get_doc('Item Price', null, { price_list: frm.doc.liste_de_prix, item_code: frm.doc.service })
            .then(doc => {
                frm.set_value('prix_appliqué', doc.price_list_rate)
                frm.refresh_field('prix_appliqué')
            })
        }
    },
    nouvelle_demande_de_financement(frm){
        if ( frm.doc.client_différent_du_stagiaire ){
            frappe.new_doc("Demande de financement", {
                source_demandeur: "Customer",
                demandeur: frm.doc.client,
                source_cible: frm.doc.doctype,
                cible: frm.doc.name
            });
        } else {
            frappe.new_doc("Demande de financement", {
                source_demandeur: "Contact",
                demandeur: frm.doc.contact_stagiaire,
                source_cible: frm.doc.doctype,
                cible: frm.doc.name,
                financeur: frm.doc.client
            });
        }
    },
    
});
