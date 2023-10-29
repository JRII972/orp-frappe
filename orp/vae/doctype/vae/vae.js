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

        frm.add_custom_button('Ajouter un RDV', () => {
            function newAppointment(name,mail,doctype,party,phone=""){
                frappe.new_doc("Appointment", {custom_description: "New Task"},
                        doc => {
                            doc.vae = frm.doc.name;
                            doc.customer_name = name;
                            doc.customer_phone_number = phone;
                            doc.customer_email = mail;
                            doc.appointment_with = doctype;
                            doc.party = party;
                        });
            }
            if (frm.doc.client_différent_du_stagiaire){
                frappe.db.get_doc('Contact', frm.doc.contact_stagiaire)
                .then(doc => {
                    newAppointment(doc.full_name, doc.email_id, 'Contact', frm.doc.contact_stagiaire, doc.phone_id)
                })
            }  else {
                frappe.db.get_doc('Customer', frm.doc.client)
                .then(doc => {
                    newAppointment(doc.full_name, doc.email_id, 'Customer', frm.doc.client, doc.phone_id)
                })
            }
            
            
        })
        
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
    }
});
