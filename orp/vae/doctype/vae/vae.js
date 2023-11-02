// Copyright (c) 2023, jeremy jovinac and contributors
// For license information, please see license.txt

function prettyRow(frm){
    for (const row of frm.doc.liste_rdv){
        console.log(row.status)
        d = document.querySelector('div[data-name="'+ row.name + '"]')
        t = d.querySelector('div[data-fieldname="status"]')
        t.style.fontWeight = 'bold'
        switch (row.status) {
            case "Unverified":
                if (frappe.datetime.get_day_diff(frappe.datetime.get_today(), row.date) < 3 ) {
                    d.style.backgroundColor = 'var(--criticism-color)' 
                    d.querySelector('div[class="data-row row"]').style.color = 'white' //'var(--text-on-red)' 
                    t.style.color = 'white' 
                } else if (frappe.datetime.get_today() > row.date ) { 
                    d.style.backgroundColor = 'var(--info)' 
                    d.querySelector('div[class="data-row row"]').style.color = 'white' 
                    frappe.msgprint("Un rendez-vous a été placé dans le passé ?! </br> <a href='/app/appointment/" + row.appointment + "'>" + row.appointment + " </a", "Incohérence !")
                } else {
                    d.style.backgroundColor = 'var(--warning)' 
                    d.querySelector('div[class="data-row row"]').style.color = 'white' 
                    // t.style.color = 'white'
                }
                break;
                case 'Open':
                    d.querySelector('div[class="data-row row"]').style.color = 'white' 
                    d.style.backgroundColor = 'var(--success)' 
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            case 'Closed':
            default:
                d.style.backgroundColor = 'var(--alert-bg-secondary)' 
                d.querySelector('div[class="data-row row"]').style.color = '' 
          }
            
    }
    frappe.db.get_doc('DocType','Demande de financement').then(doc => {
        for (const row of frm.doc.demandes_de_financement){
            console.log(row.status)
            d = document.querySelector('div[data-name="'+ row.name + '"]')
            t = d.querySelector('div[data-fieldname="status"]')
            t.style.fontWeight = 'bold'
            doc.states.forEach((data, index) => {
                if (data.title == row.status){
                    // d.style.backgroundColor = 'var(--warning)' 
                    d.querySelector('div[class="data-row row"]').style.color = 'var(--' + data.color.toLowerCase().split(' ').join('-')+ ')'
                    console.log('var(--' + data.color.toLowerCase().split(' ').join('-')+ ')')
                }
            })    
        }
    })
    
}

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

            frappe.db.get_list('Appointment', {
                fields: ['name', 'status', 'type', 'scheduled_time', 'durée', 'heure_de_fin'],
                filters: {
                    vae: frm.doc.name
                },
                order_by : 'scheduled_time desc'
            }).then(records => {
                // TODO: calc that in server side
                frm.doc.liste_rdv = []
                _heures_effectuer = 0
                _heures_planifier = 0
                records.forEach((data, index) => {
                    let row = frm.add_child('liste_rdv', {
                        appointment: data.name,
                        status: data.status,
                        type: data.type,
                        date: data.scheduled_time,
                        durée: data.durée,
                        heure_de_fin: data.heure_de_fin
                    });
                    
                    if ( data.status == 'Closed' ) { _heures_effectuer += data.durée }
                    if ( data.status != 'Cancel' ) { _heures_planifier += data.durée }
                })
                frm.set_value('heures_effectuer', _heures_effectuer)
                frm.set_value('heures_planifier', _heures_planifier)
                frm.refresh_field('heures_planifier');
                frm.refresh_field('heures_effectuer');
                frm.refresh_field('liste_rdv');
                prettyRow(frm)
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
                                cur_frm.refresh()
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

            
            frm.add_custom_button('Editer devis', () => {
                if (frm.doc.devis == undefined) {
                    frappe.db.get_doc('Item', frm.doc.service)
                    .then(item_service => {
                        frappe.new_doc('Quotation', {},
                            doc => {
                                doc.party_name = frm.doc.client
                                doc.vae = frm.doc.name
                                doc.order_type = "VAE"

                                frm.doc.items.forEach((item, index) =>{
                                    var row = frappe.model.add_child(doc, "items");
                                    row.item_code = item.item_code;
                                    row.item_name = item.item_name;
                                    row.uom = item.uom;
                                    row.qty = item.qty;
                                    row.rate = item.rate;
                                    row.amount = item.amount;
                                    row.description = item.description;
                                })
                                var row = frappe.model.add_child(doc, "items");
                                row.item_code = item_service.name;
                                row.item_name = item_service.item_name;
                                row.uom = item_service.stock_uom;
                                row.description = item_service.description;
                                row.qty = Math.floor(frm.doc.heures_planifier / 60 / 60 )
                                row.rate = frm.doc.prix_appliqué;
                                row.amount = item.amount;
                            
                        })
                    })
                    
                } else {
                    frappe.set_route(['Form', 'Quotation', frm.doc.devis])
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
    items(frm){
    },
    calculate_percet_timespend(frm){
        frm.set_value('heures_faites', frm.doc.heures_effectuer / frm.doc.heures_planifier * 100)
    },
    heures_planifier(frm){
        frm.trigger("calculate_percet_timespend");
    },
    heures_effectuer(frm){
        frm.trigger("calculate_percet_timespend");
    }
});


frappe.ui.form.on("Quotation Item", {
    item_code(frm, cdt, cdn) {
        let row = frappe.get_doc(cdt, cdn);

        frappe.db.get_list('Item Price', {
            fields: ['name', 'price_list', 'price_list_rate'],
            filters: {
                item_code: row.item_code,
                price_list: frm.doc.liste_de_prix
            }
         }).then(doc => {
                var _list = []           

                doc.forEach((data, index) => _list.push(data.price_list_rate))

                row.rate = _list[0]
                row.price_list_rate = _list[0]
                row.base_price_list_rate = _list[0]
                // row.save()
                frm.refresh_field('items')
                console.log(doc)
            })

        frappe.db.get_doc('Item', row.item_code).then( doc => {
            row.item_name = doc.item_name
            row.description = doc.description
            row.item_group = doc.item_group
            row.brand = doc.brand
            row.image = doc.image
            row.uom = doc.stock_uom
            row.conversion_factor = 1 // doc.conversion_factor // TODO:change that
            frm.refresh_field('items')
        })
    },
    items_add(frm, cdt, cdn) { 
        let row = frappe.get_doc(cdt, cdn);
        row.qty = 1
        frm.refresh_field('items')
    },
    calculate: function(frm, cdt, cdn) {
		let row = frappe.get_doc(cdt, cdn);
		frappe.model.set_value(cdt, cdn, "amount", flt(row.qty) * flt(row.rate));
		frappe.model.set_value(cdt, cdn, "base_rate", flt(frm.doc.conversion_rate) * flt(row.rate));
		frappe.model.set_value(cdt, cdn, "base_amount", flt(frm.doc.conversion_rate) * flt(row.amount));
		frm.trigger("calculate_total");
	},
	qty: function(frm, cdt, cdn) {
		frm.trigger("calculate", cdt, cdn);
	},
	rate: function(frm, cdt, cdn) {
		frm.trigger("calculate", cdt, cdn);
	}
})